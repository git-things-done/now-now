import * as github from '@actions/github';
import { getInput } from '@actions/core';
import { parse } from './parse';

const slug = process.env.GITHUB_REPOSITORY!
const [owner, repo] = slug.split('/')
const issue_number = parseInt((getInput('yesterday') || process.env.GTD_YESTERDAY)!)
const today = parseInt((getInput('today') || process.env.GTD_TODAY)!)
const token = getInput('token')!
const octokit = github.getOctokit(token)
const comment_title = getInput('name')


if (issue_number) {
  const comments = (await octokit.rest.issues.listComments({
    owner, repo, issue_number
  })).data

  const parsed = parse(comments, comment_title)

  let body = ''
  let h = '##'

  if (comment_title) {
    body += `# ${comment_title}`
    h = '##'
  }

  if (parsed['right-now']) body += `
${h} Right Now
${parsed['right-now']}
`
  if (parsed['now-now']) body += `
${h} Now Now
${parsed['now-now']}
`
  if (parsed['just-now']) body += `
${h} Just Now
<details>
<summary>${parsed['just-now'].split("\n").length} Items</summary>

${parsed['just-now']}

</details>
`
  if (parsed['now']) body += `
${h} Now
<details>
<summary>${parsed['now'].split("\n").length} Items</summary>

${parsed['now']}

</details>
`

  await octokit.rest.issues.createComment({
    owner, repo, issue_number: today, body
  })

} else {
  await octokit.rest.issues.createComment({
    owner, repo, issue_number: today, body: `
# Now Now
- [ ] [Learn to use Now Now](https://github.com/git-things-done/now-now)
`})
}