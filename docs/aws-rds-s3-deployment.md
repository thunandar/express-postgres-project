# AWS Deployment Guide - Production with RDS & S3

**Complete guide to deploy Express API with:**
- **EC2** for hosting
- **RDS PostgreSQL** for database (managed)
- **S3** for image storage

**Time: ~45 minutes**

---

## Architecture

- **Local Development**: Docker PostgreSQL + Local file storage
- **Production**: RDS PostgreSQL + S3 file storage

---

## Step 1: Create RDS PostgreSQL Database (10 min)

### 1.1 Navigate to RDS
1. AWS Console → Search "RDS"
2. Click "Create database"

### 1.2 Configure Database

```
1. Choose a database creation method:
   ✅ Standard create

2. Engine options:
   ✅ PostgreSQL
   Version: PostgreSQL 15.x (latest)

3. Templates:
   ✅ Free tier

4. Settings:
   DB instance identifier: express-postgres-db

   Master username: postgres

   Master password: YourStrongPassword123!
   Confirm password: YourStrongPassword123!
   ⚠️ SAVE THIS PASSWORD!

5. Instance configuration:
   ✅ Burstable classes (includes t classes)
   ✅ db.t3.micro (Free tier)

6. Storage:
   Storage type: General Purpose SSD (gp3)
   Allocated storage: 20 GiB
   ☐ Enable storage autoscaling (uncheck for free tier)

7. Connectivity:
   Compute resource: ✅ Don't connect to an EC2 compute resource

   VPC: Default VPC

   Public access: ✅ Yes (important!)

   VPC security group:
   → Create new
   New VPC security group name: express-postgres-db-sg

8. Database authentication:
   ✅ Password authentication

9. Additional configuration (click to expand):
   Initial database name: product_management_db
   ⚠️ IMPORTANT: Set this or you'll have to create it manually!

   ☐ Enable automated backups (uncheck for free tier)
   ☐ Enable encryption (optional)

10. Click "Create database" (orange button)
```

**Wait 5-10 minutes for database to become available**

### 1.3 Configure Security Group

```
1. Go to RDS → Databases → express-postgres-db
2. Click on the VPC security group link (under "Security")
3. Click "Edit inbound rules"
4. Click "Add rule"

New rule:
- Type: PostgreSQL
- Protocol: TCP (auto-selected)
- Port: 5432 (auto-filled)
- Source: Custom → 0.0.0.0/0
- Description: Allow PostgreSQL access

5. Click "Save rules"
```

### 1.4 Get RDS Endpoint

```
1. Go to RDS → Databases → express-postgres-db
2. Copy "Endpoint" under "Connectivity & security"
   Example: express-postgres-db.abc123xyz.us-east-1.rds.amazonaws.com

⚠️ SAVE THIS ENDPOINT!
```

---

## Step 2: Create S3 Bucket for Images (5 min)

### 2.1 Navigate to S3
1. AWS Console → Search "S3"
2. Click "Create bucket"

### 2.2 Configure Bucket

```
1. Bucket name: express-product-images-prod
   ⚠️ Must be globally unique! Add random numbers if taken.

2. AWS Region: us-east-1 (or your preferred region)

3. Object Ownership:
   ✅ ACLs enabled
   ✅ Bucket owner preferred

4. Block Public Access settings:
   ☐ Block all public access (UNCHECK THIS)

   ✅ I acknowledge that the current settings might result...

5. Bucket Versioning:
   ☐ Disable (default)

6. Default encryption:
   ✅ Server-side encryption with Amazon S3 managed keys (SSE-S3)

7. Click "Create bucket"
```

### 2.3 Configure Bucket Policy for Public Read

```
1. Click on your bucket name
2. Go to "Permissions" tab
3. Scroll to "Bucket policy"
4. Click "Edit"
5. Paste this policy (replace YOUR-BUCKET-NAME):

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}

6. Click "Save changes"
```

### 2.4 Enable CORS (for API uploads)

```
1. Go to "Permissions" tab
2. Scroll to "Cross-origin resource sharing (CORS)"
3. Click "Edit"
4. Paste this configuration:

[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]

5. Click "Save changes"
```

---

## Step 3: Create IAM User for S3 Access (5 min)

### 3.1 Navigate to IAM
1. AWS Console → Search "IAM"
2. Click "Users" in left sidebar
3. Click "Create user"

### 3.2 Create User

```
1. User name: express-api-s3-user
2. Click "Next"

3. Permissions options:
   ✅ Attach policies directly

   Search and select:
   ✅ AmazonS3FullAccess

4. Click "Next"
5. Click "Create user"
```

### 3.3 Create Access Keys

```
1. Click on the user you just created (express-api-s3-user)
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"

5. Use case:
   ✅ Application running outside AWS

6. Click "Next"
7. Description: Express API Production
8. Click "Create access key"

⚠️ SAVE THESE CREDENTIALS NOW! (You won't see them again)

Access key ID: AKIAIOSFODNN7EXAMPLE
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

## Step 4: Launch EC2 Instance (5 min)

**Same as original guide - see [aws-deployment.md](aws-deployment.md) Steps 1-3**

Quick summary:
1. Launch EC2 → Ubuntu 24.04 LTS → t3.micro
2. Create key pair → Save .pem file
3. Security group → Allow SSH (port 22) + Custom TCP (port 3000)

---

## Step 5: Connect and Install Docker (8 min)

**Same as original guide - see [aws-deployment.md](aws-deployment.md) Steps 4-5**

Quick summary:
```bash
# Connect to EC2
ssh -i express-postgres-api-key.pem ubuntu@YOUR-EC2-IP

# Install Docker + Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
newgrp docker
```

---

## Step 6: Upload Project to EC2 (5 min)

**Same as original guide - see [aws-deployment.md](aws-deployment.md) Step 6**

```bash
# On EC2
git clone https://github.com/yourusername/express-postgres-project.git
cd express-postgres-project
```

---

## Step 7: Create Production Environment File (5 min)

**On EC2:**

```bash
# Generate JWT secrets
openssl rand -hex 64  # Copy for JWT_SECRET
openssl rand -hex 64  # Copy for REFRESH_TOKEN_SECRET

# Create .env file
nano .env
```

**Add this content:**

```env
# Environment
NODE_ENV=production

# Server
PORT=3000

# RDS Database (Production)
DB_NAME=product_management_db
DB_USER=postgres
DB_PASSWORD=YourStrongPassword123!
DB_HOST=express-postgres-db.abc123xyz.us-east-1.rds.amazonaws.com
DB_PORT=5432

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=express-product-images-prod

# JWT Secrets (use generated ones)
JWT_SECRET=your_generated_jwt_secret_here
JWT_ACCESS_TOKEN_EXPIRES=15m
JWT_REFRESH_TOKEN_EXPIRES=30d
REFRESH_TOKEN_SECRET=your_generated_refresh_token_secret_here
```

**Replace:**
- `DB_PASSWORD`: Your RDS password
- `DB_HOST`: Your RDS endpoint
- `AWS_ACCESS_KEY_ID`: From Step 3
- `AWS_SECRET_ACCESS_KEY`: From Step 3
- `S3_BUCKET_NAME`: Your bucket name
- `JWT_SECRET` and `REFRESH_TOKEN_SECRET`: Generated values

**Save:** Ctrl + X → Y → Enter

---

## Step 8: Install Dependencies and Run Migrations (3 min)

**On EC2:**

```bash
# Install Node.js dependencies
npm install

# Run database migrations on RDS
npm run db:migrate

# Optional: Seed sample data
npm run db:seed
```

---

## Step 9: Start the Application (2 min)

**On EC2:**

```bash
# Start in production mode
NODE_ENV=production npm start

# Or use PM2 for process management (recommended)
npm install -g pm2
pm2 start src/app.js --name express-api
pm2 save
pm2 startup
```

**To view logs:**
```bash
pm2 logs express-api
```

---

## Step 10: Test Your API (2 min)

### From Your Local Computer:

```bash
# Health check
curl http://YOUR-EC2-IP:3000/

# Create a product with image
curl -X POST http://YOUR-EC2-IP:3000/api/products \
  -F "name=Test Product" \
  -F "description=Testing S3 upload" \
  -F "price=99.99" \
  -F "category=Electronics" \
  -F "stock=10" \
  -F "images=@/path/to/image.jpg"

# List products
curl http://YOUR-EC2-IP:3000/api/products
```

**✅ Images should be uploaded to S3!**

Check S3 bucket → You should see images in `products/` folder

---

## Architecture Summary

### Local Development
```
You → Docker PostgreSQL + Local /uploads folder
```

### Production
```
User → EC2 (Node.js) → RDS PostgreSQL
                    → S3 Bucket (images)
```

---

## Cost Estimate (Free Tier)

| Service | Cost |
|---------|------|
| EC2 t3.micro | Free (750 hrs/month) |
| RDS db.t3.micro | Free (750 hrs/month) |
| S3 Storage | Free (5GB) |
| **Total** | **$0** (within free tier) |

---

## Useful Commands

### Check RDS Connection
```bash
# On EC2
psql -h express-postgres-db.abc123xyz.us-east-1.rds.amazonaws.com \
     -U postgres -d product_management_db
```

### View S3 Files (AWS CLI)
```bash
aws s3 ls s3://express-product-images-prod/products/
```

### PM2 Commands
```bash
pm2 status              # Check status
pm2 logs express-api    # View logs
pm2 restart express-api # Restart
pm2 stop express-api    # Stop
```

---

## Troubleshooting

### Can't connect to RDS?
- Check security group allows 0.0.0.0/0 on port 5432
- Verify RDS is "Available" status
- Check endpoint is correct in .env

### S3 uploads failing?
- Verify IAM user has S3FullAccess
- Check bucket policy allows public read
- Verify AWS credentials in .env
- Check bucket name is correct

### API not accessible?
- Check EC2 security group allows port 3000
- Verify app is running: `pm2 status`
- Check logs: `pm2 logs express-api`

---

## Next Steps

- Add CloudFront CDN for S3
- Setup Application Load Balancer
- Enable RDS backups
- Add CloudWatch monitoring
- Setup CI/CD with GitHub Actions
- Add SSL/HTTPS with Certificate Manager

---

**Congratulations! Your API is now running on AWS with managed database and file storage!**
