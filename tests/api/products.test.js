const request = require('supertest');
const app = require('../../src/app');
const { cleanDatabase, closeDatabase } = require('../helpers/testDb');
const { Product } = require('../../src/models');

describe('Products API Endpoints', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    await cleanDatabase();

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin'
      });
    adminToken = adminResponse.body.data.accessToken;

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'password123',
        name: 'Regular User'
      });
    userToken = userResponse.body.data.accessToken;

    // Create test products
    await Product.bulkCreate([
      { name: 'Product 1', description: 'Desc 1', price: 50, category: 'Electronics', stock: 10 },
      { name: 'Product 2', description: 'Desc 2', price: 150, category: 'Books', stock: 5 },
    ]);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('GET /api/products', () => {
    it('should get all products without authentication', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('products');
      expect(response.body.data).toHaveProperty('totalPages');
      expect(response.body.data.products).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=1');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.totalPages).toBe(2);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Electronics');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].category).toBe('Electronics');
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=100&maxPrice=200');

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(1);
      expect(response.body.data.products[0].price).toBe("150.00");
    });
  });

  describe('GET /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.findOne();
      productId = product.id;
    });

    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    const newProduct = {
      name: 'New Product',
      description: 'New Description',
      price: 99.99,
      category: 'Electronics',
      stock: 20
    };

    it('should create product as admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(newProduct.name);
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newProduct);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(newProduct);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Product without price'
          // Missing price
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.findOne();
      productId = product.id;
    });

    it('should update product as admin', async () => {
      const updateData = {
        name: 'Updated Name',
        price: 75
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.price).toBe("75.00");
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Product',
          price: 99.99,
          description: 'Updated description'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.findOne();
      productId = product.id;
    });

    it('should delete product as admin', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);

      // Verify product is deleted
      const deletedProduct = await Product.findByPk(productId);
      expect(deletedProduct).toBeNull();
    });

    it('should return 403 for regular user', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});