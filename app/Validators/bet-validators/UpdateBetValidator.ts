import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateBetValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    gameId: schema.number([rules.exists({ table: 'games', column: 'id' })]),
    numbers: schema.array().members(schema.number()),
  })

  public messages = {
    'required': '{{ field }} is required',
    'game.exists': 'game not exists',
  }
}
