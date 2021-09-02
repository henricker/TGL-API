import Factory from '@ioc:Adonis/Lucid/Factory'
import Game from 'App/Models/Game'
import User from 'App/Models/User'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    name: faker.name.firstName() + ' ' + faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    isAdmin: false,
  }
}).build()

export const GameFactory = Factory.define(Game, ({ faker }) => {
  return {
    type: faker.random.word(),
    description: faker.lorem.paragraph(),
    range: faker.datatype.number(),
    price: faker.datatype.number(),
    maxNumber: faker.datatype.number(),
    color: faker.internet.color(),
    minCartValue: faker.datatype.number(),
  }
}).build()
