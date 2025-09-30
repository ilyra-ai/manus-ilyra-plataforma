
#!/bin/bash

case "$1" in
  "build")
    echo "Construindo imagens Docker..."
    docker-compose build
    ;;
  "up")
    echo "Iniciando contêineres Docker..."
    docker-compose up -d
    ;;
  "down")
    echo "Parando e removendo contêineres Docker..."
    docker-compose down
    ;;
  *)
    echo "Uso: $0 {build|up|down}"
    exit 1
    ;;
esac

