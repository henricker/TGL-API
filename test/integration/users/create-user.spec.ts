import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'
import PersonFactory from '../../util/person-factory'

test.group('Create user', (group) => {
  group.before(async () => {
    await Database.beginGlobalTransaction()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure the user can be created when everything is fine', async (assert) => {
    const person = new PersonFactory()
    const response = await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: person.name,
        email: person.email,
        password: person.password + '@Aq1',
        password_confirmation: person.password + '@Aq1',
      })
      .expect(200)

    assert.exists(response.body.user)
    assert.exists(response.body.token)
    assert.equal(person.email, response.body.user.email)
  })

  test('ensure the user cannot be created if the email already exists', async (assert) => {
    const person = new PersonFactory()
    await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: person.name,
        email: person.email,
        password: person.password + '@Aq1',
        password_confirmation: person.password + '@Aq1',
      })
      .expect(200)

    const response = await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: person.name,
        email: person.email,
        password: person.password + '@Aq1',
        password_confirmation: person.password + '@Aq1',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.property(response.body.errors[0], 'message')
    assert.property(response.body.errors[0], 'field')
    assert.property(response.body.errors[0], 'rule')
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'rule', 'unique')
    assert.propertyVal(response.body.errors[0], 'message', 'email already exists')
  })

  test('ensure the user cannot be created if email is invalid', async (assert) => {
    const person = new PersonFactory()
    const response = await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: person.name,
        email: 'email.com',
        password: person.password + '@Aq1',
        password_confirmation: person.password + '@Aq1',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.property(response.body.errors[0], 'message')
    assert.property(response.body.errors[0], 'field')
    assert.property(response.body.errors[0], 'rule')
    assert.propertyVal(response.body.errors[0], 'field', 'email')
    assert.propertyVal(response.body.errors[0], 'rule', 'email')
    assert.propertyVal(response.body.errors[0], 'message', 'email invalid')
  })

  test('ensure the user cannot be created if passoword to weak', async (assert) => {
    const person = new PersonFactory()
    const response = await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: person.name,
        email: person.email,
        password: '123',
        password_confirmation: '123',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.property(response.body.errors[0], 'message')
    assert.property(response.body.errors[0], 'field')
    assert.property(response.body.errors[0], 'rule')
    assert.propertyVal(response.body.errors[0], 'field', 'password')
    assert.propertyVal(response.body.errors[0], 'rule', 'regex')
    assert.propertyVal(response.body.errors[0], 'message', 'password to weak')
  })

  test('ensure the user cannot be created if the password and password_confirmation do not match', async (assert) => {
    const person = new PersonFactory()
    const response = await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: person.name,
        email: person.email,
        password: person.password + '@Aq1',
        password_confirmation: person.password + '@Aq2',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.property(response.body.errors[0], 'message')
    assert.property(response.body.errors[0], 'field')
    assert.property(response.body.errors[0], 'rule')
    assert.propertyVal(response.body.errors[0], 'field', 'password_confirmation')
    assert.propertyVal(response.body.errors[0], 'rule', 'confirmed')
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'password and password_confirmation do not match'
    )
  })

  test('ensure the user cannot be created if the property name has length less than 2', async (assert) => {
    const person = new PersonFactory()
    const response = await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: 'a',
        email: person.email,
        password: person.password + '@Aq1',
        password_confirmation: person.password + '@Aq1',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.property(response.body.errors[0], 'message')
    assert.property(response.body.errors[0], 'field')
    assert.property(response.body.errors[0], 'rule')
    assert.propertyVal(response.body.errors[0], 'field', 'name')
    assert.propertyVal(response.body.errors[0], 'rule', 'minLength')
    assert.propertyVal(response.body.errors[0], 'message', 'name to short')
  })

  test('ensure the user cannot be create if data is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/create')
      .send({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'name is required')
    assert.propertyVal(response.body.errors[1], 'message', 'email is required')
    assert.propertyVal(response.body.errors[2], 'message', 'password is required')
  })
})
