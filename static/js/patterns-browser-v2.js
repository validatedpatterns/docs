async function getData() {
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

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function cleanString(string) {
  return string.replace(/ /g, "-")
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

function sortAtoZ(a, b){
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
  if (a.Params.date != undefined) {
    var dateA = new Date(a.Params.date)
  } else {
    var dateA = new Date("2000-01-01T00:00:00Z");
  };
  if (b.Params.date != undefined) {
    var dateB = new Date(b.Params.date)
  } else {
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

function renderSpinner() {
  return '<div class="pf-l-bullseye">' +
    '<div class="pf-l-bullseye__item">' +
      '<svg class="pf-c-spinner" role="progressbar" viewBox="0 0 100 100" aria-label="Loading..." >' +
      '<circle class="pf-c-spinner__path" cx="50" cy="50" r="45" fill="none" />' +
      '</svg>' +
    '</div>' +
  '</div>';
}

function renderFilterItem(type, name, linkTitle) {
  var filterItem = '<label class="pf-c-check pf-c-select__menu-item" for="' + type + ':' + cleanString(name) + '">' +
  '<input class="pf-c-check__input" type="checkbox" id="' + type + ':' + cleanString(name) + '"' + 'onclick="filterSelection()" name="' + linkTitle + '"/>' +
  '<span class="pf-c-check__label wrappable">' + linkTitle + '</span>'+
  '</label>';
  return filterItem;
}

function renderFilterButtons(filterButtonTypes, name) {
  if (filterButtonTypes.length > 1) {
    var filterButtons = '<div class="pf-c-toggle-group pf-m-compact">';
    var firstSelected = "";
    for (item = 0; item < filterButtonTypes.length; item++) {
      firstSelected = "";
      console.log(item)
      if (item == 0) { firstSelected = " pf-m-selected"; }
      filterButtons += '<div class="pf-c-toggle-group__item">' +
        '<button class="pf-c-toggle-group__button' + firstSelected + '" type="button" id="' + name + "_button:" + filterButtonTypes[item].toLowerCase() + '" onclick="changeFilterType(this.id)">' +
          '<span class="pf-c-toggle-group__text">' + filterButtonTypes[item] + '</span>' +
        '</button>' +
      '</div>'
    }
    filterButtons += '</div>'
    return filterButtons;
  }
  return "";
}

function renderFilter(elementId, filterType, filterData) {
  const element = document.getElementById(elementId);
  for (item = 0; item < filterData.filter_list.length; item++) {
    element.innerHTML += renderFilterItem(filterType, filterData.filter_list[item].Name, filterData.filter_list[item].LinkTitle);
  };
  element.innerHTML += renderFilterButtons(filterData.filter_types, filterType);
}

function renderLabel(tier) {
  if (tier != undefined) {
    if (tier == "maintained") { var color = "green" }
    else if (tier == "tested") { var color = "blue" }
    else if (tier == "sandbox") { var color = "orange" };
    var renderedLabel = '<span class="pf-c-label pf-m-' + color +'">' +
      '<span class="pf-c-label__content">' +
        '<img src="/images/pattern-tier-' + tier + '.png" alt="' + capitalizeFirstLetter(tier) + '" width="16" height="16" class="custom-pattern-icon"/>' +
        capitalizeFirstLetter(tier) +
      '</span>' +
    '</span>';
    return renderedLabel;
  } else {
    return "";
  };
}

function renderCard(pattern) {
  var renderCard = '<div class="pf-l-gallery__item" style="display: grid;">' +
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
      renderLabel(pattern.Params.tier) +
    '</div>' +
  '</div>' +
  '</div>';
  return renderCard;
}

function renderFilteredCards(patterns, filter_categories) {
  const element = document.getElementById("patternCards");
  const patternLoaderSpinner = document.getElementById("patternLoaderSpinner");
  element.innerHTML = "";
  patternLoaderSpinner.innerHTML = renderSpinner();
  var filter = new Object();
  var filteredPatterns = [];
  var filterType = new Object();
  var sortValue = document.getElementById("select-pattern-sort");
  for (const [category, terms] of Object.entries(filter_categories)) {
    for (item = 0; item < terms.filter_list.length; item++) {
      var checkboxId = category + ":" + cleanString(terms.filter_list[item].Name);
      var checkbox = document.getElementById(checkboxId);
      if (checkbox.checked) {
        if (filter[category] == undefined) { filter[category] = [] };
        filter[category].push(terms.filter_list[item].LinkTitle);
      };
    };
    for (item = 0; item < terms.filter_types.length; item++) {
      var filterTypeID = category + "_button:" + terms.filter_types[item].toLowerCase();
      var filterTypeItem = document.getElementById(filterTypeID);
      console.log(filterTypeItem)
      if (filterTypeItem != null && filterTypeItem.classList.contains("pf-m-selected")) {
        filterType[category] = terms.filter_types[item].toLowerCase();
      };
    };
  };
  for (item = 0; item < patterns.length; item++) {
    var checksPassed = new Object();
    for (const [category, terms] of Object.entries(filter)) {
      if (typeof(patterns[item].Params[category]) == "string") {
        for (termId = 0; termId < terms.length; termId++) {
          if (terms[termId].toLowerCase() == patterns[item].Params[category].toLowerCase()) {
            checksPassed[category] = true;
          }
        }
      } else if (typeof(patterns[item].Params[category]) == "object" && patterns[item].Params[category] != null) {
        var patternTerms = patterns[item].Params[category].map(v => v.toLowerCase());
        var filterTerms = terms.map(v => v.toLowerCase());
        if(filterType[category] == "and" && filterTerms.every(r => patternTerms.includes(r))) {
          checksPassed[category] = true;
        } else if (filterType[category] == "or" && filterTerms.some(r => patternTerms.includes(r))) {
          checksPassed[category] = true;
        };
      };
    };
    var patternPassed = true;
    for (const [category, terms] of Object.entries(filter)) {
      if (checksPassed[category] != true) {
        patternPassed = false;
      };
    };
    if (patternPassed == true) { filteredPatterns.push(patterns[item]); };
  };
  if (sortValue.value == "atoz") {
    filteredPatterns.sort(sortAtoZ);
  } else if (sortValue.value == "ztoa") {
    filteredPatterns.sort(sortAtoZ);
    filteredPatterns.reverse();
  } else if (sortValue.value == "oldest") {
    filteredPatterns.sort(sortDate);
  } else if (sortValue.value == "newest") {
    filteredPatterns.sort(sortDate);
    filteredPatterns.reverse();
  };
  patternLoaderSpinner.innerHTML = "";
  for (item = 0; item < filteredPatterns.length; item++) {
    const element = document.getElementById("patternCards");
    element.innerHTML += renderCard(filteredPatterns[item]);
  };
  var totalPatternsCount = patterns.length
  var filteredPatternsCount = filteredPatterns.length
  const counter = document.getElementById("pattern-counter");
  counter.innerHTML = filteredPatternsCount + " of " + totalPatternsCount + " patterns displayed";
}

function filterSelection(filter) {
  // Declaring variables
  const patternsData = getData()
  patternsData.then(output => {
    renderFilteredCards(output.patterns, output.filter_categories)
  });
}

function changeFilterType(id) {
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

const patternsData = getData()
patternsData.then(output => {
  renderFilter("TiersItems", "tier", output.filter_categories.tier);
  renderFilter("IndustriesItems", "industries", output.filter_categories.industries);
  renderFilter("RhProductsItems", "rh_products", output.filter_categories.rh_products);
  renderFilter("OtherProductsItems", "other_products", output.filter_categories.other_products);
  renderFilteredCards(output.patterns, output.filter_categories)
});
