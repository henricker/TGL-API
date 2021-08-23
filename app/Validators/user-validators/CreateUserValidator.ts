import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(2)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.unique({ column: 'email', table: 'users' }),
    ]),
    password: schema.string({ trim: true }, [
      rules.regex(
        new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ),
      rules.confirmed(),
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
