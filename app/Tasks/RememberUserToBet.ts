import { BaseTask } from 'adonis5-scheduler/build'
import RememberBet from 'App/Mailers/RememberBet'
import User from 'App/Models/User'
import moment from 'moment'

export default class RememberUserToBet extends BaseTask {
  public static get schedule() {
    return '*/30 * * * * *'
  }

  public static get useLock() {
    return true
  }

  public async handle() {
    const users = await User.query()
    users.forEach(async (user) => {
      if (user.lastBet && moment().subtract('7', 'days').isAfter(user.lastBet) && !user.isAdmin)
        await new RememberBet(user).sendLater()
    })
  }
}
