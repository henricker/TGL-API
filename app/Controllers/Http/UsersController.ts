import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/user-validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/user-validators/UpdateUserValidator'

export default class UsersController {
  public async create({ request, auth }: HttpContextContract) {
    const data = await request.validate(CreateUserValidator)

    const user = await User.create(data)
    const token = await auth.use('api').attempt(data.email, data.password)
    return { user, token }
  }

  public async index({ auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()

    return { ok: true }
  }

  public async update({ auth, request }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    request.params['id'] = id
    const user = await User.findByOrFail('id', id)

    const data = await request.validate(UpdateUserValidator)

    user?.merge(data)

    await user?.save()
    return user
  }

  public async destroy({ auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    const user = await User.findByOrFail('id', id)

    await user.delete()

    return 'User deleted successfully'
  }
}
