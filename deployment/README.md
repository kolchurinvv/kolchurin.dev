# Kolchurin.dev K3s Deployment

This directory contains Kubernetes manifests for deploying kolchurin.dev to a K3s cluster.

## Prerequisites

- A VPS with K3s installed
- kubectl configured to access the cluster
- Container registry access for images (Docker Hub, GHCR, etc.)

## Quick Start

### 1. Install K3s on your VPS

```bash
curl -sfL https://get.k3s.io | sh -
```

### 2. Get kubeconfig from the server

```bash
scp root@your-vps:/etc/rancher/k3s/k3s.yaml ~/.kube/config
# Edit the file and change '127.0.0.1' to your VPS IP
```

### 3. Build and push images

```bash
# From the project root
docker build -t your-registry/kolchurin-backend:latest ./backend
docker push your-registry/kolchurin-backend:latest

docker build -t your-registry/kolchurin-frontend:latest ./frontend
docker push your-registry/kolchurin-frontend:latest
```

Or update the image references in `deployments.yaml` to point to your registry.

### 4. Update image references (if using custom registry)

Edit `deployments.yaml` and replace:
- `kolchurin/backend:latest` with your backend image
- `kolchurin/frontend:latest` with your frontend image

### 5. Deploy

```bash
# Using kubectl directly
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f deployments.yaml
kubectl apply -f services.yaml
kubectl apply -f ingress.yaml

# Or using Kustomize
kubectl apply -k .
```

### 6. Verify deployment

```bash
kubectl get all -n kolchurin-dev
kubectl get ingress -n kolchurin-dev
```

## TLS Certificates

For production, install cert-manager for automatic TLS:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
```

Then update the Ingress annotations to use cert-manager:

```yaml
annotations:
  cert-manager.io/cluster-issuer: letsencrypt-prod
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | SvelteKit web application |
| backend | 8080 | Go gRPC API server |
| valkey | 6379 | Valkey (Redis-compatible) database |

## Ingress Routes

| Host | Path | Service |
|------|------|---------|
| kolchurin.dev | / | frontend:3000 |
| api.kolchurin.dev | / | backend:8080 (gRPC) |

## Troubleshooting

### Check pod logs
```bash
kubectl logs -n kolchurin-dev deployment/frontend -f
kubectl logs -n kolchurin-dev deployment/backend -f
```

### Check pod status
```bash
kubectl describe pod -n kolchurin-dev -l app=frontend
kubectl describe pod -n kolchurin-dev -l app=backend
```

### Restart deployment
```bash
kubectl rollout restart deployment/frontend -n kolchurin-dev
kubectl rollout restart deployment/backend -n kolchurin-dev
```

### Delete everything
```bash
kubectl delete -k .  # Using Kustomize
# Or
kubectl delete namespace kolchurin-dev
```

## Development Notes

- Valkey uses an emptyDir volume by default (data is lost on pod restart)
- For production, consider using a PersistentVolumeClaim for Valkey
- The Traefik ingress class is configured for K3s default installation
