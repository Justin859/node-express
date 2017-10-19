$(document).ready(function() {

    var callback = function(data) {
        $.ajax({
            url: '/event-blogs/vote',
            type: 'post',
            data: { id: data.id, up: data.upvoted }
        });
    };

    $('#topic').upvote({callback: callback});
    $('#login-tool-tip').tooltip('show')
});