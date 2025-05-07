variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "mern-crud-app"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro" # Free tier eligible
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
  # Ubuntu 20.04 LTS (HVM), SSD Volume Type in us-east-1
  default     = "ami-0261755bbcb8c4a84"
}

variable "key_name" {
  description = "SSH key name"
  type        = string
  default     = "mern-app-key"
}

variable "app_port" {
  description = "Port on which the application runs"
  type        = number
  default     = 5000
}

variable "backend_port" {
  description = "Port on which the backend application runs"
  type        = number
  default     = 5000
}