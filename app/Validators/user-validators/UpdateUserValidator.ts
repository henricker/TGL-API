import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(2)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({
        column: 'email',
        table: 'users',
        whereNot: { id: this.ctx.request.params['id'] },
      }),
    ]),
  })

  public messages = {
    'required': '{{ field }} is required',
    'email.email': 'email invalid',
    'email.unique': 'email already exists',
    'name.minLength': 'name to short',
    'password.regex': 'password to weak',
  }
}
