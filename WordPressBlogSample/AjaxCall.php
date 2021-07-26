<?php
  /* Load Blog Posts */
  add_action('wp_ajax_load_blog_posts', 'wp_ajax_load_blog_posts');
  add_action('wp_ajax_nopriv_load_blog_posts', 'wp_ajax_load_blog_posts');

  function wp_ajax_load_blog_posts() {    
    $search = (isset($_POST['search'])) ? $_POST['search'] : '';
    $topics = (isset($_POST['category'])) ? $_POST['category'] : '';
    $page = (isset($_POST['page'])) ? $_POST['page'] : 1;
    $posts_per_page = (isset($_POST['posts_per_page'])) ? $_POST['posts_per_page'] : 12;
    $authored = (isset($_POST['authored'])) ? $_POST['authored'] : '';
    $tag = (isset($_POST['tag'])) ? $_POST['tag'] : '';

    // Prepare request query
    $feed_query = blog_posts_query($search, $page, $topics, $posts_per_page, $authored, $tag);

    // If request have results 
    if ($feed_query->have_posts()) {
      while ($feed_query->have_posts()) :
        $feed_query->the_post();

        // load template part with arguments
        $args = array(
          'agument_one' => true,
          'agument_two' => true
        );
        get_template_part( 'template-parts/cards/post-card', null, $args );
      endwhile;
    } else {
      // show not found message
      echo '<div class="no-results">'.__('No results found', 'dev_theme').'</div>';
    }

    wp_reset_query();
    wp_die();
  }

  /* Helper function for the post query request */
  function blog_posts_query($search, $page, $topics, $posts_per_page, $authored, $tag) {
    $feed_args = array(
      'posts_per_page' => $posts_per_page,
      'paged' => $page,
      'post_status' => 'publish',
      'post_type' => 'post',
      'orderby' => 'date',
      'sort' => 'ASC'
    );

    if ($topics) {
      // Add relation for the "topics" category
      $feed_args['tax_query'] = array(
        'relation' => 'OR'
      );

      if (!is_array($topics)) {
        $topics = explode(',', $topics);
      }      

      foreach ( $topics as $topic ) :
        array_push($feed_args['tax_query'],
          array( 
            'taxonomy' => 'category',
            'field' => 'slug',
            'terms' => $topic
          )
        );
      endforeach;
    }
    
    // Add search
    if ($search) {
      $feed_args['s'] = $search;
    }

    // Add author
    if ($authored) {
      $feed_args['author'] = $authored;
    }

    // Add tag
    if ($tag) {
      $feed_args['tag'] = $tag;
    }

    $feed_query = new WP_Query($feed_args);

    return $feed_query;
}
