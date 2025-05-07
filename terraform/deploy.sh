#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Configuration
REGION=${AWS_REGION:-us-east-1}
APP_NAME="mern-crud-app"
BACKEND_DIR="../backend"
FRONTEND_DIR="../frontend"

echo -e "${YELLOW}========== MERN Stack App Deployment Script ==========${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check if running in Docker or locally
USE_DOCKER=false
if ! command_exists aws || ! command_exists terraform; then
    echo -e "${YELLOW}AWS CLI or Terraform not found locally. Using Docker containers instead.${NC}"
    USE_DOCKER=true
    
    # Check if Docker is installed
    if ! command_exists docker; then
        echo -e "${RED}Error: Docker is not installed. Please install Docker to continue.${NC}"
        echo -e "Download from https://www.docker.com/products/docker-desktop/"
        exit 1
    fi
else
    echo -e "${GREEN}Using locally installed AWS CLI and Terraform.${NC}"
fi

# Set up AWS credentials interactively if they don't exist
if [ "$USE_DOCKER" = false ]; then
    # Check AWS credentials
    echo -e "${YELLOW}Checking AWS credentials...${NC}"
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        echo -e "${YELLOW}AWS credentials not configured. Let's set them up now.${NC}"
        echo -e "Enter your AWS Access Key ID:"
        read AWS_ACCESS_KEY_ID
        echo -e "Enter your AWS Secret Access Key:"
        read AWS_SECRET_ACCESS_KEY
        echo -e "Enter your preferred AWS region (default: us-east-1):"
        read AWS_REGION_INPUT
        AWS_REGION=${AWS_REGION_INPUT:-us-east-1}
        
        # Configure AWS CLI
        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
        aws configure set region $AWS_REGION
        aws configure set output json
        
        echo -e "${GREEN}AWS credentials configured!${NC}"
    else
        echo -e "${GREEN}AWS credentials valid!${NC}"
    fi
else
    # For Docker flow, prompt for credentials
    echo -e "${YELLOW}Please provide AWS credentials for Docker containers:${NC}"
    echo -e "Enter your AWS Access Key ID:"
    read AWS_ACCESS_KEY_ID
    echo -e "Enter your AWS Secret Access Key:"
    read AWS_SECRET_ACCESS_KEY
    echo -e "Enter your preferred AWS region (default: us-east-1):"
    read AWS_REGION_INPUT
    AWS_REGION=${AWS_REGION_INPUT:-us-east-1}
fi

# Create terraform.tfvars file
cat > terraform.tfvars << EOF
aws_region = "${AWS_REGION}"
app_name = "${APP_NAME}"
EOF

# Execute Terraform commands (either directly or via Docker)
if [ "$USE_DOCKER" = true ]; then
    # Using Docker for Terraform
    echo -e "${YELLOW}Initializing Terraform using Docker...${NC}"
    docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest init
    
    # Validate the Terraform configuration
    echo -e "${YELLOW}Validating Terraform configuration...${NC}"
    docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest validate
    
    # Create ECR repositories
    echo -e "${YELLOW}Creating ECR repositories...${NC}"
    docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest apply -target=aws_ecr_repository.backend_repository -target=aws_ecr_repository.frontend_repository -auto-approve
    
    # Get ECR repository URIs
    BACKEND_ECR_URI=$(docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest output -raw backend_ecr_repository_uri)
    FRONTEND_ECR_URI=$(docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest output -raw frontend_ecr_repository_uri)
else
    # Using local Terraform
    echo -e "${YELLOW}Initializing Terraform...${NC}"
    terraform init
    
    # Validate the Terraform configuration
    echo -e "${YELLOW}Validating Terraform configuration...${NC}"
    terraform validate
    
    # Create ECR repositories
    echo -e "${YELLOW}Creating ECR repositories...${NC}"
    terraform apply -target=aws_ecr_repository.backend_repository -target=aws_ecr_repository.frontend_repository -auto-approve
    
    # Get ECR repository URIs
    BACKEND_ECR_URI=$(terraform output -raw backend_ecr_repository_uri)
    FRONTEND_ECR_URI=$(terraform output -raw frontend_ecr_repository_uri)
fi

echo -e "${GREEN}Backend ECR repository created: ${BACKEND_ECR_URI}${NC}"
echo -e "${GREEN}Frontend ECR repository created: ${FRONTEND_ECR_URI}${NC}"

# Get ECR login password
if [ "$USE_DOCKER" = true ]; then
    # Using Docker for AWS CLI
    ECR_PASSWORD=$(docker run --rm -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" amazon/aws-cli:latest ecr get-login-password --region $AWS_REGION)
else
    # Using local AWS CLI
    ECR_PASSWORD=$(aws ecr get-login-password --region $AWS_REGION)
fi

# Build and push backend Docker image
echo -e "${YELLOW}Building Docker image for backend...${NC}"
cd $BACKEND_DIR
docker build -t backend:latest .

# Login to ECR
echo -e "${YELLOW}Logging in to ECR...${NC}"
echo "$ECR_PASSWORD" | docker login --username AWS --password-stdin $BACKEND_ECR_URI

# Tag and push backend image
echo -e "${YELLOW}Tagging and pushing backend image...${NC}"
docker tag backend:latest $BACKEND_ECR_URI:latest
docker push $BACKEND_ECR_URI:latest
echo -e "${GREEN}Backend Docker image pushed to ECR!${NC}"

# Build and push frontend Docker image
echo -e "${YELLOW}Building Docker image for frontend...${NC}"
cd ../$FRONTEND_DIR

# Create Dockerfile for frontend if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    cat > Dockerfile << EOF
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
fi

# Login to ECR for frontend
echo -e "${YELLOW}Logging in to ECR for frontend...${NC}"
echo "$ECR_PASSWORD" | docker login --username AWS --password-stdin $FRONTEND_ECR_URI

docker build -t frontend:latest .

echo -e "${YELLOW}Tagging and pushing frontend image...${NC}"
docker tag frontend:latest $FRONTEND_ECR_URI:latest
docker push $FRONTEND_ECR_URI:latest
echo -e "${GREEN}Frontend Docker image pushed to ECR!${NC}"

# Return to terraform directory
cd ../terraform

# Apply the full Terraform configuration
echo -e "${YELLOW}Applying Terraform configuration to deploy infrastructure...${NC}"
if [ "$USE_DOCKER" = true ]; then
    docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest apply -auto-approve
    
    # Get outputs
    BACKEND_IP=$(docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest output -raw backend_public_ip)
    FRONTEND_IP=$(docker run --rm -v "$(pwd):/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" -e AWS_REGION="$AWS_REGION" hashicorp/terraform:latest output -raw frontend_public_ip)
else
    terraform apply -auto-approve
    
    # Get outputs
    BACKEND_IP=$(terraform output -raw backend_public_ip)
    FRONTEND_IP=$(terraform output -raw frontend_public_ip)
fi

echo -e "${GREEN}========== Deployment Complete! ==========${NC}"
echo -e "Backend EC2 Instance IP: ${BACKEND_IP}"
echo -e "Frontend EC2 Instance IP: ${FRONTEND_IP}"
echo -e "Backend API URL: http://${BACKEND_IP}:5000"
echo -e "Frontend URL: http://${FRONTEND_IP}"
echo -e "${YELLOW}Note: It may take a few minutes for the instances to fully initialize and start the applications.${NC}"