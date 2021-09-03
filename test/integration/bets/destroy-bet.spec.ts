import Database from '@ioc:Adonis/Lucid/Database'
import { BetFactory, GameFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'
import JwtType from '../../util/jwtType-inteface'

test.group('Delete bet', (group) => {
  const userEmail = 'henricker@email.com'
  const userPassword = 'Password@123'
  const otherEmail = 'email@henricker.com'
  const otherPassword = 'Password@1234'
  let jwt: JwtType
  let othetJwt: JwtType

  group.before(async () => {
    await Database.beginGlobalTransaction()

    await GameFactory.merge({
      type: 'Mega-Sena',
      description:
        'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
      range: 60,
      price: 4.5,
      maxNumber: 6,
      color: '#01AC66',
      minCartValue: 30,
    }).create()

    await UserFactory.merge({
      email: userEmail,
      password: userPassword,
    }).create()

    await UserFactory.merge({
      email: otherEmail,
      password: otherPassword,
    }).create()

    await BetFactory.merge({
      userId: 1,
      gameId: 1,
      numbers: '1, 2, 3, 4, 5, 6',
    }).create()

    jwt = (
      await supertest(BASE_URL).post('/session').send({
        email: userEmail,
        password: userPassword,
      })
    ).body.jwt

    othetJwt = (
      await supertest(BASE_URL).post('/session').send({
        email: otherEmail,
        password: otherPassword,
      })
    ).body.jwt
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure not to delete bet when user is not a owner.', async (assert) => {
    const response = await supertest(BASE_URL)
      .delete('/users/bets/1')
      .set('Authorization', `Bearer ${othetJwt.token}`)
      .expect(403)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'E_FORBIDDEN_ACCESS: You not authorized')
  })

  test('ensure not to delete bet when user is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL).delete('/users/bets/1').expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })

  test('ensure not to delete bet when bet not exists', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/users/bets/4')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(404)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'E_ROW_NOT_FOUND: Row not found')
  })

  test('ensure to delete bet when user is authenticated', async (assert) => {
    const response = await supertest(BASE_URL)
      .delete('/users/bets/1')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(200)

    assert.exists(response.text)
    assert.equal('bet deleted successfully', response.text)
  })
})
