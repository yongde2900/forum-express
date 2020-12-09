const db = require('../models')
const Category = db.Category
let categoryService = {
    getCategories: (req, res, callback) => {
        Category.findAll({ raw: true })
            .then(categories => {

                if (req.params.id) {
                    category = categories.find(obj => obj.id == req.params.id)
                    callback({ categories, category })
                } else {
                    callback({ categories })
                }
            })
    },
    postCategory: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        Category.create({ name: req.body.name })
            .then(category => {
                return callback({ status: 'success', message: 'Category was successfully created !' })
            })
    },
    putCategory: (req, res, callback) => {
        if (!req.body.name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        Category.findByPk(req.params.id)
            .then(category => {
                category.update({ name: req.body.name })
            })
            .then(() => {
                return callback({ status: 'success', message: 'Category was successfully created !' })
            })
    }
}
module.exports = categoryService