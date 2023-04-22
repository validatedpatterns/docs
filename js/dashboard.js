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
	return stringForKey(this.pattern)+" : "+ stringForKey(this.platform)+" "+this.version+" @ "+ this.date;
    }
	
    getURI() {
        return this.base+"/"+this.key;
    }

    getJenkinsURI() {
        return jenkins_base_url(this.pattern)+"/job/"+jenkins_job(this.pattern, this.platform, this.version)+"/lastBuild/";
    }

    getJiraSearch() {
        return "https://issues.redhat.com/issues/?jql=project%3D%22Validated%20Patterns%22%20and%20summary~CI%20and%20component%3D"+jira_component(this.pattern)+"%20and%20status%20not%20in%20(Closed)";
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function filterBadges(badges, field, value) {
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
    if ( field === "pattern" ) {
	return stringForKey(value);
    }
    if ( field === "platform" ) {
	return stringForKey(value);
    }
    return value;
}

function get_shield_url(badge, label) {
    base = 'https://img.shields.io/endpoint?style=flat&logo=git&logoColor=white';
    // TODO: Replace the second link with the CI Job URL
    base = base +'&link='+ encodeURI(badge.getJenkinsURI()) + '&link=' + encodeURI(badge.getJiraSearch());
    if ( label != "" ) {
        base = base +'&label='+ encodeURI(label);
    }
    return base + '&url=' + encodeURI(badge.getURI());
}

function get_key_url(color, label) {
    uri = 'https://hybrid-cloud-patterns.io/'+color+'.json';
    base = 'https://img.shields.io/endpoint?style=flat&logo=git&logoColor=white';
    // TODO: Replace the second link with the CI Job URL
    base = base +'&link='+ encodeURI("/") + '&link=' + encodeURI(uri);
    if ( label != "" ) {
        base = base +'&label='+ encodeURI(label);
    }
    return base + '&url=' + encodeURI(uri);
}

function print_shield(bucket, badge, tag) {
    shield_url = get_shield_url(bucket, badge, tag);
    //echo "<a href='bucket/badge' rel='nofollow'><img alt='tag' src='shield_url' style='max-width: 100%;'></a><br/>";
    return "<object data="+shield_url+" style='max-width: 100%;'></object><br/>";
}

function jira_component(pattern) {
	if ( pattern == "aegitops" ) {
	    return "ansible-edge";
        } else if ( pattern == "manuela" ) {
	    return "industrial-edge";
        } else if ( pattern == "mcgitops" ) {
	    return "multicloud-gitops";
        } else if ( pattern == "medicaldiag" ) {
	    return "medical-diagnosis";
        }
	return pattern;
}

function jenkins_job(pattern, platform, version) {
    ciplatform = platform
    if ( platform == "azr" ) {
        ciplatform = "azure";
    }

    // Work-around for CI expansion bug
    // if ( pattern == "aegitops" ) {
    //    return pattern+"-1.5-"+ciplatform+"-ocp"+version+"-interop";
    // }
    return pattern+"-"+ciplatform+"-ocp"+version+"-interop";
}

function jenkins_base_url(key) {
    base = 'https://mps-jenkins-csb-mpqe.apps.ocp-c1.prod.psi.redhat.com/job/ValidatedPatterns';
    if ( key == "aegitops" ) {
	return base+'/job/AnsibleEdgeGitops';
    }
    if ( key == "devsecops" ) {
	return base+'/job/MulticlusterDevSecOps';
    }
    if ( key == "manuela" ) {
	return base+'/job/Manuela';
    }
    if ( key == "mcgitops" ) {
	return base+'/job/MultiCloudGitops';
    }
    if ( key == "medicaldiag" ) {
	return base+'/job/MedicalDiagnosis';
    }
    return base;
}

function pattern_url(key) {
    if ( key == "aegitops" ) {
	return 'https://hybrid-cloud-patterns.io/patterns/ansible-edge-gitops/';
    }
    if ( key == "devsecops" ) {
	return 'https://hybrid-cloud-patterns.io/patterns/devsecops/';
    }
    if ( key == "manuela" ) {
	return 'https://hybrid-cloud-patterns.io/patterns/industrial-edge/';
    }
    if ( key == "mcgitops" ) {
	return 'https://hybrid-cloud-patterns.io/patterns/multicloud-gitops/';
    }
    if ( key == "medicaldiag" ) {
	return 'https://hybrid-cloud-patterns.io/patterns/medical-diagnosis/';
    }
    return 'https://hybrid-cloud-patterns.io/patterns/'+key+'/';
}

function stringForKey(key) {
    if ( key == "aegitops" ) {
        return "Ansible Edge";
    }
    if ( key == "devsecops" ) {
        return "DevSecOps";
    }
    if ( key == "manuela" ) {
        return "Industrial";
    }
    if ( key == "mcgitops" ) {
        return "Core";
    }
    if ( key == "medicaldiag" ) {
        return "Image Classification";
    }
    if ( key == "azr" ) {
        return "Azure";
    }
    if ( key == "gcp" ) {
        return "Google";
    }
    if ( key == "aws" ) {
        return "Amazon";
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
    if (field == 'date' ) {
	results.push('Entry');
	return results;
    }

    badges.forEach(b => {
	if (field == 'platform' && ! results.includes(b.platform) ) {
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

function createKeyTable(rows) {
    //document.getElementById('data').innerHTML = 'Hello World!';

    tableText = "<div class='ci-key'>";
    tableText = tableText + "<h2>Key</h2>";
    tableText = tableText + "<table><tbody>";

    tableText = tableText + "<tr>";
    rows.forEach(r => {
	tableText = tableText + "<td class='ci-badge'><object data='" + get_key_url(r, "") + "' style='max-width: 100%;'>&nbsp;</object>&nbsp;</td>";
    });
    tableText = tableText + "</tr>";

    tableText = tableText + "</tbody></table></div>";
    return tableText;
}

function createFilteredHorizontalTable(badges, field, value, titles, max = 20) {
    //document.getElementById('data').innerHTML = 'Hello World!';

    tableText = "<div style='ci-results'>";
    if ( titles ) {
	tableText = tableText + "<h2>"+toTitleCase("By "+field)+"</h2>";
    }
    tableText = tableText + "<table><tbody>";

    rows = getUniqueValues(badges, field);

    rows.forEach(r => {
	pBadges = filterBadges(badges, field, r);

	tableText = tableText + "<tr>";
	if ( value == null && field == "pattern" ) {
	    tableText = tableText + "<td class='ci-badge'><a href='" + pattern_url(r) + "'>" + rowTitle(field, r) + "</a></td><td class='ci-badge'>&nbsp;</td>";
	} else if ( value == null) {
	    tableText = tableText + "<td class='ci-badge'><a href='?" + field + "=" + r + "'>" + rowTitle(field, r) + "</a></td><td class='ci-badge'>&nbsp;</td>";
	}

	let index = 0;
	if ( pBadges.length >= max ) {
            tableText = tableText + "<td><table><tbody><tr>";
	}
	pBadges.forEach(b => {
	    index = index + 1;
	    if ( pBadges.length > max && index == max ) {
		tableText = tableText + "</tr><tr>";
		if ( value == null ) {
                    tableText = tableText + "<td class='ci-badge'>&nbsp;</td><td class='ci-badge'>&nbsp;</td>";
		}
		index = 0;
	    }
	    
	    tableText = tableText + "<td class='ci-badge'><object data='" + get_shield_url(b, b.getLabel(field)) + "' style='max-width: 100%;'>'</object></td>";
	});
	if ( pBadges.length >= max ) {
            tableText = tableText + "</tr></tbody></table></td>";
	}
	tableText = tableText + "</tr>";
    });

    return tableText + "</tbody></table></div>";
}

function createFilteredVerticalTable(badges, field, value, titles) {
    //document.getElementById('data').innerHTML = 'Hello World!';

    tableText = "<div style='ci-results'>";
    if ( titles ) {
	tableText = tableText + "<h2>"+toTitleCase("By "+field)+"</h2>";
    }
    tableText = tableText + "<table><tbody>";
    
    rows = getUniqueValues(badges, field);

    fieldColumns = [];
    tableText = tableText + "<tr>";
    rows.forEach(r => {
	fieldColumns.push(filterBadges(badges, field, r));

	// https://stackoverflow.com/questions/43775947/dynamically-generate-table-from-json-array-in-javascript
	if ( value == null ) {
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
		tableText = tableText + "<object data='" + get_shield_url(b, b.getLabel(field)) + "' style='max-width: 100%;'>'</object>";
		any = true;
	    }
	    tableText = tableText + "</td>";
	}
	tableText = tableText + "</tr>";
	row = row + 1;
    }

    return tableText + "</tbody></table></div>";

}

function getBadges(xmlText, bucket_url) {
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
	
	if ( key.endsWith("-badge.json") ) {
	    //		  console.log("Key["+i+"] : "+ key);
	    badges.push(new Badge(bucket_url, key, getBadgeDate(entries[i])));
	}
    }

    return badges;
    // console.log(badges);
}

function processBucketXML(text, options) {
    const filter_field = options.get("filter_field");
    const filter_value = options.get("filter_value");
    badges = getBadges(text, options.get('bucket'));

    htmlText = "";
    
    if ( filter_field === "date" ) {
	badges.sort(function(a, b){return -1 * a.date.localeCompare(b.date)});
	htmlText = createFilteredVerticalTable(badges, "date", null, false);

    } else if (filter_field != null ) {
	if ( filter_value != null) {
	    badges = filterBadges(badges, filter_field, filter_value);
	}
	badges.sort(patternSort);
	htmlText = createFilteredHorizontalTable(badges, filter_field, filter_value, false, 6);

    } else {
	htmlText = createKeyTable(["green", "yellow", "red"]);    
	
	htmlText = htmlText + "<table><tr style='vertical-align:top'><td>";    
	badges.sort(function(a, b){return -1 * a.date.localeCompare(b.date)});
	htmlText = htmlText + createFilteredVerticalTable(badges, "date", null, true);
	htmlText = htmlText + "</td><td>&nbsp;&nbsp;&nbsp;</td><td>";    
	
	badges.sort(patternVertSort);
	htmlText = htmlText + createFilteredHorizontalTable(badges, "pattern", null, true, 3);
	htmlText = htmlText + createFilteredVerticalTable(badges, "platform", null, true);
	htmlText = htmlText + createFilteredVerticalTable(badges, "version", null, true);
	htmlText = htmlText + "</td></tr></table>";    
    }
    document.getElementById(options.get('target')).innerHTML = htmlText;
}

function getBucketOptions(input) {
    const options = new Map();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    options.set('target', 'dataset');
    options.set('bucket', 'https://storage.googleapis.com/hcp-results');

    // input.bucket , or input["bucket"]

    const fields = [ "bucket", "target", "filter_field", "filter_value" ];
    for ( i=0; i < fields.length; i++) {
	const key = fields[i];
	const value = input[key];
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
