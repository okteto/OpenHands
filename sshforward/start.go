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

			log.Println("creating tls config from in-memory certificate...")
			tlsCfg, err := newTLSConfig(metadata.InternalCertificateBase64)
			if err != nil {
				log.Fatal("error creating TLS config:", err)
			}

			log.Println("starting the ssh forward...")
			sshForwarder := newSSHForwarder(tlsCfg)
			sshForwarder.startSshForwarder(ctx, metadata.SshAgentHostname, metadata.SshAgentPort, "/okteto/.ssh/agent.sock", oktetoToken)
		},
	}

	return cmd
}
