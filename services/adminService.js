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
                return callback({restaurants})
            })
    }
}

module.exports = adminService
