const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helper = require('../_helpers')

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
        const UserId = helper.getUser(req).id
        Like.create({
            UserId: UserId,
            RestaurantId: req.params.restaurantId
        })
            .then(() => res.redirect('back'))
    },
    removeLike: (req, res) => {
        const UserId = helper.getUser(req).id
        Like.findOne({where: {
            UserId: UserId,
            RestaurantId: req.params.restaurantId
        }})
            .then(like => {
                like.destroy()
                    .then(() => res.redirect('back'))
            })
    },
    getTopUsers : (req, res) => {
        User.findAll({
            include: [{model: User, as: 'Followers'}]
        }).then(users => {
            users = users.map(users => ({
                ...users.dataValues,
                FollowerCount: users.dataValues.Followers.length,
                isFollowed: helper.getUser(req).Followings.map(d => d.id).includes(users.dataValues.id)
            }))
            users = users.sort((a,b) => b.FollowerCount - a.FollowerCount)
            return res.render('topUser', {users})
        })
    },
    addFollowing: (req, res) => {
        const followerId = helper.getUser(req).id
        const followingId = req.params.id
        Followship.create({followerId, followingId}).then(() => res.redirect('back'))
    },
    removeFollowing: (req, res) => {
        const followerId = helper.getUser(req).id
        const followingId = req.params.id
        Followship.findOne({where: {
            followerId: followerId,
            followingId: followingId
        }}).then(Followship => {
            Followship.destroy().then(() => res.redirect('back'))
        })
    }
}

module.exports = userController