<?php
  /* Template Part for: POST CARD */
  $argument_one = isset($args) && isset($args['argument-one']) ? $args['argument-one'] : null; 
  $argument_two = isset($args) && isset($args['argument-two']) ? $args['argument-two'] : null;
?>
<article class="card" data-href="<?php the_permalink(); ?>">	
  <div class="card__in">		
    <header class="card__header">
      <div class="ia-t-misc">
        <?php echo get_the_date('M d, Y'); ?>
      </div>
    </header>
    <div class="card__body">
      <h3 class="card__heading ia-t-heading">
        <a title="<?php _e('Blog article post', 'dev_theme'); ?> <?php echo get_the_title(); ?>" 
           href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
      </h3>
      <div class="card__content content-entry">
        <p class="ia-t-body-4"><?php echo shortText(get_the_excerpt(), 100); ?></p>
      </div>
    </div>
    <a href="<?php the_permalink(); ?>" class="card__more">
      <span class="ia-a11y"><?php _e('Read more', 'dev_theme'); ?></span>
      <span class="ia-control ia-control--white-arrow"></span>
    </a>
  </div>
  <div class="card__bg"></div>
</article>
