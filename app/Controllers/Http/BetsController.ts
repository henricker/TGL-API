import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import CreateBetValidator from 'App/Validators/bet-validators/CreateBetValidator'
import Bet from 'App/Models/Bet'
import { formatter } from 'App/util/formatter-real'
import moment from 'moment'
import UpdateBetValidator from 'App/Validators/bet-validators/UpdateBetValidator'
import validateBetNumbers from 'App/util/validate-numbers-bet'
import { DateTime } from 'luxon'
import NewBet from 'App/Mailers/NewBet'

export default class BetsController {
  public async index({ auth, request, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    const { page, limit } = request.qs()

    try {
      const bets = (
        await Bet.query()
          .where('user_id', id)
          .orderBy('created_at', 'desc')
          .preload('game')
          .paginate(page ?? 1, limit ?? 10)
      ).serialize()

      bets.data = bets.data.map((bet) => ({
        id: bet.id,
        numbers: bet.numbers,
        created_at: moment(bet.created_at).format('DD/MM/YYYY HH:MM:SS'),
        updated_at: moment(bet.updated_at).format('DD/MM/YYYY HH:MM:SS'),
        game: {
          id: bet.game.id,
          type: bet.game.type,
          color: bet.game.color,
          price: formatter.format(Number(bet.game.price)),
        },
      }))

      return bets
    } catch (err) {
      return response.status(400).send({ errors: [{ message: err.message }] })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const user = await auth.use('api').authenticate()

    let data = await request.validate(CreateBetValidator)

    //Now validate numbers
    const prices = data.bets.map(async (bet) => {
      const game = await Game.findByOrFail('id', bet.gameId)

      const errorValidate = validateBetNumbers(bet.numbers, game)

      if (errorValidate) return response.status(422).send(errorValidate)

      await Bet.create({
        gameId: bet.gameId,
        userId: user.id,
        numbers: bet.numbers.join(','),
      })

      return Number(game.price)
    })

    user.lastBet = DateTime.local()
    await user.save()

    let pricesResolved = await Promise.all(prices)
    let totalPrice = pricesResolved.reduce((total: number, current: number) => total + current)

    await new NewBet(user, formatter.format(totalPrice ?? 0)).sendLater()
    return { totalPrice: formatter.format(totalPrice ?? 0) }
  }

  public async show({ params, auth, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    const betId = params.betId
    try {
      const bet = await Bet.findByOrFail('id', betId)

      if (bet.userId !== id)
        return response.status(401).send({ errors: [{ message: 'You not authorized' }] })

      await bet.load('game')

      const betJSON = bet.serialize()
      return {
        id: betJSON.id,
        numbers: betJSON.numbers,
        created_at: moment(betJSON.created_at).format('DD/MM/YYYY HH:MM:SS'),
        updated_at: moment(betJSON.updated_at).format('DD/MM/YYYY HH:MM:SS'),
        game: {
          id: betJSON.game.id,
          type: betJSON.game.type,
          color: betJSON.game.color,
          price: formatter.format(Number(betJSON.game.price)),
        },
      }
    } catch (err) {
      return response.status(err.status).send({ errors: [{ message: err.message }] })
    }
  }

  public async update({ params, auth, request, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    const betId = params.betId
    const data = await request.validate(UpdateBetValidator)

    try {
      const bet = await Bet.findByOrFail('id', betId)

      if (bet.userId !== id)
        return response.status(401).send({ errors: [{ message: 'You not authorized' }] })

      const game = await Game.findByOrFail('id', data.gameId)

      const errorValidate = validateBetNumbers(data.numbers, game)

      if (errorValidate) return response.status(422).send(errorValidate)

      bet.merge({
        gameId: data.gameId,
        numbers: data.numbers.join(','),
      })

      await bet.save()
    } catch (err) {
      return response.status(err.status).send({ errors: [{ message: err.message }] })
    }
  }

  public async destroy({ params, auth, response }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    const betId = params.betId

    try {
      const bet = await Bet.findByOrFail('id', betId)

      if (bet.userId !== id)
        return response.status(401).send({ errors: [{ message: 'You not authorized' }] })

      await bet.delete()
    } catch (err) {
      return response.status(err.status).send({ errors: [{ message: err.message }] })
    }
  }
}
