#!/bin/bash
set -e

# Update and install dependencies
apt-get update
apt-get install -y docker.io docker-compose awscli

# Start Docker service
systemctl start docker
systemctl enable docker

# Create app directory
mkdir -p /app

# Add the current user to the docker group
usermod -aG docker ubuntu

# Install Docker Compose as a standalone binary
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.5.0/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# Create Nginx config file with backend API proxy
cat > /app/default.conf << EOF
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://${backend_ip}:${backend_port}/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /order/ {
        proxy_pass http://${backend_ip}:${backend_port}/order/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Create docker-compose.yml file
cat > /app/docker-compose.yml << EOF
version: '3'

services:
  frontend:
    image: ${ecr_repository_uri}:latest
    ports:
      - "80:80"
    volumes:
      - ./default.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped
EOF

# Login to ECR (using instance profile credentials)
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_repository_uri}

# Pull the latest image and run
cd /app
docker-compose pull
docker-compose up -d