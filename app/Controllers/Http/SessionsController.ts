import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SessionValidator from 'App/Validators/SessionValidator'

export default class SessionsController {
  public async store({ request, auth }: HttpContextContract) {
    const data = await request.validate(SessionValidator)
    const token = await auth.use('api').attempt(data.email, data.password, {
      expiresIn: '1days',
    })

    return { jwt: token }
  }
}
