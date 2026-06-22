const Category = require('../models/Category');

exports.getAllCategories = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};

        if (type) {
            query.type = type;
        }

        const categories = await Category.find(query).sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get categories by type
exports.getCategoriesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const categories = await Category.find({ type }).sort({ createdAt: -1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create category (admin only)
exports.createCategory = async (req, res) => {
    try {
        const { name, slug, description, type } = req.body;

        if (!name || !slug || !type) {
            return res.status(400).json({ message: 'Name, slug, and type are required' });
        }

        // Check if slug already exists for this type
        const existing = await Category.findOne({ slug, type });
        if (existing) {
            return res.status(400).json({ message: 'Slug already exists for this type' });
        }

        const category = new Category({
            name,
            slug,
            description,
            type
        });

        const saved = await category.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, type } = req.body;

        // Check if new slug already exists (excluding current category)
        if (slug) {
            const existing = await Category.findOne({
                slug,
                type,
                _id: { $ne: id }
            });
            if (existing) {
                return res.status(400).json({ message: 'Slug already exists for this type' });
            }
        }

        const updated = await Category.findByIdAndUpdate(
            id,
            { name, slug, description, type },
            { returnDocument:'after'}
        );

        if (!updated) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};