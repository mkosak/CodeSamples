(function($) {
  $(document).ready(function() {
    const pageSelector = '.blog-page';
    const feedSelector = '#blog-feed';
    const tagsSelector = '#blog-tags';
    const morePostsSelector = '#more-posts';
    const showPostsLimit = 12;
    const showTagsLimit = 5;
    const inputSelector = '[data-search-blog-input]';
    const termSelSelector = '[data-select-term]';
    
    let runRequest = false;
    let tags = [];
    let page = 1;
    let loading = false;

    // run tags re-render
    $(tagsSelector).on('update', function() {
      let tagsLength = tags.length;

      if (runRequest) {
        load_blog_posts();
      }

      // check if its reach the design space limit
      if (tagsLength > showPostsLimit) {        
        $(tagsSelector).append(`<a href="#" class="ia-tag ia-tag--selected">...</a>`);
        
        return;
      } else {
        // firts clear all tags
        $(`${tagsSelector} a`).remove();

        // re-render tags based on the global array
        tags.forEach(function(item) {
          if (item.taxonomy === 'search') return;
          $(tagsSelector).append(`<a href="#" 
                                     class="ia-tag ia-tag--selected" 
                                     data-remove-term 
                                     data-taxonomy="${item.taxonomy}" 
                                     data-term="${item.term}">${item.term}</a>`);
        });
        
        // extend the container height if there are more than 'showTagsLimit' selected
        if (tagsLength > showTagsLimit) {
          $(tagsSelector).addClass('blog-page__tags--extended');
        } else {
          $(tagsSelector).removeClass('blog-page__tags--extended');
        }
      }
    });
    
    // if there are tags in $_GET
    if ($(`${tagsSelector} a`).length) {
      
      $(`${tagsSelector} a`).each(function() {
        let taxonomy = $(this).attr('data-taxonomy');
        let term = $(this).attr('data-term');

        // add tags to the global array
        tags.push({ taxonomy: taxonomy, term: term });

        // mark terms in the navigation on the left side
        markTagsNavi(taxonomy, term, true);

        // remove initial tags renderred from $_GET because they've been just replaced with the global array
        $(this).remove();
      });

      if (tags.length) {
        changeURL(tags);
        
        // trigger update to re-render tags
        $(tagsSelector).trigger('update');
      }
    }

    // if there are tags in navigation update them to the global array by click    
    $(pageSelector).on('click', termSelSelector, function(e) {
      e.preventDefault();

      let taxonomy = $(this).attr('data-taxonomy');
      let term = $(this).attr('data-term');

      updateTag(taxonomy, term, $(this));
    });

    // if there are tags in tags area remove them from the global array 
    $(pageSelector).on('click', '[data-remove-term]', function(e) {
      e.preventDefault();

      removeTag($(this));
    });

    // load more click handler
    $('#more-posts:not([disabled])').on('click', function(e) {
      if (loading) return;

      e.preventDefault();

      $(morePostsSelector).attr('disabled', true); // Disable the button, temp.
      $(morePostsSelector).text('loading...');

      page++;
      loading = true;

      load_blog_posts(true);
    });

    // prevent page from reload
    $('[data-search-form-blog]').on('submit', function(e) {
      e.preventDefault();

      const val = $(inputSelector).val();     

      if (val !== '' || val !== undefined) {
        updateTag('search', val);
      }
    });

    // reset search input
    $('[data-reset-search-form]').on('click', function(e) {
      e.preventDefault();
      
      $(inputSelector).val('');

      updateTag('search', '');
    });
    
    // search input update
    $(inputSelector).on('input', function(e) {      
      e.preventDefault();

      const searchTerm = $(inputSelector).val();

      if (searchTerm === '') {
        updateTag('search', '');
      }
    });
    
    /* Call request */
    function load_blog_posts(more) {
      const requestData = {
        action: 'load_blog_posts',
        'blog-page': page
      };

      // prepare request data
      tags.forEach((tag) => {
        if (!requestData[tag.taxonomy]) {
          requestData[tag.taxonomy] = [];
        }

        if (tag.taxonomy === 'search') {
          requestData[tag.taxonomy] = tag.term;
        } else {
          requestData[tag.taxonomy].push(tag.term);
        }
      });

      // perform request
      $.ajax({
        type: 'POST',
        url:  '/wp-admin/admin-ajax.php',
        data: requestData,
        beforeSend: function() {
          $(`${feedSelector} article`).addClass('ia-loading');
        },
        success: function(html) {
          if (html) {
            $('#no-results').addClass('ia-hidden');

            if (more) {
              $(feedSelector).append(html);
            } else {
              $(feedSelector).html('').html(html);

              $(morePostsSelector).attr('disabled', false);
              $(morePostsSelector).text('LOAD MORE');
            }
            
            // hide load more button if there are less than 'showPostsLimit' posts
            if ($(`${feedSelector} .card`).length < showPostsLimit) {
              $(morePostsSelector).hide();
            }
          } else {           
            $(morePostsSelector).hide();
            $(feedSelector).html('<div class="no-results">No results found</div>');
          }

          $(`${feedSelector} article`).removeClass('ia-loading');
          loading = false;
        },
        error: function() {
          $(`${feedSelector} article`).removeClass('ia-loading');
          $(morePostsSelector).hide();
        }
      });

      return false;
    }
    
    /* Helper functios */
    function updateTag(taxonomy, term, el) {
      if (!taxonomy && !term) return;      

      let tag = { taxonomy: taxonomy, term: term };
      
      // check terms in the navigation on the left side
      if (el && el.hasClass('term-selected')) {
        el.removeClass('term-selected');
      } else {
        el.addClass('term-selected');
      }

      if (taxonomy === 'search' && term === '') {
        tags = tags.filter((item) => !(item.taxonomy === 'search'));
      } else {
        // add/remove tag from the global array
        if (tags.some(item => tag.taxonomy === item.taxonomy && tag.term === item.term)) {
          tags = tags.filter((item) => !(item.taxonomy === tag.taxonomy && item.term === tag.term));
        } else {
          tags.push(tag);
        }
      }

      // run re-render tags
      update();
    }

    function removeTag(el) {
      let taxonomy = el.attr('data-taxonomy');
      let term = el.attr('data-term');
      let tag = { taxonomy: taxonomy, term: term };

      // remove tag from the global array
      if (tags.some(item => tag.taxonomy === item.taxonomy && tag.term === item.term)) {
        tags = tags.filter((item) => !(item.taxonomy === tag.taxonomy && item.term === tag.term));
      }

      // mark terms in the navigation on the left side
      markTagsNavi(taxonomy, term, false);

      // run re-render tags
      update();
    }

    function markTagsNavi(taxonomy, term, active) {
      $(termSelSelector).each(function() {
        let navTaxonomy = $(this).attr('data-taxonomy');
        let navTerm = $(this).attr('data-term');

        if (navTaxonomy === taxonomy && navTerm === term) {
          if (active) {
            $(this).removeClass('term-selected');
          } else {
            $(this).addClass('term-selected');
          }
        } 
      });
    }

    function update() {
      changeURL();

      // set request to true since its a manual input by user already
      runRequest = true;

      // trigger update to re-render tags
      $(tagsSelector).trigger('update');
    }

    function changeURL() {
      const url = new URL(window.location.protocol + '//' + window.location.host + window.location.pathname);
      const tagsGrouped = tags.reduce((a, c) => {
        if (!a.hasOwnProperty(c.taxonomy)) {
          a[c.taxonomy] = [c.term];
        } else {
          a[c.taxonomy].push(c.term);
        } 
        return a;
      }, {});
      let paramUrl = '';

      for (const param in tagsGrouped) {
        paramUrl += `${param}=${tagsGrouped[param].toString()}&`;
      }

      if (paramUrl !== '') {
        paramUrl = '?' + paramUrl.slice(0, paramUrl.length -1); // with removing '&' at the end
      
        window.history.pushState(null, null, paramUrl);
      } else {        
        window.history.pushState(null, null, url);
      }

      paramUrl = '';
    }
  });
})(jQuery); 
