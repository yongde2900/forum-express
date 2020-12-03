const db =require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
let restController = {
    getRestaurants: (req, res) => {
        Restaurant.findAll({
            raw: true,
            nest: true,
            include: [Category]
        })
        .then(restaurants => {
            const data = restaurants.map(r => ({
                ...r,
                description: r.description.substring(0,50)
            }))
            res.render('restaurants', {restaurants: data})
        })
    }
}

module.exports = restController