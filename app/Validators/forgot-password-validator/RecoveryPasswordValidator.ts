import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RecoveryPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    token: schema.string({ trim: true }, [
      rules.exists({ column: 'remember_me_token', table: 'users' }),
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
    'token.exists': 'Token not found',
    'password_confirmation.confirmed': 'Password and confirmed password does not match',
    'password.regex': 'password to weak',
  }
}
