const db = require('../models')
const Category = db. Category
const categoryService = require('../services/categoryService')
let categoryController = {
    getCategories: (req, res) => {
        categoryService.getCategories(req, res, data => {
            res.render('admin/categories', data)
        })
    },
    postCategory: (req, res) => {
        Category.create({name: req.body.name})
            .then(category => {
                req.flash('success_msg', 'Category was successfully created !')
                res.redirect('/admin/categories')
            })
    },
    putCategory: (req, res) => {
        Category.findByPk(req.params.id)
            .then(category => {
                category.update({name: req.body.name})
            })
            .then(() => {
                req.flash('success_msg', 'Category was successfully updated !')
                res.redirect('/admin/categories')
            })
    },
    deleteCategory: (req, res) => {
        Category.findByPk(req.params.id)
            .then(category => category.destroy())
            .then(() => {
                req.flash('success_msg', 'Category was successfully deleted !')
                res.redirect('/admin/categories')
            })
    }
}

module.exports = categoryController