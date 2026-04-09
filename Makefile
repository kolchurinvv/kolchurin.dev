.PHONY: generate install-deps clean

install-deps:
	cd backend && go mod download
	@go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

generate: install-deps
	protoc --go_out=backend --go-grpc_out=backend proto/*.proto

generate-ts:
	@which protoc-gen-ts || (echo "Install protoc-gen-ts: npm install -g protoc-gen-ts" && exit 1)
	protoc --ts_out=frontend/src/rpc --proto_path=proto proto/*.proto

clean:
	rm -rf backend/internal/rpc/*.go
	rm -rf frontend/src/rpc/*.ts
