class Filter {
  // Class for constructing the filter, which is based on the provided
  // filter_categories dictionary checked against options from the filters
  // that the user selects.

  constructor(filter_categories) {
    this.filter_categories = filter_categories;
    this.filter_values = this.get_filter_values();
    this.filter_types = this.get_filter_types();
  }

  get_filter_values() {
    // Return the options from the filters that have been filtered
    var filterValuesResult = new Object();
    for (const [category, terms] of Object.entries(this.filter_categories)) {
      for (item = 0; item < terms.filter_list.length; item++) {
        var checkboxId = category + ":" + cleanString(terms.filter_list[item].Name);
        var checkbox = document.getElementById(checkboxId);
        if (checkbox.checked) {
          if (filterValuesResult[category] == undefined) { filterValuesResult[category] = [] };
          filterValuesResult[category].push(terms.filter_list[item].LinkTitle);
        }
      }
    }
    return filterValuesResult;
  }

  get_filter_types() {
    // Return the operator selected from the filter
    var filterTypesResult = new Object();
    for (const [category, terms] of Object.entries(this.filter_categories)) {
      for (item = 0; item < terms.filter_types.length; item++) {
        var filterTypeID = category + "_button:" + terms.filter_types[item].toLowerCase();
        var filterTypeItem = document.getElementById(filterTypeID);
        if (filterTypeItem != null && filterTypeItem.classList.contains("pf-m-selected")) {
          filterTypesResult[category] = terms.filter_types[item].toLowerCase();
        }
      }
    }
    return filterTypesResult;
  }
}

class FilteredPatterns {
  // Class for filtered the patterns based on a Filter object. Also sorts the
  // patterns based on sort_value.

  constructor(patterns_filter, patterns, sort_value) {
    this.patterns_filter = patterns_filter;
    this.patterns = patterns;
    this.sort_value = sort_value;
    this.filter_patterns = this.get_filter_patterns();
  }

  get_filter_patterns() {
    // Create a filtered list of patterns
    var filteredPatterns = [];
    for (item = 0; item < this.patterns.length; item++) {
      var checksPassed = new Object();
      for (const [category, terms] of Object.entries(this.patterns_filter.filter_values)) {
        if (typeof(this.patterns[item].Params[category]) == "string") {
          checksPassed[category] = checkCategoryString(terms, this.patterns[item].Params[category])
        } else if (typeof(this.patterns[item].Params[category]) == "object" && this.patterns[item].Params[category] != null) {
          var patternTerms = this.patterns[item].Params[category].map(v => v.toLowerCase());
          var filterTerms = terms.map(v => v.toLowerCase());
          checksPassed[category] = checkCategoryObject(patternTerms, filterTerms, this.patterns_filter.filter_types[category]);
        };
      };
      var patternPassed = true;
      for (const [category, terms] of Object.entries(this.patterns_filter.filter_values)) {
        if (checksPassed[category] != true) {
          patternPassed = false;
        };
      };
      if (patternPassed == true) { filteredPatterns.push(this.patterns[item]); };
    };
    this.sort_filtered_patterns(filteredPatterns)
    return filteredPatterns
  }

  sort_filtered_patterns(filteredPatterns) {
    // Sort the filtered list of patterns
    if (this.sort_value.value == "atoz") {
      filteredPatterns.sort(sortAtoZ);
    } else if (this.sort_value.value == "ztoa") {
      filteredPatterns.sort(sortAtoZ);
      filteredPatterns.reverse();
    } else if (this.sort_value.value == "oldest") {
      filteredPatterns.sort(sortDate);
    } else if (this.sort_value.value == "newest") {
      filteredPatterns.sort(sortDate);
      filteredPatterns.reverse();
    };
  }
}

async function getData() {
  // Load the JSON file containing all patterns data
  const url = "/patterns/index.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

function cleanString(string) {
  // Provide a string that can be used as a HTML id i.e. no spaces.
  return string.replace(/ /g, "-")
}

function capitalizeFirstLetter(string) {
  // Capitalize the first letter of a string
  return string[0].toUpperCase() + string.slice(1);
}

function sortAtoZ(a, b){
  // Sort alphabetically
  const nameA = a.Name.toUpperCase()
  const nameB = b.Name.toUpperCase()
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

function sortDate(a, b){
  // Sort by date
  if (a.Params.date != undefined) {
    var dateA = new Date(a.Params.date)
  } else {
    // Set a default date if no date exists
    var dateA = new Date("2000-01-01T00:00:00Z");
  };
  if (b.Params.date != undefined) {
    var dateB = new Date(b.Params.date)
  } else {
    // Set a default date if no date exists
    var dateB = new Date("2000-01-01T00:00:00Z");
  };
  if (dateA < dateB) {
    return -1;
  }
  if (dateA > dateB) {
    return 1;
  }
  return 0;
}

function checkCategoryString(terms, category) {
  // If the category we're checking is a string type, that means it can have
  // only one value. Therefore you can only use an OR operator on the filter.
  var checksPassed = false;
  for (termId = 0; termId < terms.length; termId++) {
    if (terms[termId].toLowerCase() == category.toLowerCase()) {
      checksPassed = true;
    }
  }
  return checksPassed;
}

function checkCategoryObject(patternTerms, filterTerms, filter_type) {
  // If the category we're checking is a object type, that means it can have
  // more than one value. Therefore you can use either AND or OR on the filter.
  var checksPassed = false;
  if(filter_type == "and" && filterTerms.every(r => patternTerms.includes(r))) {
    checksPassed = true;
  } else if (filter_type == "or" && filterTerms.some(r => patternTerms.includes(r))) {
    checksPassed = true;
  };
  return checksPassed;
}

function renderSpinner() {
  // HTML for the loading spinner
  return '<div class="pf-l-bullseye">' +
    '<div class="pf-l-bullseye__item">' +
      '<svg class="pf-c-spinner" role="progressbar" viewBox="0 0 100 100" aria-label="Loading..." >' +
      '<circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none" />' +
      '</svg>' +
    '</div>' +
  '</div>';
}

function renderFilterItem(type, name, linkTitle) {
  // HTML for each checkbox item in the filters
  var filterItemHtml = '<label class="pf-c-check pf-c-select__menu-item" for="' + type + ':' + cleanString(name) + '">' +
  '<input class="pf-c-check__input" type="checkbox" id="' + type + ':' + cleanString(name) + '"' + 'onclick="filterSelection()" name="' + linkTitle + '"/>' +
  '<span class="pf-c-check__label wrappable">' + linkTitle + '</span>'+
  '</label>';
  return filterItemHtml;
}

function renderFilterButtons(filterButtonTypes, name) {
  // HTML for the AND / OR operator buttons
  if (filterButtonTypes.length > 1) {
    var filterButtonsHtml = '<div class="pf-c-toggle-group pf-m-compact">';
    var firstSelected = "";
    for (item = 0; item < filterButtonTypes.length; item++) {
      firstSelected = "";
      if (item == 0) { firstSelected = " pf-m-selected"; }
      filterButtonsHtml += '<div class="pf-c-toggle-group__item">' +
        '<button class="pf-c-toggle-group__button' + firstSelected + '" type="button" id="' + name + "_button:" + filterButtonTypes[item].toLowerCase() + '" onclick="changeFilterType(this.id)">' +
          '<span class="pf-c-toggle-group__text">' + filterButtonTypes[item] + '</span>' +
        '</button>' +
      '</div>'
    }
    filterButtonsHtml += '</div>'
    return filterButtonsHtml;
  }
  return "";
}

function renderFilter(elementId, filterType, filterData) {
  // HTML to render all filters
  const element = document.getElementById(elementId);
  for (item = 0; item < filterData.filter_list.length; item++) {
    element.innerHTML += renderFilterItem(filterType, filterData.filter_list[item].Name, filterData.filter_list[item].LinkTitle);
  };
  element.innerHTML += renderFilterButtons(filterData.filter_types, filterType);
}

function renderLabel(tier, tier_categories) {
  // HTML to render the pattern tier label
  if (tier != undefined) {
    var color= tier_categories.filter_list.find(item => item.Name === tier);
    var renderedLabelHtml = '<span class="pf-c-label pf-m-' + color +'">' +
      '<span class="pf-c-label__content">' +
        '<img src="/images/pattern-tier-' + tier + '.png" alt="' + capitalizeFirstLetter(tier) + '" width="16" height="16" class="custom-pattern-icon"/>' +
        capitalizeFirstLetter(tier) +
      '</span>' +
    '</span>';
    return renderedLabelHtml;
  } else {
    return "";
  };
}

function renderCard(pattern, tier_categories) {
  // HTML for each pattern card
  var renderCardHtml = '<div class="pf-l-gallery__item" style="display: grid;">' +
  '<div class="pf-c-card" style="text-align: left; --pf-c-card__title--FontSize: 1rem; --pf-c-card__body--FontSize: 0.95rem;">' +
    '<div class="pf-c-card__title">' +
      '<a href="' + pattern.Link +'">' +
        pattern.Name +
      '</a>' +
    '</div>' +
    '<div class="pf-c-card__body">' +
      pattern.Params.summary +
    '</div>' +
    '<div class="pf-c-card__footer">' +
      renderLabel(pattern.Params.tier, tier_categories) +
    '</div>' +
  '</div>' +
  '</div>';
  return renderCardHtml;
}

function renderFilteredCards(patterns, filter_categories) {
  // HTML to render a gallery of cards for filtered patterns

  // Remove the current pattern cards
  const element = document.getElementById("patternCards");
  element.innerHTML = "";

  // Display the spinner while we load the pattern cards
  const patternLoaderSpinner = document.getElementById("patternLoaderSpinner");
  patternLoaderSpinner.innerHTML = renderSpinner();

  // Initialize the filter
  const patternsFilter = new Filter(filter_categories);

  // Filter the patterns
  const sortValue = document.getElementById("select-pattern-sort");
  var filteredPatterns = new FilteredPatterns(patternsFilter, patterns, sortValue).filter_patterns;

  // Remove the spinner
  patternLoaderSpinner.innerHTML = "";

  // Render the filtered cards
  for (item = 0; item < filteredPatterns.length; item++) {
    const element = document.getElementById("patternCards");
    element.innerHTML += renderCard(filteredPatterns[item], filter_categories.tier);
  };

  // Display the number of patterns
  var totalPatternsCount = patterns.length
  var filteredPatternsCount = filteredPatterns.length
  const counter = document.getElementById("pattern-counter");
  counter.innerHTML = filteredPatternsCount + " of " + totalPatternsCount + " patterns displayed";
}

function filterSelection(filter) {
  // Filter the patterns
  const patternsData = getData()
  patternsData.then(output => {
    renderFilteredCards(output.patterns, output.filter_categories)
  });
}

function changeFilterType(id) {
  // Change Function to change the filter type when the user clicks an
  // AND / OR operator button

  var filterType = id.split(":");
  var filter_category = filterType[0].replace('_button','');
  const patternsData = getData();
  patternsData.then(output => {
    for (item = 0; item < output.filter_categories[filter_category].filter_types.length; item++) {
      var unselectId = filter_category + "_button:" + output.filter_categories[filter_category].filter_types[item].toLowerCase()
      const unselectButton = document.getElementById(unselectId);
      unselectButton.classList.remove("pf-m-selected");
    }
    const selectButton = document.getElementById(id);
    selectButton.classList.add("pf-m-selected");
    renderFilteredCards(output.patterns, output.filter_categories)
  });
}


// Initialize the filters and pattern cards when the page loads
const patternsData = getData()
patternsData.then(output => {
  renderFilter("TiersItems", "tier", output.filter_categories.tier);
  renderFilter("IndustriesItems", "industries", output.filter_categories.industries);
  renderFilter("RhProductsItems", "rh_products", output.filter_categories.rh_products);
  renderFilter("OtherProductsItems", "other_products", output.filter_categories.other_products);
  renderFilteredCards(output.patterns, output.filter_categories)
});
