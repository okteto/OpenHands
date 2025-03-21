package sshforward

import (
	"context"
	"log"
	"os"

	"github.com/spf13/cobra"
)

// Start forward the local ssh socket to the ssh agent endpoint
func Start() *cobra.Command {

	cmd := &cobra.Command{
		Hidden: true,
		Use:    "start",
		Short:  "Forward the local ssh socket to the ssh agent endpoint",
		Run: func(cmd *cobra.Command, args []string) {
			ctx := context.Background()

			oktetoUrl := os.Getenv("OKTETO_CONTEXT")
			if oktetoUrl == "" {
				log.Fatal("OKTETO_CONTEXT is not set")
			}
			oktetoToken := os.Getenv("OKTETO_TOKEN")
			if oktetoToken == "" {
				log.Fatal("OKTETO_TOKEN is not set")
			}
			oktetoNamespace := os.Getenv("OKTETO_NAMESPACE")
			if oktetoNamespace == "" {
				log.Fatal("OKTETO_NAMESPACE is not set")
			}

			log.Println("quering Okteto API metadata")
			metadata, err := queryOktetoMetadata(ctx, oktetoUrl, oktetoToken, oktetoNamespace)
			if err != nil {
				log.Fatal("error querying metadata", err)
			}

			log.Print("updating /etc/hosts...")
			if err := updateEtcHosts(metadata.SshAgentHostname, metadata.SshAgentInternalIP); err != nil {
				log.Fatal("error updating /etc/hosts", err)
			}

			certPath := "/etc/ssl/certs/okteto-internal.crt"
			log.Printf("installing certificate to %s\n", certPath)
			if err := saveCertificate(metadata.InternalCertificateBase64, certPath); err != nil {
				log.Fatal("error installing certificate", err)
			}

			log.Println("starting the ssh forward...")
			sshForwarder := newSSHForwarder()
			sshForwarder.startSshForwarder(ctx, metadata.SshAgentHostname, metadata.SshAgentPort, "/okteto/.ssh/agent.sock", oktetoToken)
		},
	}

	return cmd
}
