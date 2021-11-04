import { parse } from './parse.js'

test("#1", () => {
  const output = parse([{
    id: 1,
    body: x(`
      # now now
      - [ ] task 1
      - [ ] task 2
      `)
  }])

  assertEquals(output, {
    "now-now": x(`
      - [ ] task 1 [1]
      - [ ] task 2 [1]
      `)
  })
})

test("#2", () => {
  const output = parse([{
    id: 1,
    body: x(`
      # now now
      - [x] task 1
      - [ ] task 2 [1]
      `)
  }])

  assertEquals(output, {
    "now-now": x(`
      - [ ] task 2 [2]
      `)
  })
})

test("zwsps are added to count “just now“ overdue days", () => {
  const output = parse([{
    id: 1,
    body: x(`
      # just now
      - [ ] task 1\u200B
      - [ ] task 2 [1]
      `)
  }])

  assertEquals(output, {
    "just-now": x(`
      - [ ] task 1\u200B\u200B
      - [ ] task 2 [1]\u200B
      `)
  })
})

/// lib
function test(name: string, fnc: () => void) {
  console.log(name)
  fnc()
}
function assertEquals(a: any, b: any) {
  if (!objectEquals(a, b)) {
    throw new Error(`${a} !== ${b}`)
  }
}
function x(input: string): string {
  return input
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(x => x)
    .join('\n')
}
function objectEquals(obj1: any, obj2: any) {
  const JSONstringifyOrder = (obj: any) => {
    const keys = {};
    JSON.stringify(obj, (key, value) => {
      (keys as any)[key] = null;
      return value;
    });
    return JSON.stringify(obj, Object.keys(keys).sort());
  };
  return JSONstringifyOrder(obj1) === JSONstringifyOrder(obj2);
}
