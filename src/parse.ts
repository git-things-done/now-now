import { lexer, Tokens } from 'marked'

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

export function parse(comments: Comment[]): Output {
  const output: Output = {}

  for (const comment of comments) {
    if (!comment.body) continue;

    const lexed = lexer(comment.body)

    const iterator = lexed[Symbol.iterator]()
    let item = iterator.next()

    const rawUntilNextHeading = (heading: string) => {
      let out = ''
      item = iterator.next()
      while (!item.done && item.value.type !== 'heading') {
        try {
          if (item.value.type as string !== 'list') {
            continue  // drop everything else
          }

          for (const task of (item.value as Tokens.List).items) {
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
