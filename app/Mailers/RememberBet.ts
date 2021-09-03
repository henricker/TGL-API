import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export default class RememberBet extends BaseMailer {
  constructor(private user: User) {
    super()
  }

  public prepare(message: MessageContract) {
    message
      .subject('Place a bet!')
      .from('http://tgl.luby@suport.com', 'TGL Bets')
      .to(this.user.email)
      .htmlView('mails/remember-bet', {
        name: this.user.name,
        link: 'https://tgl.bets.com/dashboard',
      })
  }
}
