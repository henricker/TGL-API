import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export default class NewBet extends BaseMailer {
  constructor(private user: User, private totalPrice: string) {
    super()
  }
  public prepare(message: MessageContract) {
    message
      .subject('New bet')
      .from('https://tgl.luby@suport.com', 'TGL Bets')
      .to(this.user.email)
      .htmlView('mails/new-bet', {
        name: this.user.name,
        totalPrice: this.totalPrice,
        link: 'https://tgl.bets.com/dashboard',
      })
  }
}
