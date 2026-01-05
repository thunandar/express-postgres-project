'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert products
    await queryInterface.bulkInsert('products', [
      {
        name: 'MacBook Pro',
        description: '16-inch MacBook Pro with M3 Pro chip',
        price: 2399.99,
        stock: 15,
        category: 'Electronics',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Office Desk',
        description: 'Large wooden office desk with storage',
        price: 199.99,
        stock: 5,
        category: 'Furniture',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Insert product images
    await queryInterface.bulkInsert('product_images', [
      // MacBook Pro images
      {
        productId: 1,
        imageUrl: 'http://localhost:3000/uploads/aws-two.PNG',
        imageFilename: 'aws-two.PNG',
        isPrimary: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: 1,
        imageUrl: 'http://localhost:3000/uploads/aws-ui-three.PNG',
        imageFilename: 'aws ui three.PNG',
        isPrimary: false,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Office Desk images
      {
        productId: 2,
        imageUrl: 'http://localhost:3000/uploads/aws.PNG',
        imageFilename: 'aws.PNG',
        isPrimary: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_images', null, {});
    await queryInterface.bulkDelete('products', null, {});
  }
};