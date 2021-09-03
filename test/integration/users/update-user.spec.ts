import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'
import JwtType from '../../util/jwtType-inteface'

test.group('Update user', (group) => {
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

  test('ensure update user when is authenticated', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        email: 'henricker@email.com',
        name: 'henricker',
      })

    assert.exists(response.body.user)
    assert.equal('henricker@email.com', response.body.user.email)
    assert.equal('henricker', response.body.user.name)
  })

  test('ensure not update user and return error when is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/users')
      .send({
        email: 'henricker@email.com',
        name: 'henricker',
      })
      .expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })

  test('ensure not update user and return error when some value of data is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        name: '',
        email: '',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'name')
    assert.propertyVal(response.body.errors[0], 'message', 'name is required')
    assert.propertyVal(response.body.errors[1], 'field', 'email')
    assert.propertyVal(response.body.errors[1], 'message', 'email is required')
  })

  test('ensure not update user and return error when some data is not string', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        name: 1,
        email: 2,
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'name')
    assert.propertyVal(response.body.errors[0], 'message', 'string validation failed')
    assert.propertyVal(response.body.errors[1], 'field', 'email')
    assert.propertyVal(response.body.errors[1], 'message', 'string validation failed')
  })

  test('ensure not update user and return error when length name is to short', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        name: 'a',
        email: 'henricker@email.com',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'name')
    assert.propertyVal(response.body.errors[0], 'message', 'name to short')
  })

  test('ensure not update user and return error when email of user to update already exists', async (assert) => {
    await UserFactory.merge({ email: 'henricker@gmail.com' }).create()

    const response = await supertest(BASE_URL)
      .put('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        name: 'henricker',
        email: 'henricker@gmail.com',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'email already exists')
  })

  test('ensure to update other user fields when the email is the same old email', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        email: user.email,
        name: 'henricker',
      })

    assert.exists(response.body.user)
    assert.equal('henricker', response.body.user.name)
    assert.equal(user.email, response.body.user.email)
  })

  test('ensure not update and return error when email is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/users')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        name: 'henricker',
        email: '@gmail.com',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'email is invalid')
  })
})
