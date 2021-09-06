import randomNumbers from './random-number'

export default function randomBet(maxNumber: number, range: number): Array<number> {
  const numbers: Array<number> = []
  for (let i = 0; i < maxNumber; i++) numbers.push(randomNumbers(1, range))
  return numbers
}
