$(document).ready(function() {

    var callback = function(data) {
        $.ajax({
            url: '/event-blogs/vote',
            type: 'post',
            data: { id: data.id, up: data.upvoted }
        });
    };

    $("#share").jsSocials({
        url: window.location.href,
        shares: ["twitter", "facebook", "googleplus"]
    });

    $('#topic').upvote({callback: callback});
    $('#login-tool-tip').tooltip('enable');
});