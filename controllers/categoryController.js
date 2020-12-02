const db = require('../models')
const category = require('../models/category')
const Category = db. Category
let categoryController = {
    getCategories: (req, res) => {
        Category.findAll({raw: true})   
        .then(categories => {
            res.render('admin/category/categories', {categories})
        })
    }
}

module.exports = categoryController