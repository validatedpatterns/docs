#!/usr/bin/env node
// Generates Markdown versions of all content pages and places them
// in public/ alongside the HTML output (as index.md).
//
// - AsciiDoc files: reduced (includes resolved) then converted via downdoc
// - Markdown files: raw content copied
// - Frontmatter is stripped and replaced with a clean title + llms.txt link
// - Sibling page links are added at the bottom
//
// Usage: node utils/generate-md.js

const fs = require('fs')
const path = require('path')

const Asciidoctor = require('asciidoctor')()
const reducer = require('@asciidoctor/reducer')
const downdoc = require('downdoc')

const PROJECT_DIR = path.join(__dirname, '..')
const CONTENT_DIR = path.join(PROJECT_DIR, 'content')
const PUBLIC_DIR = path.join(PROJECT_DIR, 'public')
const SITE_URL = 'https://validatedpatterns.io'

// Sections to skip (no useful content for LLMs)
const SKIP_SECTIONS = ['search', 'ci']

function findContentFiles (dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      findContentFiles(fullPath, files)
    } else if (entry.name.endsWith('.adoc') || entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

function getOutputPath (contentPath) {
  const rel = path.relative(CONTENT_DIR, contentPath)
  const parts = rel.split(path.sep)

  // Skip excluded sections
  if (SKIP_SECTIONS.includes(parts[0])) return null

  const basename = path.basename(rel)
  const dir = path.dirname(rel)

  if (basename.startsWith('_index.')) {
    return path.join(PUBLIC_DIR, dir, 'index.md')
  } else {
    const slug = basename.replace(/\.(adoc|md)$/, '')
    return path.join(PUBLIC_DIR, dir, slug, 'index.md')
  }
}

function getPageUrl (contentPath) {
  const rel = path.relative(CONTENT_DIR, contentPath)
  const basename = path.basename(rel)
  const dir = path.dirname(rel)

  if (basename.startsWith('_index.')) {
    return `${SITE_URL}/${dir}/`
  } else {
    const slug = basename.replace(/\.(adoc|md)$/, '')
    return `${SITE_URL}/${dir}/${slug}/`
  }
}

function parseFrontmatter (content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { frontmatter: {}, body: content }

  const fm = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w[\w_-]*):\s*(.+)/)
    if (m) {
      let val = m[2].trim()
      // Strip surrounding quotes
      if ((val.startsWith("'") && val.endsWith("'")) ||
          (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1)
      }
      fm[m[1]] = val
    }
  }

  return { frontmatter: fm, body: content.slice(match[0].length) }
}

function convertAsciidoc (filePath) {
  const registry = Asciidoctor.Extensions.create()
  reducer.register(registry)

  const doc = Asciidoctor.loadFile(filePath, {
    extension_registry: registry,
    safe: 'unsafe',
    base_dir: PROJECT_DIR
  })

  const reducedSource = doc.getSource()
  return downdoc(reducedSource)
}

function fixImagePaths (markdown) {
  return markdown.replace(/\([^)]*\/images\/(\/images\/[^)]+)\)/g,
    (_, imgPath) => `(${SITE_URL}${imgPath})`)
}

function getSiblings (contentPath) {
  const dir = path.dirname(contentPath)
  const basename = path.basename(contentPath)
  const siblings = []

  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue
      if (entry.name === basename) continue
      if (!entry.name.endsWith('.adoc') && !entry.name.endsWith('.md')) continue
      if (entry.name.startsWith('_index.')) continue

      const siblingPath = path.join(dir, entry.name)
      const sibContent = fs.readFileSync(siblingPath, 'utf8')
      const { frontmatter } = parseFrontmatter(sibContent)
      const title = frontmatter.title || entry.name.replace(/\.(adoc|md)$/, '')
      const url = getPageUrl(siblingPath)
      siblings.push({ title, url })
    }
  } catch (_) {
    // Directory read failed, return empty
  }

  return siblings
}

function buildPage (contentPath, body, title, summary) {
  const pageUrl = getPageUrl(contentPath)
  const lines = []

  // Header
  lines.push(`# ${title}`)
  lines.push('')
  if (summary) {
    lines.push(`> ${summary}`)
    lines.push('')
  }
  lines.push(`> This page is part of the [Validated Patterns](${SITE_URL}) documentation.`)
  lines.push(`> For a complete documentation index, see [llms.txt](${SITE_URL}/llms.txt)`)
  lines.push(`> HTML version: ${pageUrl}`)
  lines.push('')

  // Body
  lines.push(body.trim())
  lines.push('')

  // Sibling pages
  const siblings = getSiblings(contentPath)
  if (siblings.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Related pages')
    lines.push('')
    for (const s of siblings) {
      lines.push(`- [${s.title}](${s.url}index.md)`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function processFile (filePath) {
  let rawContent
  if (filePath.endsWith('.adoc')) {
    rawContent = fixImagePaths(convertAsciidoc(filePath))
  } else {
    rawContent = fs.readFileSync(filePath, 'utf8')
  }

  const { frontmatter, body } = parseFrontmatter(rawContent)
  const title = frontmatter.title || path.basename(filePath).replace(/\.(adoc|md)$/, '')
  const summary = frontmatter.summary || ''

  return buildPage(filePath, body, title, summary)
}

function main () {
  const files = findContentFiles(CONTENT_DIR)
  let converted = 0
  let skipped = 0
  let errors = 0

  for (const filePath of files) {
    const outputPath = getOutputPath(filePath)
    if (!outputPath) {
      skipped++
      continue
    }

    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      skipped++
      continue
    }

    try {
      const markdown = processFile(filePath)
      fs.writeFileSync(outputPath, markdown, 'utf8')
      converted++
    } catch (err) {
      console.error(`Error converting ${path.relative(CONTENT_DIR, filePath)}: ${err.message}`)
      errors++
    }
  }

  console.log(`Generated ${converted} markdown files (${skipped} skipped, ${errors} errors)`)

  // Generate llms-full.txt by concatenating all generated markdown files
  generateLlmsFullTxt()
}

function generateLlmsFullTxt () {
  const sections = ['learn', 'patterns', 'contribute']
  const parts = []

  parts.push(`# Validated Patterns — Full Documentation`)
  parts.push('')
  parts.push(`> This file contains the complete documentation for Validated Patterns.`)
  parts.push(`> For a page index, see ${SITE_URL}/llms.txt`)
  parts.push(`> For individual pages in markdown, append index.md to any page URL.`)
  parts.push('')

  for (const section of sections) {
    const sectionDir = path.join(PUBLIC_DIR, section)
    if (!fs.existsSync(sectionDir)) continue

    const mdFiles = []
    findMdFiles(sectionDir, mdFiles)
    mdFiles.sort()

    for (const mdFile of mdFiles) {
      const content = fs.readFileSync(mdFile, 'utf8')
      parts.push(content.trim())
      parts.push('')
      parts.push('---')
      parts.push('')
    }
  }

  const fullPath = path.join(PUBLIC_DIR, 'llms-full.txt')
  fs.writeFileSync(fullPath, parts.join('\n'), 'utf8')

  const sizeMB = (fs.statSync(fullPath).size / 1024 / 1024).toFixed(1)
  console.log(`Generated llms-full.txt (${sizeMB} MB)`)
}

function findMdFiles (dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      findMdFiles(fullPath, files)
    } else if (entry.name === 'index.md') {
      files.push(fullPath)
    }
  }
}

main()
