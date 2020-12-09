const db = require('../../models')
const Category = db.Category
const categoryService = require('../../services/categoryService')
let categoryController = {
    getCategories: (req, res) => {
        return categoryService.getCategories(req, res, (data) => {
            return res.json(data)
        })
    },
    postCategory: (req, res) => {
        return categoryService.postCategory(req, res, (data) => {
            return res.json(data)
        })
    },
    putCategory: (req, res) => {
        return categoryService.putCategory(req, res, (data) => {
            return res.json(data)
        })
    },
    deleteCategory: (req, res) => {
        return categoryService.deleteCategory(req, res, (data) => {
            return res.json(data)
        })
    }
}
module.exports = categoryController