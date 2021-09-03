import Env from '@ioc:Adonis/Core/Env'
import { MailConfig } from '@ioc:Adonis/Addons/Mail'

const mailConfig: MailConfig = {
  mailer: 'smtp',
  mailers: {
    smtp: {
      driver: 'smtp',
      host: Env.get('SMTP_HOST'),
      port: Env.get('SMTP_PORT'),
      auth: {
        user: Env.get('SMTP_USERNAME'),
        pass: Env.get('SMTP_PASSWORD'),
        type: 'login',
      },
    },
  },
}

export default mailConfig
