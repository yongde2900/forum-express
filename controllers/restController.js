const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 12
let restController = {
    getRestaurants: (req, res) => {
        let offset = 0
        const whereQuery = {}
        let categoryId = ''
        if (req.query.page) {
            offset = (req.query.page - 1) * pageLimit
        }
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery.categoryId = categoryId
        }
        Restaurant.findAndCountAll({
            raw: true,
            nest: true,
            include: [Category],
            where: whereQuery,
            offset: offset,
            limit: pageLimit
        }).then(result => {
            // data for pagination
            const page = Number(req.query.page) || 1
            const pages = Math.ceil(result.count / pageLimit)
            const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
            const prev = page - 1 < 1 ? 1 : page - 1
            const next = page + 1 > pages ? pages : page + 1

            // clean up restaurant data
            const data = result.rows.map(r => ({
                ...r,
                description: r.description.substring(0, 50),
            }))
            Category.findAll({
                raw: true,
                nest: true
            }).then(categories => {
                return res.render('restaurants', {
                    restaurants: data,
                    categories: categories,
                    categoryId: categoryId,
                    page: page,
                    totalPage: totalPage,
                    prev: prev,
                    next: next
                })
            })
        })
    },
    getRestaurant: (req, res) => {
        Restaurant.findByPk(req.params.id, { include: [Category, { model: Comment, include: [User] }] })
            .then(restaurant => {
                restaurant.viewCounts += 1 
                restaurant.save()
                    .then(restaurant => res.render('restaurant', { restaurant: restaurant.toJSON() }))
            })
    },
    getFeeds: (req, res) => {
        Promise.all(
            [
                Restaurant.findAll({
                    limit: 10,
                    order: [['createdAt', 'DESC']],
                    raw: true,
                    nest: true,
                    include: [Category]
                }),
                Comment.findAll({
                    limit: 10,
                    order: [['createdAt', 'DESC']],
                    raw: true,
                    nest: true,
                    include: [User, Restaurant]
                })
            ]
        )
        .then(([restaurants, comments]) => {
            return res.render('feeds', {restaurants, comments})
        })
    },
    getDashboard: (req, res) => {
        const {id} = req.params
        Promise.all([
            Comment.findAndCountAll({
                where: {UserId: id},
            }),
            Restaurant.findByPk(id, {include:[Category], raw: true, nest: true})
        ])
            .then(([result, restaurant]) => {
                res.render('dashboard', {restaurant, commentCount: result.count})
            })
    }
}

module.exports = restController