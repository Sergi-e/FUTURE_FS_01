/**
 * Sets GitHub repo "About" description via REST API.
 * Usage:
 *   GITHUB_TOKEN=ghp_... node scripts/set-github-repo-description.mjs
 *   GITHUB_TOKEN=ghp_... node scripts/set-github-repo-description.mjs "Your one-liner here."
 *
 * Tries Authorization: Bearer, then token (classic PATs sometimes need the latter).
 */
const OWNER = 'Sergi-e'
const REPO = 'FUTURE_FS_01'
const DEFAULT_DESC =
  'Full-stack portfolio: React, Vite, GSAP, Lenis, Express, SQLite API, projects, testimonials, contact, admin dashboard.'

const token = (process.env.GITHUB_TOKEN || '').trim()
if (!token) {
  console.error('Missing GITHUB_TOKEN. Create a PAT with repo (classic) or Administration read/write (fine-grained).')
  process.exit(1)
}

const description = (process.argv[2] || DEFAULT_DESC).trim()
const uri = `https://api.github.com/repos/${OWNER}/${REPO}`
const headersBase = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'portfolio-set-github-description',
}

async function patch(authHeader) {
  const res = await fetch(uri, {
    method: 'PATCH',
    headers: {
      ...headersBase,
      Authorization: authHeader,
    },
    body: JSON.stringify({ description }),
  })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    json = { raw: text }
  }
  return { ok: res.ok, status: res.status, json, text }
}

const attempts = [`Bearer ${token}`, `token ${token}`]
let last = null

for (const auth of attempts) {
  const r = await patch(auth)
  last = r
  if (r.ok) {
    console.log('OK:', r.json.full_name)
    console.log(r.json.description || '(empty)')
    process.exit(0)
  }
  if (r.status !== 401 && r.status !== 403) {
    console.error(`GitHub API ${r.status}:`, r.json.message || r.json.raw || r.text)
    process.exit(1)
  }
}

console.error('GitHub rejected the token (401/403) with both Bearer and token auth.')
if (last) console.error('Last message:', last.json.message || last.text)
console.error('')
console.error('Fix:')
console.error('  Classic PAT: https://github.com/settings/tokens/new  -> scope "repo"')
console.error('  Fine-grained: https://github.com/settings/personal-access-tokens/new')
console.error('    -> pick repo FUTURE_FS_01 -> Administration: Read and write')
process.exit(1)
