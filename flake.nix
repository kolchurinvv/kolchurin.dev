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
            playwright-driver

            buf
            protobuf
            protoc-gen-go
            protoc-gen-go-grpc

          ];

          shellHook = ''
            export PLAYWRIGHT_NODEJS_PATH="${pkgs.nodejs_25}/bin/node"
            export PLAYWRIGHT_DRIVER_PATH="${pkgs.playwright-driver}/cli.js"
            export PLAYWRIGHT_BROWSERS_PATH="${pkgs.playwright-driver.browsers}"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          '';
        };
      });
}
