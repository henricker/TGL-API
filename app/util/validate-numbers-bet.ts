import Game from 'App/Models/Game'

interface BetValidate {
  gameId: number
  numbers: number[]
}

interface ErrorValidate {
  message: string
}

export default async function validateBetNumbers(bets: BetValidate[]): Promise<ErrorValidate[][]> {
  const errors = await Promise.all(
    bets.map(async (bet) => {
      const game = await Game.findByOrFail('id', bet.gameId)
      let errorBet: ErrorValidate[] = []

      if (bet.numbers.length !== game!.maxNumber)
        errorBet.push({
          message: `The ${game.type} only allows ${game.maxNumber} numbers choosen`,
        })

      for (const value of bet.numbers) {
        if (value > game.range && value > 0)
          errorBet.push({
            message: `The ${game.type} only accepts values leess than or equal to ${game.range}`,
          })
      }

      return errorBet
    })
  )

  return errors.filter((error) => error.length > 0)
}
