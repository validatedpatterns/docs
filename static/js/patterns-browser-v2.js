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
  // Class for filtering the patterns based on a Filter object. Also sorts the
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

    // This is a special filter for the variant parent. If variant_of is set,
    // then filter by patterns that are variants of the parent.
    var variant_of = getVariantParent();
    if (variant_of != null) {
      var variantFilter = [];
      for (item = 0; item < filteredPatterns.length; item++) {
        if (variant_of == filteredPatterns[item].Params.variant_of) {
          variantFilter.push(filteredPatterns[item]);
        }
      }
      filteredPatterns = variantFilter
    }

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

function getParams() {
  // Get the params from the current URL
  const url = window.location.search;
  const urlParams = new URLSearchParams(url);
  var enabledParams = {'categories': {}, 'filters': {}};
  enabledParams.categories.tier = urlParams.getAll("tier");
  // Tier is always "and" since each pattern can only have one tier
  enabledParams.filters.tier = "and";
  enabledParams.categories.industries = urlParams.getAll("industries");
  enabledParams.filters.industries = urlParams.get("industries_filter");
  enabledParams.categories.rh_products = urlParams.getAll("rh_products");
  enabledParams.filters.rh_products = urlParams.get("rh_products_filter");
  enabledParams.categories.partners = urlParams.getAll("partners");
  enabledParams.filters.partners = urlParams.get("partners_filter");
  return enabledParams;
}

function getVariantParent() {
  // Gets the ID of the currently chosen variant parent. If the parent variant
  // hasn't been set, return null.
  const url = window.location.search;
  const urlParams = new URLSearchParams(url);
  if (urlParams.has("variant_of")) {
    return urlParams.get("variant_of");
  } else {
    return null;
  }
}

function containsVariants(current_pattern, patterns) {
  // Check an array of patterns (patterns) to see if a pattern (current_pattern)
  // is a parent. Returns the number of variants for the parent.
  var pattern_id = current_pattern.Link.split("/").filter(n => n)[1];
  var variant_count = 0;
  patterns.forEach(function (item, index) {
    if (pattern_id == item.Params.variant_of) {
      variant_count += 1;
    }
  });
  return variant_count;
}

function outputVariantCount(variant_count, pattern_id) {
  // Displays the number of variants on the parent pattern's card in the
  // bottom corner.
  var url = new URL(window.location.href);
  url.searchParams.set('variant_of', pattern_id)
  var result = "";
  if (variant_count == 1) {
    result = (`<div style='float:right'><a href='${url.toString()}'>1 variant available</a></div>`);
  } else if (variant_count > 1) {
    result = (`<div style='float:right'><a href='${url.toString()}'>${variant_count} variants available</a></div>`);
  }
  return result;
}

function renderVariantStatus(patterns) {
  // Render a notice on top of the patterns browser to indicate which variant
  // parent has been selected. Also provide a link back to the standard patterns
  // browser withou tthe variant set.
  var url = new URL(window.location.href);
  url.searchParams.delete('variant_of')
  const parent_variant = getVariantParent();
  if (parent_variant) {
    const parent_pattern = patterns.find((pattern) => pattern.Link.split("/").filter(n => n)[1] == parent_variant);
    const status = document.getElementById("variant-status");
    status.innerHTML = (`
      <p>Showing variant patterns for ${parent_pattern.Name}.</p>
      <p><a href="${url}">Click here to browse all patterns</a></p>`);
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
  return (`div class="pf-l-bullseye">
    <div class="pf-l-bullseye__item">
      <svg class="pf-c-spinner" role="progressbar" viewBox="0 0 100 100" aria-label="Loading..." >
      <circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none" />
      </svg>
    </div>
  </div>`);
}

function renderFilterItem(type, name, linkTitle, enabledItem) {
  // HTML for each checkbox item in the filters
  if (enabledItem) {
    checkedProp = "checked";
  } else {
    checkedProp = ""
  }
  var filterItemHtml = (`<label class="pf-c-check pf-c-select__menu-item" for="${type}:${cleanString(name)}">
  <input class="pf-c-check__input filter_checkbox" type="checkbox" id="${type}:${cleanString(name)}"
    onclick="filterSelection()" name="${linkTitle}" ${checkedProp} />
    <span class="pf-c-check__label wrappable">${linkTitle}</span>
  </label>`);
  return filterItemHtml;
}

function renderFilterButtons(filterButtonTypes, name, enabledFilters) {
  // HTML for the AND / OR operator buttons
  if (filterButtonTypes.length > 1) {
    var filterButtonsHtml = '<div class="pf-c-toggle-group pf-m-compact">';
    var firstSelected = "";
    for (item = 0; item < filterButtonTypes.length; item++) {
      selected = "";
      if (enabledFilters == filterButtonTypes[item].toLowerCase()) {
        selected = "pf-m-selected";
      };
      filterButtonsHtml += (`<div class="pf-c-toggle-group__item">
        <button class="pf-c-toggle-group__button ${selected}" type="button" id="${name}_button:${filterButtonTypes[item].toLowerCase()}" onclick="changeFilterType(this.id)">
          <span class="pf-c-toggle-group__text">${filterButtonTypes[item]}</span>
        </button>
      </div>`)
    }
    filterButtonsHtml += '</div>'
    return filterButtonsHtml;
  }
  return "";
}

function renderFilter(elementId, filterType, filterData, enabledParams, enabledFilters) {
  // HTML to render all filters
  const element = document.getElementById(elementId);
  for (item = 0; item < filterData.filter_list.length; item++) {
    if (enabledParams.includes(filterData.filter_list[item].Name)) {
      enabledItem = true;
    } else {
      enabledItem = false;
    }
    element.innerHTML += renderFilterItem(filterType, filterData.filter_list[item].Name, filterData.filter_list[item].LinkTitle, enabledItem);
  };
  if (!enabledFilters) {
    enabledFilters = "and";
  }
  element.innerHTML += renderFilterButtons(filterData.filter_types, filterType, enabledFilters);
}

function renderLabel(tier, tier_categories) {
  // HTML to render the pattern tier label
  if (tier != undefined) {
    var color= tier_categories.filter_list.find(item => item.Name === tier);
    var renderedLabelHtml = (`<span class="pf-c-label pf-m-${color}">
      <span class="pf-c-label__content">
        <img src="/images/pattern-tier-${tier}.png" alt="${capitalizeFirstLetter(tier)}" width="16" height="16" class="custom-pattern-icon"/>
        ${capitalizeFirstLetter(tier)}
      </span>
    </span>`);
    return renderedLabelHtml;
  } else {
    return "";
  };
}

function renderCard(pattern, tier_categories, variant_count) {
  // HTML for each pattern card
  var pattern_id = pattern.Link.split("/").filter(n => n)[1];
  var renderCardHtml = (`<div class="pf-l-gallery__item" style="display: grid;">
    <div class="pf-c-card" style="text-align: left; --pf-c-card__title--FontSize: 1rem; --pf-c-card__body--FontSize: 0.95rem;">
      <div class="pf-c-card__title">
        <a href="${pattern.Link}">${pattern.Name}</a>
      </div>
      <div class="pf-c-card__body">
        ${pattern.Params.summary}
      </div>
      <div class="pf-c-card__footer">
        ${renderLabel(pattern.Params.tier, tier_categories)} ${outputVariantCount(variant_count, pattern_id)}
      </div>
    </div>
  </div>`);
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
    var variant_count = containsVariants(filteredPatterns[item], patterns);
    const element = document.getElementById("patternCards");
    element.innerHTML += renderCard(filteredPatterns[item], filter_categories.tier, variant_count);
  };

  // Render the variant status
  renderVariantStatus(patterns);

  // Display the number of patterns
  var totalPatternsCount = patterns.length
  var filteredPatternsCount = filteredPatterns.length
  const counter = document.getElementById("pattern-counter");
  counter.innerHTML = filteredPatternsCount + " of " + totalPatternsCount + " patterns displayed";

  // Update the counters for checked filters
  updateFilterCounters();
}

function updateFilterCounters() {
  const elementIds = ["TiersItems", "IndustriesItems", "RhProductsItems", "PartnersItems"]
  for (const elementId of elementIds) {
    const element = document.getElementById(elementId);
    const elementCounter = document.getElementById(elementId + "Counter");
    var count = element.querySelectorAll('input[type="checkbox"]:checked').length;
    if (count > 0) {
      elementCounter.innerHTML = (`<span class="pf-c-badge pf-m-unread">${count}</span>`);
    } else {
      elementCounter.innerHTML = "";
    }
  }
}

function filterSelection(filter) {
  // Filter the patterns
  const patternsData = getData()
  patternsData.then(output => {
    updateURL(output.filter_categories)
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
    updateURL(output.filter_categories)
    renderFilteredCards(output.patterns, output.filter_categories)
  });
}

function updateURL(filter_categories){
  // Update the URL with the current params based on the checkboxes
  // Snce parent_variant is a special type of filter, it's not stored as a part
  // of the checbox filters. So if it is set, we need to store it so we can
  // reuse it once we regenerate the URL.
  const parent_variant = getVariantParent();
  var updatedUrl = new URL(window.location.pathname, window.location.origin);
  const patternsFilter = new Filter(filter_categories);
  var enabledParams = {};
  for (var key in patternsFilter.filter_values) {
    var values = patternsFilter.filter_values[key];
    for (const value of values) {
      var category = patternsFilter.filter_categories[key];
      var found = category.filter_list.find((element) => element.LinkTitle == value);
      updatedUrl.searchParams.append(key, found.Name);
    }
  }
  // Determine if we'r eusing an "add" or "or" filter.
  for (var type_key in patternsFilter.filter_types) {
    var type_value = patternsFilter.filter_types[type_key];
    if (type_value == "or") {
      updatedUrl.searchParams.append(type_key + "_filter", "or");
    }
  }
  // Add the parent_variant we stored earlier (if it was set).
  if (parent_variant) {
    updatedUrl.searchParams.append('variant_of', parent_variant);
  }
  // Update the URL.
  history.pushState({}, null, updatedUrl.href);
}

function clearFilters(){
  // Clear all the filters
  const patternsData = getData()
  var filter_checkboxes = document.getElementsByClassName("filter_checkbox");
  for (item = 0; item < filter_checkboxes.length; item++) {
    filter_checkboxes[item].checked = false;
  }
  patternsData.then(output => {
    updateURL(output.filter_categories);
    renderFilteredCards(output.patterns, output.filter_categories);
  });
}

// Initialize the filters and pattern cards when the page loads
const patternsData = getData();
const enabledParams = getParams();
patternsData.then(output => {
  renderFilter("TiersItems", "tier", output.filter_categories.tier, enabledParams.categories.tier, enabledParams.filters.tier);
  renderFilter("IndustriesItems", "industries", output.filter_categories.industries, enabledParams.categories.industries, enabledParams.filters.industries);
  renderFilter("RhProductsItems", "rh_products", output.filter_categories.rh_products, enabledParams.categories.rh_products, enabledParams.filters.rh_products);
  renderFilter("PartnersItems", "partners", output.filter_categories.partners, enabledParams.categories.partners, enabledParams.filters.partners);
  renderFilteredCards(output.patterns, output.filter_categories)
});
