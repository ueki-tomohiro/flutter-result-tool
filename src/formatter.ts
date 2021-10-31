import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/action'
import {Reporter} from './model/reporter'

type ExportReport = (args: {
  report?: Reporter
  coverage?: Reporter
}) => Promise<void>

const charactersLimit = 65535

export const exportReport: ExportReport = async ({report, coverage}) => {
  try {
    const octokit = new Octokit()

    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    const pr = github.context.payload.pull_request
    const sha = (pr && pr.head.sha) ?? github.context.sha

    let title = core.getInput('title')
    if (title.length > charactersLimit) {
      core.error(
        `The 'title' will be truncated because the character limit (${charactersLimit}) exceeded.`
      )
      title = title.substring(0, charactersLimit)
    }

    let summary = report?.summary ?? ''
    let reportDetail = report?.detail ?? ''
    let comment = report?.comment ?? ''

    summary += coverage?.summary ? `\n${coverage?.summary}` : ''
    reportDetail += coverage?.detail ? `\n${coverage?.detail}` : ''
    comment += coverage?.comment ? `\n${coverage?.comment}` : ''

    if (summary.length > charactersLimit) {
      core.error(
        `The 'summary' will be truncated because the character limit (${charactersLimit}) exceeded.`
      )
      summary = summary.substring(0, charactersLimit)
    }
    if (reportDetail.length > charactersLimit) {
      core.error(
        `The 'text' will be truncated because the character limit (${charactersLimit}) exceeded.`
      )
      reportDetail = reportDetail.substring(0, charactersLimit)
    }

    const annotations = report?.annotations.slice(0, 50) ?? []
    if (coverage?.annotations) {
      annotations.concat(coverage?.annotations)
    }
    if (annotations.length > 50) {
      core.error('Annotations that exceed the limit (50) will be truncated.')
    }

    if (comment) {
      octokit.issues.createComment({
        owner,
        repo,
        issue_number: github.context.issue.number,
        body: comment
      })
    }

    await octokit.checks.create({
      owner,
      repo,
      name: title,
      head_sha: sha,
      status: 'completed',
      conclusion:
        report?.status === 'success' && coverage?.status === 'success'
          ? 'success'
          : 'failure',
      output: {
        title,
        summary,
        text: reportDetail,
        annotations: annotations.slice(0, 50)
      }
    })
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}
