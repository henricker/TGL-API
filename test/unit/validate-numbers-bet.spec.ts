import Database from '@ioc:Adonis/Lucid/Database'
import validateBetNumbers from 'App/util/validate-numbers-bet'
import { GameFactory } from 'Database/factories'
import test from 'japa'

test.group('Validate numbers of bets', (group) => {
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
  })

  group.after(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('ensure the return errors have a length of 0 when everything is fine', async (assert) => {
    const bets = [
      {
        gameId: 1,
        numbers: [1, 3, 6, 60, 5, 15],
      },
      {
        gameId: 1,
        numbers: [35, 23, 21, 33, 7, 29],
      },
    ]
    const errors = await validateBetNumbers(bets)
    assert.equal(0, errors.length)
  })

  test('ensure return error when length of array of numbers is different from registered game maxNumber', async (assert) => {
    const bets = [
      {
        gameId: 1,
        numbers: [1, 3, 6, 60, 5, 15, 21],
      },
    ]
    const errors = await validateBetNumbers(bets)
    assert.equal('The Mega-Sena only allows 6 numbers choosen', errors[0][0]?.message)
  })

  test('ensure the return error when there is any number less or greater than the game interval', async (assert) => {
    const bets = [
      {
        gameId: 1,
        numbers: [1, 3, 6, 60, 5, 61],
      },
    ]
    const errors = await validateBetNumbers(bets)
    assert.equal(
      'The Mega-Sena only accepts values leess than or equal to 60',
      errors[0][0].message
    )
  })

  test('ensure the return error when there is any number less or greater than the game interval and the length or numbers of array of numbers is different from registered game maxNumber', async (assert) => {
    const bets = [
      {
        gameId: 1,
        numbers: [1, 3, 6, 60, 5, 61, 60],
      },
    ]
    const errors = await validateBetNumbers(bets)
    assert.equal('The Mega-Sena only allows 6 numbers choosen', errors[0][0]?.message)
    assert.equal(
      'The Mega-Sena only accepts values leess than or equal to 60',
      errors[0][1]?.message
    )
  })
})
