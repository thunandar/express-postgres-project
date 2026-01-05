# Docker Commands - Quick Reference

```bash
# Start containers (background)
docker-compose up -d

# Start + build (first time or after Dockerfile changes)
docker-compose up --build -d

# Start containers (see logs in terminal - blocks terminal)
docker-compose up

# Stop containers
docker-compose down

# View live logs (all containers)
docker-compose logs -f

# View last 50 lines of logs
docker-compose logs -f --tail=50

# View app logs only
docker logs express-app

# View last 30 lines of app logs
docker logs express-app --tail=30

# Check running containers
docker ps

# Fresh start (delete everything including database data)
docker-compose down -v
docker-compose up -d --build

#Runs tests INSIDE the Docker container
docker exec express-app npm test

# Test if app works
curl http://localhost:3000/api/health
```

**Flags:**
- `-d` = background (terminal free)
- `-f` = follow (keep showing new logs)
- `-v` = delete volumes (database data)
- `--build` = rebuild image (after code changes)

---

## What I Created

1. **Dockerfile** = Recipe to build app
2. **docker-compose.yml** = Run app + database
3. **.dockerignore** = Ignore junk files
4. **docker-entrypoint.sh** = Auto-run migrations

## Interview Questions You Can Answer Now

**Q: What is Docker?**
A: Tool to package apps into containers that run anywhere

**Q: What is Docker Compose?**
A: Tool to run multiple containers together (app + database)

**Q: Why use Docker?**
A: Same environment on dev, test, production. No "works on my machine" issues

**Q: What's in your Dockerfile?**
A: Node.js base image, install dependencies, copy code, run migrations, start app

**Q: How do containers communicate?**
A: Through Docker network. My app connects to `db` host (container name)
