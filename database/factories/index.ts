import Factory from '@ioc:Adonis/Lucid/Factory'
import Bet from 'App/Models/Bet'
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
    range: faker.datatype.number(100),
    price: faker.datatype.number(100),
    maxNumber: faker.datatype.number(100),
    color: faker.internet.color(),
    minCartValue: faker.datatype.number(100),
  }
}).build()

export const BetFactory = Factory.define(Bet, ({ faker }) => {
  return {
    gameId: faker.datatype.number(),
  }
}).build()
