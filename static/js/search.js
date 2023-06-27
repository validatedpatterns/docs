// Based on  https://victoria.dev/blog/add-search-to-hugo-static-sites-with-lunr/
//

function displayResults (results, store) {
  const searchResults = document.getElementById('results')
  if (results.length) {
    let resultList = ''
    // Iterate and build result list elements
    for (const n in results) {
      const item = store[results[n].ref]
     // resultList += '<li><p><a href="' + item.url + '">' + item.title + '</a></p>'
     // resultList += '<p>' + item.content.substring(0, 150) + '...</p></li>'
     resultList += '<div class="pf-c-card" style="margin-bottom: 10px"><div class="pf-c-card__title"><h2><a href="'  + item.url + '">' + item.title + '</a></h2  ></div>'
     resultList += '<div class="pf-c-card__body"><div class="search-breadcrumb">' + item.breadcrumb + '</div><p>' + item.content.substring (0,150) + '...</p></div></div>'

    }
    let resultListLength = results.length;
    searchResults.innerHTML = '<div class="pf-l-stack pf-m-gutter"><div class="pf-l-stack__item pf-u-text-align-right pattern-count-style" style="margin-bottom: 16px">' + resultListLength + ' results found</div></div>' + '<div class="pf-l-stack__item">' + resultList + '</div>'
   
  } else {
    searchResults.innerHTML = '<div class="pf-c-card" style="margin-bottom: 10pc"><div class="pf-c-card__body"><p>No results found.</p></div></div>'
  }
}


// Get the query parameter(s)
const params = new URLSearchParams(window.location.search)
const query = params.get('query')

// Perform a search if there is a query
if (query) {
  // Retain the search input in the form when displaying results
  document.getElementById('search-input').setAttribute('value', query)

  const idx = lunr(function () {
    this.ref('id')
    this.field('title', {
      boost: 15
    })
    this.field('tags')
    this.field('content', {
      boost: 10
    })

    for (const key in window.store) {
      this.add({
        id: key,
        title: window.store[key].title,
        tags: window.store[key].category,
        content: window.store[key].content
      })
    }
  })

  // Perform the search
  const results = idx.search(query)
  // Update the list with results
  displayResults(results, window.store)
}