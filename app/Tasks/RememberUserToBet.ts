import { BaseTask } from 'adonis5-scheduler/build'
import User from 'App/Models/User'
import producer from '../../kafka-producer/producer'
import moment from 'moment'

export default class RememberUserToBetTask extends BaseTask {
  public static get schedule() {
    return '*/15 * * * * *'
  }

  public static get useLock() {
    return true
  }

  public async handle() {
    const users = await User.query().where('is_admin', false)
    users.forEach(async (user) => {
      if (!user.lastBet || (user.lastBet && moment().subtract('7', 'days').isAfter(user.lastBet))) {
        await producer.connect()
        await producer.sendMessage(
          [
            {
              value: JSON.stringify({
                contact: {
                  name: user.name,
                  email: user.email,
                },
                template: 'remember-user-to-bet',
              }),
            },
          ],
          'mailer-event'
        )
        await producer.disconect()
      }
    })
  }
}
