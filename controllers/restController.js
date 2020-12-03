const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
let restController = {
    getRestaurants: (req, res) => {
        let whereQuery = {}
        let categoryId = ''
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery.categoryId = categoryId
        }
        Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category],
            where: whereQuery
        })
            .then(restaurants => {
                Category.findAll({raw: true})
                .then(categories => {
                    const data = restaurants.map(r => ({
                        ...r,
                        description: r.description.substring(0, 50)
                    }))
                    res.render('restaurants', { restaurants: data,categories, categoryId })
                })
            })
    },
    getRestaurant: (req, res) => {
        Restaurant.findByPk(req.params.id, { include: [Category] })
            .then(restaurant => {
                res.render('restaurant', { restaurant: restaurant.toJSON() })
            })
    }
}

module.exports = restController