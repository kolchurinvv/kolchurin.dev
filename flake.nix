{
  description = "Development environment for kolchurin.dev";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell rec {
          GOPATH=$HOME/go;
          PATH=$GOPATH/bin:$PATH
          buildInputs = with pkgs; [
            go
            golsp
            golangci-lint

            bun

            protobuf
            protoc-gen-go
            protoc-gen-go-grpc

          ];

          shellHook = ''
          '';
        };
      });
}
