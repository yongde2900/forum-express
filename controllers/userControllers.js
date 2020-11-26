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
    }
}

module.exports = userController