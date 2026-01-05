# Complete Setup From Scratch

## Step-by-Step Setup

### 1. Initialize Project

```bash
mkdir express-postgres-project
cd express-postgres-project
npm init -y
```

### 2. Install Dependencies

```bash
npm install express pg sequelize sequelize-cli cors helmet morgan dotenv multer 
npm install bcryptjs jsonwebtoken (for auth)
npm install --save-dev nodemon
```

### 3. Create `.sequelizerc` (manually in root)

Tells Sequelize CLI where to put files.

```javascript
const path = require('path');
module.exports = {
  'config': path.resolve('src/config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
```

**Note:** Only includes Sequelize-related paths. Don't add controllers, routes, middleware, etc.

---

### 4. Initialize Sequelize

```bash
npx sequelize-cli init
```

This creates:
- `src/config/database.js` (will need to edit)
- `src/models/index.js`
- `src/migrations/` folder
- `src/seeders/` folder

---

### 5. Edit `src/config/database.js`

Replace the generated content with:

```javascript
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME + '_test',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
```

---

### 6. Create `.env` (manually in root)

```env
NODE_ENV=development
PORT=3000
DB_NAME=product_management_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

---

### 7. Generate Model + Migration

```bash
npx sequelize-cli model:generate --name Product --attributes name:string,description:text,price:decimal,stock:integer,category:string,imageUrl:string,imageFilename:string

npx sequelize-cli model:generate --name ProductImage --attributes productId:integer,imageUrl:string,imageFilename:string,isPrimary:boolean,sortOrder:integer

npx sequelize-cli model:generate --name User --attributes email:string,password:string,name:string,role:string

```

Creates both model file and migration file.

---

### 8. Create Database and Run Migrations

```bash
npm run db:create
npm run db:migrate

npx sequelize-cli seed:generate --name demo-users
```

---

### 9. Enhance Generated Models Product.js (manually)

When you run `model:generate`, you get a basic model:




