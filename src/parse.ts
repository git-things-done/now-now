import { marked } from 'marked'

//FIXME THIS CODE IS FILTHY! FILTHY I SAY!

interface Output {
  "right-now"?: string
  "now-now"?: string
  "just-now"?: string
  now?: string
}

export interface Comment {
  id: number
  body?: string
}

function is_correct_comment(comment: marked.TokensList, comment_title?: string): boolean {
  for (const token of comment) {
    if (token.type !== 'heading') continue
    if (comment_title) {
      if (squish(token.text) == squish(comment_title)) return true
    } else {
      // if no title we're looking for an unnamed list
      //NOTE possibly this sucks
      switch (squish(token.text)) {
        case 'nownow':
        case 'rightnow':
        case 'justnow':
        case 'now':
          return true
      }
    }
    // only care about the first heading
    return false
  }

  return false
}

export function parse(comments: Comment[], comment_title?: string): Output {
  for (const comment of comments) {
    if (!comment.body) continue
    const lexed = marked.lexer(comment.body)
    if (!is_correct_comment(lexed, comment_title)) continue
    return parse2(lexed)
  }
  return {}
}

function parse2(tokens: marked.TokensList): Output {
  const output: Output = {}

  const iterator = tokens[Symbol.iterator]()
  let item = iterator.next()

  const rawUntilNextHeading = (heading: string) => {
    let out = ''
    item = iterator.next()
    while (!item.done && item.value.type !== 'heading') {
      try {
        if (item.value.type as string !== 'list') {
          continue  // drop everything else
        }

        for (const task of (item.value as marked.Tokens.List).items) {
          if (task.type != 'list_item') { out += task.raw; continue }
          if (task.checked) continue
          const { body, n, zwsps } = parseTaskLine(task.text)

          switch (heading) {
          case 'now':
          case 'justnow':
            if (zwsps < 6) {
              const cipher = [...Array(zwsps+1)].map(() => '\u200B').join('')
              const count = n ? ` [${n}]` : ''
              out += `${body}${count}${cipher}\n`
              break
            }
            /* falls through */
          case 'nownow':
          case 'rightnow':
            out += `${body} [${(n ?? 0) + 1}]\n`
            break
          default:
            out += task.raw
          }
        }
      } finally {
        item = iterator.next()
      }
    }
    return out
  }

  const append = (key: keyof Output, body: string) => {
    if (output[key]) {
      output[key] += `\n${body.trim()}`
    } else {
      output[key] = body.trim()
    }
  }

  while (!item.done) {
    const value = item.value
    if (value.type !== 'heading') { item = iterator.next(); continue }

    const squished = squish(value.text)

    switch (squished) {
    case 'rightnow':
      append('right-now', rawUntilNextHeading(squished))
      break

    case 'nownow':
      append('now-now', rawUntilNextHeading(squished))
      break
    case 'justnow':
      append('just-now', rawUntilNextHeading(squished))
      break
    case 'now':
      append('now', rawUntilNextHeading(squished))
      break
    default:
      item = iterator.next()
    }
  }

  return output
}

function parseTaskLine(input: string): { body: string, n?: number, zwsps: number } {
  const match = input.match(/^(.*?)\s*(\[(\d+)\])?(\u200B*)$/)
  if (!match) { throw new Error(`Could not parse task line: ${input}`) }
  const body = `- [ ] ${match[1].trim()}`
  let n: number | undefined = parseInt(match[3])
  if (Number.isNaN(n)) { n = undefined }
  const zwsps = match[4].length
  return {body, n, zwsps}
}

function squish(input: string): string {
  return input.toLowerCase().replace(/(\s|-)+/g, '').trim()
}
