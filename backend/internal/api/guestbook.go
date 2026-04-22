package api

import (
	"context"
	"fmt"
	"strings"

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
		return nil, fmt.Errorf("name or nick required")
	}

	msg := strings.TrimSpace(req.GetMessage())
	if msg == "" {
		return nil, fmt.Errorf("message is required")
	}

	author := ""
	if hasNick {
		author = *req.Nick
	}
	if hasName {
		author = *req.Name
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
		entry.Name = req.Name
	}

	if err := s.db.SaveMessage(ctx, entry); err != nil {
		return nil, fmt.Errorf("failed to save message: %w", err)
	}

	return &pb.PostMessageResponse{Success: true}, nil
}
