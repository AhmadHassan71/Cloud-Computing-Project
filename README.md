# Cloud Computing Project with DynamoDB

This project demonstrates basic CRUD operations along with user authentication using Amazon DynamoDB, Express.js, React.js, and Node.js.

## Project Structure

The project repository is organized into three main folders:

- `backend`: Contains the backend server code developed using Node.js and Express.js with DynamoDB integration.
- `frontend`: Contains the frontend client code developed using React.js.
- `terraform`: Contains infrastructure as code for AWS deployment.

## Local Setup

To set up this project on your local machine, follow these steps:

### Prerequisites

Before you begin, make sure you have the following installed on your machine:

- Node.js: You can download and install Node.js from [nodejs.org](https://nodejs.org).
- AWS CLI: Install and configure AWS CLI to work with DynamoDB. [Install AWS CLI](https://aws.amazon.com/cli/).

### Installation

1. Clone the repository:

    ```bash
    git clone [your-repository-url]
    ```

2. Navigate to the project directory:

    ```bash
    cd Cloud-Computing-Project
    ```

3. Backend Setup:

    ```bash
    cd backend
    ```

    - Create a `.env` file in the `backend` directory and add the following variables:

        ```
        PORT=5000
        AWS_REGION=<your_aws_region>
        AWS_ACCESS_KEY_ID=<your_aws_access_key>
        AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
        DYNAMODB_ITEMS_TABLE=Items
        DYNAMODB_ORDERS_TABLE=Orders
        DYNAMODB_USERS_TABLE=Users
        SECRET_TOKEN=<your_secret_token>
        ```

    - Install dependencies:

        ```bash
        npm install
        ```

    - Start the backend server:

        ```bash
        npm start
        ```

4. Frontend Setup:

    ```bash
    cd ../frontend
    ```

    - Install dependencies:

        ```bash
        npm install
        ```

    - Start the frontend development server:

        ```bash
        npm start
        ```

5. Access the application:

    Once the backend and frontend servers are running, you can access the application in your web browser at [http://localhost:3000](http://localhost:3000).

## Docker Compose Setup

For a containerized deployment, you can use Docker Compose to run both the frontend and backend services together:

### Prerequisites

- Docker: You can download and install Docker from [docker.com](https://www.docker.com/products/docker-desktop/).
- Docker Compose: Typically comes with Docker Desktop for Windows and Mac.

### Steps to Run with Docker Compose

1. Navigate to the project root directory:

    ```bash
    cd Cloud-Computing-Project
    ```

2. Build and start the containers:

    ```bash
    docker-compose up --build
    ```

   This will:
   - Build the Docker images for both the frontend and backend services
   - Start containers for both services
   - Set up a shared network between them
   - Configure the frontend to communicate with the backend

3. Access the application:

   Once the containers are running, you can access the application in your web browser at:
   - Frontend: [http://localhost](http://localhost)
   - Backend API: [http://localhost:5000](http://localhost:5000)

4. Stop the containers:

    ```bash
    docker-compose down
    ```

### Environment Variables

You can customize the deployment by setting environment variables before running docker-compose:

```bash
AWS_REGION=us-west-2 docker-compose up
```

## AWS Deployment Guide

This project can be deployed to AWS using Terraform for infrastructure provisioning and Docker for containerization.

### Prerequisites

- AWS CLI: Installed and configured with appropriate credentials
- Terraform: Version 0.14+ installed
- Docker: To build container images
- An AWS account with sufficient permissions

### Setup AWS Credentials

1. Configure your AWS credentials:

    ```bash
    aws configure
    ```

   You'll need to provide:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)
   - Default output format (json)

2. Set environment variables for deployment scripts:

    ```bash
    export AWS_ACCESS_KEY_ID="your-access-key"
    export AWS_SECRET_ACCESS_KEY="your-secret-key"
    export AWS_REGION="your-region"
    ```

### Deployment Steps

1. Navigate to the terraform directory:

    ```bash
    cd terraform
    ```

2. Initialize Terraform:

    ```bash
    terraform init
    ```

3. Review the deployment plan:

    ```bash
    terraform plan
    ```

4. Deploy the infrastructure:

    ```bash
    terraform apply -auto-approve
    ```

   Alternatively, you can use the provided deployment scripts:

    - For Windows: `deploy.bat`
    - For Linux/Mac: `deploy.sh`
    - For PowerShell: `deploy.ps1`

5. Once deployment completes, Terraform will output:
   - Backend EC2 instance URL
   - Frontend EC2 instance URL
   - ECR repository URLs

### Infrastructure Components Created

- **ECR Repositories**: For storing Docker images
  - Frontend repository
  - Backend repository
  
- **EC2 Instances**:
  - Backend server instance
  - Frontend server instance
  
- **Networking**:
  - VPC
  - Subnets
  - Security Groups
  - Internet Gateway

### Post-Deployment Steps

1. Access your application using the Frontend EC2 instance's public URL
2. For API access, use the Backend EC2 instance's public URL
3. To monitor your instances, use the AWS EC2 Dashboard

### Cleanup

To remove all created AWS resources when no longer needed:

```bash
cd terraform
terraform destroy -auto-approve
```

## Contributing

If you'd like to contribute to this project, feel free to fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
