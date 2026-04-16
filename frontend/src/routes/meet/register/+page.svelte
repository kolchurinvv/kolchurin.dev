<script lang="ts">
  import { authClient } from "$lib/auth/client";
  import { goto } from "$app/navigation";
  import { redirect } from "@sveltejs/kit";

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleSignUp() {
    loading = true;
    error = "";

    if (password !== confirmPassword) {
      error = "Passwords do not match";
      loading = false;
      return;
    }

    if (password.length < 8) {
      error = "Password must be at least 8 characters";
      loading = false;
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        error = result.error.message || "Sign up failed";
      } else {
        throw redirect(303, "/meet");
      }
    } catch (e) {
      if (e instanceof redirect) {
        throw e;
      }
      error = e instanceof Error ? e.message : "Sign up failed";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Create Account | kolchurin.dev/meet</title>
</svelte:head>

<div class="auth-container">
  <div class="auth-card">
    <div class="auth-header">
      <a href="/meet/login" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Sign In
      </a>
      <h1>Create Account</h1>
      <p>Sign up to create and join meetings</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" type="text" bind:value={name} placeholder="Your name" required />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" bind:value={email} placeholder="you@example.com" required />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" type="password" bind:value={password} placeholder="Min. 8 characters" required minlength="8" />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" bind:value={confirmPassword} placeholder="••••••••" required />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>

    <div class="auth-footer">
      <p>Already have an account? <a href="/meet/login">Sign in</a></p>
    </div>
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    padding: 2rem;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
  }

  .auth-header {
    margin-bottom: 2rem;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--accent);
  }

  .auth-header h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }

  .auth-header p {
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .form-group input::placeholder {
    color: var(--text-muted);
  }

  button {
    width: 100%;
    padding: 0.875rem;
    background: var(--accent);
    border: none;
    border-radius: 8px;
    color: var(--bg-primary);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  button:hover {
    opacity: 0.9;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-message {
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    border-radius: 8px;
    color: #ef4444;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .auth-footer {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .auth-footer p {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .auth-footer a {
    color: var(--accent);
    font-weight: 500;
  }
</style>