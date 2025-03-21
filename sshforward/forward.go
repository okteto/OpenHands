package sshforward

import (
	"bufio"
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"strings"
	"time"

	"golang.org/x/sync/errgroup"
)

const timeout = 5 * time.Minute

type sshForwarder struct {
	getTLSConfig func() *tls.Config
}

func newSSHForwarder() *sshForwarder {
	return &sshForwarder{
		getTLSConfig: newTLSConfigWithSystemCA,
	}
}

// CA is not specified because it should use System CA root. When remote-run command is executed,
// the CA should be already available as the CLI set it in the Dockerfile used as a base to
// run the command
func newTLSConfigWithSystemCA() *tls.Config {
	return &tls.Config{}
}

// startSshForwarder This functions starts the ssh-forwarded process expected to be run on remote-run commands.
// This process just listens a UNIX socket, and forward the messages to the SSH Agent exposed in the hostname
// and port received as parameters
func (s *sshForwarder) startSshForwarder(ctx context.Context, sshAgentHostname, sshAgentPort, sshSocket, userToken string) error {
	// Remove existing socket if it exists
	os.Remove(sshSocket)

	// Listen on the UNIX domain socket
	localListener, err := net.Listen("unix", sshSocket)
	if err != nil {
		return fmt.Errorf("failed to listen on UNIX socket %s: %v", sshSocket, err)
	}
	defer localListener.Close()
	log.Printf("SSH Agent Forwarder listening on %s\n", sshSocket)

	// Set permissions so only the owner can access the socket
	err = os.Chmod(sshSocket, 0600)
	if err != nil {
		return fmt.Errorf("failed to set permissions on UNIX socket %s: %v", sshSocket, err)
	}

	go func() {
		<-ctx.Done()
		localListener.Close()
	}()

	for {
		// Accept connections from local clients
		localConn, err := localListener.Accept()
		if err != nil {
			if errors.Is(err, net.ErrClosed) {
				log.Println("listener closed, stopping accept new connections")
				break
			}
			log.Printf("failed to accept local connection: %v\n", err)
			continue
		}

		// Handle each connection concurrently
		go func() {
			err := s.handleConnection(ctx, localConn, sshAgentHostname, sshAgentPort, userToken, timeout)
			if err != nil && !errors.Is(err, net.ErrClosed) {
				log.Printf("error sending/receiving data to/from remote SSH agent: %v\n", err)
			}
		}()
	}
	return nil
}

func (s *sshForwarder) handleConnection(ctx context.Context, localConn net.Conn, host, port, userToken string, timeout time.Duration) error {
	defer localConn.Close()

	cfg := s.getTLSConfig()

	// Connect to the remote SSH agent over TCP
	remoteConn, err := tls.Dial("tcp", fmt.Sprintf("%s:%s", host, port), cfg)
	if err != nil {
		return fmt.Errorf("failed to connect to remote SSH agent: %v", err)
	}
	defer remoteConn.Close()

	// Set timeout for auth request
	err = remoteConn.SetWriteDeadline(time.Now().Add(timeout))
	if err != nil {
		log.Printf("failed to set timeout to send auth message: %v\n", err)
	}

	// Send the authentication token
	_, err = remoteConn.Write([]byte(userToken + "\n"))
	if err != nil {
		return fmt.Errorf("failed to write auth token to remote SSH agent: %v", err)
	}

	// Setting timeout to read response from server
	err = remoteConn.SetReadDeadline(time.Now().Add(timeout))
	if err != nil {
		log.Printf("failed to set timeout to wait for server confirmation: %v\n", err)
	}

	// Read the acknowledgment
	reader := bufio.NewReader(remoteConn)
	ack, err := reader.ReadString('\n')
	if err != nil {
		return fmt.Errorf("failed to read ACK from remote SSH agent: %v", err)
	}
	ack = strings.TrimSpace(ack)
	if ack != "OK" {
		return fmt.Errorf("invalid ACK message. Expected 'OK' but remote SSH agent returned '%s'", ack)
	}

	// Reset deadlines before starting data forwarding
	err = remoteConn.SetDeadline(time.Time{})
	if err != nil {
		log.Printf("faile to reset timeout to the remote ssh agent connection: %v\n", err)
	}

	err = localConn.SetDeadline(time.Time{})
	if err != nil {
		log.Printf("failed to set timeout to the local socket connection: %v\n", err)
	}

	go func() {
		<-ctx.Done()
		localConn.Close()
		remoteConn.Close()
	}()

	var eg errgroup.Group

	err = localConn.SetDeadline(time.Now().Add(timeout))
	if err != nil {
		log.Printf("failed to set timeout to the local socket: %v\n", err)
	}

	err = remoteConn.SetDeadline(time.Now().Add(timeout))
	if err != nil {
		log.Printf("failed to set timeout to the remote ssh connection: %v\n", err)
	}

	// Forward data from local to remote
	eg.Go(func() error {
		_, err := io.Copy(remoteConn, localConn)
		if err != nil {
			return fmt.Errorf("error while sending data to remote SSH agent: %w", err)
		}
		return nil
	})

	// Forward data from remote to local
	eg.Go(func() error {
		_, err := io.Copy(localConn, remoteConn)
		if err != nil {
			return fmt.Errorf("error while receiving data from remote SSH agent: %w", err)
		}
		return nil
	})

	return eg.Wait()
}
