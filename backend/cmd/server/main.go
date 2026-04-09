package main

import (
	"context"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"

	"kolchurin.dev/backend/internal/api"
	"kolchurin.dev/backend/internal/db"
	pb "kolchurin.dev/backend/internal/rpc"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	valkeyAddr := os.Getenv("VALKEY_ADDR")
	if valkeyAddr == "" {
		valkeyAddr = "localhost:6379"
	}

	database, err := db.NewClient(ctx, valkeyAddr)
	if err != nil {
		log.Fatalf("failed to connect to valkey: %v", err)
	}
	defer database.Close()

	lis, err := net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterBlogServiceServer(s, api.NewBlogService(database))
	reflection.Register(s)

	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		<-sigCh
		log.Println("shutting down server...")
		cancel()
		s.GracefulStop()
	}()

	log.Printf("server listening on :8080")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
