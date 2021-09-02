import Database from '@ioc:Adonis/Lucid/Database'
import { GameFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'

test.group('Index game', (group) => {
  group.before(async () => {
    await Database.beginGlobalTransaction()
    await GameFactory.createMany(20)
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure return array of games with pagination default', async (assert) => {
    const response = await supertest(BASE_URL).get('/games').expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 1)
    assert.propertyVal(response.body.meta, 'per_page', 15)
    assert.isArray(response.body.data)
  })

  test('ensure return array of games of the page two', async (assert) => {
    const response = await supertest(BASE_URL).get('/games?page=2').expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 2)
    assert.propertyVal(response.body.meta, 'per_page', 15)
    assert.isArray(response.body.data)
  })

  test('ensure return array of games when limit pagination is three', async (assert) => {
    const response = await supertest(BASE_URL).get('/games?limit=3').expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 1)
    assert.propertyVal(response.body.meta, 'per_page', 3)
    assert.isArray(response.body.data)
  })

  test('ensure return array of games when limit pagination is three and page is five', async (assert) => {
    const response = await supertest(BASE_URL).get('/games?limit=3&page=5').expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 5)
    assert.propertyVal(response.body.meta, 'per_page', 3)
    assert.isArray(response.body.data)
  })
})
