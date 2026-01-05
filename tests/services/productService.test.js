const ProductService = require('../../src/services/productService');
const { Product } = require('../../src/models');
const { cleanDatabase, closeDatabase } = require('../helpers/testDb');

describe('ProductService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const product = await ProductService.createProduct(productData);

      expect(product).toHaveProperty('id');
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe("99.99");
      expect(product.category).toBe(productData.category);
      expect(product.stock).toBe(productData.stock);
    });

    it('should create product with default stock of 0', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics'
      };

      const product = await ProductService.createProduct(productData);

      expect(product.stock).toBe(0);
    });
  });

  describe('getAllProducts', () => {
    beforeEach(async () => {
      // Create test products
      await Product.bulkCreate([
        { name: 'Product 1', description: 'Desc 1', price: 50, category: 'Electronics', stock: 10 },
        { name: 'Product 2', description: 'Desc 2', price: 150, category: 'Books', stock: 5 },
        { name: 'Product 3', description: 'Desc 3', price: 200, category: 'Electronics', stock: 0 },
      ]);
    });

    it('should return all products with pagination', async () => {
      const result = await ProductService.getAllProducts(1, 10);

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('currentPage');
      expect(result).toHaveProperty('totalProducts');
      expect(result.products).toHaveLength(3);
      expect(result.totalProducts).toBe(3);
    });

    it('should filter products by category', async () => {
      const result = await ProductService.getAllProducts(1, 10, { category: 'Electronics' });

      expect(result.products).toHaveLength(2);
      expect(result.totalProducts).toBe(2);
      result.products.forEach(p => {
        expect(p.category).toBe('Electronics');
      });
    });

    it('should filter products by price range', async () => {
      const result = await ProductService.getAllProducts(1, 10, {
        minPrice: 100,
        maxPrice: 200
      });

      expect(result.products).toHaveLength(2);
      result.products.forEach(p => {
        const price = parseFloat(p.price);
        expect(price).toBeGreaterThanOrEqual(100);
        expect(price).toBeLessThanOrEqual(200);
      });
    });

    it('should filter products by stock status', async () => {
      const result = await ProductService.getAllProducts(1, 10, { inStock: 'true' });

      expect(result.products).toHaveLength(2);
      result.products.forEach(p => {
        expect(p.stock).toBeGreaterThan(0);
      });
    });

    it('should sort products by price ascending', async () => {
      const result = await ProductService.getAllProducts(1, 10, {
        sortBy: 'price',
        sortOrder: 'ASC'
      });

      expect(result.products[0].price).toBe("50.00");
      expect(result.products[2].price).toBe("200.00");
    });
  });

  describe('getProductById', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      });
      productId = product.id;
    });

    it('should return product by ID', async () => {
      const product = await ProductService.getProductById(productId);

      expect(product).toBeTruthy();
      expect(product.id).toBe(productId);
      expect(product.name).toBe('Test Product');
    });

    it('should throw error if product not found', async () => {
      await expect(
        ProductService.getProductById(99999)
      ).rejects.toThrow('Product with ID 99999 not found');
    });
  });

  describe('updateProduct', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Original Name',
        description: 'Original Description',
        price: 50,
        category: 'Electronics',
        stock: 10
      });
      productId = product.id;
    });

    it('should update product successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        price: 75
      };

      const updatedProduct = await ProductService.updateProduct(productId, updateData);

      expect(updatedProduct.name).toBe('Updated Name');
      expect(updatedProduct.price).toBe("75.00");
      expect(updatedProduct.category).toBe('Electronics'); // Unchanged
    });

    it('should throw error if product not found', async () => {
      await expect(
        ProductService.updateProduct(99999, { name: 'Test' })
      ).rejects.toThrow('Product with ID 99999 not found');
    });
  });

  describe('deleteProduct', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      });
      productId = product.id;
    });

    it('should delete product successfully', async () => {
      await ProductService.deleteProduct(productId);

      const product = await Product.findByPk(productId);
      expect(product).toBeNull();
    });

    it('should throw error if product not found', async () => {
      await expect(
        ProductService.deleteProduct(99999)
      ).rejects.toThrow('Product with ID 99999 not found');
    });
  });
});
