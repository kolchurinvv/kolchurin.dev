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
  server: { allowedHosts: [".ngrok-free.app"] },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts}", "tests/unit/**/*.{test,spec}.{js,ts}"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["src/app.d.ts", "src/lib/index.ts", "src/test/**"],
    },
  },
})
