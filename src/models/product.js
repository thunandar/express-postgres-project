'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // One product can have many images
      Product.hasMany(models.ProductImage, {
        foreignKey: 'productId',
        as: 'images',
        onDelete: 'CASCADE'
      });
    }
  }

  Product.init({
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['category']
      }
    ]
  });
  
  return Product;
};