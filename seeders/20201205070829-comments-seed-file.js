'use strict';
const faker = require('faker')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Comments',
      Array.from({ length: 10 }).map(index => ({
        text: faker.lorem.text().substring(0,20),
        UserId: 1,
        RestaurantId: Math.floor(Math.random() * 20),
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  }
};
