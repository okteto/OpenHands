package sshforward

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
)

// GraphQL query structure
type graphqlRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables"`
}

// Response structures
type metadataResponse struct {
	Data struct {
		Metadata []metadataItem `json:"metadata"`
	} `json:"data"`
}

type metadataItem struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type Metadata struct {
	InternalCertificateBase64 string
	SshAgentHostname          string
	SshAgentPort              string
}

func queryOktetoMetadata(ctx context.Context, oktetoUrl, oktetoToken, oktetoNamespace string) (*Metadata, error) {
	query := `query ($namespace: String!) {
		metadata(namespace: $namespace) {
		  name
		  value
		}
	  }`
	requestBody := graphqlRequest{
		Query:     query,
		Variables: map[string]interface{}{"namespace": oktetoNamespace},
	}

	body, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	baseURL, err := url.Parse(oktetoUrl)
	if err != nil {
		return nil, err
	}
	baseURL.Path = path.Join(baseURL.Path, "graphql")

	req, err := http.NewRequestWithContext(ctx, "POST", baseURL.String(), bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", oktetoToken))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status: %s", resp.Status)
	}

	var metadataResp metadataResponse
	if err := json.NewDecoder(resp.Body).Decode(&metadataResp); err != nil {
		return nil, err
	}

	metadata := &Metadata{}
	for _, pair := range metadataResp.Data.Metadata {
		switch pair.Name {
		case "internalCertificateBase64":
			metadata.InternalCertificateBase64 = pair.Value
		case "sshAgentHostname":
			metadata.SshAgentHostname = pair.Value
		case "sshAgentPort":
			metadata.SshAgentPort = pair.Value
		}
	}

	return metadata, nil
}
