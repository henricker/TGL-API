import Database from '@ioc:Adonis/Lucid/Database'
import { BetFactory, GameFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'
import JwtType from '../../util/jwtType-inteface'

test.group('Index bet', (group) => {
  const userEmail = 'henricker@email.com'
  const userPassword = 'Password@123'
  let jwt: JwtType

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

    await BetFactory.merge({
      userId: 1,
      gameId: 1,
      numbers: '1, 2, 3, 4, 5, 6',
    }).createMany(20)

    jwt = (
      await supertest(BASE_URL).post('/session').send({
        email: userEmail,
        password: userPassword,
      })
    ).body.jwt
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure show array of bets of user authenticated with pagination', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.isArray(response.body.data)
    assert.equal(1, response.body.meta.current_page)
    assert.equal(10, response.body.meta.per_page)
  })

  test('ensure return array of games of the page two', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/users/bets?page=2')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.equal(2, response.body.meta.current_page)
    assert.equal(10, response.body.meta.per_page)
    assert.isArray(response.body.data)
  })

  test('ensure return array of games when limit pagination is three', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/users/bets?limit=3')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.equal(1, response.body.meta.current_page)
    assert.equal(3, response.body.meta.per_page)
    assert.isArray(response.body.data)
  })

  test('ensure return array of games when limit pagination is three and page is five', async (assert) => {
    const response = await supertest(BASE_URL)
      .get('/users/bets?limit=3&page=5')
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(200)

    assert.exists(response.body.meta)
    assert.exists(response.body.data)
    assert.equal(5, response.body.meta.current_page)
    assert.equal(3, response.body.meta.per_page)
    assert.isArray(response.body.data)
  })

  test('ensure not show array of bets when user is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL).get('/users/bets').expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })
})
