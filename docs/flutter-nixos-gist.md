# Gist: Flutter + NixOS dev environment

> Captured during the developer-story interview (see `docs/developer_story.md`, Chapter 4 — the NixOS-pivot stretch). Pick up later as its own task.

## What Vladimir wants

A gist-style page on `kolchurin.dev` that publishes a **generalised** Flutter-on-NixOS development flake, derived from the working PlayerPulse flake at:

`/home/_liminor/Dev_Projects/Build_Sticky/PlayerPulse_org/playerpulse/flake.nix`

Audience: developers fighting the exact combination Vladimir fought for ~12 months and could not find proper docs for —

- Modern NVIDIA GPU on NixOS (his case: RTX 5080) needing to expose host drivers to a Nix-flake sandbox.
- Android emulator with Vulkan hardware acceleration (otherwise everything renders on CPU and stutters).
- Qt-bundled-with-the-emulator vs Wayland incompatibility, forcing X11/xcb fallback.
- Mutter's bad frame pacing for X11 clients like `qemu` / the emulator.
- Flutter toolchain layered on top of all of the above.

There's effectively zero good documentation for this combination online; what exists is buried deep inside GitHub issues, nixpkgs PRs, and scattered Reddit/Discourse threads. This gist would consolidate a known-working flake plus the explanations for *why each line is there*.

## What to strip from the source flake

Project-specific bits that should not appear in the public gist:

- `PORT="3003"` and `# FLAVOR="local";` — PlayerPulse-specific dev port + flavor flag.
- The PlayerPulse description string in `description = "Flutter environment";` (already generic) — keep as-is.
- `permittedInsecurePackages = ["olm-3.2.16"]` — only needed if downstream deps pull it in; explain it as "remove unless you need it" rather than ship it.
- Anything that hard-codes `playerpulse` paths or names. (Quick scan of the file shows nothing else project-named, but double-check before publishing.)

## What to keep and explain (the load-bearing bits)

For each, the gist should include a short "why" annotation:

1. **`config.allowUnfree = true;`** — required for the NVIDIA driver and Android SDK.
2. **`androidenv.override { licenseAccepted = true; }`** + `extraLicenses` list — bypasses the interactive license prompts that don't work in a flake build.
3. **Pinned versions** — `abiVersions`, `buildToolsVersions`, `platformVersions`, `ndkVersion`, `emulatorVersion`. Explain that floating these breaks things on a regular cadence. Document the channel pin (`nixos-25.11`) and why he didn't use unstable.
4. **`LD_LIBRARY_PATH` with `/run/opengl-driver/lib:/run/opengl-driver-32/lib`** — the "secret sauce" line (his words, in the source comment). This is the NixOS-impure-GPU bridge: Vulkan and OpenGL clients inside the flake can't autodiscover the host's NVIDIA driver, so you point at the impure path. **This single line was ~half the year of pain.** Explain it loudly.
5. **`VK_ICD_FILENAMES = "/run/opengl-driver/share/vulkan/icd.d/nvidia_icd.x86_64.json"`** — explicit Vulkan ICD manifest pointer. Pair with the `LD_LIBRARY_PATH` note.
6. **`QT_QPA_PLATFORM = "wayland;xcb"`** — fallback chain that lets the emulator's bundled-Qt work despite Wayland incompatibility. Quote his comment verbatim: *"NB: due to the emulator's bundled qt version, it currently does not start with QT\_QPA\_PLATFORM='wayland'. Maybe one day this will be supported."*
7. **`ANDROID_EMULATOR_USE_SYSTEM_LIBS=1`** + the long list of `xorg.libX*` / `nss` / `nspr` packages in `buildInputs` — tells the emulator to use the host's system libs instead of its broken bundled ones. Both pieces are needed; document why the X11 libs have to be listed explicitly.
8. **`CMAKE_PREFIX_PATH`** built from `libsecret.dev` + `gtk3.dev`  — for Flutter desktop / native plugin builds.
9. **The `shellHook`** for `PUB_CACHE` + SSL cert env vars — boilerplate that nobody documents.

## Open questions to resolve when picking this up

- Hosting target: a new route on `kolchurin.dev` under `/notes/` or `/gists/`? Or a public GitHub Gist linked from the site? Vladimir's preference TBD.
- Should the gist ship with a companion `nix flake check`-able minimal repo (so people can clone-and-go), or is the inline flake enough?
- Cross-platform claim: the source flake declares `eachSystem [ "x86_64-linux" ]` only. Worth stating "tested on x86_64-linux with NVIDIA, NixOS 25.11" and not claiming Darwin support.
- License: MIT/CC0/public-domain for the flake itself, so people can copy-paste freely.

## Status

- [ ] Draft generalised flake (strip project bits per list above).
- [ ] Write per-section "why each line is here" annotations.
- [ ] Decide hosting (gist vs `/notes/` on `kolchurin.dev`).
- [ ] Cross-post: link from any of the upstream GitHub issues that are still open on this combination, so future searchers find it.
