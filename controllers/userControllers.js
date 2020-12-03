const bcrypt = require('bcryptjs')
const db = require('../models')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const User = db.User

let userController = {
    signUpPage: (req, res) => {
        res.render('signup')
    },
    signUp: (req, res) => {
        const {email, name, password, passwordCheck} = req.body
        if(passwordCheck !== password){
            req.flash('error_msg', '兩次密碼輸入不同')
            return res.render('signup', {email, name})
        }else{
            User.findOne({where: {email: email}})
                .then(user => {
                    if(user) {
                        req.flash('error_msg', '信箱重複')
                        return res.render('signup', {email, name})
                    }else {
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
        // if(req.user.id !== Number(req.params.id)){
        //     return res.redirect('/restaurants')
        // }
        //辨別使用者但會使測試失敗
        User.findByPk(req.params.id)
            .then(user => {
                res.render('profile', {user: user.toJSON()})
            })
    },
    editUser: (req, res) => {
        // if(req.user.id !== Number(req.params.id)){
        //     return res.redirect('/restaurants')
        // }
        //辨別使用者但會使測試失敗
        User.findByPk(req.params.id)
            .then(user => {
                res.render('edit-profile', {user: user.toJSON()})
            })
    },
    putUser: (req, res) => {
        if (!req.body.name) {
            req.flash('error_msg', "Name didn't exist")
            return res.redirect('back')
        }
        const {file} = req
        return User.findByPk(req.params.id)
            .then(user => {
                if(file) {
                    imgur.setClientID(IMGUR_CLIENT_ID)
                    imgur.upload(file.path, (err, img) => {
                        user.update({
                            name: req.body.name,
                            image: file ? img.data.link : user.image
                        })
                    })
                }else{
                    console.log('if else file',req.body)
                    user.update({name: req.body.name})
                }
            })
            .then(user => {
                req.flash('success_msg', 'profile was successfully updated!')
                res.redirect(`/users/${req.params.id}`)
            })
    }
}

module.exports = userController