import Game from 'App/Models/Game'

export default function validateBetNumbers(numbers: number[], game: Game): Object | undefined {
  if (numbers.length !== game.maxNumber) {
    return {
      errors: [{ message: `The ${game.type} only allows ${game.maxNumber} numbers choosen` }],
    }
  }

  for (const value of numbers) {
    if (value > game.range) {
      return {
        errors: [
          {
            message: `The ${game.type} only accepts values less than or equal to ${game.range}`,
          },
        ],
      }
    }
  }

  return undefined
}
