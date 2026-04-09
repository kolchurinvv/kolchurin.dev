<script lang="ts">
import "../app.css";

let { children } = $props();
</script>

<svelte:head>
	<title>Vladimir Kolchurin</title>
	<meta name="description" content="Backend & Systems-oriented Engineer specializing in resilient architectures and distributed systems" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
</svelte:head>

{@render children()}
