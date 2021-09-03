import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import JwtType from '../../util/jwtType-inteface'
import BASE_URL from '../../util/base-url'

test.group('Index user', (group) => {
  let jwt: JwtType
  let user: User

  group.before(async () => {
    await Database.beginGlobalTransaction()
    const passwordUser = 'Password@123'
    user = await UserFactory.merge({ password: passwordUser }).create()

    const { body } = await supertest(BASE_URL)
      .post('/session')
      .send({ email: user.email, password: passwordUser })

    jwt = body.jwt
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure return user when is authenticated', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(200)

    assert.exists(response.body.user)
    assert.propertyVal(response.body.user, 'email', user.email)
  })

  test('ensure not return user and return error when user is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL).get('/users').expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })
})
