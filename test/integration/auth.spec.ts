import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../util/base-url'
import PersonFactory from '../util/person-factory'

test.group('Auth', (group) => {
  const person = new PersonFactory()

  group.before(async () => {
    await Database.beginGlobalTransaction()
    await User.create({
      name: person.name,
      email: person.email,
      password: person.password + '@1Qw',
    })
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure to authenticate the user and return the jwt token when everything is fine', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/session')
      .send({
        email: person.email,
        password: person.password + '@1Qw',
      })
      .expect(200)

    assert.exists(response.body.token)
    assert.equal(response.body.token.type, 'bearer')
  })

  test("ensure not authenticate the user and return an error if the credentials don't match", async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/session')
      .send({
        email: person.email,
        password: person.password + '@1w',
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
        password: person.password + '@1w',
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
