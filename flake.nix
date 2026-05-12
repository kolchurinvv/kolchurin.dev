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

            protobuf
            protoc-gen-go
            protoc-gen-go-grpc

            chromium
          ];

          shellHook = ''
            # Use system Chromium from nixpkgs instead of Playwright-managed browsers.
            export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="${pkgs.chromium}/bin/chromium"
            export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="true"
            export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"

            # Some Nix shells inject Playwright driver/browser paths that can mismatch
            # the @playwright/test version from package.json and break browser launch.
            unset PLAYWRIGHT_BROWSERS_PATH
            unset PLAYWRIGHT_DRIVER_PATH
            unset PLAYWRIGHT_NODEJS_PATH
          '';
        };
      });
}
