import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class AdminsController {
  public async promoteUser({ params, response }: HttpContextContract) {
    try {
      const userId = params['userId']
      const user = await User.findByOrFail('id', userId)
      user.isAdmin = true
      await user.save()

      return response.send('user promoted')
    } catch (err) {
      return response.status(404).send({ errors: [{ message: 'user not found' }] })
    }
  }

  public async demoteUser({ params, response }: HttpContextContract) {
    try {
      const userId = params['userId']
      const user = await User.findByOrFail('id', userId)
      user.isAdmin = false
      await user.save()

      return response.send('user demoted')
    } catch (err) {
      return response.status(404).send({ errors: [{ message: 'user not found' }] })
    }
  }

  public async deleteUser({ params, response }: HttpContextContract) {
    try {
      const userId = params['userId']
      const user = await User.findByOrFail('id', userId)

      await user.delete()

      return response.send('user removed')
    } catch (err) {
      return response.status(404).send({ errors: [{ message: 'user not found' }] })
    }
  }

  public async getAllUsers({ request }: HttpContextContract) {
    const { page, limit } = request.qs()
    let usersJSON = (
      await User.query()
        .orderBy('is_admin', 'desc')
        .paginate(page ?? 1, limit ?? 15)
    ).serialize()

    usersJSON.data = usersJSON.data.map((user) => ({
      id: user.id,
      name: user.name,
      is_admin: user.is_admin,
      last_bet: user.last_bet,
      created_at: user.created_at,
    }))

    return usersJSON
  }
}
