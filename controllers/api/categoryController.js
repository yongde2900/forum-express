const db = require('../../models')
const Category = db.Category
const categoryService = require('../../services/categoryService')
let categoryController = {
    getCategories: (req, res) => {
        return categoryService.getCategories(req, res, (data) => {
            return res.json(data)
        })
    }
}
module.exports = categoryController