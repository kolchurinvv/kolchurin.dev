<script lang="ts">
import "../app.css"

let { children } = $props()
</script>

<svelte:head>
	<title>Vladimir Kolchurin</title>
	<meta name="description" content="Backend & Systems-oriented Engineer specializing in resilient architectures and distributed systems" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
	<link href="https://cdn.jsdelivr.net/npm/beercss@4.0.20/dist/cdn/beer.min.css" rel="stylesheet" />
	<script type="module" src="https://cdn.jsdelivr.net/npm/beercss@4.0.20/dist/cdn/beer.min.js"></script>
	<script type="module" src="https://cdn.jsdelivr.net/npm/material-dynamic-colors@1.1.4/dist/cdn/material-dynamic-colors.min.js"></script>
</svelte:head>

{@render children()}
