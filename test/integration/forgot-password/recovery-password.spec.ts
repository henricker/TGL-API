import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'

test.group('Recovery password', (group) => {
  group.before(async () => {
    await Database.beginGlobalTransaction()
    await UserFactory.merge({
      email: 'henricker@email.com',
    }).create()

    await supertest(BASE_URL).post('/forgot-password').send({
      email: 'henricker@email.com',
    })
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure not update password when password is to weak', async (assert) => {
    const token = (await User.findByOrFail('email', 'henricker@email.com')).rememberMeToken
    const response = await supertest(BASE_URL)
      .patch('/forgot-password/recovery')
      .send({
        token,
        password: '123456',
        password_confirmation: '123456',
      })
      .expect(422)

    const user = await User.findByOrFail('email', 'henricker@email.com')
    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'password')
    assert.propertyVal(response.body.errors[0], 'message', 'password to weak')
    assert.exists(user.rememberMeToken)
  })

  test('ensure not update password when token not exists', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch('/forgot-password/recovery')
      .send({
        token: '127axc',
        password: '123456',
        password_confirmation: '123456',
      })
      .expect(422)

    const user = await User.findByOrFail('email', 'henricker@email.com')
    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'token')
    assert.propertyVal(response.body.errors[0], 'message', 'token not found')
    assert.exists(user.rememberMeToken)
  })

  test('ensure not update password when some data is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch('/forgot-password/recovery')
      .send({
        token: '',
        password: '',
        password_confirmation: '',
      })
      .expect(422)

    const user = await User.findByOrFail('email', 'henricker@email.com')
    assert.exists(user.rememberMeToken)
    assert.propertyVal(response.body.errors[0], 'field', 'token')
    assert.propertyVal(response.body.errors[0], 'message', 'token is required')
    assert.propertyVal(response.body.errors[1], 'field', 'password')
    assert.propertyVal(response.body.errors[1], 'message', 'password is required')
  })

  test('ensure not update password when password and password_confirmation do not match', async (assert) => {
    const token = (await User.findByOrFail('email', 'henricker@email.com')).rememberMeToken
    const response = await supertest(BASE_URL)
      .patch('/forgot-password/recovery')
      .send({
        token,
        password: 'Password@123',
        password_confirmation: 'Password@13',
      })
      .expect(422)

    const user = await User.findByOrFail('email', 'henricker@email.com')
    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'password_confirmation')
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'Password and confirmed password do not match'
    )
    assert.exists(user.rememberMeToken)
  })

  test('ensure not update password when some data is not string', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch('/forgot-password/recovery')
      .send({
        token: 1,
        password: 1,
        password_confirmation: 1,
      })
      .expect(422)

    const user = await User.findByOrFail('email', 'henricker@email.com')
    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'token')
    assert.propertyVal(response.body.errors[0], 'message', 'string validation failed')
    assert.propertyVal(response.body.errors[2], 'field', 'password')
    assert.propertyVal(response.body.errors[2], 'message', 'string validation failed')
    assert.exists(user.rememberMeToken)
  })

  test('ensure update password when all is fine', async (assert) => {
    const token = (await User.findByOrFail('email', 'henricker@email.com')).rememberMeToken
    const response = await supertest(BASE_URL).patch('/forgot-password/recovery').send({
      token,
      password: '123456@Password',
      password_confirmation: '123456@Password',
    })

    const user = await User.findByOrFail('email', 'henricker@email.com')
    assert.equal('password updated successfully!', response.text)
    assert.notExists(user.rememberMeToken)
  })
})
