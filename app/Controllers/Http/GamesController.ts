import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Game from 'App/Models/Game'
import { formatter } from 'App/util/formatter-real'
import GameValidator from 'App/Validators/GameValidator'
import moment from 'moment'

export default class GamesController {
  public async index({ request, response }: HttpContextContract) {
    try {
      let { page, limit } = request.qs()
      let gamesJSON = (await Game.query().paginate(page ?? 1, limit ?? 15)).serialize()

      gamesJSON.data = gamesJSON.data.map((game) => {
        game.price = formatter.format(game.price)
        game.created_at = moment(game.created_at).format('DD/MM/YYYY HH:MM:SS')
        game.updated_at = moment(game.updated_at).format('DD/MM/YYYY HH:MM:SS')
        return game
      })

      return gamesJSON
    } catch (err) {
      return response.status(400).send({ errors: [{ message: err.message }] })
    }
  }

  public async store({ request }: HttpContextContract) {
    const data = await request.validate(GameValidator)
    let game = (await Game.create(data)).serialize()

    game.price = formatter.format(game.price)

    return game
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      let gameJSON = (await Game.findByOrFail('id', params.id)).serialize()
      gameJSON.price = formatter.format(gameJSON.price)
      gameJSON.created_at = moment(gameJSON.createdAt).format('DD/MM/YYYY HH:MM:SS')
      gameJSON.updated_at = moment(gameJSON.updatedAt).format('DD/MM/YYYY HH:MM:SS')
      return gameJSON
    } catch (err) {
      return response.status(err.status).send({ errors: [{ message: err.message }] })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const data = await request.validate(GameValidator)

    try {
      const game = await Game.findByOrFail('id', params.id)
      game.merge(data)

      await game.save()
      return game
    } catch (err) {
      return response.status(err.status).send({ errors: [{ message: err.message }] })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const game = await Game.findByOrFail('id', params.id)

      await game.delete()
    } catch (err) {
      return response.status(err.status).send({ errors: [{ message: err.message }] })
    }
  }
}
