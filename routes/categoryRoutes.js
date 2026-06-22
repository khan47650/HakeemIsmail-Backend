const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { getAllCategories, getCategoriesByType, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");

router.get('/', getAllCategories);

// Get categories by type
router.get('/type/:type', getCategoriesByType);

// Create category
router.post('/', createCategory);

// Update category 
router.put('/:id', updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

module.exports = router;