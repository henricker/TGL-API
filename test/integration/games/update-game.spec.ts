import Database from '@ioc:Adonis/Lucid/Database'
import User from 'App/Models/User'
import { GameFactory, UserFactory } from 'Database/factories'
import test from 'japa'
import supertest from 'supertest'
import BASE_URL from '../../util/base-url'

test.group('Update game', (group) => {
  let admin: User
  let commonUser: User
  const adminPassword = 'Password@123'
  const commonPassword = 'Password@1234'

  group.before(async () => {
    await Database.beginGlobalTransaction()
    await GameFactory.create()
    admin = await UserFactory.merge({ password: adminPassword, isAdmin: true }).create()
    commonUser = await UserFactory.merge({ password: commonPassword }).create()
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure update game when admin is authenticated by specified id', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: admin.email, password: adminPassword })
    ).body

    const response = await supertest(BASE_URL)
      .put('/admin/games/1')
      .send({
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 60,
        price: 4.5,
        max_number: 6,
        color: '#01AC66',
        min_cart_value: 30,
      })
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(200)

    assert.exists(response.body.game)
    assert.propertyVal(response.body.game, 'type', 'Mega-Sena')
  })

  test('ensure not update game when admin is not authenticated', async (assert) => {
    const response = await supertest(BASE_URL)
      .put('/admin/games/1')
      .send({
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 60,
        price: 4.5,
        max_number: 6,
        color: '#01AC66',
        min_cart_value: 30,
      })
      .expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: Unauthorized access'
    )
  })

  test('ensure not update game when user is not admin', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: commonUser.email, password: commonPassword })
    ).body

    const response = await supertest(BASE_URL)
      .put('/admin/games/1')
      .send({
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 60,
        price: 4.5,
        max_number: 6,
        color: '#01AC66',
        min_cart_value: 30,
      })
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(401)

    assert.exists(response.body.errors)
    assert.propertyVal(
      response.body.errors[0],
      'message',
      'E_UNAUTHORIZED_ACCESS: You are not authorized for this route.'
    )
  })

  test('ensure not update game when data is invalid', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: admin.email, password: adminPassword })
    ).body

    const response = await supertest(BASE_URL)
      .put('/admin/games/1')
      .send({
        type: '',
        description: '',
        range: '',
        price: '',
        max_number: '',
        color: '',
        min_cart_value: '',
      })
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'type is required')
    assert.propertyVal(response.body.errors[1], 'message', 'description is required')
    assert.propertyVal(response.body.errors[2], 'message', 'range is required')
    assert.propertyVal(response.body.errors[3], 'message', 'price is required')
    assert.propertyVal(response.body.errors[4], 'message', 'max_number is required')
    assert.propertyVal(response.body.errors[5], 'message', 'min_cart_value is required')
    assert.propertyVal(response.body.errors[6], 'message', 'color is required')
  })

  test('ensure not update game when range, price, max-number or min_cart_value is not number', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: admin.email, password: adminPassword })
    ).body

    const response = await supertest(BASE_URL)
      .put('/admin/games/1')
      .send({
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 'a',
        price: 'a',
        max_number: 'a',
        color: '#01AC66',
        min_cart_value: 'a',
      })
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'number validation failed')
    assert.propertyVal(response.body.errors[1], 'message', 'number validation failed')
    assert.propertyVal(response.body.errors[2], 'message', 'number validation failed')
    assert.propertyVal(response.body.errors[3], 'message', 'number validation failed')
  })

  test('ensure not update game when type or description is not string', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: admin.email, password: adminPassword })
    ).body

    const response = await supertest(BASE_URL)
      .put('/admin/games/1')
      .send({
        type: 1,
        description: 1,
        range: 60,
        price: 4.5,
        max_number: 6,
        color: '#01AC66',
        min_cart_value: 30,
      })
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'string validation failed')
    assert.propertyVal(response.body.errors[1], 'message', 'string validation failed')
  })

  test('ensure not update game when color is invalid', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: admin.email, password: adminPassword })
    ).body

    const response = await supertest(BASE_URL)
      .put('/admin/games/1')
      .send({
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 60,
        price: 4.5,
        max_number: 6,
        color: '1234',
        min_cart_value: 30,
      })
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(422)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'color is invalid')
    assert.propertyVal(response.body.errors[0], 'field', 'color')
    assert.propertyVal(response.body.errors[0], 'rule', 'regex')
  })

  test('ensure return error when a game specified by id not exists', async (assert) => {
    const { jwt } = (
      await supertest(BASE_URL)
        .post('/session')
        .send({ email: admin.email, password: adminPassword })
    ).body

    const response = await supertest(BASE_URL)
      .put('/admin/games/2')
      .send({
        type: 'Mega-Sena',
        description:
          'Escolha 6 números dos 60 disponíveis na mega-sena. Ganhe com 6, 5 ou 4 acertos. São realizados dois sorteios semanais para você apostar e torcer para ficar milionário.',
        range: 60,
        price: 4.5,
        max_number: 6,
        color: '#ffffff',
        min_cart_value: 30,
      })
      .set('Authorization', `Bearer ${jwt.token}`)
      .expect(404)

    assert.exists(response.body.errors)
    assert.propertyVal(response.body.errors[0], 'message', 'E_ROW_NOT_FOUND: Row not found')
  })
})
