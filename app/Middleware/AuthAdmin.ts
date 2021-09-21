import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthAdmin {
  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    const { roleId } = await auth.use('api').authenticate()

    if (roleId !== 1)
      throw new AuthenticationException(
        'You are not authorized for this route.',
        'E_UNAUTHORIZED_ACCESS'
      )

    await next()
  }
}
