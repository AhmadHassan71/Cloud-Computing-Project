@echo off
echo ========== MERN Stack App Deployment Script ==========

REM Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not installed. Please install Docker to continue.
    echo Download from https://www.docker.com/products/docker-desktop/
    exit /b 1
)

REM Configuration
set APP_NAME=mern-crud-app
set BACKEND_DIR=..\backend
set FRONTEND_DIR=..\frontend

REM Get AWS credentials securely
set /p AWS_ACCESS_KEY_ID=Enter your AWS Access Key ID: 
set /p AWS_SECRET_ACCESS_KEY=Enter your AWS Secret Access Key: 
set /p AWS_REGION_INPUT=Enter your preferred AWS region (default: us-east-1): 

if "%AWS_REGION_INPUT%"=="" (
    set AWS_REGION=us-east-1
) else (
    set AWS_REGION=%AWS_REGION_INPUT%
)

REM Create tfvars file
echo aws_region = "%AWS_REGION%" > terraform.tfvars
echo app_name = "%APP_NAME%" >> terraform.tfvars

REM Clean up any previous failed deployments
if exist ".terraform" (
    rmdir /s /q .terraform
)
if exist ".terraform.lock.hcl" (
    del /f .terraform.lock.hcl
)

REM Initialize Terraform using Docker
echo Initializing Terraform using Docker...
docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest init

REM Validate the Terraform configuration
echo Validating Terraform configuration...
docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest validate

REM Create ECR repositories
echo Creating ECR repositories...
docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest apply -target=aws_ecr_repository.backend_repository -target=aws_ecr_repository.frontend_repository -auto-approve

REM Get ECR repository URIs - using a temporary file to avoid command output issues
echo Getting ECR repository URIs...
docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest output -raw backend_ecr_repository_uri > backend_uri.txt
set /p BACKEND_ECR_URI=<backend_uri.txt
del backend_uri.txt

docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest output -raw frontend_ecr_repository_uri > frontend_uri.txt
set /p FRONTEND_ECR_URI=<frontend_uri.txt
del frontend_uri.txt

echo Backend ECR repository created: %BACKEND_ECR_URI%
echo Frontend ECR repository created: %FRONTEND_ECR_URI%

REM Get ECR login password and login to ECR
echo Getting ECR login credentials...
docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" amazon/aws-cli:latest ecr get-login-password --region %AWS_REGION% > ecr_password.txt
set /p ECR_PASSWORD=<ecr_password.txt
del ecr_password.txt

REM Login to ECR with the password
echo Logging in to ECR...
echo %ECR_PASSWORD%| docker login --username AWS --password-stdin %BACKEND_ECR_URI%

REM Build and push backend Docker image
echo Building Docker image for backend...
cd %BACKEND_DIR%
docker build -t backend:latest .

echo Tagging and pushing backend image...
docker tag backend:latest %BACKEND_ECR_URI%:latest
docker push %BACKEND_ECR_URI%:latest
echo Backend Docker image pushed to ECR!

REM Build and push frontend Docker image
echo Building Docker image for frontend...
cd ..\%FRONTEND_DIR%

REM Create Dockerfile for frontend if it doesn't exist
if not exist "Dockerfile" (
    echo FROM node:18-alpine as build > Dockerfile
    echo WORKDIR /app >> Dockerfile
    echo COPY package*.json ./ >> Dockerfile
    echo RUN npm install >> Dockerfile
    echo COPY . . >> Dockerfile
    echo RUN npm run build >> Dockerfile
    echo FROM nginx:alpine >> Dockerfile
    echo COPY --from=build /app/build /usr/share/nginx/html >> Dockerfile
    echo COPY default.conf /etc/nginx/conf.d/default.conf >> Dockerfile
    echo EXPOSE 80 >> Dockerfile
    echo CMD ["nginx", "-g", "daemon off;"] >> Dockerfile
)

REM Login to ECR again for frontend
echo Logging in to ECR for frontend...
echo %ECR_PASSWORD%| docker login --username AWS --password-stdin %FRONTEND_ECR_URI%

docker build -t frontend:latest .

echo Tagging and pushing frontend image...
docker tag frontend:latest %FRONTEND_ECR_URI%:latest
docker push %FRONTEND_ECR_URI%:latest
echo Frontend Docker image pushed to ECR!

REM Return to terraform directory
cd ..\terraform

REM Apply the full Terraform configuration
echo Applying Terraform configuration to deploy infrastructure...
docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest apply -auto-approve

REM Get outputs
docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest output -raw backend_public_ip > backend_ip.txt
set /p BACKEND_IP=<backend_ip.txt
del backend_ip.txt

docker run --rm -v "%cd%:/workspace" -w /workspace -e AWS_ACCESS_KEY_ID="%AWS_ACCESS_KEY_ID%" -e AWS_SECRET_ACCESS_KEY="%AWS_SECRET_ACCESS_KEY%" -e AWS_REGION="%AWS_REGION%" hashicorp/terraform:latest output -raw frontend_public_ip > frontend_ip.txt
set /p FRONTEND_IP=<frontend_ip.txt
del frontend_ip.txt

echo ========== Deployment Complete! ==========
echo Backend EC2 Instance IP: %BACKEND_IP%
echo Frontend EC2 Instance IP: %FRONTEND_IP%
echo Backend API URL: http://%BACKEND_IP%:5000
echo Frontend URL: http://%FRONTEND_IP%
echo Note: It may take a few minutes for the instances to fully initialize and start the applications.

pause