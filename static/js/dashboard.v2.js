// ============================================
// Data Classes & Parsing
// ============================================

class Badge {

  constructor (base, key, date) {
    this.base = base
    this.key = key
    const fields = key.split('-')
    this.pattern = fields[0]
    this.platform = fields[1]
      if (fields[fields.length-2] == 'operator') {
          this.operator = fields[fields.length-5]
    } else {
        this.operator = 'N/A'
    }
    if (fields[2] != 'ci.json') {
	    this.version = fields[2]
    } else {
	    this.version = ''
    }
    this.date = date.substr(0, 10)
  }

  string () {
    return this.key
  }

  getURI () {
    return this.base + '/' + this.key
  }
}

// ============================================
// Helper Functions
// ============================================

function getJiraSearch (pattern) {
  return 'https://issues.redhat.com/issues/?jql=project%3D%22Validated%20Patterns%22%20and%20labels%20in%20(ci-fail)%20and%20component%3D' + jira_component(pattern) + '%20and%20status%20not%20in%20(Closed)'
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Still present in badge buckets but no longer in the CI matrix (omit from dashboard)
var CI_DASHBOARD_EXCLUDED_OCP_VERSIONS = ['4.19']

function excludeRetiredOcpVersionsFromDashboard (badges) {
  if (!badges || badges.length === 0) {
    return badges || []
  }
  return badges.filter(function (b) {
    return CI_DASHBOARD_EXCLUDED_OCP_VERSIONS.indexOf(b.version) === -1
  })
}

function filterBadges (badges, field, value) {
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

function jira_component (pattern) {
  if (pattern == 'aegitops') {
	    return 'ansible-edge'
  } else if (pattern == 'manuela') {
	    return 'industrial-edge'
  } else if (pattern == 'mcgitops') {
	    return 'multicloud-gitops'
    } else if (pattern == 'medicaldiag') {
	    return 'medical-diagnosis'
  }
  return pattern
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

function pattern_url (key) {
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

function stringForKey (key) {
  if (key == 'azr') {
    return 'Azure'
  }
  if (key == 'gcp') {
    return 'Google'
  }
  if (key == 'aws') {
    return 'Amazon'
  }
  if (key == 'aegitops') {
    return 'Ansible Edge'
  }
  if (key == 'devsecops') {
    return 'DevSecOps'
  }
  if (key == 'manuela') {
    return 'Industrial'
  }
  if (key == 'mcgitops') {
    return 'Core GitOps'
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

function getBadgeDate (xml) {
  parent = xml.parentNode
  for (j = 0; j < parent.childNodes.length; j++) {
    if (parent.childNodes[j].nodeName == 'LastModified') {
	    return parent.childNodes[j].childNodes[0].nodeValue
    }
  }
  return '2033-03-22T16:45:47.966Z'
}

function getUniqueValues (badges, field) {
  results = []

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

function patternSort (a, b) {
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

function patternVertSort (a, b) {
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

function toCamelCase (str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ''
    return index === 0 ? match.toLowerCase() : match.toUpperCase()
  })
}

function toTitleCase (str) {
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

function jsonSuccess() {
  if (this.status < 200 || this.status >= 300) {
    console.warn('getJSON HTTP', this.status, this.responseURL)
  }
  this.callback.apply(this, this.arguments)
}

function jsonError() {
  console.error(this.statusText);
}

function parseBadgeJsonResponseText (text) {
  if (text == null) return null
  var t = String(text).replace(/^\uFEFF/, '').trim()
  if (t.length === 0) return null
  var first = t.charCodeAt(0)
  if (first === 0x3C) return null // '<' — XML/HTML/S3 error bodies
  try {
    return JSON.parse(t)
  } catch (e) {
    return null
  }
}

function getJSON(url, callback, ...args) {
  const jsonRequest = new XMLHttpRequest();
  jsonRequest.callback = callback;
  jsonRequest.arguments = args;
  jsonRequest.onload = jsonSuccess;
  jsonRequest.onerror = jsonError;
  jsonRequest.open("GET", url, true);
  jsonRequest.send(null);
}

// ============================================
// Legacy Badge Rendering (for pattern page embeds)
// ============================================

function getLabel (field, json_obj) {
  if (field == 'pattern') {
    return stringForKey(json_obj.infraProvider) + ' ' + json_obj.openshiftVersion
  }
  if (field == 'platform') {
    return stringForKey(json_obj.patternName) + ' - ' + json_obj.openshiftVersion
  }
  if (field == 'version') {
    return stringForKey(json_obj.patternName) + ' : ' + stringForKey(json_obj.infraProvider)
  }
  return stringForKey(json_obj.patternName) + ' : ' + stringForKey(json_obj.infraProvider) + ' ' + json_obj.openshiftVersion
}

function rowTitle (field, value) {
  if (field === 'pattern') {
    return stringForKey(value)
  }
  if (field === 'platform') {
    return stringForKey(value)
  }
  return value
}

function renderSetButtons(sets){
    var currentURL = new URL(window.location.href)
    if (currentURL.searchParams.get('view') === 'classic') {
      ;['pattern', 'platform', 'version', 'date', 'sort'].forEach(function (k) {
        currentURL.searchParams.delete(k)
      })
      currentURL.searchParams.set('view', 'classic')
    }
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    var setList = {'GA': 'GA', 'early': 'Pre-release', 'all': 'All'}
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

function renderSingleBadge (key, field, linkType, badge_url) {
    var json_obj = parseBadgeJsonResponseText(this.responseText)
    if (json_obj == null) {
      var failedEl = document.getElementById(key + '-' + field)
      if (failedEl) {
        var fallbackLink = document.createElement('a')
        fallbackLink.href = badge_url
        fallbackLink.className = 'ci-label ci-label-load-error'
        fallbackLink.target = '_blank'
        fallbackLink.rel = 'noopener noreferrer'
        fallbackLink.textContent = 'Unavailable'
        fallbackLink.setAttribute('aria-label', 'Open badge URL in a new tab')
        failedEl.replaceWith(fallbackLink)
      }
      console.warn('Badge JSON parse failed:', badge_url)
      return
    }
    var branchLabel = json_obj.patternBranch
    var color = json_obj.color

    var envLabel = getLabel(field, json_obj)
    if (badge_url.endsWith("stable-badge.json") ) {
	var badgeClass = "ci-label-environment-stable";
    } else if (badge_url.endsWith("prerelease-badge.json") ) {
	var badgeClass = "ci-label-environment-prerelease";
    } else if (badge_url.endsWith("operator-badge.json") ) {
	var badgeClass = "ci-label-environment-prerelease";
	branchLabel = json_obj.triggerSource +" "+json_obj.triggerVersion;
    } else if (badge_url.endsWith("nightly-badge.json") ) {
	var badgeClass = "ci-label-environment-prerelease";
	branchLabel = "nightly ("+ json_obj.patternBranch+")";
    }

    if ( linkType == "internal") {
      envLink = json_obj.jenkinsURL
      branchLink = encodeURI(getJiraSearch(json_obj.patternName));
    } else {
      envLink = encodeURI(badge_url)
      branchLink = encodeURI(json_obj.patternRepo)
    }

    badgeText = '<span class="ci-label">'
    if (envLink != null) {
        badgeText += '<a href="' + envLink + '"><span class="' + badgeClass + '"><i class="ci-icon fas fa-fw fa-brands fa-git-alt" aria-hidden="true"></i>' + envLabel + '</span></a>'
    } else {
        badgeText += '<span class="' + badgeClass + '"><i class="ci-icon fas fa-fw fa-brands fa-git-alt" aria-hidden="true"></i>' + envLabel + '</span>'
    }
    if (branchLink != null) {
        badgeText += '<a href="' + branchLink + '"><span class="ci-label-branch-' + color + '">' + branchLabel + '</span></a></span>'
    } else {
        badgeText += '<span class="ci-label-branch-' + color + '">' + branchLabel + '</span>'
    }
    badgeText += '</span>'
    document.getElementById(key + '-' + field).outerHTML = badgeText
}

function renderBadgePlaceholder (key, field) {
    return '<span id="' + key + '-' + field + '"><svg class="pf-c-spinner pf-m-md" role="progressbar" viewBox="0 0 100 100" aria-label="Loading..."><circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none" /></svg></span>'
}

function renderBadges (badges, field, value, links) {
  if (field != null && value != null) {
      pBadges = filterBadges(badges, field, value)
  } else {
      pBadges = badges
  }
  badgeText = '<div class="pf-l-flex">'
  pBadges.forEach(b => {
    badgeText += renderBadgePlaceholder(b.string(), field)
    getJSON(b.getURI(), renderSingleBadge, b.string(), field, links,  b.getURI())
  })
  badgeText += '</div>'
  return badgeText
}

function legacyFilteredHref (field, rowValue) {
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

function createFilteredHorizontalTable (badges, field, value, titles, links) {
  tableText = "<dl class='pf-c-description-list' id='ci-" + field + "-result' style='margin-bottom: 20px;'><div class='pf-c-description-list__group'>"
  if (titles) {
    tableText += "<dt class='pf-c-description-list__term'><span class='pf-c-description-list__text'>" + toTitleCase('By ' + field) + '</div></dt>'
  }
  tableText += "<dd class='pf-c-description-list__description'><div class='pf-c-description-list__text'>"

  rows = getUniqueValues(badges, field)
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
    tableText += renderBadges(badges, field, r, links)
    tableText += '</div></dd></div>'
  })
  tableText += '</dl>'
  return tableText + '</div></dd></div></dl>'
}

function processBadgesLegacy (badges, options) {
  const filter_field = options.get('filter_field')
  const filter_value = options.get('filter_value')
  const links = options.get("links")

  var htmlText = ""
  if (options.get('show_dashboard_tabs') === true) {
    htmlText += renderTabs('classic')
  }
  htmlText += renderSetButtons(options.get('sets'))

  if (filter_field === 'date') {
    badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })
    if (filter_value != null && filter_value != "all") {
        htmlText += renderBadges(badges, filter_field, filter_value, links)
    } else if (filter_value == "all") {
        htmlText += createFilteredHorizontalTable(badges, filter_field, null, true, links)
    }
  } else if (filter_field != null) {
    if (filter_value != null && filter_value != "all") {
      badges = filterBadges(badges, filter_field, filter_value)
    }
    badges.sort(patternSort)
    if (filter_value != null && filter_value != "all") {
        htmlText += renderBadges(badges, filter_field, filter_value, links)
    } else if (filter_value == "all") {
        htmlText += createFilteredHorizontalTable(badges, filter_field, null, true, links)
    }
  } else {
    // Classic home: same long-scroll layout as pre-redesign CI page — all groupings at once
    badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })
    badges.sort(patternVertSort)
    htmlText += createFilteredHorizontalTable(badges, 'date', null, true, links)
    htmlText += createFilteredHorizontalTable(badges, 'pattern', null, true, links)
    htmlText += createFilteredHorizontalTable(badges, 'platform', null, true, links)
    htmlText += createFilteredHorizontalTable(badges, 'version', null, true, links)
    var setsVal = options.get('sets') || 'GA'
    if (String(setsVal).includes('all') || String(setsVal).includes('early')) {
      htmlText += createFilteredHorizontalTable(badges, 'operator', null, true, links)
    }
  }

  document.getElementById(options.get('target')).innerHTML = htmlText
}

// ============================================
// New Dashboard Rendering (for CI status page)
// ============================================

function statusLabel (color) {
  if (color === 'green') return 'Passed'
  if (color === 'yellow') return 'CI infrastructure failure'
  if (color === 'red') return 'CI test failure'
  return 'Unknown'
}

function platformDisplayName (platform) {
  var names = {
    'aws': 'AWS (us-east-1)',
    'azr': 'Azure',
    'gcp': 'Google Cloud',
    'nutanix': 'Nutanix',
    'intel': 'On-prem (Intel)'
  }
  return names[platform] || stringForKey(platform)
}

function platformIconSvg (platform) {
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

function timeAgo (dateStr) {
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

function sanitizeId (str) {
  return str.replace(/\./g, '_').replace(/[^a-zA-Z0-9_-]/g, '-')
}

function getLatestPerPatternPlatform (badges) {
  var seen = {}
  var result = []
  badges.forEach(function (b) {
    var compositeKey = b.pattern + '-' + b.platform
    if (!seen[compositeKey]) {
      seen[compositeKey] = true
      result.push(b)
    }
  })
  return result
}

function getCurrentTab () {
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

function buildTabUrl (paramKey) {
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

function buildPatternDetailHref (pattern) {
  var u = new URL(window.location.href)
  u.searchParams.delete('view')
  u.searchParams.set('pattern', pattern)
  var qs = u.searchParams.toString()
  return u.pathname + (qs ? '?' + qs : '')
}

function buildClassicTabUrl () {
  var u = new URL(window.location.href)
  ;['pattern', 'platform', 'version', 'date', 'sort'].forEach(function (k) {
    u.searchParams.delete(k)
  })
  u.searchParams.set('view', 'classic')
  var qs = u.searchParams.toString()
  return u.pathname + (qs ? '?' + qs : '')
}

function renderTabs (activeTab) {
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

function renderSortControl (currentSort) {
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

function renderTimeRangeControl (rangeKey) {
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

function renderDashboardFiltersRow (rangeKey, currentSort, showSort) {
  var html = '<div class="ci-dashboard-filters">'
  html += '<div class="ci-dashboard-filters-actions">'
  if (showSort) {
    html += renderSortControl(currentSort)
  }
  html += renderTimeRangeControl(rangeKey)
  html += '</div></div>'
  return html
}

function renderOverviewLegendRow (rangeKey) {
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

function renderDashboardTableHeader () {
  return '<table class="ci-table"><thead><tr>' +
    '<th>Status</th>' +
    '<th>Pattern</th>' +
    '<th>Platform</th>' +
    '<th>OpenShift Version</th>' +
    '<th>Time</th>' +
    '</tr></thead><tbody>'
}

function renderDashboardTableRow (badge) {
  var rowId = sanitizeId(badge.key)
  var patternName = stringForKey(badge.pattern)
  var platformName = platformDisplayName(badge.platform)
  var version = (badge.version && badge.version !== 'none' && badge.version !== '') ? 'OCP ' + badge.version : ''
  var time = timeAgo(badge.date)

  var html = '<tr>'
  html += '<td><div class="ci-status-cell" id="ci-status-' + rowId + '">'
  html += '<svg class="pf-c-spinner pf-m-sm" role="progressbar" viewBox="0 0 100 100" aria-label="Loading...">'
  html += '<circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none" /></svg>'
  html += '</div></td>'

  html += '<td><span class="ci-pattern-name">'
  html += '<a href="' + pattern_url(badge.pattern) + '">' + patternName + '</a></span>'
  html += '<span class="ci-pattern-branch" id="ci-branch-' + rowId + '"></span></td>'

  html += '<td><div class="ci-platform-cell">' + platformIconSvg(badge.platform) + ' ' + platformName + '</div></td>'

  html += '<td>' + version + '</td>'

  html += '<td><span class="ci-time">' + time + '</span></td>'
  html += '</tr>'
  return html
}

function updateRowStatus (badgeKey) {
  var json_obj = parseBadgeJsonResponseText(this.responseText)
  if (json_obj == null) {
    var rowIdFail = sanitizeId(badgeKey)
    var statusElFail = document.getElementById('ci-status-' + rowIdFail)
    if (statusElFail) {
      statusElFail.textContent = ''
      var dotEl = document.createElement('span')
      dotEl.className = 'ci-status-dot unavailable'
      statusElFail.appendChild(dotEl)
      var failUrl = typeof this.responseURL === 'string' && this.responseURL.length > 0 ? this.responseURL : ''
      if (failUrl) {
        var linkEl = document.createElement('a')
        linkEl.href = failUrl
        linkEl.className = 'ci-status-text unavailable ci-status-unavailable-link'
        linkEl.target = '_blank'
        linkEl.rel = 'noopener noreferrer'
        linkEl.textContent = 'Unavailable'
        linkEl.setAttribute('aria-label', 'Open badge URL in a new tab')
        statusElFail.appendChild(linkEl)
      } else {
        var spanEl = document.createElement('span')
        spanEl.className = 'ci-status-text unavailable'
        spanEl.textContent = 'Unavailable'
        statusElFail.appendChild(spanEl)
      }
    }
    console.warn('Row badge JSON parse failed:', badgeKey)
    return
  }
  var color = json_obj.color || 'green'
  var branch = json_obj.patternBranch || ''
  var rowId = sanitizeId(badgeKey)

  var statusEl = document.getElementById('ci-status-' + rowId)
  if (statusEl) {
    statusEl.innerHTML =
      '<span class="ci-status-dot ' + color + '"></span>' +
      '<span class="ci-status-text ' + color + '">' + statusLabel(color) + '</span>'
  }

  var branchEl = document.getElementById('ci-branch-' + rowId)
  if (branchEl && branch) {
    branchEl.textContent = '#' + branch
  }
}

function isProductionSite () {
  return window.location.hostname === 'validatedpatterns.io'
}

function sampleColorForKey (badgeKey) {
  var colors = ['green', 'green', 'green', 'green', 'green', 'green', 'yellow', 'red']
  var hash = 0
  for (var i = 0; i < badgeKey.length; i++) {
    hash = ((hash << 5) - hash) + badgeKey.charCodeAt(i)
    hash = hash & hash
  }
  return colors[Math.abs(hash) % colors.length]
}

function simulateSampleStatus (badgeKey) {
  var rowId = sanitizeId(badgeKey)
  var color = sampleColorForKey(badgeKey)
  var branch = 'main'
  var hash = 0
  for (var i = 0; i < badgeKey.length; i++) {
    hash = ((hash << 5) - hash) + badgeKey.charCodeAt(i)
    hash = hash & hash
  }

  setTimeout(function () {
    var statusEl = document.getElementById('ci-status-' + rowId)
    if (statusEl) {
      statusEl.innerHTML =
        '<span class="ci-status-dot ' + color + '"></span>' +
        '<span class="ci-status-text ' + color + '">' + statusLabel(color) + '</span>'
    }
    var branchEl = document.getElementById('ci-branch-' + rowId)
    if (branchEl) {
      branchEl.textContent = '#' + branch
    }
  }, 100 + Math.abs(hash) % 300)
}

function renderDashboardTableWithBadges (badges) {
  var html = renderDashboardTableHeader()
  var useSample = !isProductionSite()
  badges.forEach(function (b) {
    html += renderDashboardTableRow(b)
    if (useSample) {
      simulateSampleStatus(b.key)
    } else {
      getJSON(b.getURI(), updateRowStatus, b.key)
    }
  })
  html += '</tbody></table>'
  return html
}

function renderGroupedTables (badges, groupField) {
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

function groupBadgesByPattern (badges) {
  var groups = {}
  badges.forEach(function (b) {
    if (!groups[b.pattern]) {
      groups[b.pattern] = []
    }
    groups[b.pattern].push(b)
  })
  return groups
}

function getLatestBadgePerPlatform (badges) {
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

function filterRecentBadges (badges, months) {
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

function getTimeRangeFromParams (params) {
  var r = params.get('range')
  if (r === '6m' || r === '1y' || r === 'all') return r
  return '3m'
}

function monthsForTimeRange (rangeKey) {
  if (rangeKey === '6m') return 6
  if (rangeKey === '1y') return 12
  return 3
}

function applyTimeRangeToBadges (badges, rangeKey) {
  if (rangeKey === 'all') return badges.slice()
  return filterRecentBadges(badges, monthsForTimeRange(rangeKey))
}

function timeRangeLegendPhrase (rangeKey) {
  if (rangeKey === 'all') return 'all recorded tests in this view'
  if (rangeKey === '6m') return 'tests from the last 6 months'
  if (rangeKey === '1y') return 'tests from the last year'
  return 'tests from the last 3 months'
}

function getLatestBadgePerCombo (badges) {
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

function computeCardHealth (tracker) {
  if (tracker.loaded < tracker.total) return 'loading'
  var colors = Object.values(tracker.platforms)
  var hasRed = colors.indexOf('red') !== -1
  var hasYellow = colors.indexOf('yellow') !== -1
  var hasUnavailable = colors.indexOf('unavailable') !== -1

  if (hasRed) return 'has-failures'
  if (hasUnavailable) return 'unknown-status'
  if (!hasRed && hasYellow) return 'green-with-infra'
  return 'green'
}

function cardHealthLabel (tracker) {
  var colors = Object.values(tracker.platforms)
  var total = colors.length
  var greenCount = colors.filter(function (c) { return c === 'green' }).length
  var yellowCount = colors.filter(function (c) { return c === 'yellow' }).length
  var redCount = colors.filter(function (c) { return c === 'red' }).length
  var unavailableCount = colors.filter(function (c) { return c === 'unavailable' }).length

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
  return 'Loading...'
}

function cardHealthIcon (health) {
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

function updateCardUI (pattern) {
  var tracker = _cardTracker[pattern]
  if (!tracker) return
  var health = computeCardHealth(tracker)

  Object.keys(tracker.platforms).forEach(function (platform) {
    var dotEl = document.getElementById('ci-card-dot-' + sanitizeId(pattern) + '-' + sanitizeId(platform))
    if (dotEl) {
      dotEl.className = 'ci-card-platform-dot ' + tracker.platforms[platform]
    }
  })

  Object.keys(tracker.tests).forEach(function (comboKey) {
    var blockEl = document.getElementById('ci-card-block-' + sanitizeId(pattern) + '-' + comboKey)
    if (blockEl) {
      blockEl.className = 'ci-card-block ' + tracker.tests[comboKey]
    }
  })

  var summaryEl = document.getElementById('ci-card-summary-' + sanitizeId(pattern))
  if (summaryEl) {
    summaryEl.textContent = cardHealthLabel(tracker)
    summaryEl.className = 'ci-card-summary ' + health
  }

  var iconEl = document.getElementById('ci-card-icon-' + sanitizeId(pattern))
  if (iconEl) {
    iconEl.innerHTML = cardHealthIcon(health)
  }

  var cardEl = document.getElementById('ci-card-' + sanitizeId(pattern))
  if (cardEl) {
    cardEl.setAttribute('data-health', health)
  }

  updateOverallStats()
}

function updateOverallStats () {
  var statsEl = document.getElementById('ci-overall-stats')
  if (!statsEl) return

  var patterns = Object.keys(_cardTracker)
  var totalPatterns = patterns.length
  var passingCount = 0
  var infraCount = 0
  var failureCount = 0
  var loading = 0

  patterns.forEach(function (p) {
    var health = computeCardHealth(_cardTracker[p])
    if (health === 'green') passingCount++
    else if (health === 'green-with-infra') { passingCount++; infraCount++ }
    else if (health === 'has-failures') failureCount++
    else loading++
  })

  if (loading > 0) {
    statsEl.innerHTML = '<div class="ci-stats-bar"><div class="ci-stats-text"><span class="ci-stats-loading-text">Loading test results...</span></div></div>'
    return
  }

  var pct = Math.round((passingCount / totalPatterns) * 100)
  var html = '<div class="ci-stats-bar">'
  html += '<div class="ci-stats-text">'
  html += '<span class="ci-stats-number">' + passingCount + '</span> of <span class="ci-stats-number">' + totalPatterns + '</span> patterns passing'
  html += '</div>'
  html += '<div class="ci-stats-progress"><div class="ci-stats-progress-fill" style="width: ' + pct + '%"></div></div>'
  html += '</div>'
  statsEl.innerHTML = html
}

function cardStatusCallback (badgeKey, pattern, platform, comboKey) {
  var json_obj = parseBadgeJsonResponseText(this.responseText)
  var color = json_obj != null ? (json_obj.color || 'green') : 'unavailable'

  if (_cardTracker[pattern]) {
    _cardTracker[pattern].tests[comboKey] = color
    _cardTracker[pattern].loadedTests++

    // Platform dot uses latest badge only (first one seen, since badges sorted by date desc)
    if (!_cardTracker[pattern].platforms[platform]) {
      _cardTracker[pattern].platforms[platform] = color
      _cardTracker[pattern].loaded++
    }

    updateCardUI(pattern)
  }
}

function renderPatternCard (pattern, platformBadges, comboBadges) {
  var patternId = sanitizeId(pattern)
  var patternName = stringForKey(pattern)
  var latestDate = platformBadges.length > 0 ? platformBadges[0].date : ''

  var html = '<a href="' + buildPatternDetailHref(pattern) + '" class="ci-card" id="ci-card-' + patternId + '" data-pattern="' + pattern + '" data-health="loading">'

  html += '<div class="ci-card-header">'
  html += '<span class="ci-card-health" id="ci-card-icon-' + patternId + '">' + cardHealthIcon('loading') + '</span>'
  html += '<span class="ci-card-title">' + patternName + '</span>'
  html += '</div>'

  html += '<div class="ci-card-summary loading" id="ci-card-summary-' + patternId + '">Loading...</div>'

  html += '<div class="ci-card-platforms">'
  platformBadges.forEach(function (b) {
    html += '<span class="ci-card-platform" title="' + platformDisplayName(b.platform) + '">'
    html += '<span class="ci-card-platform-dot loading" id="ci-card-dot-' + patternId + '-' + sanitizeId(b.platform) + '"></span>'
    html += '<span class="ci-card-platform-label">' + stringForKey(b.platform) + '</span>'
    html += '</span>'
  })
  html += '</div>'

  html += '<div class="ci-card-blocks">'
  comboBadges.slice().reverse().forEach(function (b) {
    var comboId = sanitizeId(b.platform) + '-' + sanitizeId(b.version)
    html += '<span class="ci-card-block loading" id="ci-card-block-' + patternId + '-' + comboId + '" title="' + platformDisplayName(b.platform) + ' ' + b.version + '"></span>'
  })
  html += '</div>'

  html += '<div class="ci-card-footer">Last tested: ' + timeAgo(latestDate) + '</div>'

  html += '</a>'
  return html
}

function renderPatternCards (badges) {
  badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })

  var groups = groupBadgesByPattern(badges)
  var patternNames = Object.keys(groups).sort(function (a, b) {
    return stringForKey(a).localeCompare(stringForKey(b))
  })

  _cardTracker = {}

  var html = '<div id="ci-overall-stats"><div class="ci-stats-bar"><div class="ci-stats-text"><span class="ci-stats-loading-text">Loading test results...</span></div></div></div>'

  html += '<div class="ci-card-grid">'

  var useSample = !isProductionSite()

  patternNames.forEach(function (pattern) {
    var patternBadges = groups[pattern]
    var latestPerPlatform = getLatestBadgePerPlatform(patternBadges)
    var latestPerCombo = getLatestBadgePerCombo(patternBadges)

    _cardTracker[pattern] = {
      total: latestPerPlatform.length,
      loaded: 0,
      platforms: {},
      tests: {},
      totalTests: latestPerCombo.length,
      loadedTests: 0,
      recentComboKeys: {}
    }

    latestPerCombo.forEach(function (b) {
      _cardTracker[pattern].recentComboKeys[sanitizeId(b.platform) + '-' + sanitizeId(b.version)] = true
    })

    html += renderPatternCard(pattern, latestPerPlatform, latestPerCombo)

    latestPerCombo.forEach(function (b) {
      var comboKey = sanitizeId(b.platform) + '-' + sanitizeId(b.version)
      if (useSample) {
        var color = sampleColorForKey(b.key)
        _cardTracker[pattern].tests[comboKey] = color

        // Platform dot uses latest badge only (first one seen)
        if (!_cardTracker[pattern].platforms[b.platform]) {
          _cardTracker[pattern].platforms[b.platform] = color
        }
        _cardTracker[pattern].loadedTests++
        _cardTracker[pattern].loaded = latestPerPlatform.length
      } else {
        getJSON(b.getURI(), cardStatusCallback, b.key, pattern, b.platform, comboKey)
      }
    })
  })

  html += '</div>'

  if (useSample) {
    setTimeout(function () {
      patternNames.forEach(function (pattern) {
        updateCardUI(pattern)
      })
    }, 150)
  }

  html += '<a href="' + buildTabUrl('date') + '" class="ci-history-link">View complete history &rarr;</a>'

  return html
}

function renderStatusKey () {
  return '<div class="ci-status-key">' +
    '<span class="ci-status-key-item"><span class="ci-status-dot green"></span> <strong>Passed:</strong> Pattern deployed and tests succeeded</span>' +
    '<span class="ci-status-key-item"><span class="ci-status-dot yellow"></span> <strong>CI infrastructure failure:</strong> Cloud or pipeline problem, not a pattern issue</span>' +
    '<span class="ci-status-key-item"><span class="ci-status-dot red"></span> <strong>CI test failure:</strong> Pattern tests did not pass</span>' +
    '</div>'
}

function handleSort (value) {
  var url = new URL(window.location.href)
  url.searchParams.set('sort', value)
  window.location.href = url.toString()
}

function handleTimeRange (value) {
  var url = new URL(window.location.href)
  if (value === '3m') {
    url.searchParams.delete('range')
  } else {
    url.searchParams.set('range', value)
  }
  window.location.href = url.toString()
}

function syncCiSidebarNavWithUrl () {
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

function renderDashboard (badges, options) {
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

function getBadges (xmlText, bucket_url, badge_set) {
  parser = new DOMParser()
  var xmlDoc = parser.parseFromString(xmlText, 'application/xml')
  const errorNode = xmlDoc.querySelector('parsererror')
  if (errorNode) {
    return
  }

  var badges = []
  var entries = xmlDoc.getElementsByTagName('Key')

  l = entries.length

  for (i = 0; i < l; i++) {
    key = entries[i].childNodes[0].nodeValue
    if (badge_set == "GA" && key.endsWith("stable-badge.json") ) {
	    badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
	} else if (badge_set == "early" && (key.endsWith("prerelease-badge.json") || key.endsWith("nightly-badge.json") || key.endsWith("operator-badge.json")) ) {
	    badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
	} else if (badge_set == "all" &&  key.endsWith("-badge.json") ) {
	    badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
	} else {
	    console.log("Skipping: " + key);
	}
  }

  return badges
}

function processBadges (badges, options) {
  badges = excludeRetiredOcpVersionsFromDashboard(badges)
  if (options.get('disable_buttons') === true) {
    processBadgesLegacy(badges, options)
    return
  }

  renderDashboard(badges, options)
}

// ============================================
// Entry Points
// ============================================

function getBucketOptions (input) {
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

  buckets = []
  const bucket = input['bucket']
  if (bucket != null) {
    buckets.push(bucket)
  } else {
    buckets.push('https://storage.googleapis.com/vp-results')
    buckets.push('https://vp-ntnx-results.s3.amazonaws.com')
  }
  options.set('buckets', buckets)

  const fields = [ 'sets', 'target', 'filter_field', 'filter_value', 'links', 'disable_buttons' ]
  for (i = 0; i < fields.length; i++) {
    const key = fields[i]
    const value = input[key]
    if (value != null) {
	    options.set(fields[i], value)
    }
  }
  const sections = [ 'date', 'version', 'platform', 'pattern' ]

  filter_field = options.get('filter_field')

  if (options.get('filter_field') == null) {
    for (i = 0; i < sections.length; i++) {
	  if (urlParams.get(sections[i]) != null) {
        options.set('filter_field', sections[i])
        if (options.get('filter_value') == null && urlParams.get(sections[i]) != null) {
		  options.set('filter_value', urlParams.get(sections[i]))
        } else if (options.get('filter_value') == null && urlParams.get(sections[i]) != null) {
          options.set('filter_value', 'all')
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
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    const options = getBucketOptions(inputs);
    req.open('GET', bucket);
    req.onload = function () {
      if (req.status == 200) {
        const badges = getBadges(req.responseText, bucket, options.get('sets'))
        resolve(badges);
      } else {
        console.error('Error: ' + req.status);
        reject('Error: ' + req.status);
      }
    };
    req.send();
  });
}

function obtainBadgesFromSample (inputs) {
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

function obtainBadges (inputs) {
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
    .then((results) => {
      const allBadges = [];
      for (const badges of results) {
        console.log("Got "+badges.length+" badges")
        allBadges.push(...badges);
      }

      console.log('All badges:', allBadges);

      processBadges(allBadges, options)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
