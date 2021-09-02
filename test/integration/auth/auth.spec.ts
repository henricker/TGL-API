import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'

test.group('Auth', (group) => {
  let user: User
  const userPassword = 'Password@123'

  group.before(async () => {
    user = await UserFactory.merge({ password: userPassword, isAdmin: true }).create()
  })

  test('ensure to authenticate the user and return the jwt token when everything is fine', async (assert) => {
    const response = await supertest(BASE_URL).post('/session').send({
      email: user.email,
      password: userPassword,
    })

    assert.exists(response.body.jwt)
    assert.equal(response.body.jwt.type, 'bearer')
  })

  test("ensure not authenticate the user and return an error if the credentials don't match", async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/session')
      .send({
        email: user.email,
        password: 'hasuihasdjkha12863172',
      })
      .expect(400)

    assert.exists(response.body.errors)
    assert.property(response.body.errors[0], 'message')
    assert.propertyVal(response.body.errors[0], 'message', 'Invalid user credentials')
  })

  test('ensure not authenticate the user and return error if email is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/session')
      .send({
        email: 'email.com',
        password: userPassword,
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'rule', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'email is invalid')
  })

  test('ensure not authenticate the user and return error if data is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/session')
      .send({
        email: '',
        password: '',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.equal(2, response.body.errors.length)
    assert.propertyVal(response.body.errors[0], 'message', 'email is required')
    assert.propertyVal(response.body.errors[1], 'message', 'password is required')
  })
})
