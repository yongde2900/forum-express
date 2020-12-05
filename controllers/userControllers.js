const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like

let userController = {
    signUpPage: (req, res) => {
        res.render('signup')
    },
    signUp: (req, res) => {
        const { email, name, password, passwordCheck } = req.body
        if (passwordCheck !== password) {
            req.flash('error_msg', '兩次密碼輸入不同')
            return res.render('signup', { email, name })
        } else {
            User.findOne({ where: { email: email } })
                .then(user => {
                    if (user) {
                        req.flash('error_msg', '信箱重複')
                        return res.render('signup', { email, name })
                    } else {
                        User.create({
                            name: name,
                            email: email,
                            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
                        }).then(user => {
                            return res.redirect('/signin')
                        })
                    }
                })
        }
    },
    signInPage: (req, res) => {
        return res.render('signin')
    },
    signIn: (req, res) => {
        req.flash('success_msg', '成功登入！')
        res.redirect('/restaurants')
    },
    logOut: (req, res) => {
        req.flash('success_msg', '成功登出！')
        req.logout()
        res.redirect('/signin')
    },
    getUser: (req, res) => {
        const { id } = req.params
        Comment.findAll({
            where: { UserId: id },
            include: [Restaurant],
            raw: true,
            nest: true
        })
            .then(comments => {
                User.findByPk(id)
                    .then(user => {
                        const commentedRestaurantsId = []
                        const commentedRestaurants = []
                        comments.forEach(comment => {
                            if(!commentedRestaurantsId.some(id => id === comment.RestaurantId)){
                                commentedRestaurantsId.push(comment.RestaurantId)
                                commentedRestaurants.push({RestaurantId:comment.RestaurantId, RestaurantImage: comment.Restaurant.image})
                            }
                        })
                        console.log(commentedRestaurants)
                        res.render('profile', {user: user.toJSON(), commentedRestaurants})
                    })
            })
    },
    editUser: (req, res) => {
        User.findByPk(req.params.id)
            .then(user => {
                res.render('edit-profile', { user: user.toJSON() })
            })
    },
    putUser: (req, res) => {
        const { file } = req
        const update = req.body
        const id = req.params.id
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                if (err) console.log(err)
                return User.findByPk(id)
                    .then(user => {
                        update.image = file ? image.data.link : user.image
                        user.update(update)
                            .then(user => {
                                req.flash('success_msg', 'Profile was successfully updated!')
                                res.redirect(`/users/${id}`)
                            })
                    })
            })
        } else {
            return User.findByPk(id)
                .then(user => {
                    update.image = user.image
                    user.update(update)
                        .then(user => {
                            req.flash('success_msg', 'Profile was successfully updated!')
                            res.redirect(`/users/${id}`)
                        })
                })
        }
    },
    addFavorite: (req, res) => {
        Favorite.create({
            UserId: req.user.id,
            RestaurantId: req.params.id
        })
            .then(() => res.redirect('back'))
    },
    removeFavorite: (req, res) => {
        Favorite.findOne({where: {
            UserId: req.user.id,
            RestaurantId: req.params.id
        }})
        .then(favorite => {
            favorite.destroy()
                .then(() => res.redirect('back'))
        })
    },
    addLike: (req, res) => {
        Like.create({
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        })
            .then(() => res.redirect('back'))
    },
    removeLike: (req, res) => {
        Like.findOne({where: {
            UserId: req.user.id,
            RestaurantId: req.params.restaurantId
        }})
            .then(like => {
                like.destroy()
                    .then(() => res.redirect('back'))
            })
    }
}

module.exports = userController