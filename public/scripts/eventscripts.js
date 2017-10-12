$(document).ready(function(){
    
        var sticky = new Waypoint.Sticky({
            element: $('#weekend-heading')[0]
        })
    
        var sticky = new Waypoint.Sticky({
            element: $('#upcoming-heading')[0]
        })
    
        $('.sticky-wrapper').addClass('hidden-md-up');
    
          $('.grid').each(function() {
            if( !$.trim($(this).html()).length ) {
                $(this).parent().html('<div class="card" style="padding: 8px; margin: 50px;" align="center"><h1>No Events Yet.</h1></div>')
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
                
                    var waypoint = new Waypoint({
                        element: document.getElementById('weekend-events-heading'),
                        handler: function(direction) {
                            if(direction === 'down') {
                                $('#weekend-events-tag').removeClass('events-tag-closed');
                                $('#weekend-events-tag').addClass('events-tag-open');
                            } else {
                                $('#weekend-events-tag').addClass('events-tag-closed');
                                $('#weekend-events-tag').removeClass('events-tag-open');
                            }
                
                        }
                    })
                
                    var waypoint = new Waypoint({
                        element: document.getElementById('upcoming-events-heading'),
                        handler: function(direction) {
                            if(direction === 'down') {                    
                                $('#weekend-events-tag').addClass('events-tag-closed');
                                $('#upcoming-events-tag').removeClass('events-tag-closed');
                                $('#upcoming-events-tag').addClass('events-tag-open');
                            } else {
                                $('#weekend-events-tag').removeClass('events-tag-closed');                    
                                $('#weekend-events-tag').addClass('events-tag-open');
                                $('#upcoming-events-tag').addClass('events-tag-closed');                    
                                $('#upcoming-events-tag').removeClass('events-tag-open');                    
                            }
                
                        }
                    }) 
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
    });