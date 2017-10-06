$(document).ready(function() {

    $("input[name=name]").on('focusin', function(e){
        $(e.target).addClass('focused');
    });

    $("input[name=name]").on('focusout', function(e){
        $(e.target).removeClass('focused');
    });

    $("input[name=email]").on('focusin', function(e){
        $(e.target).next('.form-text').removeClass('invisible');
        $(e.target).addClass('focused');
    });

    $("input[name=email]").on('focusout', function(e){
        $(e.target).next('.form-text').addClass('invisible');
        $(e.target).removeClass('focused');
    });

    $(document).on('focusin', 'textarea', function(e){
        $(e.target).next('.form-text').removeClass('invisible');
        $(e.target).addClass('focused');
    });

    $(document).on('focusout', 'textarea', function(e){
        $(e.target).next('.form-text').addClass('invisible');
        $(e.target).removeClass('focused');
    });

    $("input[name=email]").on('change focusout', function(e){
        if($(e.target).is(':invalid'))  {
            $('#emailHelp').removeClass('invisible');
        } else {
            $('#emailHelp').addClass('invisible');
        }
    });

    $("input[name=name]").on('change focusout', function(e){
        if($(e.target).is(':invalid'))  {
            $('#nameHelp').removeClass('invisible');
        } else {
            $('#nameHelp').addClass('invisible');
        }
    });

    $(document).on('change focusout', 'textarea', function(e){
        if($(e.target).is(':invalid'))  {
            $('#queryHelp').removeClass('invisible');
        } else {
            $('#queryHelp').addClass('invisible');
        }
    });

    $("form").submit(function() {
        document.getElementById("overlay").style.display = "block";
    });

    $(window).bind("pageshow", function(event) {
        $("#overlay").hide();
    });

    $('.close-button').click(function() {
        $('.modal-container').addClass('modal-closed');        
    })

    $('#myModal').modal('show')
});