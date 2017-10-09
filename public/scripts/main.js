$(document).ready(function(){     
    
        $('.menu-pick').click(function(e) {
            if ($('#navigation-side-bar').hasClass('nav-closed')) {
                $('nav').removeClass('nav-closed');
                $('nav').addClass('nav-open');
                $('.nav-button').removeClass('nav-button-closed')
                $('.nav-button').addClass('nav-button-open');
                $('body').addClass('stop-mobile-scroll')     
            } else {
                $('nav').removeClass("nav-open");
                $('nav').addClass("nav-closed");
                $('.nav-button').removeClass('nav-button-open')
                $('.nav-button').addClass('nav-button-closed');
                $('body').removeClass('stop-mobile-scroll')
            }
            e.preventDefault()
        });
    
        $(".container, .container-fluid, .cover-photo").click(function() {
            if($('#navigation-side-bar').hasClass('nav-open')) {
                $('nav').removeClass("nav-open");
                $('nav').addClass("nav-closed");
                $('.nav-button').removeClass('nav-button-open')
                $('.nav-button').addClass('nav-button-closed');
                $('body').removeClass('stop-mobile-scroll')
            }
        })
    
        var lastScrollTop = 0;
    
        $(window).scroll(function(event){
           var st = $(this).scrollTop();
           if (st > lastScrollTop){
               $('.nav-button').addClass('hide-button');
           } else {
               $('.nav-button').removeClass('hide-button');  
           }
           lastScrollTop = st;
        });
    
        var scrollToTop = 0;
        
        $(window).scroll(function(){
            var scr = $(window).scrollTop();
            if (scr > scrollToTop || scr < 500) {
                $('#myBtn').removeClass('btn-top-show');
                $('#myBtn').addClass('btn-top-hide');
            } else {
                $('#myBtn').addClass('btn-top-show');
                $('#myBtn').removeClass('btn-top-hide');
            }
            scrollToTop = scr;
        });
    
    });
    
    
    