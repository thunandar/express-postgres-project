## model:generate vs migration:generate

### `model:generate` - Creates Model + Migration

```bash
npx sequelize-cli model:generate --name Product --attributes name:string,description:text,price:decimal,stock:integer,category:string
```

**Creates TWO files automatically:**
- Model file (`models/product.js`)
- Migration file (`migrations/XXXXXXXX-create-product.js`)

---

### `migration:generate` - Creates Migration Only (Advanced)

```bash
npx sequelize-cli migration:generate --name create-product
```

**Creates ONLY migration file**

---

## Phase 1: Initial Setup

```bash
# Create main models
npx sequelize-cli model:generate --name Product --attributes name:string,description:text,price:decimal,stock:integer,sku:string

# Run initial migrations
npx sequelize-cli db:migrate
```

---

## Phase 2: Adding New Features (Weeks Later)

```bash
# Add categories feature
npx sequelize-cli model:generate --name Category --attributes name:string,description:text

# Modify existing products table to add category relationship
npx sequelize-cli migration:generate --name add-categoryId-to-products

# Add indexes for performance
npx sequelize-cli migration:generate --name add-indexes-to-products
```


