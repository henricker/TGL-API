import faker from 'faker'

export default class PersonFactory {
  public name: string
  public email: string
  public password: string

  constructor() {
    this.name = faker.name.firstName() + ' ' + faker.name.lastName()
    ;(this.email = faker.internet.email()),
      (this.password = faker.internet.password(12, undefined, new RegExp(/[a-zA-Z0-9]/)))
  }
}
