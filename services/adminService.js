const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

let adminService = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category]
        })
            .then(restaurants => {
                return callback({ restaurants })
            })
    },
    getRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id, {
            raw: true,
            nest: true,
            include: [Category]
        })
            .then(restaurant => {
                return callback({ restaurant })
            })
    },
    postRestaurant: (req, res, callback) => {
        const { name, tel, address, opening_hours, description, categoryId } = req.body
        const { file } = req
        if (!req.body.name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                return Restaurant.create({
                    name,
                    tel,
                    address,
                    opening_hours,
                    description, image: file ? img.data.link : null,
                    CategoryId: categoryId
                })
                    .then(restaurant => {
                        return callback({ status: 'success', message: 'restaurant was successfully created!' })
                    })
            })
        } else {
            return Restaurant.create({
                name,
                tel,
                address,
                opening_hours,
                description, image: null,
                CategoryId: categoryId
            })
                .then(restaurant => {
                    return callback({ status: 'success', message: 'restaurant was successfully created!' })
                })
        }
    },
    putRestaurant: (req, res, callback) => {
        const { name, tel, address, opening_hours, description, categoryId } = req.body
        const { file } = req
        if (!req.body.name) {
            return callback({status: 'error', message: "name didn't exist"})
        }
        return Restaurant.findByPk(req.params.id)
            .then(restaurant => {
                if (file) {
                    imgur.setClientID(IMGUR_CLIENT_ID)
                    imgur.upload(file.path, (err, img) => {
                        restaurant.update({
                            name,
                            tel,
                            address,
                            opening_hours,
                            description,
                            image: file ? img.data.link : restaurant.img,
                            CategoryId: categoryId
                        })
                    })
                } else {
                    restaurant.update({
                        name,
                        tel,
                        opening_hours,
                        address,
                        description, image: restaurant.image,
                        CategoryId: categoryId
                    })
                }
            })
            .then(restaurant => {
                return callback({status: 'success', message: 'restaurant was successfully to update'})
            })
    },
    deleteRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id)
            .then(restaurant => restaurant.destroy())
            .then(() => {
                callback({ status: 'success', message: '' })
            })
    }

}

module.exports = adminService
