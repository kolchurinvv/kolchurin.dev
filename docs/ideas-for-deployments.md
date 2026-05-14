
1.  **Environment Switching:** I added a conditional check at the start of the build step.
    *   **Pull Request $\rightarrow$ Preview:** It creates a tag like `preview-feature-branch-name`. This allows you 
to have multiple preview environments running simultaneously without them overwriting each other.
    *   **Push to Main $\rightarrow$ Production:** It uses the `latest` tag.
2.  **Dynamic Webhooks:** Instead of one webhook, I suggest using two secrets: `PREVIEW_WEBHOOK_URL` and             
`PRODUCTION_WEBHOOK_URL`.
    *   Your **Preview server** can listen to the preview webhook and spin up a temporary container.
    *   Your **Production server** only updates when the `latest` image is pushed.
3.  **Podman Integrity:** All commands remain `podman build` and `podman push`.

### How to handle the Server side (The Webhook)

Since you are now pushing different tags (`latest` vs `preview-xyz`), your server-side script that handles the webhook
should look something like this (conceptual bash):

```bash
# Extract the tag from the JSON payload
TAG=$(echo $PAYLOAD | jq -r '.tag')

# Pull the specific image
podman pull ghcr.io/username/repo:$TAG

# Stop the old container (if it's production or the same preview)
podman stop app-$TAG || true
podman rm app-$TAG || true

# Run the new container
podman run -d --name app-$TAG -p 8080:80 ghcr.io/username/repo:$TAG
```

### Summary of the "Preview" workflow you now have:
1.  **Developer** opens a PR named `add-login-page`.
2.  **GitHub Actions** builds an image tagged `preview-add-login-page`.
3.  **GitHub Actions** hits the **Preview Webhook**.
4.  **Preview Server** pulls `preview-add-login-page` and starts it on a specific port/subdomain.
5.  **Developer** merges PR to `main`.
6.  **GitHub Actions** builds `latest`, hits the **Production Webhook**, and the **Production Server** updates.


