import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export default class Welcome extends BaseMailer {
  constructor(private user: User) {
    super()
  }

  public prepare(message: MessageContract) {
    message
      .subject('Welcome to TGL BETS')
      .from('tgl@suport.com', 'TGL Bets')
      .to(this.user.email)
      .htmlView('mails/welcome', { name: this.user.name, link: 'https://tgl.bets.com/login' })
  }
}
