package api

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
	"kolchurin.dev/backend/internal/db"
	pb "kolchurin.dev/backend/internal/rpc/guestbook/v1"
)

type GuestbookService struct {
	pb.UnimplementedGuestbookServiceServer
	db *db.Client
}

func NewGuestbookService(dbClient *db.Client) *GuestbookService {
	return &GuestbookService{db: dbClient}
}

func (s *GuestbookService) PostMessage(ctx context.Context, req *pb.PostMessageRequest) (*pb.PostMessageResponse, error) {
	hasName := req.Name != nil && strings.TrimSpace(*req.Name) != ""
	hasNick := req.Nick != nil && strings.TrimSpace(*req.Nick) != ""
	if !hasName && !hasNick {
		// return nil, fmt.Errorf("name or nick required")
		return nil, status.Error(codes.InvalidArgument, "nick or name is required")
	}
	nick := normalize(*req.Nick)
	name := normalize(*req.Name)
	email := normalize(*req.Email)
	msg := normalize(*&req.Message)

	if msg == "" {
		return nil, fmt.Errorf("message is required")
	}

	if len([]rune(msg)) > 2000 {
		return nil, status.Error(codes.InvalidArgument, "message too long (max 2000 characters)")
	}

	author := ""
	if hasNick {
		author = nick
	}
	if len([]rune(nick)) > 32 {
		return nil, status.Error(codes.InvalidArgument, "nick too long (max 32 characters)")
	}
	if hasName {
		author = name
	}
	if len([]rune(name)) > 32 {
		return nil, status.Error(codes.InvalidArgument, "name too long (max 32 characters)")
	}

	if author == "" {
		return nil, fmt.Errorf("we need an author for a message")
	}

	entry := &pb.MessageEntry{
		Message: msg,
		Nick:    author,
		Ts:      timestamppb.Now(),
	}

	if hasName {
		entry.Name = &name
	}

	if err := s.db.SaveMessage(ctx, entry); err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}

	return &pb.PostMessageResponse{Success: true}, nil
}

func normalize(s string) string {
	s = strings.TrimSpace(s)
	return strings.Join(strings.Fields(s), " ")
}
