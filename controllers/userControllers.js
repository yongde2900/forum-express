const bcrypt = require('bcryptjs')
const db = require('../models')
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
        if(req.user.id !== Number(req.params.id)){
            return res.redirect('/restaurants')
        }
        User.findByPk(req.params.id)
            .then(user => {
                res.render('profile', {user: user.toJSON()})
            })
    }
}

module.exports = userController