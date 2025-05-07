# PowerShell script for deploying the MERN stack application
Write-Host "========== MERN Stack App Deployment Script ==========" -ForegroundColor Yellow

# Check if Docker is installed
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed. Please install Docker to continue." -ForegroundColor Red
    Write-Host "Download from https://www.docker.com/products/docker-desktop/"
    exit 1
}

# Configuration
$APP_NAME = "mern-crud-app"
$BACKEND_DIR = "..\backend"

# Get AWS credentials
$AWS_ACCESS_KEY_ID = Read-Host "Enter your AWS Access Key ID"
$AWS_SECRET_ACCESS_KEY = Read-Host "Enter your AWS Secret Access Key"
$AWS_REGION_INPUT = Read-Host "Enter your preferred AWS region (default: us-east-1)"

if ([string]::IsNullOrEmpty($AWS_REGION_INPUT)) {
    $AWS_REGION = "us-east-1"
} else {
    $AWS_REGION = $AWS_REGION_INPUT
}

# Create tfvars file
"aws_region = `"$AWS_REGION`"" | Out-File -FilePath terraform.tfvars -Encoding utf8

# Initialize Terraform using Docker
Write-Host "Initializing Terraform using Docker..." -ForegroundColor Yellow
docker run --rm -v "${PWD}:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_REGION=$AWS_REGION hashicorp/terraform:latest init

# Create ECR repository
Write-Host "Creating ECR repository..." -ForegroundColor Yellow
docker run --rm -v "${PWD}:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_REGION=$AWS_REGION hashicorp/terraform:latest apply -target=aws_ecr_repository.app_repository -auto-approve

# Get ECR repository URI
$ECR_REPO_URI = docker run --rm -v "${PWD}:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_REGION=$AWS_REGION hashicorp/terraform:latest output -raw ecr_repository_uri

Write-Host "ECR repository created: $ECR_REPO_URI" -ForegroundColor Green

# Build Docker image
Write-Host "Building Docker image for backend..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR
docker build -t ${APP_NAME}:latest .

# Login to ECR and push image
Write-Host "Pushing Docker image to ECR..." -ForegroundColor Yellow
$ECR_PASSWORD = docker run --rm -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_REGION=$AWS_REGION amazon/aws-cli:latest ecr get-login-password
docker login --username AWS --password $ECR_PASSWORD $ECR_REPO_URI

docker tag ${APP_NAME}:latest ${ECR_REPO_URI}:latest
docker push ${ECR_REPO_URI}:latest
Write-Host "Docker image pushed to ECR!" -ForegroundColor Green

# Return to terraform directory
Set-Location ..\terraform

# Apply the full Terraform configuration
Write-Host "Applying Terraform configuration to deploy infrastructure..." -ForegroundColor Yellow
docker run --rm -v "${PWD}:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_REGION=$AWS_REGION hashicorp/terraform:latest apply -auto-approve

# Get outputs
$INSTANCE_IP = docker run --rm -v "${PWD}:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_REGION=$AWS_REGION hashicorp/terraform:latest output -raw public_ip
$INSTANCE_ID = docker run --rm -v "${PWD}:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY -e AWS_REGION=$AWS_REGION hashicorp/terraform:latest output -raw instance_id

Write-Host "========== Deployment Complete! ==========" -ForegroundColor Green
Write-Host "EC2 Instance IP: $INSTANCE_IP"
Write-Host "EC2 Instance ID: $INSTANCE_ID"
Write-Host "Application URL: http://$INSTANCE_IP:5000"
Write-Host "Note: It may take a few minutes for the instance to fully initialize and start the application." -ForegroundColor Yellow

Read-Host "Press Enter to exit"