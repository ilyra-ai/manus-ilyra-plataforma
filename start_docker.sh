#!/bin/bash

echo "Construindo imagens Docker..."
docker build -t ilyra-backend ./backend
docker build -t ilyra-frontend ./frontend

echo "Iniciando contêineres Docker..."
docker run -d -p 5000:5000 --name ilyra-backend-container ilyra-backend
docker run -d -p 80:80 --name ilyra-frontend-container ilyra-frontend

echo "Contêineres iniciados. Backend na porta 5000, Frontend na porta 80."

