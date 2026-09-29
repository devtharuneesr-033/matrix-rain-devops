# ⚡ Matrix Rain Effect Page & DevOps CI/CD Pipeline

A production-grade implementation of the **Matrix Rain Effect Page** (classic HTML5 Canvas digital rain animation with interactive controls) paired with an automated end-to-end DevOps pipeline built using **GitHub, Jenkins, Docker, Terraform, Ansible, and Kubernetes**.

---

## 🌟 Application Features

- **Interactive Canvas Rain Renderer**: High-performance 60 FPS animation loop with trailing character fade effect.
- **Speed Controls**: Real-time FPS throttle slider (5 to 60 FPS).
- **Rain Density & Font Sizing**: Fine-tune character spacing and scale dynamically.
- **5 Character Sets**: Matrix Half-width Katakana, Binary (0/1), ASCII Cyber Code, Hexadecimal Dump, and Ancient Runic Glyphs.
- **5 Cyberpunk Themes**: Classic Matrix Green, Cyberpunk Cyan/Neon, Red Alert, Zion Gold, and Retro Amber Terminal.
- **Controls & Status**: Pause/Play toggle, Reset viewport, Fullscreen mode, live column counters, and pod status indicator.

---

## 🏗️ DevOps Pipeline Architecture

```
                                    +-------------------------------------------------+
                                    |               GitHub Repository                 |
                                    |    (Trunk / Branching Strategy Workflow)        |
                                    +------------------------+------------------------+
                                                             |
                                                             | Push / PR Webhook Trigger
                                                             v
                                    +-------------------------------------------------+
                                    |                Jenkins Pipeline                 |
                                    |                                                 |
                                    |  1. Checkout & npm ci                           |
                                    |  2. Lint & Unit Testing (Jest)                  |
                                    |  3. Multi-stage Docker Build                    |
                                    |  4. Push Image to Registry                      |
                                    |  5. Terraform Infra Plan & Apply                |
                                    |  6. Ansible Playbook Server Configuration       |
                                    |  7. Kubernetes Rolling Deployment               |
                                    |  8. Health Check Verification (/healthz)        |
                                    +------------------------+------------------------+
                                                             |
                                                             | Deploy Manifests
                                                             v
+-------------------------------------------------------------------------------------------------------------------+
|                                            Kubernetes Cluster Infrastructure                                      |
|                                                                                                                   |
|  +--------------------+         +-----------------------+         +-------------------------------+               |
|  | ConfigMap & HPA    | ------> | NodePort / Service    | ------> | Deployment (3 Replicas)       |               |
|  | (Metrics scaling)  |         | Port: 8080            |         | Pod 1 | Pod 2 | Pod 3         |               |
|  +--------------------+         +-----------------------+         +-------------------------------+               |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 📁 Repository Structure

```
matrix-rain-devops/
├── src/                      # Matrix Rain Canvas Web Application
│   ├── index.html            # Main HTML UI structure
│   ├── style.css             # Glassmorphism Cyberpunk styling
│   └── script.js             # High-performance Canvas animation engine
├── test/                     # Automated Test Suite
│   └── matrix.test.js        # Jest unit tests for rain calculations & state
├── terraform/                # Infrastructure as Code (IaC)
│   ├── providers.tf          # Terraform provider setup
│   ├── main.tf               # AWS VPC, Subnets, Security Group, EC2 instances
│   ├── variables.tf          # Configurable infra parameters
│   └── outputs.tf            # Output IP addresses & connection details
├── ansible/                  # Server Configuration Management
│   ├── inventory.ini         # Target node inventory
│   ├── playbook.yml          # Docker runtime & K8s node bootstrap
│   └── roles/                # Modular Ansible tasks
├── k8s/                      # Kubernetes Orchestration Manifests
│   ├── configmap.yaml        # App environment parameters
│   ├── deployment.yaml       # Deployment spec with 3 replicas & probes
│   ├── service.yaml          # ClusterIP/NodePort exposure
│   ├── ingress.yaml          # Nginx Ingress routing
│   └── hpa.yaml              # Horizontal Pod Autoscaler
├── Dockerfile                # Multi-stage Docker build config
├── nginx.conf                # Production Nginx server configuration
├── Jenkinsfile               # Declarative CI/CD pipeline definition
├── BRANCHING.md              # Git branching model & release tags documentation
└── package.json              # Node project & test dependencies
```

---

## 🚀 Quick Start & Local Running

### 1. Run Web App Locally
Open `src/index.html` in any web browser, or launch via Node HTTP server:
```bash
npm install
npm start
```

### 2. Run Automated Unit Tests
```bash
npm test
```

### 3. Build & Run Docker Container
```bash
docker build -t matrix-rain-effect:latest .
docker run -d -p 8080:8080 --name matrix-rain matrix-rain-effect:latest
```
Access in browser: `http://localhost:8080` or verify health check: `http://localhost:8080/healthz`.

### 4. Deploy Infrastructure with Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 5. Configure Servers with Ansible
```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

### 6. Deploy to Kubernetes Cluster
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

---

## 🔒 Security & Reliability

- **Non-Root Container User**: Container runs under unprivileged `nginx` user (`UID 101`).
- **Security Headers**: Standard Nginx security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).
- **Health Probes**: Kubernetes `livenessProbe` and `readinessProbe` targeting `/healthz`.
- **Zero-Downtime Deployment**: Rolling updates with `maxSurge: 1` and `maxUnavailable: 0`.
- **Auto-scaling**: HPA automatically scales pods between 2 and 10 based on CPU & Memory metrics.
