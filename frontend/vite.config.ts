import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $test: new URL("./src/test", import.meta.url).pathname,
    },
    conditions: ["browser"],
  },
  server: { allowedHosts: ["kolchurin.dev"] },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.{test,spec}.{js,ts}"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["src/app.d.ts", "src/lib/index.ts", "src/test/**"],
    },
  },
})
