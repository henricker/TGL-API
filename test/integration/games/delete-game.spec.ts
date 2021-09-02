import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { GameFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'

test.group('Delete game', async (group) => {
  let admin: User
  let commonUser: User
  const adminPassword = 'Password@123'
  const commonPassword = 'Password@1234'

  group.before(async () => {
    await Database.beginGlobalTransaction()
    await GameFactory.create()
    admin = await UserFactory.merge({ password: adminPassword, isAdmin: true }).create()
    commonUser = await UserFactory.merge({ password: commonPassword }).create()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure delete game when id is specified and admin is authenticate', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: admin.email, password: adminPassword })
    ).body

    const response = await supertest(BASE_URL)
      .delete('/admin/games/1')
      .set('Authorization', `Bearer ${jwt.token}`)

    assert.equal(200, response.status)
  })

  test('ensure not delete game when admin is not authenticate', async (assert) => {
    const response = await supertest(BASE_URL).delete('/admin/games/1').expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })

  test('ensure not delete game when user is not admin', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: commonUser.email, password: commonPassword })
    ).body

    const response = await supertest(BASE_URL)
      .delete('/admin/games/1')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: You are not authorized for this route.'
    )
  })
})
