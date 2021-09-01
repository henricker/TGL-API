import { formatter } from 'App/util/formatter-real'
import test from 'japa'

test.group('formatter-real', () => {
  test('ensure convert numbers to currency brasilian money', (assert) => {
    const money = 2.67
    const toReal = formatter.format(money)
    /*
     *As it is of the read only type, we cannot make the *conventional comparison. For this I tested using the "include"
     */
    assert.exists(toReal)
    assert.equal(true, toReal.includes('R$'))
    assert.equal(true, toReal.includes('2,67'))
  })
})
