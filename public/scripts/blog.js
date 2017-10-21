$(document).ready(function(){
    $('.grid').each(function() {
        if( !$.trim($(this).html()).length ) {
            $(this).parent().html('<div class="card" style="padding: 8px; margin: 50px;" align="center"><h1>No Event Blogs at the moment.</h1></div>')
            $('.loading').addClass('invisible');
         } else {
            var $grid = $('.grid').masonry({
                // options...
                itemSelector: '.grid-item',
                transitionDuration: 0,
            });
            // layout Masonry after each image loads
            $grid.imagesLoaded().progress(function() {
                // init Masonry
                $grid.masonry('layout');
                $('.card').removeClass('hide');
                $('.loading').addClass('invisible');
            
            });
          }
        })

    var delay = (function(){
        var timer = 0;
        return function(callback, ms){
          clearTimeout (timer);
          timer = setTimeout(callback, ms);
        };
      })();

    $(window).resize(function() {
        delay(function(){
          Waypoint.refreshAll()
        }, 500);
    });
}) 