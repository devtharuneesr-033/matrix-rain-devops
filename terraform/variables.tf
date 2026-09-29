variable "aws_region" {
  description = "AWS region for infrastructure provisioning"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Target deployment environment"
  type        = string
  default     = "production"
}

variable "cluster_name" {
  description = "Kubernetes Cluster name prefix"
  type        = string
  default     = "matrix-rain-cluster"
}

variable "vpc_cidr" {
  description = "VPC CIDR block range"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "Public Subnet CIDR range"
  type        = string
  default     = "10.0.1.0/24"
}

variable "node_ami" {
  description = "AMI ID for Ubuntu Server 22.04 LTS"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS (us-east-1)
}

variable "instance_type" {
  description = "EC2 instance size for K8s nodes"
  type        = string
  default     = "t3.medium"
}

variable "worker_count" {
  description = "Number of Kubernetes worker nodes"
  type        = number
  default     = 2
}

variable "key_pair_name" {
  description = "SSH key pair name for server access"
  type        = string
  default     = "matrix-devops-key"
}
