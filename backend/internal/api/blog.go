package api

import (
	"context"

	"kolchurin.dev/backend/internal/db"
	pb "kolchurin.dev/backend/internal/rpc"
)

type BlogService struct {
	pb.UnimplementedBlogServiceServer
	db *db.Client
}

func NewBlogService(dbClient *db.Client) *BlogService {
	return &BlogService{db: dbClient}
}

func (s *BlogService) GetPost(ctx context.Context, req *pb.GetPostRequest) (*pb.Post, error) {
	return nil, nil
}

func (s *BlogService) ListPosts(ctx context.Context, req *pb.ListPostsRequest) (*pb.ListPostsResponse, error) {
	return &pb.ListPostsResponse{}, nil
}

func (s *BlogService) CreatePost(ctx context.Context, req *pb.CreatePostRequest) (*pb.Post, error) {
	return nil, nil
}
