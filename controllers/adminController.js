const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant

let adminController = {
    getRestaurants: (req, res) => {
        return Restaurant.findAll({ raw: true })
            .then(restaurants => {
                return res.render('admin/restaurants', { restaurants })
            })
    },
    createRestaurants: (req, res) => {
        return res.render('admin/create')
    },
    postRestaurant: (req, res) => {
        const { name, tel, address, opening_hours, description } = req.body
        const { file } = req
        if (!req.body.name) {
            req.flash('error_msg', "Name didn't exist")
            return res.redirect('back')
        }
        if (file) {
            fs.readFile(file.path, (err, data) => {
                if (err) return console.log(err)
                fs.writeFile(`upload/${file.originalname}`, data, () => {
                    return Restaurant.create({ name, tel, address, opening_hours, description, image: file ? `/upload/${file.originalname}` : null })
                        .then((restaurant) => {
                            req.flash('success_msg', 'restaurant was successfully created!')
                            res.redirect('/admin/restaurants')
                        })
                })
            })
        } else {
            return Restaurant.create({ name, tel, address, opening_hours, description, image: null })
                .then(restaurant => {
                    req.flash('success_msg', 'restaurant was successfully created!')
                    res.redirect('/admin/restaurants')
                })
        }
    },
    getRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, { raw: true })
            .then(restaurant => {
                return res.render('admin/restaurant', { restaurant })
            })
    },
    editRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id, { raw: true })
            .then(restaurant => {
                return res.render('admin/create', { restaurant })
            })
    },
    putRestaurant: (req, res) => {
        const { name, tel, address, opening_hours, description } = req.body
        const { file } = req
        if (!req.body.name) {
            req.flash('error_msg', "Name didn't exist")
            return res.redirect('back')
        }
        return Restaurant.findByPk(req.params.id)
            .then(restaurant => {
                if (file) {
                    fs.readFile(file.path, (err, data) => {
                        if (err) return console.log(err)
                        fs.writeFile(`upload/${file.originalname}`, data, () => {
                            restaurant.update({ name, tel, opening_hours, address, description, image: file ? `/upload/${file.originalname}` : restaurant.image })
                        })
                    })
                } else {
                    restaurant.update({ name, tel, opening_hours, address, description, image: restaurant.image })
                }
            })
            .then(restaurant => {
                req.flash('success_msg', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
            })
    },
    deleteRestaurant: (req, res) => {
        return Restaurant.findByPk(req.params.id)
            .then(restaurant => restaurant.destroy())
            .then(() => {
                req.flash('success_msg', 'restaurant was successfully to delete')
                res.redirect('/admin/restaurants')
            })
    }
}
module.exports = adminController