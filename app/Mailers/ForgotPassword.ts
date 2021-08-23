import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import User from 'App/Models/User'

export default class ForgotPassword extends BaseMailer {
  constructor(private user: User) {
    super()
  }

  public prepare(message: MessageContract) {
    message
      .subject('Reset password')
      .from('tgl@suport.com', 'TGL Bets')
      .to(this.user.email)
      .htmlView('mails/forgot-password', {
        name: this.user.name,
        link: `https://tgl.bets.com/reset_password?token=${this.user.rememberMeToken}`,
        email: this.user.email,
        token: this.user.rememberMeToken,
      })
  }
}
