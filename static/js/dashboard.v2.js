class Badge {

  constructor (base, key, date) {
    this.base = base
    this.key = key
    const fields = key.split('-')
    this.pattern = fields[0]
    this.platform = fields[1]
    if (fields[2] != 'ci.json') {
	    this.version = fields[2]
    } else {
	    this.version = ''
    }
    this.date = date.substr(5, 5)
  }

  string () {
    return this.key
  }

  getLabel (field) {
    if (field == 'pattern') {
	    return stringForKey(this.platform) + ' ' + this.version
    }
    if (field == 'platform') {
	    return stringForKey(this.pattern) + ' - ' + this.version
    }
    if (field == 'version') {
	    return stringForKey(this.pattern) + ' : ' + stringForKey(this.platform)
    }
    return stringForKey(this.pattern) + ' : ' + stringForKey(this.platform) + ' ' + this.version
  }

  getURI () {
    return this.base + '/' + this.key
  }

  getJenkinsURI () {
    return jenkins_base_url(this.pattern) + '/job/' + jenkins_job(this.pattern, this.platform, this.version) + '/lastBuild/'
  }

  getJiraSearch () {
    return 'https://issues.redhat.com/issues/?jql=project%3D%22Validated%20Patterns%22%20and%20labels%20in%20(ci-fail)%20and%20component%3D' + jira_component(this.pattern) + '%20and%20status%20not%20in%20(Closed)'
  }
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

function get_shield_url (badge, label) {
  base = 'https://img.shields.io/endpoint?style=flat&logo=git&logoColor=white'

  base = base + '&link=' + encodeURI(badge.getJenkinsURI()) + '&link=' + encodeURI(badge.getJiraSearch())
  if (label != '') {
    base = base + '&label=' + encodeURI(label)
  }
  return base + '&url=' + encodeURI(badge.getURI())
}

function get_key_url (color, label) {
  uri = 'https://validatedpatterns.io/' + color + '.json'
  base = 'https://img.shields.io/endpoint?style=flat&logo=git&logoColor=white'

  base = base + '&link=' + encodeURI('/') + '&link=' + encodeURI(uri)
  if (label != '') {
    base = base + '&label=' + encodeURI(label)
  }
  return base + '&url=' + encodeURI(uri)
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

function jenkins_job (pattern, platform, version) {
  ciplatform = platform
  if (platform == 'azr') {
    ciplatform = 'azure'
  }

  return pattern + '-' + ciplatform + '-ocp' + version + '-interop'
}

function jenkins_base_url (key) {
  base = 'https://mps-jenkins-csb-mpqe.apps.ocp-c1.prod.psi.redhat.com/job/ValidatedPatterns'
  if (key == 'aegitops') {
    return base + '/job/AnsibleEdgeGitops'
  }
  if (key == 'devsecops') {
    return base + '/job/MulticlusterDevSecOps'
  }
  if (key == 'manuela') {
    return base + '/job/Manuela'
  }
  if (key == 'mcgitops') {
    return base + '/job/MultiCloudGitops'
  }
  if (key == 'medicaldiag') {
    return base + '/job/MedicalDiagnosis'
  }
  return base
}

function pattern_url (key) {
  if (key == 'aegitops') {
    return '/patterns/ansible-edge-gitops/'
  }
  if (key == 'devsecops') {
    return '/patterns/devsecops/'
  }
  if (key == 'manuela') {
    return '/patterns/industrial-edge/'
  }
  if (key == 'mcgitops') {
    return '/patterns/multicloud-gitops/'
  }
  if (key == 'medicaldiag') {
    return '/patterns/medical-diagnosis/'
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
    return 'Image Classification'
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

function repo_url(key) {
    const prefix = 'https://github.com/hybrid-cloud-patterns/'
    const dictionary = {
	aegitops: "ansible-edge-gitops",
	devsecops: "multicluster-devsecops",
	manuela: "industrial-edge",
	mcgitops: "multicloud-gitops",
	medicaldiag: "medical-diagnosis"
    };

    if ( key in dictionary ) {
	return prefix + dictionary[key] + '/';
    }
    return prefix + key + '/';
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

function renderSingleBadge (key, field, envLabel, envLink, branchLink, badge_url) {
    var json_obj = JSON.parse(this.responseText)
    var branchLabel = json_obj.message
    var color = json_obj.color
    var nightlyLabel = ""
    if (badge_url.endsWith("stable-badge.json") ) {
	    var badgeClass = "ci-label-environment-stable";
	} else if (badge_url.endsWith("prerelease-badge.json") ) {
	    var badgeClass = "ci-label-environment-prerelease";
    } else if (badge_url.endsWith("operator-badge.json") ) {
	    var badgeClass = "ci-label-environment-prerelease";
    } else if (badge_url.endsWith("nightly-badge.json") ) {
	    var badgeClass = "ci-label-environment-prerelease";
        nightlyLabel = "(nightly build)"
	}

    if ( envLink == "internal") {
      envLink = json_obj.jenkinsURL
    }

    badgeText = '<span class="ci-label">'
    if (envLink != null) {
        badgeText += '<a href="' + envLink + '"><span class="' + badgeClass + '"><i class="ci-icon fas fa-fw fa-brands fa-git-alt" aria-hidden="true"></i>' + envLabel + ' ' + nightlyLabel + '</span></a>'
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
    if ( links == "internal") {
  	     envLink = "internal"
         branchLink = encodeURI(b.getJiraSearch());
    } else {
  	     envLink = encodeURI(b.getURI())
         branchLink = encodeURI(repo_url(b.pattern));
    }
    console.log(field)
    badgeText += renderBadgePlaceholder(b.string(), field)
    getJSON(b.getURI(), renderSingleBadge, b.string(), field, b.getLabel(field), envLink, branchLink,  b.getURI())
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

function createFilteredVerticalTable (badges, field, value, titles) {
  tableText = "<div style='ci-results' id='ci-" + field + "-result'>"
  if (titles) {
    tableText += '<h2>' + toTitleCase('By ' + field) + '</h2>'
  }
  tableText += "<table id='ci-" + field + "-table'><tbody>"

  rows = getUniqueValues(badges, field)

  fieldColumns = []
  tableText += '<tr>'
  rows.forEach(r => {
    fieldColumns.push(filterBadges(badges, field, r))

    if (value == null && field != 'date') {
	    tableText += "<th><a href='?" + field + '=' + r + "'>" + rowTitle(field, r) + '</a></th>'
    }
  })
  tableText += '</tr>'

  any = true
  row = 0
  numColumns = fieldColumns.length
  while (any) {
    any = false
    tableText += '<tr>'
    for (i = 0; i < numColumns; i++) {
	    blist = fieldColumns[i]
	    tableText += "<td class='ci-badge'>"
	    if (blist.length > row) {
      b = blist[row]

      tableText += "<object data='" + get_shield_url(b, b.getLabel(field)) + "' style='max-width: 100%;'>'</object>"
      any = true
	    }
	    tableText += '</td>'
    }
    tableText += '</tr>'
    row = row + 1
  }

  return tableText + '</tbody></table></div>'
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
