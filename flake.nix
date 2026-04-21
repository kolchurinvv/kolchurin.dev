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
          buildInputs = with pkgs; [
            go
            gopls
            golangci-lint

            bun
            vitejs
            nodejs_25 # needed for nvim plugins

            buf
            protobuf
            protoc-gen-go
            protoc-gen-go-grpc

          ];

          shellHook = ''
          '';
        };
      });
}
