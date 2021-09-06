import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'

test.group('Forgot password', (group) => {
  group.before(async () => {
    await Database.beginGlobalTransaction()
    await UserFactory.merge({
      email: 'henricker@email.com',
    }).create()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure create remember_me_token when all is fine', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: 'henricker@email.com',
      })
      .expect(200)

    const user = await User.findByOrFail('email', 'henricker@email.com')
    assert.equal('Check the token in your email', response.text)
    assert.exists(user.rememberMeToken)
  })

  test('ensure not create remember_me_token when email is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: 'email.com',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'email is invalid')
  })

  test('ensure not create remember_me_token when email not found', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: 'any@email.com',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'email not found')
  })

  test('ensure not create remember_me_token when email not provided', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: '',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'email is required')
  })

  test('ensure not create remember_me_token when email is not string', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/forgot-password')
      .send({
        email: 1,
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'string validation failed')
  })
})
