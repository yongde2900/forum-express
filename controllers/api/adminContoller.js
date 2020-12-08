const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category

module.exports = {
    getRestaurants: (req, res) => {
        return Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category]
        })
            .then(restaurants => {
                return res.json( { restaurants })
            })
    }
}