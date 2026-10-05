// ============================================
// Data Classes & Parsing
// ============================================

class Badge {

  constructor(base, key, date) {
    this.base = base
    this.key = key
    this._json = null
    this.operator = 'N/A'
    this.date = date.substr(0, 10)
    this.pattern = ''
    this.platform = ''
    this.version = ''

    if (isNewCiBadgeBase(base)) {
      return
    }

    const fields = key.split('-')
    this.pattern = fields[0]
    this.platform = fields[1]
    if (fields[fields.length - 2] == 'operator') {
      this.operator = fields[fields.length - 5]
    } else {
      this.operator = 'N/A'
    }
    if (fields[2] != 'ci.json') {
      this.version = fields[2]
    } else {
      this.version = ''
    }
  }

  applyJson(json) {
    this._json = json

    if (!isNewCiBadgeBase(this.base)) {
      return this
    }

    var patternId = ciPatternIdFromJson(json, this.key)

    if (patternId != null) {
      this.pattern = patternId
    }

    var platform = normalizeInfraProvider(json.infraProvider)
    if (platform != null && json.infraProvider) {
      this.platform = platform
    }

    var version = ocpMajorMinor(json.openshiftVersion)
    if (version != null) {
      this.version = version
    } else if (json.openshiftVersion != null && json.openshiftVersion !== '') {
      this.version = String(json.openshiftVersion)
    }

    if (json.date != null && json.date !== '') {
      this.date = String(json.date).substr(0, 10)
    }

    if (json.operator != null && json.operator !== '') {
      this.operator = json.operator
    }

    return this
  }

  string() {
    return this.key
  }

  getURI() {
    return this.base + '/' + this.key
  }
}

// ============================================
// Helper Functions
// ============================================

// Still present in badge buckets but no longer in the CI matrix (omit from dashboard)
var CI_DASHBOARD_EXCLUDED_OCP_VERSIONS = ['4.19']

function excludeRetiredOcpVersionsFromDashboard(badges) {
  if (!badges || badges.length === 0) {
    return badges || []
  }
  return badges.filter(function (b) {
    return CI_DASHBOARD_EXCLUDED_OCP_VERSIONS.indexOf(b.version) === -1
  })
}

function filterBadges(badges, field, value) {
  if (field === 'pattern') {
    return badges.filter(badge => badge.pattern === value)
  }
  if (field === 'platform') {
    return badges.filter(badge => badge.platform === value)
  }
  if (field === 'version') {
    return badges.filter(badge => badge.version === value)
  }
  if (field === 'date') {
    return badges.filter(badge => badge.date === value)
  }
  if (field === 'operator') {
    return badges.filter(badge => badge.operator === value)
  }
  return badges
}

// CI pattern keys for patterns in the Archived tier. Keep in sync with
// content/patterns/**/_index.* where tier: archived.
var ARCHIVED_CI_PATTERNS = {
  medicaldiag: true
}

// First segment of badge filenames (before the first `-`) → Hugo section under /patterns/, or absolute path.
// Sync new keys with `ci:` in content/patterns/**/_index.* (hyphenated CI IDs often appear only as a shortened prefix in keys).
var CI_PATTERN_DOC_SLUG = {
  aegitops: 'ansible-edge-gitops',
  agof: 'ansible-gitops-framework',
  coco: 'coco-pattern',
  connvehicle: 'connected-vehicle-architecture',
  devsecops: 'devsecops',
  emergingdd: 'emerging-disease-detection',
  federatedobservability: 'federated-edge-observability',
  hypershift: 'hypershift',
  imageclass: 'emerging-disease-detection',
  industrialedge: 'industrial-edge',
  ingressmeshbgp: 'ingress-mesh-bgp',
  layeredzerotrust: 'layered-zero-trust',
  manuela: 'industrial-edge',
  mcgitops: 'multicloud-gitops',
  mcgitopshcp: 'multicloud-gitops',
  mcgitopsstandalone: 'multicloud-gitops',
  mcgitopsamx: 'multicloud-gitops-amx',
  mcgitopsqat: 'multicloud-gitops-qat',
  mcgitopssgx: 'multicloud-gitops-sgx',
  mcgitopsrhoai: 'multicloud-gitops-amx-rhoai',
  medicaldiag: 'medical-diagnosis',
  netapp: 'netapp-dr-starter-kit',
  openshiftai: 'openshift-ai',
  omnicloud: 'omnicloud',
  patternsoperator: '/learn/using-validated-pattern-operator',
  portworx: 'portworx-dr',
  ragllm: 'rag-llm-gitops',
  ramendr: 'ramendr-starter-kit',
  retail: 'retail',
  telco: 'telco-hub',
  telcohub: 'telco-hub',
  travelops: 'travelops',
  vsk: 'virtualization-starter-kit'
}

// New CI badge bucket (S3 keys under ci-badges/) — distinct from legacy vp-results filenames.

var NEW_CI_BADGE_KEY_PREFIX = "https://vp-qe-ci-badges"

function isNewCiBadgeBase(base) {
  return base != null && base.startsWith(NEW_CI_BADGE_KEY_PREFIX)
}

function normalizeInfraProvider(provider) {
  if (provider == null || provider === '') {
    return null
  }
  var p = String(provider).toLowerCase()
  if (p === 'azure') {
    return 'azr'
  }
  if (p === 'google' || p === 'gcp') {
    return 'gcp'
  }
  if (p === 'amazon' || p === 'aws') {
    return 'aws'
  }
  return p
}

function ocpMajorMinor(version) {
  if (version == null || version === '') {
    return null
  }
  var match = String(version).match(/^(\d+\.\d+)/)
  return match ? match[1] : null
}

function badgeOcpVersion(badge) {
  if (badge == null) {
    return null
  }
  if (badge._json && badge._json.openshiftVersion) {
    var fromJson = ocpMajorMinor(badge._json.openshiftVersion)
    if (fromJson != null) {
      return fromJson
    }
  }
  if (badge.version != null && badge.version !== '' && badge.version !== 'none') {
    return badge.version
  }
  return null
}

function ciPatternIdFromJson(json, key) {
  if (json == null) {
    return null
  }
  if (json.patternName == null || json.patternName === '') {
    return null
  }
  var name = String(json.patternName).toLowerCase()
  if (name === 'mcg') {
    if (json.variant === 'hub') {
      return 'mcgitops'
    }
    if (String(key).includes("-hosted-")) {

      return 'mcgitopshcp'
    }
    if (String(key).includes("-single-")) {
      return 'mcgitopsstandalone'
    }
    return 'mcgitops'
  }
  if (name === 'ansibleedgegitops' || name === 'ansible-edge' || name === 'aegitops') {
    return 'aegitops'
  }
  return name
}

function pattern_url(key) {
  if (key == null || key === '') {
    return '/patterns/'
  }
  var slug = CI_PATTERN_DOC_SLUG[key]
  if (slug != null) {
    if (slug.charAt(0) === '/') {
      return slug.endsWith('/') ? slug : (slug + '/')
    }
    return '/patterns/' + slug + '/'
  }
  // Already matches section slug (e.g. telco-hub, cockroachdb)
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) {
    return '/patterns/' + key + '/'
  }
  return '/patterns/' + key + '/'
}

function stringForKey(key) {
  if (key == 'azr') {
    return 'Azure'
  }
  if (key == 'agof') {
    return 'AnsibleGitopsFramework'
  }
  if (key == 'coco') {
    return 'CoCo'
  }
  if (key == 'gcp') {
    return 'Google'
  }
  if (key == 'aws') {
    return 'AWS'
  }
  if (key == 'aegitops') {
    return 'AnsibleEdgeGitops'
  }
  if (key == 'devsecops') {
    return 'DevSecOps'
  }
  if (key == 'manuela' || key == 'industrialedge') {
    return 'IndustrialEdge'
  }
  if (key == 'mcgitops') {
    return 'Core GitOps'
  }
  if (key == 'mcgitopshcp') {
    return 'MultiCloudGitopsHypershift'
  }
  if (key == 'mcgitopsstandalone') {
    return 'MultiCloudGitopsStandalone'
  }
  if (key == 'ragllm') {
    return 'RAG-LLM'
  }
  if (key == 'travelops') {
    return 'TravelOps'
  }
  if (key == 'layeredzerotrust') {
    return 'LayeredZeroTrust'
  }
  if (key == 'hypershift') {
    return 'Hypershift'
  }
  if (key == 'openshiftai') {
    return 'OpenShiftAI'
  }
  if (key == 'patternsoperator') {
    return 'PatternsOperator'
  }
  if (key == 'medicaldiag') {
    return 'Medical Diagnosis'
  }
  if (key == 'imageclass') {
    return 'Edge Anomaly Detection'
  }
  if (key == 'connvehicle') {
    return 'Connected Vehicle'
  }
  if (key == 'retail') {
    return 'Quarkus CoffeeShop'
  }
  if (key == 'nutanix') {
    return 'Nutanix'
  }
  return key
}

function getBadgeDate(xml) {
  let parent = xml.parentNode
  for (let j = 0; j < parent.childNodes.length; j++) {
    if (parent.childNodes[j].nodeName == 'LastModified') {
      return parent.childNodes[j].childNodes[0].nodeValue
    }
  }
  return '2033-03-22T16:45:47.966Z'
}

function getUniqueValues(badges, field) {
  let results = []

  badges.forEach(b => {
    if (field == 'date' && !results.includes(b.date)) {
      results.push(b.date)
    } else if (field == 'platform' && !results.includes(b.platform)) {
      results.push(b.platform)
    } else if (field == 'pattern' && !results.includes(b.pattern)) {
      results.push(b.pattern)
    } else if (field == 'version' && b.version != '' && !results.includes(b.version)) {
      results.push(b.version)
    } else if (field == 'operator' && b.operator != '' && !results.includes(b.operator)) {
      results.push(b.operator)
    }
  })

  if (field === 'pattern') {
    return results.sort(function (a, b) { return -1 * a.localeCompare(b) })
  } else if (field === 'version') {
    return results.sort(function (a, b) { return -1 * a.localeCompare(b) })
  } else if (field === 'date') {
    return results.sort(function (a, b) { return -1 * a.localeCompare(b) })
  }

  return results.sort()
}

function patternSort(a, b) {
  if (a.pattern != b.pattern) {
    return a.pattern.localeCompare(b.pattern)
  }
  if (a.platform != b.platform) {
    return a.platform.localeCompare(b.platform)
  }
  if (a.version != b.version) {
    return -1 * a.version.localeCompare(b.version)
  }
  return -1 * a.date.localeCompare(b.date)
}

function patternVertSort(a, b) {
  if (a.version != b.version) {
    return -1 * a.version.localeCompare(b.version)
  }
  if (a.pattern != b.pattern) {
    return a.pattern.localeCompare(b.pattern)
  }
  if (a.platform != b.platform) {
    return a.platform.localeCompare(b.platform)
  }
  return -1 * a.date.localeCompare(b.date)
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

// ============================================
// Network / JSON Fetching
// ============================================

function badgeStatusColor(badge) {
  if (badge == null) return 'unavailable'
  if (badge._json != null && badge._json.color) return badge._json.color
  if (badge._color) return badge._color
  return 'unavailable'
}

function enrichBadgesFromJson(badges) {
  if (!badges || badges.length === 0) {
    return Promise.resolve(badges || [])
  }
  return Promise.all(badges.map(function (badge) {
    return fetch(badge.getURI())
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP error: ' + response.status)
        }
        return response.json()
      })
      .then(function (json) {
        return badge.applyJson(json)
      })
      .catch(function (err) {
        console.error('Fetch problem: ' + err.message + ' when fetching ' + badge.getURI())
        return badge
      })
  })).then(function () {
    return badges
  })
}

// ============================================
// Legacy Badge Rendering (for pattern page embeds)
// ============================================

function getLabel(field, badge) {
  if (field == 'pattern') {
    return platformDisplayName(badge._json.infraProvider) + ' ' + badge._json.openshiftVersion
  }
  if (field == 'platform') {
    return stringForKey(badge.pattern) + ' - ' + badge._json.openshiftVersion
  }
  if (field == 'version') {
    return stringForKey(badge.pattern) + ' : ' + platformDisplayName(badge._json.infraProvider)
  }
  return stringForKey(badge.pattern) + ' : ' + platformDisplayName(badge._json.infraProvider) + ' ' + badge._json.openshiftVersion
}

function rowTitle(field, value) {
  if (field === 'pattern') {
    return stringForKey(value)
  }
  if (field === 'platform') {
    return stringForKey(value)
  }
  return value
}

function renderSetButtons(sets) {
  var currentURL = new URL(window.location.href)
  if (currentURL.searchParams.get('view') === 'classic') {
    ;['pattern', 'platform', 'version', 'date', 'sort'].forEach(function (k) {
      currentURL.searchParams.delete(k)
    })
    currentURL.searchParams.set('view', 'classic')
  }
  var setList = { 'GA': 'GA', 'early': 'Pre-release', 'all': 'All' }
  var buttonText = ""
  buttonText += '<nav class="pf-c-nav pf-m-tertiary" aria-label="Local" style="margin-bottom: 20px;">'
  buttonText += '<ul class="pf-c-nav__list">'

  for (var key in setList) {
    buttonText += '<li class="pf-c-nav__item">'
    currentURL.searchParams.set('sets', key)
    if (key == sets) {
      buttonText += '<a href="' + currentURL + '" class="pf-c-nav__link pf-m-current" aria-current="page">' + setList[key] + '</a>'
    } else {
      buttonText += '<a href="' + currentURL + '" class="pf-c-nav__link">' + setList[key] + '</a>'
    }
    buttonText += '</li>'
  }
  buttonText += '</ul>'
  buttonText += '</nav>'
  return buttonText
}

function renderBadgeHtml(badge, field) {
  let badge_url = badge.getURI()
  let json_obj = badge._json
  if (json_obj == null) {
    return '<a href="' + badge_url + '" class="ci-label ci-label-load-error" target="_blank" rel="noopener noreferrer" aria-label="Open badge URL in a new tab">Unavailable</a>'
  }

  let branchLabel = json_obj.patternBranch
  let color = json_obj.color || 'green'
  let envLabel = getLabel(field, badge)
  let badgeClass = 'ci-label-environment-prerelease'

  if (badge_url.endsWith('stable-badge.json')) {
    badgeClass = 'ci-label-environment-stable'
  } else if (badge_url.endsWith('operator-badge.json')) {
    branchLabel = json_obj.triggerSource + ' ' + json_obj.triggerVersion
  } else if (badge_url.endsWith('nightly-badge.json')) {
    branchLabel = 'nightly (' + json_obj.patternBranch + ')'
  }

  let envLink = encodeURI(badge_url)
  let branchLink = json_obj.patternRepo != null ? encodeURI(json_obj.patternRepo) : null
  let badgeText = '<span class="ci-label">'
  badgeText += '<a href="' + envLink + '"><span class="' + badgeClass + '"><i class="ci-icon fas fa-fw fa-brands fa-git-alt" aria-hidden="true"></i>' + envLabel + '</span></a>'
  if (branchLink != null) {
    badgeText += '<a href="' + branchLink + '"><span class="ci-label-branch-' + color + '">' + branchLabel + '</span></a>'
  } else {
    badgeText += '<span class="ci-label-branch-' + color + '">' + branchLabel + '</span>'
  }
  badgeText += '</span>'
  return badgeText
}

function renderBadges(badges, field, value) {
  let pBadges = badges
  if (field != null && value != null) {
    pBadges = filterBadges(badges, field, value)
  }
  let badgeText = '<div class="pf-l-flex">'
  pBadges.forEach(function (b) {
    badgeText += renderBadgeHtml(b, field)
  })
  badgeText += '</div>'
  return badgeText
}

function legacyFilteredHref(field, rowValue) {
  var cur = new URLSearchParams(window.location.search)
  if (cur.get('view') !== 'classic') {
    return '?' + field + '=' + encodeURIComponent(rowValue)
  }
  var next = new URLSearchParams()
  next.set('view', 'classic')
  var setsVal = cur.get('sets')
  if (setsVal != null && setsVal !== '') next.set('sets', setsVal)
  next.set(field, rowValue)
  return '?' + next.toString()
}

function createFilteredHorizontalTable(badges, field, value, titles) {
  let tableText = "<dl class='pf-c-description-list' id='ci-" + field + "-result' style='margin-bottom: 20px;'><div class='pf-c-description-list__group'>"
  if (titles) {
    tableText += "<dt class='pf-c-description-list__term'><span class='pf-c-description-list__text'>" + toTitleCase('By ' + field) + '</div></dt>'
  }
  tableText += "<dd class='pf-c-description-list__description'><div class='pf-c-description-list__text'>"

  let rows = getUniqueValues(badges, field)
  tableText += "<dl class='pf-c-description-list pf-m-horizontal'>"
  rows.forEach(r => {
    tableText += "<div class='pf-c-description-list__group'>"
    tableText += "<dt class='pf-c-description-list__term'>"
    if (value == null && field == 'pattern') {
      tableText += "<a href='" + pattern_url(r) + "'>" + rowTitle(field, r) + '</a>'
    } else if (value == null) {
      tableText += "<a href='" + legacyFilteredHref(field, r) + "'>" + rowTitle(field, r) + '</a>'
    }
    tableText += '</dt>'

    tableText += '<dd class="pf-c-description-list__description">'
    tableText += '<div class="pf-c-description-list__text">'
    tableText += renderBadges(badges, field, r)
    tableText += '</div></dd></div>'
  })
  tableText += '</dl>'
  return tableText + '</div></dd></div></dl>'
}

function processBadgesLegacy(badges, options) {
  const filter_field = options.get('filter_field')
  const filter_value = options.get('filter_value')

  var htmlText = ""
  if (options.get('show_dashboard_tabs') === true) {
    htmlText += renderTabs('classic')
  }
  htmlText += renderSetButtons(options.get('sets'))

  if (filter_field === 'date') {
    badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })
    if (filter_value != null && filter_value != "all") {
      htmlText += renderBadges(badges, filter_field, filter_value)
    } else if (filter_value == "all") {
      htmlText += createFilteredHorizontalTable(badges, filter_field, null, true)
    }
  } else if (filter_field != null) {
    if (filter_value != null && filter_value != "all") {
      badges = filterBadges(badges, filter_field, filter_value)
    }
    badges.sort(patternSort)
    if (filter_value != null && filter_value != "all") {
      htmlText += renderBadges(badges, filter_field, filter_value)
    } else if (filter_value == "all") {
      htmlText += createFilteredHorizontalTable(badges, filter_field, null, true)
    }
  } else {
    // Classic home: same long-scroll layout as pre-redesign CI page — all groupings at once
    badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })
    badges.sort(patternVertSort)
    htmlText += createFilteredHorizontalTable(badges, 'date', null, true)
    htmlText += createFilteredHorizontalTable(badges, 'pattern', null, true)
    htmlText += createFilteredHorizontalTable(badges, 'platform', null, true)
    htmlText += createFilteredHorizontalTable(badges, 'version', null, true)
    var setsVal = options.get('sets') || 'GA'
    if (String(setsVal).includes('all') || String(setsVal).includes('early')) {
      htmlText += createFilteredHorizontalTable(badges, 'operator', null, true)
    }
  }

  document.getElementById(options.get('target')).innerHTML = htmlText
}

// ============================================
// New Dashboard Rendering (for CI status page)
// ============================================

function statusLabel(color) {
  if (color === 'green') return 'Passed'
  if (color === 'yellow') return 'CI infrastructure failure'
  if (color === 'red') return 'CI test failure'
  return 'Unknown'
}

function platformDisplayName(platform) {
  var names = {
    'aws': 'AWS',
    'azr': 'Azure',
    'gcp': 'Google Cloud',
    'nutanix': 'Nutanix',
    'intel': 'On-prem (Intel)'
  }
  return names[platform] || stringForKey(platform)
}

function platformIconSvg(platform) {
  if (platform === 'aws' || platform === 'gcp') {
    return '<span class="ci-platform-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2C5.2 2 3 4 3 6.5c0 .3 0 .5.1.8A3.5 3.5 0 0 0 0 10.5 3.5 3.5 0 0 0 3.5 14h9a3.5 3.5 0 0 0 .5-7c-.5-2.8-3-5-5-5z"/></svg></span>'
  }
  if (platform === 'azr') {
    return '<span class="ci-platform-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2C5.2 2 3 4 3 6.5c0 .3 0 .5.1.8A3.5 3.5 0 0 0 0 10.5 3.5 3.5 0 0 0 3.5 14h9a3.5 3.5 0 0 0 .5-7c-.5-2.8-3-5-5-5z"/></svg></span>'
  }
  if (platform === 'intel' || platform === 'nutanix') {
    return '<span class="ci-platform-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v8H2V3zm1 1v6h10V4H3zm-1 8h12v1H2v-1z"/></svg></span>'
  }
  return '<span class="ci-platform-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2C5.2 2 3 4 3 6.5c0 .3 0 .5.1.8A3.5 3.5 0 0 0 0 10.5 3.5 3.5 0 0 0 3.5 14h9a3.5 3.5 0 0 0 .5-7c-.5-2.8-3-5-5-5z"/></svg></span>'
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  var date = new Date(dateStr + 'T00:00:00')
  var now = new Date()
  var diffMs = now - date
  var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return dateStr
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return diffDays + ' days ago'
  if (diffDays < 30) {
    var weeks = Math.floor(diffDays / 7)
    return weeks + (weeks === 1 ? ' week ago' : ' weeks ago')
  }
  if (diffDays < 365) {
    var months = Math.floor(diffDays / 30)
    return months + (months === 1 ? ' month ago' : ' months ago')
  }
  var years = Math.floor(diffDays / 365)
  return years + (years === 1 ? ' year ago' : ' years ago')
}

function sanitizeId(str) {
  return str.replace(/\./g, '_').replace(/[^a-zA-Z0-9_-]/g, '-')
}

function getCurrentTab() {
  var params = new URLSearchParams(window.location.search)
  if (params.get('view') === 'classic') return 'classic'
  if (params.get('date') != null) return 'history'
  if (params.get('pattern') != null) {
    var val = params.get('pattern')
    if (val !== 'all') return 'pattern-detail'
    return 'patterns'
  }
  if (params.get('platform') != null) return 'infrastructure'
  if (params.get('version') != null) return 'version'
  return 'overview'
}

function buildTabUrl(paramKey) {
  var u = new URL(window.location.href)
    ;['pattern', 'platform', 'version', 'date', 'view'].forEach(function (k) {
      u.searchParams.delete(k)
    })
  if (paramKey != null) {
    u.searchParams.set(paramKey, 'all')
  }
  var qs = u.searchParams.toString()
  return u.pathname + (qs ? '?' + qs : '')
}

function buildPatternDetailHref(pattern) {
  var u = new URL(window.location.href)
  u.searchParams.delete('view')
  u.searchParams.set('pattern', pattern)
  var qs = u.searchParams.toString()
  return u.pathname + (qs ? '?' + qs : '')
}

function buildClassicTabUrl() {
  var u = new URL(window.location.href)
    ;['pattern', 'platform', 'version', 'date', 'sort'].forEach(function (k) {
      u.searchParams.delete(k)
    })
  u.searchParams.set('view', 'classic')
  var qs = u.searchParams.toString()
  return u.pathname + (qs ? '?' + qs : '')
}

function renderTabs(activeTab) {
  var tabs = [
    { id: 'overview', label: 'Overview', href: buildTabUrl(null) },
    { id: 'infrastructure', label: 'By Platform', href: buildTabUrl('platform') },
    { id: 'version', label: 'By Version', href: buildTabUrl('version') },
    { id: 'history', label: 'History', href: buildTabUrl('date') },
    { id: 'classic', label: 'Classic', href: buildClassicTabUrl() }
  ]

  var html = '<div class="ci-tabs">'
  tabs.forEach(function (tab) {
    var isActive = tab.id === activeTab || (activeTab === 'pattern-detail' && tab.id === 'overview')
    var activeClass = isActive ? ' active' : ''
    html += '<a href="' + tab.href + '" class="ci-tab' + activeClass + '">' + tab.label + '</a>'
  })
  html += '</div>'
  return html
}

function renderSortControl(currentSort) {
  var html = '<div class="ci-toolbar ci-toolbar-sort">'
  html += '<label for="ci-sort">Sort by:</label>'
  html += '<select id="ci-sort" onchange="handleSort(this.value)">'
  html += '<option value="latest"' + (currentSort === 'latest' ? ' selected' : '') + '>Latest</option>'
  html += '<option value="pattern"' + (currentSort === 'pattern' ? ' selected' : '') + '>Pattern</option>'
  html += '<option value="platform"' + (currentSort === 'platform' ? ' selected' : '') + '>Platform</option>'
  html += '<option value="version"' + (currentSort === 'version' ? ' selected' : '') + '>Version</option>'
  html += '</select>'
  html += '</div>'
  return html
}

function renderTimeRangeControl(rangeKey) {
  var html = '<div class="ci-toolbar ci-toolbar-range">'
  html += '<label for="ci-range">Time range:</label>'
  html += '<select id="ci-range" onchange="handleTimeRange(this.value)">'
  CI_TIME_RANGE_OPTIONS.forEach(function (opt) {
    html += '<option value="' + opt.id + '"' + (rangeKey === opt.id ? ' selected' : '') + '>' + opt.label + '</option>'
  })
  html += '</select>'
  html += '</div>'
  return html
}

function renderDashboardFiltersRow(rangeKey, currentSort, showSort) {
  var html = '<div class="ci-dashboard-filters">'
  html += '<div class="ci-dashboard-filters-actions">'
  if (showSort) {
    html += renderSortControl(currentSort)
  }
  html += renderTimeRangeControl(rangeKey)
  html += '</div></div>'
  return html
}

function renderOverviewLegendRow(rangeKey) {
  var legendWindow = timeRangeLegendPhrase(rangeKey)
  var legendBody =
    'Cards show the latest test per platform for the selected time range. Status bars show ' +
    legendWindow +
    ', oldest to newest. ' +
    '<span class="ci-legend-bar green"></span> Passed ' +
    '<span class="ci-legend-bar gray"></span> Infra issue ' +
    '<span class="ci-legend-bar red"></span> Test failure'
  var html = '<div class="ci-overview-toolbar">'
  html += '<div class="ci-overview-legend">' + legendBody + '</div>'
  html += renderTimeRangeControl(rangeKey)
  html += '</div>'
  return html
}

function renderDashboardTableHeader() {
  return '<table class="ci-table"><thead><tr>' +
    '<th>Status</th>' +
    '<th>Pattern</th>' +
    '<th>Platform</th>' +
    '<th>OpenShift Version</th>' +
    '<th>Time</th>' +
    '</tr></thead><tbody>'
}

function renderDashboardTableRow(badge) {
  var patternName = stringForKey(badge.pattern)
  var platformName = platformDisplayName(badge.platform)
  let version = badgeOcpVersion(badge) != null ? ('OCP ' + badgeOcpVersion(badge)) : ''
  var time = timeAgo(badge.date)
  var color = badgeStatusColor(badge)
  var branch = badge._json && badge._json.patternBranch ? badge._json.patternBranch : ''
  if (!branch && badge._color) {
    branch = 'main'
  }

  var html = '<tr>'
  html += '<td><div class="ci-status-cell">'
  if (color === 'unavailable') {
    html += '<span class="ci-status-dot unavailable"></span>'
    html += '<a href="' + badge.getURI() + '" class="ci-status-text unavailable ci-status-unavailable-link" target="_blank" rel="noopener noreferrer" aria-label="Open badge URL in a new tab">Unavailable</a>'
  } else {
    html += '<span class="ci-status-dot ' + color + '"></span>'
    html += '<span class="ci-status-text ' + color + '">' + statusLabel(color) + '</span>'
  }
  html += '</div></td>'

  html += '<td><span class="ci-pattern-name">'
  html += '<a href="' + pattern_url(badge.pattern) + '">' + patternName + '</a></span>'
  if (branch) {
    html += '<span class="ci-pattern-branch">#' + branch + '</span>'
  }
  html += '</td>'

  html += '<td><div class="ci-platform-cell">' + platformIconSvg(badge.platform) + ' ' + platformName + '</div></td>'

  html += '<td>' + version + '</td>'

  html += '<td><span class="ci-time">' + time + '</span></td>'
  html += '</tr>'
  return html
}

function isProductionSite() {
  var host = window.location.hostname
  return host === 'validatedpatterns.io' ||
    host === 'localhost' ||
    host === '127.0.0.1'
}

function sampleColorForKey(badgeKey) {
  var colors = ['green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'red']
  var hash = 0
  for (var i = 0; i < badgeKey.length; i++) {
    hash = ((hash << 5) - hash) + badgeKey.charCodeAt(i)
    hash = hash & hash
  }
  return colors[Math.abs(hash) % colors.length]
}

function renderDashboardTableWithBadges(badges) {
  var html = renderDashboardTableHeader()
  badges.forEach(function (b) {
    html += renderDashboardTableRow(b)
  })
  html += '</tbody></table>'
  return html
}

function renderGroupedTables(badges, groupField) {
  var groups = getUniqueValues(badges, groupField)
  var html = ''

  groups.forEach(function (groupValue) {
    var groupBadges = filterBadges(badges, groupField, groupValue)
    var groupTitle

    if (groupField === 'pattern') {
      groupTitle = '<a href="' + pattern_url(groupValue) + '">' + stringForKey(groupValue) + '</a>'
    } else if (groupField === 'platform') {
      groupTitle = platformDisplayName(groupValue)
    } else if (groupField === 'version') {
      groupTitle = (groupValue && groupValue !== 'none') ? 'OCP ' + groupValue : 'Unversioned'
    } else {
      groupTitle = groupValue
    }

    html += '<h3 class="ci-section-header">' + groupTitle + '</h3>'
    html += renderDashboardTableWithBadges(groupBadges)
  })

  return html
}

// ============================================
// Card-Based Dashboard (Progressive Disclosure)
// ============================================

var _cardTracker = {}

function groupBadgesByPattern(badges) {
  var groups = {}
  badges.forEach(function (b) {
    if (!groups[b.pattern]) {
      groups[b.pattern] = []
    }
    groups[b.pattern].push(b)
  })
  return groups
}

function getLatestBadgePerPlatform(badges) {
  var seen = {}
  var result = []
  badges.forEach(function (b) {
    if (!seen[b.platform]) {
      seen[b.platform] = true
      result.push(b)
    }
  })
  return result
}

function filterRecentBadges(badges, months) {
  var cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  var cutoffStr = cutoff.toISOString().substr(0, 10)
  return badges.filter(function (b) { return b.date >= cutoffStr })
}

var CI_TIME_RANGE_OPTIONS = [
  { id: '3m', label: 'Last 3 months' },
  { id: '6m', label: 'Last 6 months' },
  { id: '1y', label: 'Last year' },
  { id: 'all', label: 'All' }
]

function getTimeRangeFromParams(params) {
  var r = params.get('range')
  if (r === '6m' || r === '1y' || r === 'all') return r
  return '3m'
}

function monthsForTimeRange(rangeKey) {
  if (rangeKey === '6m') return 6
  if (rangeKey === '1y') return 12
  return 3
}

function applyTimeRangeToBadges(badges, rangeKey) {
  if (rangeKey === 'all') return badges.slice()
  return filterRecentBadges(badges, monthsForTimeRange(rangeKey))
}

function timeRangeLegendPhrase(rangeKey) {
  if (rangeKey === 'all') return 'all recorded tests in this view'
  if (rangeKey === '6m') return 'tests from the last 6 months'
  if (rangeKey === '1y') return 'tests from the last year'
  return 'tests from the last 3 months'
}

function getLatestBadgePerCombo(badges) {
  var seen = {}
  var result = []
  badges.forEach(function (b) {
    var combo = b.platform + '-' + b.version
    if (!seen[combo]) {
      seen[combo] = true
      result.push(b)
    }
  })
  return result
}

function computeCardHealth(tracker) {
  var colors = Object.values(tracker.platforms)
  var hasRed = colors.indexOf('red') !== -1
  var hasYellow = colors.indexOf('yellow') !== -1
  var hasUnavailable = colors.indexOf('unavailable') !== -1

  if (hasRed) return 'has-failures'
  if (hasUnavailable) return 'unknown-status'
  if (!hasRed && hasYellow) return 'green-with-infra'
  return 'green'
}

function cardHealthLabel(tracker) {
  var colors = Object.values(tracker.platforms)
  var total = colors.length
  var greenCount = colors.filter(function (c) { return c === 'green' }).length
  var yellowCount = colors.filter(function (c) { return c === 'yellow' }).length
  var redCount = colors.filter(function (c) { return c === 'red' }).length
  var unavailableCount = colors.filter(function (c) { return c === 'unavailable' }).length

  if (total === 0) return 'No platforms'
  if (unavailableCount === total) return 'Status unavailable'
  if (unavailableCount > 0) return 'Some platform status unavailable'

  if (greenCount === total) return 'Passing'
  if (redCount === 0 && yellowCount > 0) {
    return 'Passing (' + yellowCount + ' infra ' + (yellowCount === 1 ? 'issue' : 'issues') + ')'
  }
  var passing = greenCount + yellowCount
  if (redCount > 0) {
    return 'Passing on ' + passing + '/' + total + ' platforms'
  }
  return 'Unknown'
}

function cardHealthIcon(health) {
  if (health === 'green' || health === 'green-with-infra') {
    return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#3e8635"/><path d="M6 10l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  }
  if (health === 'has-failures') {
    return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#ec7a08"/><rect x="9" y="5" width="2" height="6" rx="1" fill="#fff"/><rect x="9" y="13" width="2" height="2" rx="1" fill="#fff"/></svg>'
  }
  if (health === 'unknown-status') {
    return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#6a6e73"/><rect x="9" y="5" width="2" height="6" rx="1" fill="#fff"/><rect x="9" y="13" width="2" height="2" rx="1" fill="#fff"/></svg>'
  }
  return '<svg class="pf-c-spinner pf-m-sm" role="progressbar" viewBox="0 0 100 100"><circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none" /></svg>'
}

function renderOverallStatsBar() {
  var patterns = Object.keys(_cardTracker)
  var totalPatterns = patterns.length
  var passingCount = 0

  patterns.forEach(function (p) {
    var health = computeCardHealth(_cardTracker[p])
    if (health === 'green' || health === 'green-with-infra') passingCount++
  })

  if (totalPatterns === 0) {
    return '<div id="ci-overall-stats"><div class="ci-stats-bar"><div class="ci-stats-text">No CI results found.</div></div></div>'
  }

  var pct = Math.round((passingCount / totalPatterns) * 100)
  var html = '<div id="ci-overall-stats"><div class="ci-stats-bar">'
  html += '<div class="ci-stats-text">'
  html += '<span class="ci-stats-number">' + passingCount + '</span> of <span class="ci-stats-number">' + totalPatterns + '</span> patterns passing'
  html += '</div>'
  html += '<div class="ci-stats-progress"><div class="ci-stats-progress-fill" style="width: ' + pct + '%"></div></div>'
  html += '</div></div>'
  return html
}

function renderPatternCard(pattern, platformBadges, comboBadges, tracker) {
  var patternId = sanitizeId(pattern)
  var patternName = stringForKey(pattern)
  var latestDate = platformBadges.length > 0 ? platformBadges[0].date : ''
  var health = computeCardHealth(tracker)

  var html = '<a href="' + buildPatternDetailHref(pattern) + '" class="ci-card" id="ci-card-' + patternId + '" data-pattern="' + pattern + '" data-health="' + health + '">'

  html += '<div class="ci-card-header">'
  html += '<span class="ci-card-health" id="ci-card-icon-' + patternId + '">' + cardHealthIcon(health) + '</span>'
  html += '<span class="ci-card-title">' + patternName + '</span>'
  html += '</div>'

  html += '<div class="ci-card-summary ' + health + '" id="ci-card-summary-' + patternId + '">' + cardHealthLabel(tracker) + '</div>'

  html += '<div class="ci-card-platforms">'
  platformBadges.forEach(function (b) {
    var platformColor = tracker.platforms[b.platform] || 'unavailable'
    html += '<span class="ci-card-platform" title="' + platformDisplayName(b.platform) + '">'
    html += '<span class="ci-card-platform-dot ' + platformColor + '" id="ci-card-dot-' + patternId + '-' + sanitizeId(b.platform) + '"></span>'
    html += '<span class="ci-card-platform-label">' + stringForKey(b.platform) + '</span>'
    html += '</span>'
  })
  html += '</div>'

  html += '<div class="ci-card-blocks">'
  comboBadges.slice().reverse().forEach(function (b) {
    var comboId = sanitizeId(b.platform) + '-' + sanitizeId(b.version)
    var blockColor = tracker.tests[comboId] || 'unavailable'
    html += '<span class="ci-card-block ' + blockColor + '" id="ci-card-block-' + patternId + '-' + comboId + '" title="' + platformDisplayName(b.platform) + ' ' + b.version + '"></span>'
  })
  html += '</div>'

  html += '<div class="ci-card-footer">Last tested: ' + timeAgo(latestDate) + '</div>'

  html += '</a>'
  return html
}

function renderPatternCards(badges) {
  badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })

  var groups = groupBadgesByPattern(badges)
  var patternNames = Object.keys(groups).sort(function (a, b) {
    return stringForKey(a).localeCompare(stringForKey(b))
  })

  _cardTracker = {}

  var html = '<div class="ci-card-grid">'

  patternNames.forEach(function (pattern) {
    var patternBadges = groups[pattern]
    var latestPerPlatform = getLatestBadgePerPlatform(patternBadges)
    var latestPerCombo = getLatestBadgePerCombo(patternBadges)

    var tracker = {
      platforms: {},
      tests: {}
    }

    latestPerPlatform.forEach(function (b) {
      tracker.platforms[b.platform] = badgeStatusColor(b)
    })

    latestPerCombo.forEach(function (b) {
      var comboKey = sanitizeId(b.platform) + '-' + sanitizeId(b.version)
      tracker.tests[comboKey] = badgeStatusColor(b)
    })

    _cardTracker[pattern] = tracker
    html += renderPatternCard(pattern, latestPerPlatform, latestPerCombo, tracker)
  })

  html += '</div>'
  html = renderOverallStatsBar() + html
  html += '<a href="' + buildTabUrl('date') + '" class="ci-history-link">View complete history &rarr;</a>'

  return html
}

function renderStatusKey() {
  return '<div class="ci-status-key">' +
    '<span class="ci-status-key-item"><span class="ci-status-dot green"></span> <strong>Passed:</strong> Pattern deployed and tests succeeded</span>' +
    '<span class="ci-status-key-item"><span class="ci-status-dot yellow"></span> <strong>CI infrastructure failure:</strong> Cloud or pipeline problem, not a pattern issue</span>' +
    '<span class="ci-status-key-item"><span class="ci-status-dot red"></span> <strong>CI test failure:</strong> Pattern tests did not pass</span>' +
    '</div>'
}

function handleSort(value) {
  var url = new URL(window.location.href)
  url.searchParams.set('sort', value)
  window.location.href = url.toString()
}

function handleTimeRange(value) {
  var url = new URL(window.location.href)
  if (value === '3m') {
    url.searchParams.delete('range')
  } else {
    url.searchParams.set('range', value)
  }
  window.location.href = url.toString()
}

function syncCiSidebarNavWithUrl() {
  var list = document.querySelector('.ci-sidebar-nav')
  if (!list) return
  var cur = new URL(window.location.href)
  list.querySelectorAll('a[href]').forEach(function (a) {
    var linkUrl = new URL(a.getAttribute('href'), window.location.origin)
      ;['range', 'sort'].forEach(function (k) {
        var v = cur.searchParams.get(k)
        if (k === 'range') {
          if (v == null || v === '' || v === '3m') linkUrl.searchParams.delete('range')
          else linkUrl.searchParams.set('range', v)
        } else if (k === 'sort') {
          if (v == null || v === '' || v === 'latest') linkUrl.searchParams.delete('sort')
          else linkUrl.searchParams.set('sort', v)
        }
      })
    var qs = linkUrl.searchParams.toString()
    a.setAttribute('href', linkUrl.pathname + (qs ? '?' + qs : ''))
  })
}

function renderDashboard(badges, options) {
  var filter_field = options.get('filter_field')
  var filter_value = options.get('filter_value')
  var target = options.get('target')

  var currentTab = getCurrentTab()
  var params = new URLSearchParams(window.location.search)
  var currentSort = params.get('sort') || 'latest'
  var rangeKey = getTimeRangeFromParams(params)

  badges = applyTimeRangeToBadges(badges, rangeKey)

  if (filter_value != null && filter_value !== 'all') {
    badges = filterBadges(badges, filter_field, filter_value)
  }

  badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })

  if (currentSort === 'pattern') {
    badges.sort(patternSort)
  } else if (currentSort === 'platform') {
    badges.sort(function (a, b) {
      if (a.platform !== b.platform) return a.platform.localeCompare(b.platform)
      return -1 * a.date.localeCompare(b.date)
    })
  } else if (currentSort === 'version') {
    badges.sort(function (a, b) {
      if (a.version !== b.version) return -1 * a.version.localeCompare(b.version)
      return -1 * a.date.localeCompare(b.date)
    })
  }

  var html = ''

  html += renderTabs(currentTab)

  var showSortInFilters =
    currentTab === 'pattern-detail' ||
    currentTab === 'infrastructure' ||
    currentTab === 'version' ||
    currentTab === 'history' ||
    currentTab === 'patterns'

  // Time range (+ sort where applicable) directly under tabs so drill-down pages match overview visibility
  if (currentTab === 'overview') {
    html += renderOverviewLegendRow(rangeKey)
  } else {
    html += renderDashboardFiltersRow(rangeKey, currentSort, showSortInFilters)
  }

  if (currentTab === 'pattern-detail') {
    html += '<a href="' + buildTabUrl(null) + '" class="ci-back-link">&larr; Back to overview</a>'
    html += '<h2 class="ci-detail-title">' + stringForKey(filter_value) + '</h2>'
  }

  if (currentTab === 'overview') {
    html += renderPatternCards(badges)
  } else if (currentTab === 'pattern-detail') {
    html += renderStatusKey()
    html += renderDashboardTableWithBadges(badges)
  } else if (currentTab === 'infrastructure') {
    html += renderStatusKey()
    if (filter_value != null && filter_value !== 'all') {
      html += renderDashboardTableWithBadges(badges)
    } else {
      html += renderGroupedTables(badges, 'platform')
    }
  } else if (currentTab === 'version') {
    html += renderStatusKey()
    if (filter_value != null && filter_value !== 'all') {
      html += renderDashboardTableWithBadges(badges)
    } else {
      html += renderGroupedTables(badges, 'version')
    }
  } else if (currentTab === 'history') {
    html += renderStatusKey()
    if (filter_value != null && filter_value !== 'all') {
      var dateBadges = filterBadges(badges, 'date', filter_value)
      html += renderDashboardTableWithBadges(dateBadges)
    } else {
      html += renderDashboardTableWithBadges(badges)
    }
  } else if (currentTab === 'patterns') {
    html += renderGroupedTables(badges, 'pattern')
  }

  if (badges.length === 0) {
    html += '<div class="ci-empty">No CI results found.</div>'
  }

  document.getElementById(target).innerHTML = html
  syncCiSidebarNavWithUrl()
}

// ============================================
// Badge Data Processing
// ============================================

function getBadges(xmlText, bucket_url, badge_set) {
  let parser = new DOMParser()
  var xmlDoc = parser.parseFromString(xmlText, 'application/xml')
  const errorNode = xmlDoc.querySelector('parsererror')
  if (errorNode) {
    console.warn('Failed to parse bucket listing XML:', bucket_url)
    return []
  }

  var badges = []
  var entries = xmlDoc.getElementsByTagName('Key')

  let l = entries.length

  for (let i = 0; i < l; i++) {
    let key = entries[i].childNodes[0].nodeValue
    if (badge_set == "GA" && key.endsWith("stable-badge.json")) {
      badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
    } else if (badge_set == "early" && (key.endsWith("prerelease-badge.json") || key.endsWith("nightly-badge.json") || key.endsWith("operator-badge.json"))) {
      badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
    } else if (badge_set == "all" && key.endsWith("-badge.json")) {
      badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
    } else {
      console.log("Skipping: " + key);
    }
  }

  return badges
}

function excludeArchivedPatternsFromDashboard(badges) {
  return badges.filter(function (badge) {
    return !ARCHIVED_CI_PATTERNS[badge.pattern]
  })
}

function processBadges(badges, options) {
  badges = excludeRetiredOcpVersionsFromDashboard(badges)
  badges = excludeArchivedPatternsFromDashboard(badges)
  if (options.get('disable_buttons') === true) {
    processBadgesLegacy(badges, options)
    return
  }

  renderDashboard(badges, options)
}

// ============================================
// Entry Points
// ============================================

function getBucketOptions(input) {
  const options = new Map()
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)

  if (urlParams.get('sets') != null) {
    options.set('sets', urlParams.get('sets'))
  } else {
    options.set('sets', 'GA')
  }
  options.set('links', 'public')
  options.set('target', 'dataset')

  let buckets = []
  const bucket = input['bucket']
  if (bucket != null) {
    buckets.push(bucket)
  } else {
    buckets.push('https://storage.googleapis.com/vp-results')
    buckets.push('https://vp-ntnx-results.s3.amazonaws.com')
    buckets.push('https://vp-qe-ci-badges.s3.us-east-2.amazonaws.com')
  }
  options.set('buckets', buckets)

  const fields = ['sets', 'target', 'filter_field', 'filter_value', 'links', 'disable_buttons']
  for (let i = 0; i < fields.length; i++) {
    const key = fields[i]
    const value = input[key]
    if (value != null) {
      options.set(fields[i], value)
    }
  }
  const sections = ['date', 'version', 'platform', 'pattern']

  let filter_field = options.get('filter_field')

  if (filter_field == null) {
    for (let i = 0; i < sections.length; i++) {
      if (urlParams.get(sections[i]) != null) {
        options.set('filter_field', sections[i])
        if (options.get('filter_value') == null && urlParams.get(sections[i]) != null) {
          options.set('filter_value', urlParams.get(sections[i]))
        }
      }
    }
  }

  if (urlParams.get('view') === 'classic') {
    options.set('disable_buttons', true)
    options.set('show_dashboard_tabs', true)
    var classicPf = options.get('filter_field')
    var classicPv = options.get('filter_value')
    if (classicPf === 'pattern' && classicPv != null && classicPv !== 'all') {
      options.delete('filter_field')
      options.delete('filter_value')
    }
  }

  return options
}

function fetchBucketBadges(bucket, inputs) {
  return new Promise(function (resolve) {
    var req = new XMLHttpRequest()
    const options = getBucketOptions(inputs)
    req.open('GET', bucket)
    req.onload = function () {
      if (req.status === 200) {
        const badges = getBadges(req.responseText, bucket, options.get('sets')) || []
        resolve(badges)
      } else {
        console.warn('CI badge bucket unavailable:', bucket, '(HTTP', req.status + ')')
        resolve([])
      }
    }
    req.onerror = function () {
      console.warn('CI badge bucket request failed:', bucket)
      resolve([])
    }
    req.send()
  })
}

function obtainBadgesFromSample(inputs) {
  const options = getBucketOptions(inputs);

  fetch('/data/sample-badges.json')
    .then(function (response) { return response.json() })
    .then(function (sampleData) {
      var allBadges = sampleData.map(function (item) {
        var b = new Badge(item.base, item.key, item.date + 'T00:00:00Z')
        b.pattern = item.pattern
        b.platform = item.platform
        b.operator = item.operator
        b.version = item.version
        b.date = item.date
        b._color = sampleColorForKey(item.key)
        return b
      })
      console.log('Using sample data:', allBadges.length, 'badges')
      processBadges(allBadges, options)
    })
    .catch(function (error) {
      console.error('Error loading sample data:', error)
    })
}

function obtainBadges(inputs) {
  if (!isProductionSite()) {
    console.log('Non-production site detected, using sample badge data')
    obtainBadgesFromSample(inputs)
    return
  }

  const options = getBucketOptions(inputs);
  const buckets = options.get('buckets')

  const badgePromises = [];

  for (const bucket of buckets) {
    badgePromises.push(fetchBucketBadges(bucket, inputs));
  }

  Promise.all(badgePromises)
    .then(function (results) {
      const allBadges = []
      results.forEach(function (badges) {
        if (badges && badges.length > 0) {
          console.log('Got ' + badges.length + ' badges')
        }
        allBadges.push.apply(allBadges, badges || [])
      })

      console.log('All badges:', allBadges)
      return enrichBadgesFromJson(allBadges)
    })
    .then(function (allBadges) {
      console.log('Enriched badges:', allBadges.length);
      processBadges(allBadges, options)
    })
}
