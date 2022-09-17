import {Parser} from '../src/parser'
import {promises} from 'fs'

const {readFile} = promises

describe('Paraser', () => {
  test('parse json', async () => {
    const parser = new Parser('__tests__/data/result.json')
    await parser.parseObject()
    expect(parser.tests.length).toBe(3)
  })

  test('check suite', async () => {
    const parser = new Parser('__tests__/data/result.json')
    await parser.parseObject()
    expect(parser.tests[0].id).toBe(0)
    expect(parser.tests[0].groups.length).toBe(2)
    expect(parser.tests[0].path).toBe('forecast_controller_test.dart')
  })

  test('check group', async () => {
    const parser = new Parser('__tests__/data/result.json')
    await parser.parseObject()
    expect(parser.tests[0].groups[0].id).toBe(6)
    expect(parser.tests[0].groups[0].tests.length).toBe(1)
  })

  test('check test', async () => {
    const parser = new Parser('__tests__/data/result.json')
    await parser.parseObject()
    expect(parser.tests[0].groups[0].tests[0].url).toBe(
      'file://forecast_controller_test.dart'
    )
    expect(parser.tests[0].groups[0].tests[0].suiteId).toBe(0)
    expect(parser.tests[0].groups[0].tests[0].groupIds[0]).toBe(6)
  })

  test('check test done', async () => {
    const parser = new Parser('__tests__/data/result.json')
    await parser.parseObject()
    expect(parser.tests[0].groups[0].tests[0].result?.state).toBe('success')
  })

  test('check unit', async () => {
    const parser = new Parser('__tests__/data/result.json')
    await parser.parseObject()
    const xml = Buffer.from(
      await readFile('__tests__/data/result.xml')
    ).toString('utf8')
    expect(parser.toUnit()).toBe(xml)
  })

  test('check report', async () => {
    const parser = new Parser('__tests__/data/result.json')
    await parser.parseObject()
    const report = parser.toReport()
    expect(report.annotations.length).toBe(1)
  })
})
