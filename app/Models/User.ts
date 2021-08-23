import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, beforeUpdate, afterCreate } from '@ioc:Adonis/Lucid/Orm'
import Welcome from 'App/Mailers/Welcome'
import ForgotPassword from 'App/Mailers/ForgotPassword'
// import Bet from './Bet'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public isAdmin: boolean

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string | null

  @column()
  public tokenCreatedAt: DateTime | null

  @column()
  public lastBet: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) user.password = await Hash.make(user.password)
  }

  @afterCreate()
  public static async sendWelcomeMail(user: User) {
    await new Welcome(user).sendLater()
  }

  @beforeUpdate()
  public static async sendForgotPasswordMail(user: User) {
    if (user.$dirty.rememberMeToken) await new ForgotPassword(user).sendLater()
  }
  // @hasMany(() => Bet)
  // public bets: HasMany<typeof Bet>
}
