import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type: string

  @column()
  public description: string

  @column()
  public range: number

  @column()
  public price: number

  @column()
  public color: string

  @column()
  public maxNumber: number

  @column()
  public minCartValue: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
