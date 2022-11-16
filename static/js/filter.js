function filterSelection(filter) {
    // Declaring variables
    var filterdivs = [];
    var primarytags;
    var tagids;
    var patterncount = 0;
    // Enable / disable the tag that was clicked
    var primarytag = document.getElementById(filter);
    if (primarytag) {
        if (primarytag.classList.contains("active-tag")) {
            primarytag.classList.add("pf-m-outline");
            primarytag.classList.remove("active-tag");
        } else {
            primarytag.classList.add("active-tag");
            primarytag.classList.remove("pf-m-outline");
        }
    }
    // Get all tags with the class "active-tag"
    primarytags = document.getElementsByClassName("active-tag");
    tagids = extractIds(primarytags);
    // Get all the pattern summary cards with the class "filterDiv"
    filterdivs = document.getElementsByClassName("filterDiv");
    // Run through each of the pattern summary cards
    Array.prototype.forEach.call(filterdivs, function (div) {
        // Hide the card
        div.style.display = "none";
        // If the card contains all the tags set to "active-tag",
        // show the card. Otherwise, the card remains hidden.
        // If no "active-tags" are set, show everything.
        if (tagids.every((elem) => getAttrs(div).includes(elem)) || tagids.length === 0) {
            div.style.display = "grid";
            // Increase the pattern count
            patterncount++;
        }
    });
    // Set the pattern count in the HTML
    document.getElementById("pattern-count").textContent = patterncount;
}

// Function to extract the ids only from the array of active-tag elements
function extractIds(elems) {
    const ids = [];
    Array.prototype.forEach.call(elems, function (elem) {
        ids.push(elem.id);
    });
    return ids;
}

// Function to return an array of tag data from the pattern summary cards
function getAttrs(elem) {
    return elem.getAttribute("tag-data").split(" ");
}