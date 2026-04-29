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
        playwrightWrapper = pkgs.writeShellScriptBin "playwright" ''
          set -euo pipefail

          if [ -f package.json ] && [ -d tests/e2e ]; then
            :
          elif [ -f frontend/package.json ]; then
            cd frontend
          else
            git_root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
            if [ -n "$git_root" ] && [ -f "$git_root/frontend/package.json" ]; then
              cd "$git_root/frontend"
            else
              echo "playwright wrapper: could not find frontend/package.json" >&2
              exit 1
            fi
          fi

          export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="${pkgs.chromium}/bin/chromium"
          export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="true"
          export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"

          exec ${pkgs.bun}/bin/bunx playwright "$@"
        '';
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
            playwrightWrapper
          ];

          PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";

          shellHook = ''
          '';
        };
      });
}
