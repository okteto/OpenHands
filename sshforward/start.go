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
			oktetoSshAgentHostname := os.Getenv("OKTETO_SSH_AGENT_HOSTNAME")
			if oktetoNamespace == "" {
				log.Fatal("OKTETO_SSH_AGENT_HOSTNAME is not set")
			}
			oktetoSshAgentPort := os.Getenv("OKTETO_SSH_AGENT_PORT")
			if oktetoNamespace == "" {
				log.Fatal("OKTETO_SSH_AGENT_PORT is not set")
			}

			log.Println("starting the ssh forward...")
			sshForwarder := newSSHForwarder()
			sshForwarder.startSshForwarder(ctx, oktetoSshAgentHostname, oktetoSshAgentPort, "/okteto/.ssh/agent.sock", oktetoToken)
		},
	}

	return cmd
}
