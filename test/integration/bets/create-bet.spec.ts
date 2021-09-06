import Database from '@ioc:Adonis/Lucid/Database'
import { GameFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import JwtType from '../../util/jwtType-inteface'
import BASE_URL from '../../util/base-url'

test.group('Create bet', (group) => {
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

  test('ensure create a new bet when user is authenticated', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: [
          {
            gameId: 1,
            numbers: [1, 2, 3, 4, 5, 6],
          },
          {
            gameId: 1,
            numbers: [60, 23, 56, 42, 4, 2],
          },
        ],
      })
      .expect(200)

    assert.exists(response.body.totalPrice)
    assert.equal(
      true,
      response.body.totalPrice.includes('R$') && response.body.totalPrice.includes('9,00')
    )
  })

  test('ensure not create a bet when user is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .send({
        bets: [
          {
            gameId: 1,
            numbers: [1, 2, 3, 4, 5, 6],
          },
          {
            gameId: 1,
            numbers: [60, 23, 56, 42, 4, 2],
          },
        ],
      })
      .expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })

  test('ensure not create a bet when game not exists', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: [
          {
            gameId: 2,
            numbers: [60, 23, 56, 42, 4, 2],
          },
        ],
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'bets.0.gameId')
    assert.propertyVal(response.body.errors[0], 'message', 'game not exists')
  })

  test('ensure not create a bet when bets is not array', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: 1,
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'bets')
    assert.propertyVal(response.body.errors[0], 'message', 'array validation failed')
  })

  test('ensure not create a bet when some bet is not object', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: [
          'bet',
          {
            gameId: 1,
            numbers: [60, 23, 56, 42, 4, 2],
          },
        ],
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'bets.0')
    assert.propertyVal(response.body.errors[0], 'message', 'object validation failed')
  })

  test('ensure not to create a bet when gameId on a bet is not a number.', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: [
          {
            gameId: 'number',
            numbers: [60, 23, 56, 42, 4, 2],
          },
          {
            gameId: 1,
            numbers: [34, 23, 54, 12, 8, 2],
          },
        ],
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'bets.0.gameId')
    assert.propertyVal(response.body.errors[0], 'message', 'number validation failed')
  })

  test('ensure not to create a bet when the numbers in the bet are not arrays.', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: [
          {
            gameId: 1,
            numbers: 'array',
          },
        ],
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'bets.0.numbers')
    assert.propertyVal(response.body.errors[0], 'message', 'array validation failed')
  })

  test('ensure not to create a bet when any number in the bet is not a number.', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: [
          {
            gameId: 1,
            numbers: [34, 'a', 54, 12, 8, 2],
          },
        ],
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'bets.0.numbers.1')
    assert.propertyVal(response.body.errors[0], 'message', 'number validation failed')
  })

  test('ensure not to create a bet when some field is invalid', async (assert) => {
    const response = await supertest(BASE_URL)
      .post('/users/bets')
      .set('Authorization', `Bearer ${jwt.token}`)
      .send({
        bets: [
          {
            gameId: '',
            numbers: '',
          },
        ],
      })
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'field', 'bets.0.gameId')
    assert.propertyVal(response.body.errors[0], 'message', 'bets.0.gameId is required')
    assert.propertyVal(response.body.errors[1], 'field', 'bets.0.numbers')
    assert.propertyVal(response.body.errors[1], 'message', 'bets.0.numbers is required')
  })
})
