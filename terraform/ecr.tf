# ECR Repository for Backend
resource "aws_ecr_repository" "backend_repository" {
  name                 = "${var.app_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-backend-ecr"
  }
}

# ECR Repository for Frontend
resource "aws_ecr_repository" "frontend_repository" {
  name                 = "${var.app_name}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.app_name}-frontend-ecr"
  }
}

# Backend EC2 Instance
resource "aws_instance" "backend_instance" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.backend_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = templatefile("${path.module}/backend-user-data-new.sh", {
    app_port = var.backend_port
    aws_region = var.aws_region
    ecr_repository_uri = aws_ecr_repository.backend_repository.repository_url
  })

  tags = {
    Name = "${var.app_name}-backend-instance"
  }

  root_block_device {
    volume_type           = "gp2"
    volume_size           = 20
    delete_on_termination = true
  }
}

# Frontend EC2 Instance
resource "aws_instance" "frontend_instance" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.frontend_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = templatefile("${path.module}/frontend-user-data.sh", {
    backend_ip = aws_instance.backend_instance.private_ip
    backend_port = var.backend_port
    aws_region = var.aws_region
    ecr_repository_uri = aws_ecr_repository.frontend_repository.repository_url
  })

  tags = {
    Name = "${var.app_name}-frontend-instance"
  }

  root_block_device {
    volume_type           = "gp2"
    volume_size           = 20
    delete_on_termination = true
  }

  # Add dependency on backend instance
  depends_on = [aws_instance.backend_instance]
}

# IAM policy for EC2 to access AWS resources
resource "aws_iam_policy" "ec2_policy" {
  name        = "${var.app_name}-ec2-policy"
  description = "Policy for EC2 to access AWS resources"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:Scan"
        ]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.items_table.arn,
          aws_dynamodb_table.orders_table.arn,
          aws_dynamodb_table.users_table.arn
        ]
      },
      {
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:GetAuthorizationToken"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "ec2_policy_attachment" {
  role       = aws_iam_role.ec2_dynamodb_role.name
  policy_arn = aws_iam_policy.ec2_policy.arn
}

# Outputs
output "backend_ecr_repository_uri" {
  value = aws_ecr_repository.backend_repository.repository_url
  description = "The URI of the backend ECR repository"
}

output "frontend_ecr_repository_uri" {
  value = aws_ecr_repository.frontend_repository.repository_url
  description = "The URI of the frontend ECR repository"
}

output "backend_public_ip" {
  value = aws_instance.backend_instance.public_ip
  description = "The public IP address of the backend EC2 instance"
}

output "backend_private_ip" {
  value = aws_instance.backend_instance.private_ip
  description = "The private IP address of the backend EC2 instance"
}

output "frontend_public_ip" {
  value = aws_instance.frontend_instance.public_ip
  description = "The public IP address of the frontend EC2 instance"
}

output "dynamodb_tables" {
  value = {
    items = aws_dynamodb_table.items_table.name
    orders = aws_dynamodb_table.orders_table.name
    users = aws_dynamodb_table.users_table.name
  }
  description = "The names of the DynamoDB tables"
}