package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/okteto/Openhands/sshforward"

	"github.com/spf13/cobra"
)

var root = &cobra.Command{
	SilenceUsage: true,
}

func main() {
	root.AddCommand(sshforward.Start())

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	err := root.ExecuteContext(ctx)
	if err != nil {
		os.Exit(1)
	}
}
