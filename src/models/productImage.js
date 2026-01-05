'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      // Each image belongs to one product
      ProductImage.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  ProductImage.init({
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageFilename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Marks the main product image'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Display order of images'
    }
  }, {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'product_images',
    indexes: [
      {
        fields: ['productId']
      },
      {
        fields: ['isPrimary']
      }
    ]
  });

  return ProductImage;
};
