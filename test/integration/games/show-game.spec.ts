import Database from '@ioc:Adonis/Lucid/Database'
import Game from 'App/Models/Game'
import { GameFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'

test.group('Show game', (group) => {
  let game: Game

  group.before(async () => {
    await Database.beginGlobalTransaction()
    game = await GameFactory.create()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure return a game specified by id', async (assert) => {
    const response = await supertest(BASE_URL).get('/games/1').expect(200)

    assert.exists(response.body.game)
    assert.equal(game.type, response.body.game.type)
  })

  test('ensure return error when a game specified by id not exists', async (assert) => {
    const response = await supertest(BASE_URL).get('/games/50').expect(404)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'E_ROW_NOT_FOUND: Row not found')
  })
})
