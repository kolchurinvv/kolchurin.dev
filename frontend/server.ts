import { handle } from "./.svelte-kit/adapter-bun/index.js";

const server = Bun.serve({
  port: 3000,
  fetch: (req) => handle(req),
});

console.log(`Server running at http://localhost:${server.port}`);