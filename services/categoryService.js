const db = require('../models')
const Category = db.Category
let categoryService = {
    getCategories: (req, res, callback) => {
        Category.findAll({ raw: true })
            .then(categories => {

                if (req.params.id) {
                    category = categories.find(obj => obj.id == req.params.id)
                    callback({ categories, category })
                } else {
                    callback({ categories })
                }
            })
    }
}
module.exports = categoryService