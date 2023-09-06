class Badge {
    
    constructor(base, key, date) {  // Class constructor
	this.base = base;  // Class body/properties
	this.key = key;  // Class body/properties
	const fields = key.split("-");
	this.pattern = fields[0];
	this.platform = fields[1];
	if ( fields[2] != "ci.json" ) {
	    this.version = fields[2];
	} else {
	    this.version = "";
	}
	this.date = date.substr(5, 5);
    }

    string() {
        return this.key;
    }
    
    getLabel(field) {
        if(field == "pattern") {
	    return stringForKey(this.platform)+" "+this.version;
        }
        if(field == "platform") {
	    return stringForKey(this.pattern)+" - "+this.version;
        }
        if(field == "version") {
	    return stringForKey(this.pattern)+" : "+stringForKey(this.platform);
        }
        if(field == "date") {
	    return stringForKey(this.pattern)+" : "+stringForKey(this.platform)+" "+this.version;
        }
	return stringForKey(this.pattern)+" : "+ stringForKey(this.platform)+" "+this.version+" @ "+ this.date;
    }
	
    getURI() {
        return this.base+"/"+this.key;
    }

    getJenkinsURI() {
        return jenkins_base_url(this.pattern)+"/job/"+jenkins_job(this.pattern, this.platform, this.version)+"/lastBuild/";
    }

    getJiraSearch() {
        return "https://issues.redhat.com/issues/?jql=project%3D%22Validated%20Patterns%22%20and%20labels%20in%20(ci-fail)%20and%20component%3D"+jira_component(this.pattern)+"%20and%20status%20not%20in%20(Closed)";
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function filterBadges(badges, field, value) {
    if ( field === "date" ) {
	return badges.filter(badge => badge.date === value);
    }
    if ( field === "pattern" ) {
	return badges.filter(badge => badge.pattern === value);
    }
    if ( field === "platform" ) {
	return badges.filter(badge => badge.platform === value);
    }
    if ( field === "version" ) {
	return badges.filter(badge => badge.version === value);
    }
    return badges;
}

function rowTitle(field, value) {
    if ( field === "date" ) {
	return stringForKey(value);
    }
    if ( field === "pattern" ) {
	return stringForKey(value);
    }
    if ( field === "platform" ) {
	return stringForKey(value);
    }
    return value;
}

function get_shield_url(badge, label, links) {
    base = 'https://img.shields.io/endpoint?style=flat&logo=git&logoColor=white';
    // TODO: Replace the second link with the CI Job URL
    if ( links === "internal") {
	base = base +'&link='+ encodeURI(badge.getJenkinsURI()) + '&link=' + encodeURI(badge.getJiraSearch());
    } else {
	base = base +'&link='+ encodeURI(badge.getURI()) + '&link=' + encodeURI(repo_url(badge.pattern));
    }
    if ( label != "" ) {
        base = base +'&label='+ encodeURI(label);
    }
    return base + '&url=' + encodeURI(badge.getURI());
}

function get_key_url(color, label, links) {
    uri = 'https://validatedpatterns.io/'+color+'.json';
    base = 'https://img.shields.io/endpoint?style=flat&logo=git&logoColor=white';

    base = base +'&link='+ encodeURI("/") + '&link=' + encodeURI(uri);
    if ( label != "" ) {
	base = base +'&label='+ encodeURI(label);
    } else if ( links === "internal" ) {
        base = base +'&label='+ encodeURI("Job name with link");
    } else {
        base = base +'&label='+ encodeURI("Job name");
    }
    return base + '&url=' + encodeURI(uri);
}

function jira_component(pattern) {
    const dictionary = {
	aegitops: "ansible-edge",
	devsecops: "devsecops",
	manuela: "industrial-edge",
	mcgitops: "multicloud-gitops",
	medicaldiag: "medical-diagnosis"
    };

    if ( pattern in dictionary ) {
	return dictionary[pattern];
    }
    return pattern;
}

function jenkins_job(pattern, platform, version) {
    ciplatform = platform
    if ( platform == "azr" ) {
        ciplatform = "azure";
    }

    return pattern+"-"+ciplatform+"-ocp"+version+"-interop";
}

function jenkins_base_url(key) {
    const prefix = 'https://mps-jenkins-csb-mpqe.apps.ocp-c1.prod.psi.redhat.com/job/ValidatedPatterns';
    const dictionary = {
	aegitops: "AnsibleEdgeGitops",
	devsecops: "MulticlusterDevSecOps",
	manuela: "Manuela",
	mcgitops: "MultiCloudGitops",
	medicaldiag: "MedicalDiagnosis"
    };

    if ( key in dictionary ) {
	return prefix + '/job/' + dictionary[key];
    }
    return prefix;
}

function pattern_url(key) {
    const prefix = 'https://validatedpatterns.io/patterns/'
    const dictionary = {
	aegitops: "ansible-edge-gitops",
	devsecops: "devsecops",
	manuela: "industrial-edge",
	mcgitops: "multicloud-gitops",
	medicaldiag: "medical-diagnosis"
    };

    if ( key in dictionary ) {
	return prefix + dictionary[key] + '/';
    }
    return prefix + key + '/';
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

function stringForKey(key) {
    const dateRegex = /^(\d{2})-(\d{2})$/;
    const months = [
	"Jan",
	"Feb",
	"March",
	"April",
	"May",
	"June",
	"July",
	"Aug",
	"Sept",
	"Oct",
	"Nov",
	"Dec"
    ];

    const dictionary = {
	aegitops: "Ansible Edge",
	devsecops: "DevSecOps",
	manuela: "Industrial",
	mcgitops: "Core GitOps",
	medicaldiag: "Image Classification",
	azr: "Azure",
	gcp: "GCP",
	aws: "AWS"
    };

    if ( key in dictionary ) {
	return dictionary[key];
    }

    const matches = dateRegex.exec(key);
    if ( matches ) {
	monthIndex = parseInt(matches[1], 10) - 1;
	return months[monthIndex] + " "+ matches[2];
    }
    return key;
}

function getBadgeDate(xml) {
    parent = xml.parentNode;
    for (j = 0; j < parent.childNodes.length; j++) {
	if ( parent.childNodes[j].nodeName == "LastModified" ) {
	    return parent.childNodes[j].childNodes[0].nodeValue;
	}
    }
    return "2033-03-22T16:45:47.966Z";
}

function getUniqueValues(badges, field){
    results = [];
    badges.forEach(b => {
	if (field == 'date' && ! results.includes(b.date) ) {
	    results.push(b.date);
	} else if (field == 'platform' && ! results.includes(b.platform) ) {
	    results.push(b.platform);
	} else if (field == 'pattern' && ! results.includes(b.pattern) ) {
	    results.push(b.pattern);
	} else if (field == 'version' && b.version != "" && ! results.includes(b.version) ) {
	    results.push(b.version);
	}
    });

    if ( field === "pattern" ) {
	return results.sort(function(a, b){return -1 * a.localeCompare(b)});
    } else if ( field === "version" ) {
	return results.sort(function(a, b){return -1 * a.localeCompare(b)});
    } else if ( field === "date" ) {
	return results.sort(function(a, b){return -1 * a.localeCompare(b)});
    }
    
    return results.sort();
}

function patternSort(a, b){
    if ( a.pattern != b.pattern ) {
	return a.pattern.localeCompare(b.pattern);
    }
    if ( a.platform != b.platform ) {
	return a.platform.localeCompare(b.platform);
    }
    if ( a.version != b.version ) {
	return -1 * a.version.localeCompare(b.version);
    }
    return -1 * a.date.localeCompare(b.date)
}

function patternVertSort(a, b){
    if ( a.version != b.version ) {
	return -1 * a.version.localeCompare(b.version);
    }
    if ( a.pattern != b.pattern ) {
	return a.pattern.localeCompare(b.pattern);
    }
    if ( a.platform != b.platform ) {
	return a.platform.localeCompare(b.platform);
    }
    return -1 * a.date.localeCompare(b.date)
}

function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
	if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
	return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

function toTitleCase(str) {
    return str.replace(
	/\w\S*/g,
	function(txt) {
	    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}
    );
}      

function createKeyTable(rows, links) {
    //document.getElementById('data').innerHTML = 'Hello World!';

    tableText = "<div class='ci-key'>";
    tableText = tableText + "<h2>Key</h2>";
    tableText = tableText + "<table><tbody>";

    tableText = tableText + "<tr>";
    rows.forEach(r => {
	tableText = tableText + "<td class='ci-badge'><object data='" + get_key_url(r, "", links) + "' style='max-width: 100%;'>&nbsp;</object>&nbsp;</td>";
    });
    tableText = tableText + "</tr>";

    tableText = tableText + "</tbody></table></div>";
    return tableText;
}

function getContentPrefix() {
    prefix = "<td style='width:1400px'>"
    if ( false ) {
        prefix = prefix + "<table><tbody><tr>";
    } else {
	prefix = prefix + "  <div class='pf-l-grid'>";
	prefix = prefix + "    <div class='pf-l-grid__item pf-u-py-sm'>";
	prefix = prefix + "      <div class='pf-c-content' >";
	prefix = prefix + "        <div class='pf-l-gallery pf-m-gutter' style='--pf-l-gallery--GridTemplateColumns--min: 200px;'>";
    }
    return prefix;
}

function getContentSuffix() {
    prefix = ""
    if ( false ) {
        prefix = prefix + "</tr></tbody></table>";
    } else {
	prefix = prefix + "        </div>";
	prefix = prefix + "      </div>";
	prefix = prefix + "    </div>";
	prefix = prefix + "  </div>";
    }
    prefix = prefix + "</td>";
    return prefix;
}


function createFilteredHorizontalTable(badges, field, value, titles, links = "public", max = 20) {
    //document.getElementById('data').innerHTML = 'Hello World!';

    tableText = "<div style='ci-results' id='ci-"+field+"-result'>";
    if ( titles ) {
	tableText = tableText + "<h2>"+toTitleCase("By "+field)+"</h2>";
    }
    tableText = tableText + "<table id='ci-"+field+"-table'><tbody>";

    rows = getUniqueValues(badges, field);

    rows.forEach(r => {
	pBadges = filterBadges(badges, field, r);

	tableText = tableText + "<tr style='vertical-align:top'>";
	if ( value == null && field == "pattern" ) {
	    tableText = tableText + "<td class='ci-badge'><a href='" + pattern_url(r) + "'>" + rowTitle(field, r) + "</a></td>";
	} else if ( value == null ) {
	    tableText = tableText + "<td class='ci-badge'><a href='?" + field + "=" + r + "'>" + rowTitle(field, r) + "</a></td>";
	}

	let index = 0;
	max = 100;
        tableText = tableText + getContentPrefix();

	pBadges.forEach(b => {
	    if ( pBadges.length > max && index >= max ) {
		tableText = tableText + "</tr><tr>";
		index = 0;
	    }
	    
	    tableText = tableText + "            <div class='pf-l-gallery__item' style='display: grid;'>"
	    //tableText = tableText + "            <td class='ci-badge'>"
	    tableText = tableText + "<object data='" + get_shield_url(b, b.getLabel(field), links) + "' style='padding: 10; max-width: 100%;'>'</object>";
	    //tableText = tableText + "            </td>";
	    tableText = tableText + "            </div>"
	    index = index + 1;
	});
        tableText = tableText + getContentSuffix();
	tableText = tableText + "</tr>";
    });

    return tableText + "</tbody></table></div>";
}

function createFilteredVerticalTable(badges, field, value, titles, links = "public") {
    //document.getElementById('data').innerHTML = 'Hello World!';

    tableText = "<div style='ci-results' id='ci-"+field+"-result'>";
    if ( titles ) {
	tableText = tableText + "<h2>"+toTitleCase("By "+field)+"</h2>";
    }
    tableText = tableText + "<table id='ci-"+field+"-table'><tbody>";

    //style='vertical-align:top'
    rows = getUniqueValues(badges, field);

    fieldColumns = [];
    tableText = tableText + "<tr>";
    rows.forEach(r => {
	fieldColumns.push(filterBadges(badges, field, r));

	// https://stackoverflow.com/questions/43775947/dynamically-generate-table-from-json-array-in-javascript
	if ( value == null && field != "date" ) {
	    tableText = tableText + "<th><a href='?" + field + "=" + r + "'>" + rowTitle(field, r) + "</a></th>";
	}		  
    });
    tableText = tableText + "</tr>";

    any = true;
    row = 0;
    numColumns = fieldColumns.length;
    while (any) {
	any = false;
	tableText = tableText + "<tr>";
	for ( i = 0; i < numColumns; i++) {
	    blist = fieldColumns[i];
	    tableText = tableText + "<td class='ci-badge'>";
	    if ( blist.length > row ) {
		b = blist[row];
		//		      console.log(b);
		tableText = tableText + "<object data='" + get_shield_url(b, b.getLabel(field), links) + "' style='max-width: 100%;'>'</object>";
		any = true;
	    }
	    tableText = tableText + "</td>";
	}
	tableText = tableText + "</tr>";
	row = row + 1;
    }

    return tableText + "</tbody></table></div>";

}

function getBadges(xmlText, bucket_url, badge_set) {
    parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const errorNode = xmlDoc.querySelector("parsererror");
    if (errorNode) {
	// parsing failed
	console.log("failed: "+errorNode);
	return;
    }

    var badges = [];
    var entries = xmlDoc.getElementsByTagName("Key");
    // var entries = xmlDoc.childNodes.getElementsByTagName("Contents");
    // var entries = xmlDoc.childNodes;
    // 	  document.getElementById("data").innerHTML = errorNode.childNodes[1].nodeValue;

    l = entries.length;
    console.log("processing +entries[0].nodeName+ "+l);
    
    for (i = 0; i < l; i++) {
	//	  entries[i].childNodes[0].nodeValue
	key = entries[i].childNodes[0].nodeValue;
	
	if (badge_set == "GA" && key.endsWith("stable-badge.json") ) {
	    badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
	} else if (badge_set == "early" && key.endsWith("prerelease-badge.json") ) {
	    badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
	} else 	if (badge_set == "all" &&  key.endsWith("-badge.json") ) {
	    badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
	} else {
	    console.log("Skipping: " + key + " - "+badge_set);
	}
    }

    return badges;
}

function processBucketXML(text, options) {
    const filter_field = options.get("filter_field");
    const filter_value = options.get("filter_value");
    const links = options.get("links");
    badges = getBadges(text, options.get('bucket'), options.get('sets'));

    htmlText = "";
    
    if (filter_field != null ) {
	if ( filter_value != null) {
	    badges = filterBadges(badges, filter_field, filter_value);
	}
	badges.sort(patternSort);
	numElements = Math.min(Math.floor(window.innerWidth/140), 6);
	// if ( window.innerWidth < 1200 ) {
	//      No left or right sidebar    
	//	numElements = Math.floor(window.innerWidth/140);
	// } else if ( window.innerWidth < 1450 ) {
	//      No right sidebar    
	//	numElements = Math.floor((window.innerWidth-290)/140);
	// } else {
	//      Left and right sidebar, but fixed inner width
	//	numElements = Math.floor(832/140);
	// }
	htmlText = createFilteredHorizontalTable(badges, filter_field, filter_value, false, links, numElements);

    } else {
	htmlText = createKeyTable(["green", "yellow", "red"], links);
	
	badges.sort(function(a, b){return -1 * a.date.localeCompare(b.date)});
	htmlText = htmlText + createFilteredHorizontalTable(badges, "date", null, true, links, Math.floor((window.innerWidth-200)/200));
	
	badges.sort(patternVertSort);
	htmlText = htmlText + createFilteredHorizontalTable(badges, "pattern", null, true, links, Math.floor((window.innerWidth-200)/140));
	htmlText = htmlText + createFilteredVerticalTable(badges, "platform", null, true, links);
	htmlText = htmlText + createFilteredVerticalTable(badges, "version", null, true, links);
    }
    document.getElementById(options.get('target')).innerHTML = htmlText;
}

function getBucketOptions(input) {
    const options = new Map();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    options.set('sets', 'GA');
    options.set('links', 'public');
    options.set('target', 'dataset');
    options.set('bucket', 'https://storage.googleapis.com/hcp-results');

    // input.bucket , or input["bucket"]

    const fields = [ "sets", "bucket", "target", "filter_field", "filter_value", "links" ];
    for ( i=0; i < fields.length; i++) {
	const key = fields[i];
	var value = input[key];
	if ( value == null ) {
	    value = urlParams.get(fields[i]);
	}
	if ( value != null ) {
	    console.log(key, value);
	    options.set(fields[i], value);	
	}
    }
    
    const sections = [ "date", "version", "platform", "pattern" ];

    filter_field = options.get("filter_field");
    if ( filter_field == null ) {
	for ( i=0; i < sections.length; i++) {
	    if ( urlParams.get(sections[i]) != null ) {
		options.set("filter_field", sections[i]);
		if (options.get("filter_value") == null && urlParams.get(sections[i]) != null) {
		    options.set("filter_value", urlParams.get(sections[i]));
		}
	    }
	}
    }

    console.log(options);
    return options;
}

function obtainBadges(inputs) {
    let req = new XMLHttpRequest();
    const options = getBucketOptions(inputs);
    req.open('GET', options.get('bucket'));
    req.onload = function() {
	if (req.status == 200) {
	    processBucketXML(req.responseText, options);
	} else {
	    console.log("Error: " + req.status);
	}
    }
    req.send();
}
