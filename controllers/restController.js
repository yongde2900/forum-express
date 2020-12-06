const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 12
const helper = require('../_helpers')
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
                isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
                isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
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
        Restaurant.findByPk(req.params.id, { include: [Category, { model: Comment, include: [User] }, { model: User, as: 'FavoritedUsers' }, { model: User, as: 'LikedUsers' }] })
            .then(restaurant => {
                const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(helper.getUser(req).id)
                const isLiked = restaurant.LikedUsers.map(item => item.id).includes(helper.getUser(req).id)
                restaurant.viewCounts += 1
                restaurant.save()
                    .then(restaurant => res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked }))
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
                return res.render('feeds', { restaurants, comments })
            })
    },
    getDashboard: (req, res) => {
        const { id } = req.params
        Promise.all([
            Comment.findAndCountAll({
                where: { UserId: id },
            }),
            Restaurant.findByPk(id, { include: [Category], raw: true, nest: true })
        ])
            .then(([result, restaurant]) => {
                res.render('dashboard', { restaurant, commentCount: result.count })
            })
    },
    getTopRestaurants: (req, res) => {
        Restaurant.findAll({
            include: [{model: User, as: 'FavoritedUsers' }]
        }).then(restaurants => {
            restaurants = restaurants.map(restaurants => ({
                ...restaurants.dataValues,
                FavoriteCount: restaurants.dataValues.FavoritedUsers.length,
                isFavorited: restaurants.dataValues.FavoritedUsers.map(d => d.id).includes(helper.getUser(req).id)
            }))
            restaurants = restaurants.sort((a,b) => b.FavoriteCount - a.FavoriteCount).slice(0, 10)
            res.render('topRestaurants', {restaurants})
        })
    }
}

module.exports = restController