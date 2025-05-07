#!/bin/bash
set -e

# Update and install dependencies
apt-get update
apt-get install -y docker.io docker-compose awscli

# Start Docker service
systemctl start docker
systemctl enable docker

# Create app directory
mkdir -p /app/docs
mkdir -p /app/uploads

# Add the current user to the docker group
usermod -aG docker ubuntu

# Install Docker Compose as a standalone binary
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# Create .env file
cat > /app/.env << EOF
PORT=${app_port}
SECRET_TOKEN=your_secret_token_here
AWS_REGION=${aws_region}
DYNAMODB_ITEMS_TABLE=Items
DYNAMODB_ORDERS_TABLE=Orders
DYNAMODB_USERS_TABLE=Users
EOF

# Create docker-compose.yml file
cat > /app/docker-compose.yml << EOF
version: '3'

services:
  backend:
    image: ${ecr_repository_uri}:latest
    ports:
      - "${app_port}:${app_port}"
    volumes:
      - ./docs:/usr/src/app/docs
      - ./uploads:/usr/src/app/uploads
    environment:
      - PORT=${app_port}
      - AWS_REGION=${aws_region}
      - SECRET_TOKEN=your_secret_token_here
      - DYNAMODB_ITEMS_TABLE=Items
      - DYNAMODB_ORDERS_TABLE=Orders
      - DYNAMODB_USERS_TABLE=Users
    restart: unless-stopped
EOF

# Login to ECR (using instance profile credentials)
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_repository_uri}

# Pull the latest image and run
cd /app
docker-compose pull
docker-compose up -d