import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GameValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    type: schema.string({ trim: true }),
    description: schema.string({ trim: true }),
    range: schema.number(),
    price: schema.number(),
    max_number: schema.number(),
    min_cart_value: schema.number(),
    color: schema.string({}, [rules.regex(new RegExp(/^#([0-9A-F]{3}){1,2}$/i))]),
  })

  public messages = {
    'required': '{{ field }} is required',
    'color.regex': 'color is invalid',
  }
}
