terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }

  # In production, configure remote backend (e.g. AWS S3 + DynamoDB state locking)
  # backend "s3" {
  #   bucket         = "matrix-devops-tf-state"
  #   key            = "prod/matrix-rain/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "matrix-devops-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "MatrixRainEffect"
      ManagedBy   = "Terraform"
    }
  }
}
