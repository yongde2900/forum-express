const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant

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
    deleteRestaurant: (req, res, callback) => {
        return Restaurant.findByPk(req.params.id)
            .then(restaurant => restaurant.destroy())
            .then(() => {
                callback({status: 'success', message: ''})
            })
    }

}

module.exports = adminService
