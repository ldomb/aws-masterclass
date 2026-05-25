#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="aws-course"
CONTAINER_NAME="aws-course"
PORT="${PORT:-3000}"

echo "==> Building image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

# Stop and remove any existing container with the same name
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "==> Removing existing container: $CONTAINER_NAME"
  docker rm -f "$CONTAINER_NAME"
fi

echo "==> Starting container on port $PORT"
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "${PORT}:3000" \
  -e NODE_ENV=production \
  "$IMAGE_NAME"

echo ""
echo "✓ App running at http://localhost:${PORT}"
echo ""
echo "  Logs:  docker logs -f $CONTAINER_NAME"
echo "  Stop:  docker rm -f $CONTAINER_NAME"
