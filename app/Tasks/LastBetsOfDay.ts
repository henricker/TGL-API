import { BaseTask } from 'adonis5-scheduler/build'
import Bet from 'App/Models/Bet'
import User from 'App/Models/User'
import producer from '../../kafka-producer/producer'
import moment from 'moment'
import Game from '../Models/Game'
import { formatter } from 'App/util/formatter-real'

export default class LastBetsOfDayTask extends BaseTask {
  public static get schedule() {
    return '0 0 17 * * *'
  }

  public static get useLock() {
    return true
  }

  public async handle() {
    const admin = await User.query().where('roleId', 1)
    const games = await Game.query()
    const bets = (await Bet.query().preload('game')).filter((bet) =>
      moment().subtract('1', 'day').isBefore(bet.createdAt.toJSDate())
    )

    const gamesPlaced = bets.map((bet) => bet.game)
    let totalPrice = 0
    const gamesRelatory = games.map((game) => {
      let amountOfBets = 0
      let totalPriceOfGame = 0

      const gameSelected = gamesPlaced.filter((gamePlaced) => gamePlaced.type === game.type)
      totalPriceOfGame = gameSelected.length * game.price
      amountOfBets = gameSelected.length
      totalPrice += totalPriceOfGame

      return {
        game: game.type,
        color: game.color,
        amountOfBets,
        totalPriceOfGame: formatter.format(totalPriceOfGame),
      }
    })

    admin.forEach(async (adm) => {
      await producer.connect()
      await producer.sendMessage(
        [
          {
            value: JSON.stringify({
              contact: {
                name: adm.name,
                email: adm.email,
              },
              games: {
                totalPrice: formatter.format(totalPrice),
                gamesRelatory,
              },
              template: 'daily-reports-admin',
            }),
          },
        ],
        'mailer-event'
      )
      await producer.disconect()
    })
  }
}
