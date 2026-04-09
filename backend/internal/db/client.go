package db

import (
	"context"
	"log"

	"github.com/valkey-io/valkey-go"
)

type Client struct {
	client valkey.Client
}

func NewClient(ctx context.Context, addr string) (*Client, error) {
	client, err := valkey.NewClient(valkey.ClientOption{
		InitAddress: []string{addr},
	})
	if err != nil {
		return nil, err
	}

	if err := client.Do(ctx, client.B().Ping().Build()).Error(); err != nil {
		return nil, err
	}

	log.Printf("connected to valkey at %s", addr)
	return &Client{client: client}, nil
}

func (c *Client) Close() {
	c.client.Close()
}

func (c *Client) Ping(ctx context.Context) error {
	return c.client.Do(ctx, c.client.B().Ping().Build()).Error()
}

func (c *Client) Do(ctx context.Context, cmd valkey.Completed) valkey.ValkeyResult {
	return c.client.Do(ctx, cmd)
}
