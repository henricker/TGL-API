import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/user-validators/CreateUserValidator'
import UpdateUserValidator from 'App/Validators/user-validators/UpdateUserValidator'
import moment from 'moment'

export default class UsersController {
  public async store({ request, auth }: HttpContextContract) {
    const data = await request.validate(CreateUserValidator)
    const user = await User.create(data)
    const token = await auth.use('api').attempt(data.email, data.password)
    return { user, token }
  }

  public async index({ auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()

    const user = await User.findByOrFail('id', id)

    const userJSON = user.serialize()

    userJSON.remember_me_token = undefined
    userJSON.token_created_at = undefined
    userJSON.created_at = moment(userJSON.created_at).format('DD/MM/YYYY HH:MM:DD')
    userJSON.updated_at = moment(userJSON.updated_at).format('DD/MM/YYYY HH:MM:SS')

    return { user: userJSON }
  }

  public async update({ auth, request }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    request.params['id'] = id
    const user = await User.findByOrFail('id', id)

    const data = await request.validate(UpdateUserValidator)

    user.merge(data)

    await user.save()
    return { user }
  }

  public async destroy({ auth }: HttpContextContract) {
    const { id } = await auth.use('api').authenticate()
    const user = await User.findByOrFail('id', id)

    await user.delete()

    return 'User deleted successfully'
  }
}
