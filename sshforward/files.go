package sshforward

import (
	"encoding/base64"
	"fmt"
	"os"
	"strings"
)

func updateEtcHosts(hostname, ip string) error {
	hostsContent, err := os.ReadFile("/etc/hosts")
	if err != nil {
		return err
	}

	entry := fmt.Sprintf("%s\t%s", ip, hostname)
	if strings.Contains(string(hostsContent), entry) {
		return nil
	}

	f, err := os.OpenFile("/etc/hosts", os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer f.Close()

	if _, err := f.WriteString(entry + "\n"); err != nil {
		return err
	}

	return nil
}

func saveCertificate(base64Cert, filepath string) error {
	certData, err := base64.StdEncoding.DecodeString(base64Cert)
	if err != nil {
		return err
	}
	return os.WriteFile(filepath, certData, 0644)
}
