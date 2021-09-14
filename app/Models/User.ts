import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  beforeUpdate,
  afterCreate,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import Bet from './Bet'
//import Welcome from 'App/Mailers/Welcome'
//import ForgotPassword from 'App/Mailers/ForgotPassword'
import producer from '../../kafka-producer/producer'

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

  @hasMany(() => Bet)
  public bets: HasMany<typeof Bet>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) user.password = await Hash.make(user.password)
  }

  @afterCreate()
  public static async sendWelcomeMail(user: User) {
    await producer.connect()
    await producer.sendMessage(
      [
        {
          value: JSON.stringify({
            contact: {
              name: user.name,
              email: user.email,
            },
            template: 'welcome-user',
          }),
        },
      ],
      'mailer-event'
    )
    await producer.disconect()
  }

  @beforeUpdate()
  public static async sendForgotPasswordMail(user: User) {
    if (user.$dirty.rememberMeToken) {
      await producer.connect()
      await producer.sendMessage(
        [
          {
            value: JSON.stringify({
              contact: {
                name: user.name,
                email: user.email,
                remember_me_token: user.rememberMeToken,
              },
              template: 'forgot-password-user',
            }),
          },
        ],
        'mailer-event'
      )
      await producer.disconect()
    }
  }
}
