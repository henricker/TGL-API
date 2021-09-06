import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import JwtType from '../../util/jwtType-inteface'
import BASE_URL from '../../util/base-url'

test.group('Get all users', (group) => {
  let admin: User
  let user: User
  let jwtAdmin: JwtType
  let jwtUser: JwtType
  group.before(async () => {
    await Database.beginGlobalTransaction()

    //id = 1
    admin = await UserFactory.merge({
      email: 'henricker@admin.com',
      password: '123@Password',
      isAdmin: true,
    }).create()

    //id = 2
    user = await UserFactory.merge({
      email: 'email@email.com',
      password: '123@Password',
    }).create()

    await UserFactory.createMany(20)

    jwtAdmin = (
      await supertest(BASE_URL).post('/session').send({
        email: admin.email,
        password: '123@Password',
      })
    ).body.jwt

    jwtUser = (
      await supertest(BASE_URL).post('/session').send({
        email: user.email,
        password: '123@Password',
      })
    ).body.jwt
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure return array of users with pagination default', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/admin/users')
      .set('Authorization', `Bearer ${jwtAdmin.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 1)
    assert.propertyVal(response.body.meta, 'per_page', 15)
    assert.isArray(response.body.data)
  })

  test('ensure return array of users when page is two', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/admin/users?page=2')
      .set('Authorization', `Bearer ${jwtAdmin.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 2)
    assert.propertyVal(response.body.meta, 'per_page', 15)
    assert.isArray(response.body.data)
  })

  test('ensure return array of users when limit pagination is three', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/admin/users?limit=3')
      .set('Authorization', `Bearer ${jwtAdmin.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 1)
    assert.propertyVal(response.body.meta, 'per_page', 3)
    assert.isArray(response.body.data)
  })

  test('ensure return array of users when limit pagination is three and page is five', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/admin/users?limit=3&page=5')
      .set('Authorization', `Bearer ${jwtAdmin.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.propertyVal(response.body.meta, 'current_page', 5)
    assert.propertyVal(response.body.meta, 'per_page', 3)
    assert.isArray(response.body.data)
  })

  test('ensure return error when admin is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL).get('/admin/users?limit=3&page=5').expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })

  test('ensure return error when user is not admin', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/admin/users?limit=3&page=5')
      .set('Authorization', `Bearer ${jwtUser.token}`)
      .expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: You are not authorized for this route.'
    )
  })
})
