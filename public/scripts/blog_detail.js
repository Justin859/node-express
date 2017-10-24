$(document).ready(function() {

    var callback = function(data) {
        $.ajax({
            url: '/event-blogs/vote',
            type: 'post',
            data: { id: data.id, up: data.upvoted }
        });
    };

    $('#comments-container').comments({
        postComment: function(commentJSON, sucess, error) {
            $.ajax({
                type: 'post',
                url: '/api/comments/',
                data: commentJSON,
                success: function(comment) {
                    success(comment)
                },
                error: error
            });
        },
        profilePictureURL: 'https://app.viima.com/static/media/user_profiles/user-icon.png',
        getComments: function(success, error) {
            $.ajax({
                type: 'get',
                url: '/api/79/comments/',
                success: function(commentsArray) {
                    success(commentsArray)
                },
                error: error
            });
        },
        upvoteComment: function(commentJSON, success, error) {
            var commentURL = '/api/comments/' + commentJSON.id;
            var upvotesURL = commentURL + '/upvotes/';
    
            $.ajax({
                type: 'post',
                url: upvotesURL + 7,
                data: commentJSON,
                success: function(comment) {
                    success(comment)
                },
                error: error
            });
        }
    });

    $("#share").jsSocials({
        url: window.location.href,
        shares: ["twitter", "facebook", "googleplus"]
    });

    $('#topic').upvote({callback: callback});
    $('#login-tool-tip').tooltip('enable');
});