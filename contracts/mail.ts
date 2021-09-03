declare module '@ioc:Adonis/Addons/Mail' {
  import { MailDrivers } from '@ioc:Adonis/Addons/Mail'

  interface MailersList {
    smtp: MailDrivers['smtp']
  }
}
