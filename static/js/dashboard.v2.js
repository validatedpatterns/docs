class Badge {

  constructor (base, key, date) {
    this.base = base
    //this.base = '/ci/vp-results'
    //this.base = 'https://storage.googleapis.com/vp-results'
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

function getJiraSearch (pattern) {
  return 'https://issues.redhat.com/issues/?jql=project%3D%22Validated%20Patterns%22%20and%20labels%20in%20(ci-fail)%20and%20component%3D' + jira_component(pattern) + '%20and%20status%20not%20in%20(Closed)'
}

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

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

function rowTitle (field, value) {
  if (field === 'pattern') {
    return stringForKey(value)
  }
  if (field === 'platform') {
    return stringForKey(value)
  }
  return value
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

function pattern_url (key) {
  if (key == 'aegitops') {
    return '/patterns/ansible-edge-gitops/'
  }
  if (key == 'devsecops') {
    return '/patterns/devsecops/'
  }
  if (key == 'industrialedge') {
    return '/patterns/industrial-edge/'
  }
  if (key == 'mcgitops') {
    return '/patterns/multicloud-gitops/'
  }
  if (key == 'medicaldiag') {
    return '/patterns/medical-diagnosis/'
  }
  if (key == 'ragllm') {
    return '/patterns/rag-llm-gitops/'
  }
  if (key == 'openshiftai') {
    return '/patterns/openshift-ai/'
  }
  if (key == 'agof') {
    return '/patterns/ansible-gitops-framework/'
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

function renderSetButtons(sets){
    var currentURL = new URL(window.location.href)
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

function jsonSuccess() {
  this.callback.apply(this, this.arguments);
}

function jsonError() {
  console.error(this.statusText);
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

function renderSingleBadge (key, field, linkType, badge_url) {
    var json_obj = JSON.parse(this.responseText)
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
	  tableText += "<a href='?" + field + '=' + r + "'>" + rowTitle(field, r) + '</a>'
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
	//	  entries[i].childNodes[0].nodeValue
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
  const filter_field = options.get('filter_field')
  const filter_value = options.get('filter_value')
  const links = options.get("links");

  htmlText = ""
  if (options.get("disable_buttons") != true) {
      htmlText += renderSetButtons(options.get('sets'))
  }
  if (filter_field === 'date') {
    badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })
    if (filter_value != null && filter_value != "all") {
        htmlText += renderBadges(badges, filter_field, filter_value)
    } else if (filter_value == "all") {
        htmlText += createFilteredHorizontalTable(badges, filter_field, null, true, links)
    }
  } else if (filter_field != null) {
    if (filter_value != null && filter_value != "all") {
      badges = filterBadges(badges, filter_field, filter_value)
    }
    badges.sort(patternSort)
    numElements = Math.min(Math.floor(window.innerWidth / 140), 6)
    if (filter_value != null && filter_value != "all") {
        htmlText += renderBadges(badges, filter_field, filter_value)
    } else if (filter_value == "all") {
        htmlText += createFilteredHorizontalTable(badges, filter_field, null, true, links)
    }
  } else {
    badges.sort(function (a, b) { return -1 * a.date.localeCompare(b.date) })
    badges.sort(patternVertSort)

    htmlText += createFilteredHorizontalTable(badges, 'date', null, true, links)
    htmlText += createFilteredHorizontalTable(badges, 'pattern', null, true, links)
    htmlText += createFilteredHorizontalTable(badges, 'platform', null, true, links)
    htmlText += createFilteredHorizontalTable(badges, 'version', null, true, links)

    if ( options.get('sets').includes('all') || options.get('sets').includes('early'))  {
	htmlText += createFilteredHorizontalTable(badges, 'operator', null, true, links)
    }

  }
  document.getElementById(options.get('target')).innerHTML = htmlText
}

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
    //buckets.push('/ci/vp-results.xml')
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
  const sections = [ 'date', 'version', 'platform', 'pattern', 'operator' ]

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

function obtainBadges (inputs) {
  const options = getBucketOptions(inputs);
  const buckets = options.get('buckets')

  // Create an array to store promises for each bucket's badges
  const badgePromises = [];

  // Iterate through each bucket URL and fetch badges asynchronously
  for (const bucket of buckets) {
    badgePromises.push(fetchBucketBadges(bucket, inputs));
  }

  // Wait for all promises to resolve
  Promise.all(badgePromises)
    .then((results) => {
      // Process the badges from all buckets
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
