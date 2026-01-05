const { ValidationError, BadRequestError } = require('../utils/errors');

/**
 * Validates pagination parameters
 */
const validatePagination = (req, res, next) => {
  try {
    const { page, limit } = req.query;

    if (page !== undefined) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestError('Page must be a positive integer');
      }
    }

    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestError('Limit must be between 1 and 100');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates product ID parameter
 */
const validateProductId = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError('Product ID is required');
    }

    const idNum = parseInt(id);
    if (isNaN(idNum) || idNum < 1) {
      throw new BadRequestError('Product ID must be a valid positive integer');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates product data for create/update operations
 * Note: Basic validation only. Model validation handles detailed constraints.
 */
const validateProduct = (req, res, next) => {
  try {
    const { name, price, description, stock, category } = req.body;
    const errors = [];

    // Name validation
    if (!name || name.trim() === '') {
      errors.push({ field: 'name', message: 'Product name is required' });
    } else if (name.length < 2 || name.length > 100) {
      errors.push({ field: 'name', message: 'Product name must be between 2 and 100 characters' });
    }

    // Price validation
    if (price === undefined || price === null || price === '') {
      errors.push({ field: 'price', message: 'Price is required' });
    } else {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        errors.push({ field: 'price', message: 'Price must be a valid positive number' });
      }
    }

    // Description validation (optional)
    if (description && description.length > 1000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
    }

    // Stock validation (optional)
    if (stock !== undefined && stock !== null && stock !== '') {
      const stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
        errors.push({ field: 'stock', message: 'Stock must be a valid positive integer' });
      }
    }

    // Category validation (optional)
    if (category && category.length > 50) {
      errors.push({ field: 'category', message: 'Category cannot exceed 50 characters' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates search query parameter
 */
const validateSearch = (req, res, next) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === '') {
      throw new BadRequestError('Search term is required');
    }

    if (search.length > 100) {
      throw new BadRequestError('Search term cannot exceed 100 characters');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates filter parameters
 */
const validateFilters = (req, res, next) => {
  try {
    const { minPrice, maxPrice, sortBy, sortOrder, inStock } = req.query;
    const errors = [];

    // Price range validation
    if (minPrice !== undefined) {
      const min = parseFloat(minPrice);
      if (isNaN(min) || min < 0) {
        errors.push({ field: 'minPrice', message: 'Minimum price must be a valid positive number' });
      }
    }

    if (maxPrice !== undefined) {
      const max = parseFloat(maxPrice);
      if (isNaN(max) || max < 0) {
        errors.push({ field: 'maxPrice', message: 'Maximum price must be a valid positive number' });
      }
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        errors.push({ field: 'priceRange', message: 'Minimum price cannot be greater than maximum price' });
      }
    }

    // Sort validation
    if (sortBy !== undefined) {
      const validSortFields = ['name', 'price', 'stock', 'createdAt'];
      if (!validSortFields.includes(sortBy)) {
        errors.push({ field: 'sortBy', message: `Sort field must be one of: ${validSortFields.join(', ')}` });
      }
    }

    if (sortOrder !== undefined) {
      const validSortOrders = ['ASC', 'DESC', 'asc', 'desc'];
      if (!validSortOrders.includes(sortOrder)) {
        errors.push({ field: 'sortOrder', message: 'Sort order must be ASC or DESC' });
      }
    }

    // Stock validation
    if (inStock !== undefined) {
      const validStockValues = ['true', 'false'];
      if (!validStockValues.includes(inStock.toLowerCase())) {
        errors.push({ field: 'inStock', message: 'inStock must be true or false' });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Filter validation failed', errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates user registration data
 */
const validateRegister = (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const errors = [];

    // Email validation
    if (!email || email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Password validation
    if (!password || password.trim() === '') {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    // Name validation
    if (!name || name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (name.length < 2 || name.length > 100) {
      errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters' });
    }

    // Role validation (optional)
    if (role && !['admin', 'user'].includes(role)) {
      errors.push({ field: 'role', message: 'Role must be either admin or user' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validates user login data
 */
const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = [];

    // Email validation
    if (!email || email.trim() === '') {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    // Password validation
    if (!password || password.trim() === '') {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateProduct,
  validateSearch,
  validatePagination,
  validateProductId,
  validateFilters,
  validateRegister,
  validateLogin
};