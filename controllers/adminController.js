const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const fs = require('fs')
const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant
const User = db.User
const adminService = require('../services/adminService')
let adminController = {
    getRestaurants: (req, res) => {
        adminService.getRestaurants(req, res, (data) => {
            return res.render('admin/restaurants', data)
        })
    },
    createRestaurants: (req, res) => {
        Category.findAll({ raw: true })
            .then(categories => {
                return res.render('admin/create', { categories })
            })
    },
    postRestaurant: (req, res) => {
        adminService.postRestaurant(req, res, (data) => {
            if(data.status === 'error'){
                req.flash('error_msg', data.message)
                return res.redirect('/admin/restaurants')
            }
                req.flash('success_msg', data.message)
                res.redirect('/admin/restaurants')
        })
    },
    getRestaurant: (req, res) => {
        return adminService.getRestaurant(req, res, (data) => {
            return res.render('admin/restaurant', data)
        })
    },
    editRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, {
            raw: true,
            nest: true,
        })
            .then(restaurant => {
                Category.findAll({ raw: true })
                    .then(categories => {
                        return res.render('admin/create', { restaurant, categories })
                    })
            })
    },
    putRestaurant: (req, res) => {
        adminService.putRestaurant(req, res, (data) => {
            if(data.status === 'error'){
                req.flash('error_msg', data.message)
                return res.redirect('/admin/restaurants')
            }
            req.flash('success_msg', data.message)
            return res.redirect('/admin/restaurants')
        })
    },
    deleteRestaurant: (req, res) => {
        return adminService.deleteRestaurant(req, res, (data) => {
            if (data.status === 'success') {
                req.flash('success_msg', 'restaurant was successfully to delete')
                res.redirect('/admin/restaurants')
            }
        })
    },
    getUser: (req, res) => {
        return User.findAll({ raw: true })
            .then(user => {
                res.render('admin/users', { user })
            })
    },
    toggleAdmin: (req, res) => {
        return User.findByPk(req.params.id)
            .then(user => {
                const changed2Admin = !user.isAdmin
                user.update({ isAdmin: changed2Admin })
            })
            .then(user => {
                req.flash('success_msg', 'User was successfully to updated')
                res.redirect('/admin/users')
            })
    }
}
module.exports = adminController