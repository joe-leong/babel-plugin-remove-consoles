const testPlugin = require('./index')
describe('plugins-test', () => {
  it('leading comments should be remove', () => {
    const testCode = `
    console.log('should be remove')
    `
    const code = testPlugin({ code: testCode })
    expect(code).toBe('')
  })
  it('leading comment should be no remove', () => {
    const testCode = `
    // no remove
    console.log('should no be remove')
    `
    const code = testPlugin({ code: testCode })
    expect(code).toBe("// no remove\nconsole.log('should no be remove');")
  })
  it('tailing comment should be no remove with same line', () => {
    const testCode = `
    console.log('should no be remove');// no remove
    `
    const code = testPlugin({ code: testCode })
    expect(code).toBe("console.log('should no be remove'); // no remove")
  })
  it('tailing comment should be remove next line', () => {
    const testCode = `
    console.log('should no be remove');
    // no remove
    `
    const code = testPlugin({ code: testCode })
    expect(code).toBe("")
  })
  it('mixin leading comments & tailing comments', () => {
     const testCode = `
    console.log('should be remove');
    // no remove
    // comment
    console.log('should no be remove')
    `
    const code = testPlugin({ code: testCode })
    expect(code).toBe("// no remove\n// comment\nconsole.log('should no be remove');")
  })
  it('no remove error with default config', () => {
    const testCode = `
    console.error('test error log')
    `
    const code = testPlugin({ code: testCode })
    expect(code).toBe("console.error('test error log');")
  })
  it('remove error with configure', () => {
    const testCode = `
    console.error('test error log')
    `
    const code = testPlugin({ code: testCode,exclude:[] })
    expect(code).toBe("")
  })
  it('no remove error with comment', () => {
    const testCode = `
    // no remove
    console.error('test error log with comment')
    `
    const code = testPlugin({ code: testCode,exclude:[] })
    expect(code).toBe("// no remove\nconsole.error('test error log with comment');")
  })
  it('same line comment no effect next log', () => {
    const testCode = `
    console.log('line') // no remove
    console.log('next line')
    `
    const code = testPlugin({ code: testCode })
    expect(code).toBe("console.log('line'); // no remove")
  })
})
