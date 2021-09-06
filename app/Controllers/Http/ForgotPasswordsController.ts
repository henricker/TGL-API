import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import RecoveryPasswordValidator from 'App/Validators/forgot-password-validator/RecoveryPasswordValidator'
import ResetPasswordValidator from 'App/Validators/forgot-password-validator/ResetPasswordValidator'
import crypto from 'crypto'
import { DateTime } from 'luxon'
import moment from 'moment'
import { ValidationException } from '@ioc:Adonis/Core/Validator'

export default class ForgotPasswordsController {
  public async store({ request }: HttpContextContract) {
    const data = await request.validate(ResetPasswordValidator)
    const user = await User.findByOrFail('email', data.email)

    user.rememberMeToken = crypto.randomBytes(12).toString('hex')
    user.tokenCreatedAt = DateTime.now()

    await user.save()
    return 'Check the token in your email'
  }

  public async update({ request }: HttpContextContract) {
    const { password, token } = await request.validate(RecoveryPasswordValidator)
    const user = await User.findByOrFail('remember_me_token', token)

    const tokenExpired = moment().subtract('2', 'days').isAfter(user.tokenCreatedAt)

    if (tokenExpired) throw new ValidationException(false, 'Token expired')

    user.rememberMeToken = null
    user.tokenCreatedAt = null
    user.password = password

    await user.save()
    return 'password updated successfully!'
  }
}
