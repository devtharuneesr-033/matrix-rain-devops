output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.matrix_vpc.id
}

output "master_public_ip" {
  description = "Public IP address of Kubernetes Master node"
  value       = aws_instance.k8s_master.public_ip
}

output "worker_public_ips" {
  description = "Public IP addresses of Kubernetes Worker nodes"
  value       = aws_instance.k8s_workers[*].public_ip
}

output "security_group_id" {
  description = "Security Group ID for K8s nodes"
  value       = aws_security_group.k8s_sg.id
}

output "ssh_connection_master" {
  description = "SSH Command for Master Node access"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_instance.k8s_master.public_ip}"
}
