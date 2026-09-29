# Terraform Infrastructure Provisioning Manifest
# Provisions VPC, Subnets, Security Groups, and K8s Node Virtual Machines

# 1. Virtual Private Cloud (VPC)
resource "aws_vpc" "matrix_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.cluster_name}-vpc"
  }
}

# 2. Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.matrix_vpc.id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "${var.cluster_name}-public-subnet"
  }
}

# 3. Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.matrix_vpc.id

  tags = {
    Name = "${var.cluster_name}-igw"
  }
}

# 4. Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.matrix_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.cluster_name}-public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# 5. Security Group for Kubernetes Cluster Nodes
resource "aws_security_group" "k8s_sg" {
  name        = "${var.cluster_name}-sg"
  description = "Security group for Matrix Rain K8s cluster nodes"
  vpc_id      = aws_vpc.matrix_vpc.id

  # Allow HTTP web traffic
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow NodePort web traffic
  ingress {
    from_port   = 30080
    to_port     = 30080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow SSH for Ansible management
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Kubernetes API communication
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound rule
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-sg"
  }
}

# 6. Kubernetes Master Node VM Instance
resource "aws_instance" "k8s_master" {
  ami                    = var.node_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "${var.cluster_name}-master-node"
    Role = "master"
  }
}

# 7. Kubernetes Worker Nodes VM Instances
resource "aws_instance" "k8s_workers" {
  count                  = var.worker_count
  ami                    = var.node_ami
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "${var.cluster_name}-worker-node-${count.index + 1}"
    Role = "worker"
  }
}

# 8. Generate Ansible Inventory File dynamically
resource "local_file" "ansible_inventory" {
  filename = "${path.module}/../ansible/inventory.ini"
  content  = <<EOF
[k8s_master]
${aws_instance.k8s_master.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa

[k8s_workers]
%{ for ip in aws_instance.k8s_workers[*].public_ip ~}
${ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
%{ endfor ~}

[all:vars]
ansible_python_interpreter=/usr/bin/python3
EOF
}
