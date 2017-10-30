$(document).ready(function() {

    var callback = function(data) {
        $.ajax({
            url: '/event-blogs/vote',
            type: 'post',
            data: { id: data.id, up: data.upvoted }
        });
    };

    $('#comments-container').comments({
        postComment: function(commentJSON, success, error) {
            $.ajax({
                type: 'post',
                url: '/api/comments/',
                data: {parent: commentJSON.parent,
                       created: commentJSON.created,
                       creator: commentJSON.creator,
                       content: commentJSON.content,
                       fullname: commentJSON.fullname,
                       blog_id: document.getElementById('blogId').innerHTML},
                success: function(comment) {
                    
                    $.get('/api/' + document.getElementById('blogId').innerHTML + '/comments/', function(data) {
                        $.each(data, function(i, item) {
                            if (data[i].created == commentJSON.created) {
                                newData = {
                                    id : data[i].id,
                                    parent: commentJSON.parent,
                                    created: commentJSON.created,
                                    creator: commentJSON.creator,
                                    content: commentJSON.content,
                                    fullname: commentJSON.fullname,
                                    created_by_current_user: commentJSON.created_by_current_user,
                                    upvote_count: 0,
                                    blog_id: document.getElementById('blogId').innerHTML
                                }
                                success(newData)
                            }
                        });
                    });
                },
                error: error
            });
        },
        refresh: function() {
            $('#comments-container').addClass('rendered');
        },
        profilePictureURL: 'https://app.viima.com/static/media/user_profiles/user-icon.png',
        getComments: function(success, error) {
            $.ajax({
                type: 'get',
                url: '/api/'+ document.getElementById('blogId').innerHTML +'/comments/',
                success: function(commentsArray) {
                    success(commentsArray)
                },
                error: error
            });
        },
        upvoteComment: function(commentJSON, success, error) {
                
            $.ajax({
                type: 'post',
                url: '/api/comments/upvotes',
                data: commentJSON,
                success: function(comment) {
                    success(commentJSON)
                },
                error: error
            });
        },
        deleteComment: function(commentJSON, success, error) {
            $.ajax({
                type: 'post',
                url: '/api/comments/delete',
                data: commentJSON,
                success: success,
                error: error
            });
        },
        putComment: function(commentJSON, success, error) {
            $.ajax({
                type: 'post',
                url: '/api/comments/edit/',
                data: commentJSON,
                success: function(comment) {
                    success(commentJSON)
                },
                error: error
            });
        }
    });

    $('#unauthenticated-comments-container').comments({
        readOnly: true,
        getComments: function(success, error) {
            $.ajax({
                type: 'get',
                url: '/api/'+ document.getElementById('blogId').innerHTML +'/comments/',
                success: function(commentsArray) {
                    success(commentsArray)
                },
                error: error
            });
        }
    })

    $("#share").jsSocials({
        url: window.location.href,
        shares: ["twitter", "facebook", "googleplus"]
    });

    $('#topic').upvote({callback: callback});
    $('#login-upvote-tool-tip').tooltip('show');
    $('.login-comment-tool-tip').tooltip('show');
});