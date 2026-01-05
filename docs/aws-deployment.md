# AWS EC2 Deployment - Step by Step

## Cost Overview

### FREE for Learning (First 12 months):
- ✅ EC2 t2.micro: 750 hours/month (FREE)
- ✅ Storage: 30 GB (FREE)
- ✅ Data transfer: 15 GB/month out (FREE)

### What Costs Money:
- ⚠️ Elastic IP if NOT attached to running instance: $0.005/hour (~$3.60/month)
- ⚠️ Load Balancer: ~$18/month (SKIP for learning!)
- ⚠️ RDS Database: ~$15/month (We use Docker PostgreSQL = FREE!)

### Your Situation:
**Cost for 1 week learning: $0.00** ✅
- t2.micro = FREE tier
- Will delete after learning = No charges
- Your $50 credits = Backup if anything goes wrong

### Where to Check Costs:
1. AWS Console → Top right → Billing Dashboard
2. Shows real-time costs
3. Check daily while learning

---

## Prerequisites

**Before starting:**
- ✅ AWS account with $50 credits
- ✅ Region: Singapore (ap-southeast-1)
- ✅ Git Bash terminal

---

## Step 1: Launch EC2 Instance (5 min)

### 1.1 Navigate to EC2
```
1. AWS Console → Search "EC2"
2. Click "EC2" service
3. Make sure region = "Singapore" (top right)
```

### 1.2 Launch Instance
```
1. Click "Launch Instance" (orange button)

2. Name and tags:
   Name: express-api-production

3. Application and OS Images:
   ✅ Ubuntu Server 22.04 LTS (Free tier eligible)
   ✅ 64-bit (x86)

4. Instance type:
   ✅ t2.micro (Free tier eligible)

5. Key pair (login):
   → Click "Create new key pair"

   Settings:
   - Key pair name: express-api-key
   - Key pair type: RSA
   - Private key file format: .pem

   → Click "Create key pair"
   → File downloads: express-api-key.pem
   ⚠️ SAVE THIS FILE! You need it to connect!

6. Network settings:
   ✅ Allow SSH traffic from: My IP
   ✅ Allow HTTP traffic from the internet
   ✅ Allow HTTPS traffic from the internet

7. Configure storage:
   ✅ 20 GiB gp3

8. Advanced details:
   → Leave default (skip)

9. Summary:
   Number of instances: 1

10. Click "Launch instance" (orange button)
```

### 1.3 Wait for Instance to Start
```
Status will change:
Pending → Running (takes 1-2 minutes)
```

---

## Step 2: Get Public IP Address (1 min)

```
1. Click "Instances" in left sidebar
2. Click your instance (express-api-production)
3. Copy "Public IPv4 address"
   Example: 54.123.456.789

⚠️ SAVE THIS IP! This is your API URL:
   http://54.123.456.789:3000
```

---

## Step 3: Configure Security Group - Open Port 3000 (2 min)

**Your app runs on port 3000, AWS blocks it by default!**

```
1. Click your instance
2. Click "Security" tab
3. Click the Security Group ID (sg-xxxxxxxxx)
4. Click "Inbound rules" tab
5. Click "Edit inbound rules"
6. Click "Add rule"

New rule:
- Type: Custom TCP
- Port range: 3000
- Source: Anywhere-IPv4 (0.0.0.0/0)
- Description: Express API

7. Click "Save rules"
```

---

## Step 4: Connect to EC2 via SSH (3 min)

### 4.1 Prepare Your Key File

**In Git Bash terminal:**

```bash
# Navigate to Downloads (where key was saved)
cd ~/Downloads

# Set correct permissions (important for security!)
chmod 400 express-api-key.pem

# Verify key exists
ls -l express-api-key.pem
```

### 4.2 Connect to EC2

```bash
# Replace 54.123.456.789 with YOUR Public IP
ssh -i express-api-key.pem ubuntu@54.123.456.789
```

**If it asks:**
```
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```
Type: `yes`

**You should see:**
```
Welcome to Ubuntu 22.04 LTS
ubuntu@ip-172-31-xx-xx:~$
```

**✅ You're now inside AWS EC2!**

---

## Step 5: Install Docker on EC2 (5 min)

**Run these commands one by one:**

```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make Docker Compose executable
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu

# Apply group changes
newgrp docker

# Verify Docker installation
docker --version
docker-compose --version
```

**Expected output:**
```
Docker version 24.x.x
Docker Compose version 2.24.0
```

---

## Step 6: Upload Your Project to EC2 (5 min)

### Option A: Using Git (Recommended)

**On EC2:**
```bash
# Install git
sudo apt install -y git

# Clone your repository (replace with YOUR GitHub repo)
git clone https://github.com/YOUR_USERNAME/express-postgres-project.git

# Navigate to project
cd express-postgres-project
```

### Option B: Using SCP (If no GitHub yet)

**On your local computer (new terminal, NOT EC2):**

```bash
# Navigate to your project
cd /c/office/learning/express-postgres-project

# Copy entire project to EC2
# Replace 54.123.456.789 with YOUR IP
scp -i ~/Downloads/express-api-key.pem -r ./* ubuntu@54.123.456.789:~/express-postgres-project/
```

**Then on EC2:**
```bash
cd ~/express-postgres-project
```

---

## Step 7: Create Production Environment File (2 min)

**On EC2:**

```bash
# Create .env file for production
nano .env
```

**Add this content:**
```env
# Environment
NODE_ENV=production

# Server
PORT=3000

# Database (Docker internal)
DB_NAME=product_management_db
DB_USER=postgres
DB_PASSWORD=YourStrongPassword123!
DB_HOST=db
DB_PORT=5432

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-production-jwt-key-change-this
JWT_ACCESS_TOKEN_EXPIRES=15m
JWT_REFRESH_TOKEN_EXPIRES=30d
REFRESH_TOKEN_SECRET=your-super-secret-production-refresh-key-change-this
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

⚠️ **IMPORTANT:** Change the JWT secrets to something secure!

---

## Step 8: Run Docker Compose (3 min)

**On EC2:**

```bash
# Make sure you're in project directory
cd ~/express-postgres-project

# Build and start containers
docker-compose up -d

# Check if containers are running
docker ps

# View logs
docker-compose logs -f
```

**Expected output:**
```
express-app        ... Up
express-postgres-db ... Up
✅ Server is running on port 3000
```

**Press `Ctrl + C` to exit logs**

---

## Step 9: Test Your API (2 min)

### From Your Local Computer:

**Open browser or Postman:**

```
# Health check
http://YOUR_EC2_IP:3000/

# Register user
POST http://YOUR_EC2_IP:3000/api/auth/register
Body:
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}

# Get products
GET http://YOUR_EC2_IP:3000/api/products
```

**✅ If you get responses, it's working!**

---

## Step 10: Monitor and Manage (Ongoing)

### Check Logs:
```bash
# On EC2
docker-compose logs -f express-app
```

### Restart Containers:
```bash
docker-compose restart
```

### Stop Containers:
```bash
docker-compose down
```

### Update Code:
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build
```

---

## Clean Up (When Done Learning)

### Step 1: Stop Containers
```bash
# On EC2
cd ~/express-postgres-project
docker-compose down -v
```

### Step 2: Terminate EC2 Instance
```
1. AWS Console → EC2 → Instances
2. Select your instance
3. Instance state → Terminate instance
4. Confirm
```

### Step 3: Delete Key Pair (Optional)
```
1. EC2 → Key Pairs
2. Select express-api-key
3. Actions → Delete
```

**✅ No charges after termination!**

---

## Cost Tracking During Learning

**Check daily:**
```
AWS Console → Billing Dashboard → Bills

Should show:
EC2 t2.micro: $0.00 (Free tier)
Data transfer: $0.00 (Within limits)
Total: $0.00
```

**If you see charges:**
- Elastic IP not attached: Delete it
- Larger instance type: Terminate and recreate t2.micro
- Old snapshots: Delete them

---

## Troubleshooting

### Can't connect to EC2:
```bash
# Check security group has SSH rule (port 22) from your IP
# Verify key file permissions: chmod 400 express-api-key.pem
```

### API not accessible:
```bash
# Check security group has Custom TCP rule (port 3000)
# Check containers are running: docker ps
# Check logs: docker-compose logs -f
```

### Out of memory:
```bash
# t2.micro has only 1GB RAM
# Check memory: free -h
# Restart containers: docker-compose restart
```

### Database connection failed:
```bash
# Check .env file has DB_HOST=db (not localhost!)
# Check postgres container running: docker ps
```

---

## Load Balancer Setup (Optional - Costs Money!)

**Only if you want to learn (not recommended for now):**

### What Load Balancer Does:
- Distributes traffic across multiple servers
- Auto-scaling
- Health checks
- SSL termination

### Cost:
- ~$18/month (Application Load Balancer)
- NOT in free tier

### How to Set Up:
1. EC2 → Load Balancers → Create
2. Type: Application Load Balancer
3. Configure listeners (port 80/443)
4. Add EC2 instances as targets
5. Configure health checks

**Skip this unless you have extra money to spend!**

---

## Next Steps After Deployment

1. ✅ Test all API endpoints
2. ✅ Update README with live URL
3. ✅ Add to resume: "Deployed to AWS EC2"
4. ✅ Push final code to GitHub
5. ✅ Update CI/CD to auto-deploy (advanced)

---

## Interview Talking Points

**You can now say:**

> "I deployed my Express API to AWS EC2 using Docker. Set up the infrastructure, configured security groups, managed the database in containers, and ensured the application runs in production environment."

**If they ask about cost optimization:**

> "I used t2.micro for cost efficiency, Docker containers for resource management, and proper security group configuration. I understand load balancing concepts but didn't implement it to stay within free tier."

**If they ask about scaling:**

> "Currently single instance, but designed with Docker so it's ready for horizontal scaling with load balancer and auto-scaling groups."
