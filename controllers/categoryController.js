const db = require('../models')
const category = require('../models/category')
const Category = db. Category
let categoryController = {
    getCategories: (req, res) => {
        Category.findAll({raw: true})   
        .then(categories => {
            res.render('admin/category/categories', {categories})
        })
    },
    postCategory: (req, res) => {
        Category.create({name: req.body.name})
            .then(category => {
                req.flash('success_msg', 'Category was successfully created !')
                res.redirect('/admin/categories')
            })
    }
}

module.exports = categoryController