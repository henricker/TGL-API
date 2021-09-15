import { BaseTask } from 'adonis5-scheduler/build'
import Bet from 'App/Models/Bet'
import User from 'App/Models/User'
import producer from '../../kafka-producer/producer'
import moment from 'moment'
import Game from '../Models/Game'

export default class LastBetsOfDayTask extends BaseTask {
  public static get schedule() {
    return '*/30 * * * * *'
  }

  public static get useLock() {
    return true
  }

  public async handle() {
    const admin = await User.query().where('isAdmin', true) //get all admins
    const games = await Game.query()
    const bets = (await Bet.query().preload('game')).filter((bet) =>
      moment().subtract('0', 'days').isAfter(bet.createdAt)
    )

    const gamesPlaced = bets.map((bet) => bet.game)
    const gamesRelatory = games.map((game) => {
      let amountOfBets = 0
      let totalPriceOfGame = 0

      const gameSelected = gamesPlaced.filter((gamePlaced) => gamePlaced.type === game.type)
      totalPriceOfGame = gameSelected.length * game.price
      amountOfBets = gameSelected.length

      return {
        game: game.type,
        color: game.color,
        amountOfBets,
        totalPriceOfGame,
      }
    })
    let totalPrice = 0
    gamesRelatory.forEach((game) => (totalPrice += game.totalPriceOfGame))

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
                totalPrice,
                gamesRelatory,
              },
              template: 'new-bets-admin',
            }),
          },
        ],
        'mailer-event'
      )
      await producer.disconect()
    })
  }
}

/*
{
  "type": 'Mega-Sena",
  "color": ''
}
*/
