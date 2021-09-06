import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import JwtType from '../../util/jwtType-inteface'
import BASE_URL from '../../util/base-url'

test.group('Demote user', (group) => {
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
      email: 'user@email.com',
      password: '123Password@',
    }).create()

    jwtAdmin = (
      await supertest(BASE_URL).post('/session').send({
        email: admin.email,
        password: '123@Password',
      })
    ).body.jwt

    jwtUser = (
      await supertest(BASE_URL).post('/session').send({
        email: user.email,
        password: '123Password@',
      })
    ).body.jwt
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure not demote user when not found user with the user_id', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch('/admin/users/demote-user/3')
      .set('Authorization', `Bearer ${jwtAdmin.token}`)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'user not found')
  })

  test('ensure not demote user when admin is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL).patch('/admin/users/demote-user/2').expect(401)
    const user = await User.findByOrFail('id', 2)
    assert.exists(response.body.errors)
    assert.isNotTrue(user.isAdmin)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })

  test('ensure not demote user when user is not admin', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch('/admin/users/demote-user/2')
      .set('Authorization', `Bearer ${jwtUser.token}`)
      .expect(401)

    const user = await User.findByOrFail('id', 2)
    assert.exists(response.body.errors)
    assert.isNotTrue(user.isAdmin)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: You are not authorized for this route.'
    )
  })

  test('ensure demote user when all is fine', async (assert) => {
    const response = await supertest(BASE_URL)
      .patch('/admin/users/demote-user/2')
      .set('Authorization', `Bearer ${jwtAdmin.token}`)

    assert.exists(response.text)
    assert.equal('user demoted', response.text)
  })
})
