import * as github from '@actions/github';
import { getInput } from '@actions/core';
import { parse } from './parse';

const slug = process.env.GITHUB_REPOSITORY!
const [owner, repo] = slug.split('/')
const issue_number = parseInt((getInput('yesterday') || process.env.GTD_YESTERDAY)!)
const today = parseInt((getInput('today') || process.env.GTD_TODAY)!)
const token = getInput('token')!
const octokit = github.getOctokit(token)


if (issue_number) {
  const comments = (await octokit.rest.issues.listComments({
    owner, repo, issue_number
  })).data

  const parsed = parse(comments)

  let body = ''

  if (parsed['right-now']) body += `
# Right Now
${parsed['right-now']}
`
  if (parsed['now-now']) body += `
# Now Now
${parsed['now-now']}
`
  if (parsed['just-now']) body += `
# Just Now
<details>
<summary>${parsed['just-now'].split("\n").length} Items</summary>

${parsed['just-now']}

</details>
`
  if (parsed['now']) body += `
# Now
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