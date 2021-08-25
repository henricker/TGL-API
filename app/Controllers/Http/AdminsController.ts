import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import moment from 'moment'

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

  public async getAllUsers({ request, response }: HttpContextContract) {
    try {
      let { page, limit } = request.qs()

      let usersJSON = (
        await User.query()
          .orderBy('is_admin', 'asc')
          .paginate(page ?? 1, limit ?? 15)
      ).serialize()

      usersJSON.data = usersJSON.data.map((user) => ({
        id: user.id,
        name: user.name,
        is_admin: user.is_admin,
        last_bet: !user.last_bet ? null : moment(user.last_bet).format('DD/MM/YYYY HH:MM:SS'),
        created_at: moment(user.created_at).format('DD/MM/YYYY HH:MM:SS'),
        updated_at: moment(user.updated_at).format('DD/MM/YYYY HH:MM:SS'),
      }))

      return usersJSON
    } catch (err) {
      return response.status(400).send({ errors: [{ message: err.message }] })
    }
  }
}
