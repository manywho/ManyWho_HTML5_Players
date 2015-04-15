/*!

Copyright 2013 Manywho, Inc.

Licensed under the Manywho License, Version 1.0 (the "License"); you may not use this
file except in compliance with the License.

You may obtain a copy of the License at: http://manywho.com/sharedsource

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied. See the License for the specific language governing
permissions and limitations under the License.

*/

(function ($) {
    // Some useful constants to help manage the posts
    var POST_COLOR = '#ffffff';
    var COMMENT_COLOR = '#d9edf7';
    var NEW_POST_COLOR = '#dff0d8';
    var NEW_COMMENT_COLOR = '#dff0d8';

    // Array of uploaded files for a particular post
    var uploadedFiles = new Array();

    // The user info for the logged in user
    var myData = null;

    // Current options assigned to this plugin
    var currentOptions;

    // Array of mentioned users in a particular post
    var mentionedUsers = new Array();

    // Variable holding the share js state for the last post information
    var $shareJsState;

    // Helper method to see if an array contains a particular object
    //
    function contains(obj, a) {
        if (a != undefined) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] === obj) {
                    return true;
                }
            }
        }

        return false;
    };

    // Helper method for removing items from an array
    //
    var removeItem = function (array, item) {
        for (var i in array) {
            if (array[i] == item) {
                array.splice(i, 1);
                break;
            }
        }
    };

    // This method is called after a file has been successfully uploaded
    //
    var fileUploaded = function (file) {
        // Put the file into the local files array
        uploadedFiles.push(file);

        // If we have some files to upload, enable the share button for a file post
        if (uploadedFiles.length == 0) {
            $('#' + currentOptions.domId + '-new-file-button').removeAttr('disabled');
        }
    };

    // Deletes the file from the local array
    //
    var fileDeleted = function (file) {
        // Remove the file from our array of uploaded files
        removeItem(uploadedFiles, file);

        // Check to see if the array of files is empty, if so, disable the file post button
        if (uploadedFiles.length == 0) {
            $('#' + currentOptions.domId + '-new-file-button').prop('disabled', true);
        }
    };

    // Resets the file upload post area back to default
    //
    var resetFileUploader = function () {
        // Reset the local array of uploaded files
        uploadedFiles = new Array();

        // Clean up the UI and reset the file upload options (TODO: not sure why this is needed!)
        $('#' + currentOptions.domId + '-fileupload ul.template-download').remove();
        $('#' + currentOptions.domId + '-fileupload').fileupload('option', 'maxNumberOfFiles', 1);

        // Blank and re-enable the text area for the file post
        $('#' + currentOptions.domId + '-new-file-text').val('');
        $('#' + currentOptions.domId + '-new-file-text').prop('disabled', false);

        // Remove the file information in the uploader area
        $('#manywho-social-uploadedfiles').html('');
    };

    // Sends the file post over to the social network
    //
    var sendFile = function (text, users) {
        var previouslyUploadedFiles = null;
        var previouslyUploadedFile = null;

        $('.manywho-social-file').each(function (index, element) {
            if (previouslyUploadedFiles == null) {
                previouslyUploadedFiles = new Array();
            }

            // Create a new file object to pass back to the API
            previouslyUploadedFile = new Object();
            previouslyUploadedFile.id = $(this).attr('id');
            previouslyUploadedFile.name = $(this).attr('data-name');
            previouslyUploadedFile.type = $(this).attr('data-type');

            // Grab the id from the page element, that will be the id of the file in the system
            previouslyUploadedFiles[previouslyUploadedFiles.length] = previouslyUploadedFile;
        });

        ManyWhoSocial.postNewMessage('SocialNetworkPlugin.sendFile',
                                     currentOptions.stateId,
                                     currentOptions.streamId,
                                     { senderId: myData.id, messageText: text, mentionedWhos: users, uploadedFiles: previouslyUploadedFiles },
                                     null,
                                     function (data, status, xhr) {
                                         // Create the post for this file
                                         createPost(currentOptions.domId + '-messages', data, true, true);

                                         // Reset the file uploader so we're back to a clean state
                                         resetFileUploader();
                                     },
                                     null);
    };

    // Removes a post from chatter and from the UI
    //
    var removePost = function (messageId) {
        ManyWhoSocial.postNewMessage('SocialNetworkPlugin.removePost',
                                     currentOptions.stateId,
                                     currentOptions.streamId,
                                     messageId,
                                     null,
                                     function (data, status, xhr) {
                                         $('#' + currentOptions.domId + '-' + messageId + '-wrapper').remove();
                                     },
                                     null);
    };

    // Sets up the following button with the correct status for this user
    //
    var setFollowingInfo = function (following) {
        var followHtml = '<i class="icon-plus-sign icon-white"></i> Follow';
        var followingHtml = '<i class="icon-minus-sign icon-white"></i> Following';

        // Apply the data attribute to the button
        $('#' + currentOptions.domId + '-follow-flow-button').attr('data-following', '' + following + '');

        // Then change the text and content of the button appropriately
        if (following == false) {
            $('#' + currentOptions.domId + '-follow-flow-button').text('');
            $('#' + currentOptions.domId + '-follow-flow-button').children('i').remove();
            $('#' + currentOptions.domId + '-follow-flow-button').append(followHtml);
        } else {
            $('#' + currentOptions.domId + '-follow-flow-button').text('');
            $('#' + currentOptions.domId + '-follow-flow-button').children('i').remove();
            $('#' + currentOptions.domId + '-follow-flow-button').append(followingHtml);
        }
    };

    // This function is used to populate the social network chassis with all of the data
    //
    var populateSocialData = function () {
        ManyWhoSocial.getMyUserInfo('SocialNetworkPlugin.populateSocialData',
                                    currentOptions.stateId,
                                    currentOptions.streamId,
                                    null,
                                    function (data, status, xhr) {
                                        // Assign the local data to the logged in user
                                        myData = data;

                                        // Update the following button correctly for this user
                                        setFollowingInfo(myData.isFollower);

                                        // Now move on to populate the follows of this group
                                        getFeedFollowers();

                                        // Also load all of the feed data
                                        getFeed();
                                    },
                                    null);
    };

    // Print out all of the followers of this flow
    //
    var getFeedFollowers = function () {
        ManyWhoSocial.getStreamFollowers('SocialNetworkPlugin.getFeedFollowers',
                                         currentOptions.stateId,
                                         currentOptions.streamId,
                                         null,
                                         function (data, status, xhr) {
                                             var html = '';

                                             // We apply the followers to the group
                                             if (data != null &&
                                                 data.length > 0) {
                                                 // Go through each of the followers and print out the entries into the html
                                                 for (var j = 0; j < data.length; j++) {
                                                     html += '<img id="' + currentOptions.domId + '-' + data[j].id + '-follower-avatar" data-whoId="' + data[j].id + '" class="avatar manywho-who-reference" src="' + data[j].avatarUrl + '"/>';
                                                 }
                                             }

                                             // If we don't have any followers, we shouldn't show the follower panel
                                             if (html == null ||
                                                 html.trim().length == 0) {
                                                 // Blank everything out
                                                 $('#' + currentOptions.domId + '-followers').html('');
                                                 $('#' + currentOptions.domId + '-followers').hide();
                                             } else {
                                                 // Apply the html to our followers panel
                                                 $('#' + currentOptions.domId + '-followers').html(html);
                                                 $('#' + currentOptions.domId + '-followers').show();
                                             }
                                         },
                                         null);
    };

    // Send the comment over to the social network
    //
    var sendComment = function (text, users, messageId) {
        ManyWhoSocial.postNewMessage('SocialNetworkPlugin.sendComment',
                                     currentOptions.stateId,
                                     currentOptions.streamId,
                                     { senderId: myData.id, messageText: text, mentionedWhos: users, repliedTo: messageId },
                                     null,
                                     function (data, status, xhr) {
                                         // Update the post id so we don't confuse the realtime updates
                                         $('#' + currentOptions.domId + '-post-id').val(data.id);

                                         // Notify subscribers of the latest post id - but only if we have an active connection to share js
                                         if ($shareJsState != null) {
                                             $shareJsState.insert(0, data.id);
                                         }

                                         // Reset the new comments section
                                         $('#' + currentOptions.domId + '-' + messageId + '-new-comment-text').val('');
                                         $('#' + currentOptions.domId + '-' + messageId + '-new-comment-text').prop('disabled', false);

                                         // Create the comment
                                         createComment(currentOptions.domId + '-' + messageId + '-comments', data, true);
                                     },
                                     null);
    };


    // Tells the social network that this user wants to follow the flow
    //
    var followFlow = function (follow) {
        ManyWhoSocial.followStream('SocialNetworkPlugin.followFlow',
                                       currentOptions.stateId,
                                       currentOptions.streamId,
                                       follow,
                                       null,
                                       function (data, status, xhr) {
                                           // We send through a dummy id for the update
                                           var update = 'follow0000AAe5FCAT';

                                           if (follow == true) {
                                               update = 'unfollow00AAe5FCAT';
                                           }

                                           // Update the post id so we don't confuse the realtime updates
                                           $('#' + currentOptions.domId + '-post-id').val(update);

                                           // Notify subscribers of the latest post id - but only if we have an active connection to share js
                                           if ($shareJsState != null) {
                                               $shareJsState.insert(0, update);
                                           }

                                           // Update the follow button appropriately
                                           setFollowingInfo(follow);

                                           // Call the feed followers method to get the latest followers of the flow (including the current user)
                                           getFeedFollowers();
                                       },
                                       null);
    };

    // Populate the feed messages contained in the data
    //
    var populateFeedMessages = function (data, showNew, prepend) {
        // First populate all of the messages
        if (data.messages != null &&
            data.messages.length > 0) {
            for (var i = 0; i < data.messages.length; i++) {
                createPost(currentOptions.domId + '-messages', data.messages[i], showNew, prepend);
            }

            // If we're prepending, we want to remove messages that were not included in the results
            if (prepend == true) {
                // Now we need to delete the messages that are no longer in the view - so we go through all of the posts in the UI
                $('.manywho-post').each(function (index, element) {
                    var doDelete = true;
                    var postId = $(this).attr('data-postId');

                    // Check to see if this post is in our updated messages list
                    for (var j = 0; j < data.messages.length; j++) {
                        if (data.messages[j].id == postId) {
                            doDelete = false;
                        }
                    }

                    // Delete the message as it no longer exists in the results
                    if (doDelete == true) {
                        $('#' + postId).remove();
                    }
                });
            }
        }

        // Check to see if we have a next page and only show the button if we do
        if (data.nextPage != null &&
            data.nextPage.trim().length > 0) {
            // Add the next page id to the button
            $('#' + currentOptions.domId + '-more-button').attr('data-nextPage', data.nextPage);

            // Show the button as there are more messages
            $('#' + currentOptions.domId + '-more').show();
        } else {
            // Blank out the next page id from the button
            $('#' + currentOptions.domId + '-more-button').attr('data-nextPage', '');

            // Hide the button as we don't have any messages
            $('#' + currentOptions.domId + '-more').hide();
        }
    };

    // Populate the feed with all of the messages
    //
    var getFeed = function () {
        ManyWhoSocial.getStreamMessages('SocialNetworkPlugin.getFeed',
                                        currentOptions.stateId,
                                        currentOptions.streamId,
                                        null,
                                        null,
                                        function (data, status, xhr) {
                                            populateFeedMessages(data, false, false);
                                        },
                                        null);
    };

    // Gets the latest messages from the social network
    //
    var updateMessages = function () {
        ManyWhoSocial.getStreamMessages('SocialNetworkPlugin.updateMessages',
                                            currentOptions.stateId,
                                            currentOptions.streamId,
                                            null,
                                            null,
                                            function (data, status, xhr) {
                                                populateFeedMessages(data, true, true);
                                            },
                                            null);
    };

    // Gets more messages from the social network
    //
    var getMoreMessages = function () {
        ManyWhoSocial.getStreamMessages('SocialNetworkPlugin.getMoreMessages',
                                        currentOptions.stateId,
                                        currentOptions.streamId,
                                        $('#' + currentOptions.domId + '-more-button').attr('data-nextPage'),
                                        null,
                                        function (data, status, xhr) {
                                            populateFeedMessages(data, true, false);
                                        },
                                        null);
    };

    // Gets the user data for the provided user id.
    //
    var getUserData = function (elementId, userId) {
        if (userId !== myData.id) {
            ManyWhoSocial.getUserInfo('SocialNetworkPlugin.getUserInfo',
                                      currentOptions.stateId,
                                      currentOptions.streamId,
                                      userId,
                                      null,
                                      function (data, status, xhr) {
                                          showPopover(elementId, data);
                                      },
                                      null);
        } else {
            showPopover(elementId, myData);
        }
    };

    // Shows the pop-over for the given user data.  The element id is the element id for the element being hovered over.
    //
    var showPopover = function (elementId, data) {
        $('#' + elementId).popover('destroy');
        $('#' + elementId).popover({
            offset: 10,
            trigger: 'hover',
            html: true,
            delay: { show: 500, hide: 300 },
            placement: 'top',
            content: createUserDataPopoverHtml(data),
            title: 'Who',
            template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
        }).popover('show');
    };

    // Create the html for the user content popover
    //
    var createUserDataPopoverHtml = function (data) {
        var popoverHtml = null;
        
        popoverHtml = '';
        popoverHtml += '<div class="media">';
        popoverHtml += '  <img class="pull-left avatar-big" src="' + data.avatarUrl + '">';
        popoverHtml += '  <div class="media-body">';
        popoverHtml += '    <h5 class="media-heading">' + data.fullName + '</h5>';

        if (data.jobTitle != null) {
            popoverHtml += '    ' + data.jobTitle;
        }

        // Out of scope for now - just seems a little unnecessary
        //if (data.id != myData.id) {
        //    popoverHtml += '    <button id="' + currentOptions.domId + '-follow-user-button" class="btn btn-success">';
        
        //    if (data.isFollower == true) {
        //        popoverHtml += '<i class="icon-minus-sign icon-white"></i> Following';
        //    } else {
        //        popoverHtml += '<i class="icon-plus-sign icon-white"></i> Follow';
        //    }

        //    popoverHtml += '</button>';
        //}

        popoverHtml += '  </div>';
        popoverHtml += '</div>';

        return popoverHtml;
    };

    // Creates the html for a comment against a post in the feed.
    //
    var createComment = function (parentElementId, data, showNew) {
        var html = '';
        var exists = false;

        // Make sure the data for the message is no null
        if (data != null) {
            // Check to see if this comment already exists in the feed
            if ($('#' + currentOptions.domId + '-' + data.id + '-wrapper').length > 0) {
                // It exists, so we need to check everything is up-to-date
                exists = true;
            } else {
                // It doesn't exist, we can print everything out
                exists = false;
            }

            if (exists == false) {
                html += '<li id="' + currentOptions.domId + '-' + data.id + '-wrapper" class="manywho-post-comment" style="background-color: ' + COMMENT_COLOR + ';">';
                html += '  <div class="media">';
                html += '    <img id="' + currentOptions.domId + '-' + data.id + '-avatar" data-whoId="' + data.sender.id + '" class="media-object pull-left avatar manywho-who-reference" src="' + data.sender.avatarUrl + '" />';
                html += '    <div class="media-body">';
                html += '      <ul class="inline-block unstyled">';
                html += '        <li>';
                html += '          <h4 class="media-heading">';
                html += '            <span class="media-fullname manywho-who-reference" id="' + currentOptions.domId + '-' + data.id + '-sender" data-whoId="' + data.sender.id + '">' + data.sender.fullName + '</span>';

                // Add the delete button, but only if we made the comment
                if (data.sender.id == myData.id) {
                    html += '            <button id="' + currentOptions.domId + '-' + data.id + '-delete" data-postId="' + data.id + '" class="close">&times;</button>';
                }

                html += '          </h4>';

                // Print the text of the actual comment
                html += data.text;

                html += '        </li>';
                html += '        <li>';
                html += '          <ul class="nav nav-pills">';
                html += '            <li>';
                html += '              <span class="muted" id="' + currentOptions.domId + '-' + data.id + '-created-date" data-createdDate="' + data.createdDate + '">' + moment(data.createdDate).format(currentOptions.dateTimeFormat) + '</span>';
                html += '            </li>';
                html += '          </ul>';
                html += '        </li>';
                html += '      </ul>';
                html += '    </div>';
                html += '  </div>';
                html += '</li>';

                $('#' + parentElementId).append(html);

                // Indicates if this is a new comment and should be shown as new
                if (showNew == true) {
                    // Make the background to the post the new color
                    $('#' + currentOptions.domId + '-' + data.id + '-wrapper').css('background-color', NEW_COMMENT_COLOR);

                    // Create the transition to the normal comment color
                    $('#' + currentOptions.domId + '-' + data.id + '-wrapper').fadeIn('slow', function () {
                        $(this).animate({ 'background-color': COMMENT_COLOR }, 5000);
                    });
                } else {
                    // Make the post the standard comment color
                    $('#' + currentOptions.domId + '-' + data.id + '-wrapper').css('background-color', COMMENT_COLOR);
                }
            }
        }
    };

    // Creates the html for a post in the feed - including comments.
    //
    var createPost = function (parentElementId, data, showNew, prepend) {
        var html = '';
        var youLikeThis = false;
        var exists = false;

        // Make sure the data for the message is no null
        if (data != null) {
            // Check to see if this post already exists in the feed
            if ($('#' + currentOptions.domId + '-' + data.id + '-wrapper').length > 0) {
                // It exists, so we need to check everything is up-to-date
                exists = true;
            } else {
                // It doesn't exist, we can print everything out
                exists = false;
            }

            // If the post doesn't exist, we post the parent body piece - this bit is never updated for existing posts - including attachments
            if (exists == false) {
                // Create the main post body
                html += '<li id="' + currentOptions.domId + '-' + data.id + '-wrapper" data-postId="' + data.id + '" class="media manywho-post">';
                html += '  <img id="' + currentOptions.domId + '-' + data.id + '-avatar" data-whoId="' + data.sender.id + '" class="media-object pull-left avatar-big manywho-who-reference" src="' + data.sender.avatarUrl + '" />';
                html += '  <div class="media-body">';
                html += '    <ul id="' + currentOptions.domId + '-' + data.id + '" class="inline-block unstyled">';
                html += '      <li>';
                html += '        <h4 class="media-heading">';
                html += '          <span class="media-fullname manywho-who-reference" id="' + currentOptions.domId + '-' + data.id + '-sender" data-whoId="' + data.sender.id + '">' + data.sender.fullName + '</span>';

                // Only provide a delete button if this is the user that made the post
                if (data.sender.id == myData.id) {
                    html += '          <button id="' + currentOptions.domId + '-' + data.id + '-delete" data-postId="' + data.id + '" class="close">&times;</button>';
                }

                html += '        </h4>';

                // Add the text for the actual post
                html += data.text;

                html += '      </li>';

                // If the post has an attachment, add that to the UI
                if (data.attachments != null &&
                    data.attachments.length > 0) {
                    for (var i = 0; i < data.attachments.length; i++) {
                        if (data.attachments[i].type != null &&
                            data.attachments[i].type !== "ymodule") {
                            html += '      <li class="well well-small">';
                            html += '        <div class="media">';
                            html += '          <img class="pull-left" src="' + data.attachments[i].iconUrl + '" />';
                            html += '          <div class="media-body">';
                            //html += '            File Size: ' + data.attachments[i].size + '<br />';
                            html += '            <a class="downloadUri" href="' + data.attachments[i].downloadUrl + '" target="_blank">' + data.attachments[i].name + '</a>';
                            html += '          </div>';
                            html += '        </div>';
                            html += '      </li>';
                        }
                    }
                }

                // Add the controls for liking, commenting, etc
                html += '      <li>';
                html += '        <ul class="nav nav-pills">';
                html += '          <li><a id="' + currentOptions.domId + '-' + data.id + '-add-comment" data-postId="' + data.id + '" href="#">Comment</a></li>';
                html += '          <li><a id="' + currentOptions.domId + '-' + data.id + '-like" data-postId="' + data.id + '" href="#"></a></li>';
                html += '          <li class="disabled"><a href="#" id="' + currentOptions.domId + '-' + data.id + '-created-date" data-createdDate="' + data.createdDate + '">' + moment(data.createdDate).format(currentOptions.dateTimeFormat) + '</a></li>';
                html += '        </ul>';
                html += '      </li>';
                html += '      <li class="well well-small" id="' + currentOptions.domId + '-' + data.id + '-you-like"><i class="icon-thumbs-up"></i> You like this</li>';
                html += '    </ul>';

                // Now add the comments section for this post
                html += '    <ul id="' + currentOptions.domId + '-' + data.id + '-comments" class="inline-block unstyled">';
                html += '    </ul>';

                // Add the create new comment area (textarea and button)
                html += '    <div id="' + currentOptions.domId + '-' + data.id + '-new-comment" style="overflow: hidden; height:0px;">';
                html += '      <ul class="inline-block unstyled">';
                html += '        <li>';
                html += '          <textarea id="' + currentOptions.domId + '-' + data.id + '-new-comment-text" placeholder="Write a comment..." class="span12 typeahead elastic"></textarea>';
                html += '          <button id="' + currentOptions.domId + '-' + data.id + '-new-comment-button" class="btn btn-success">Comment</button>';
                html += '        </li>';
                html += '      </ul>';
                html += '    </div>';

                // Close out the media body and media entry
                html += '  </div>';
                html += '</li>';

                // Print at the beginning or the end of the list of posts depending on the prepend flag
                if (prepend == true) {
                    $('#' + parentElementId).prepend(html);
                } else {
                    $('#' + parentElementId).append(html);
                }

                // Indicates if this is a new post and should be shown as new
                if (showNew == true) {
                    // Make the background to the post the new color
                    $('#' + currentOptions.domId + '-' + data.id + '-wrapper').css('background-color', NEW_POST_COLOR);

                    // Create the transition to the normal post color
                    $('#' + currentOptions.domId + '-' + data.id + '-wrapper').fadeIn('slow', function () {
                        $(this).animate({ 'background-color': POST_COLOR }, 5000);
                    });
                }

                // Add type ahead to the comment box
                addTypeAhead(currentOptions.domId + '-' + data.id + '-new-comment-text');

                // Make the comment box elastic
                $('#' + currentOptions.domId + '-' + data.id + '-new-comment-text').elastic();

                // Add the click event for deleting a post
                $('#' + currentOptions.domId + '-' + data.id + '-delete').click(function (event) {
                    event.preventDefault();

                    // Remove the post from the social network
                    removePost(data.id);
                });

                // Add click event for adding comments to this post - this displays the new comment panel
                $('#' + currentOptions.domId + '-' + data.id + '-add-comment').click(function (event) {
                    event.preventDefault();

                    // Set the focus to the comment related to this button
                    $('#' + currentOptions.domId + '-' + data.id + '-new-comment-text').focus();

                    // Animate the opening of the new comment panel
                    $('#' + currentOptions.domId + '-' + data.id + '-new-comment').animate(
                        { 'min-height': 110 + 'px' },
                        500,
                        function () {
                            $(this).css('height', 'auto');
                        }
                    );
                });

                // Add the click event for new comments
                $('#' + currentOptions.domId + '-' + data.id + '-new-comment-button').click(function (event) {
                    event.preventDefault();

                    var commentText = null;
                    var mentionedUsersResponse = null;

                    // Grab the text for the comment
                    commentText = $('#' + currentOptions.domId + '-' + data.id + '-new-comment-text').val();

                    // Get the list of mentioned users from the comment text
                    mentionedUsersResponse = getMentionedUsers(commentText);

                    // Make sure the comment text if valid
                    if (validatePost(mentionedUsersResponse.messageText) == false) {
                        return;
                    }

                    // Disable the text area for the post
                    $('#' + currentOptions.domId + '-' + data.id + '-new-comment-text').prop('disabled', true);

                    // Send it over
                    sendComment(mentionedUsersResponse.messageText, mentionedUsersResponse.mentionedWhosToSend, data.id);
                });

                // Add the click event for liking and unliking posts
                $('#' + currentOptions.domId + '-' + data.id + '-like').click(function () {
                    event.preventDefault();
                    
                    // Check the like status of this post and do the opposite
                    if ($(this).attr('data-like') == 'true') {
                        likePost(data.id, false);
                    } else {
                        likePost(data.id, true);
                    }
                });
            }

            // Check to see if we have any comments in the data, add those as needed
            if (data.comments != null &&
                data.comments.length > 0) {
                // Print each of the comments to the post
                for (var j = 0; j < data.comments.length; j++) {
                    createComment(currentOptions.domId + '-' + data.id + '-comments', data.comments[j], false);
                }
            }

            // Check to see if the array of liker ids contains our id
            youLikeThis = contains(myData.id, data.likerIds);

            // Make sure the like control has the right text and we're storing the correct like status
            assignLikeButtonText(data.id, youLikeThis);
        }
    };

    // Assigns the correct text for the like button on a post
    //
    var assignLikeButtonText = function (messageId, like) {
        if (like == true) {
            $('#' + currentOptions.domId + '-' + messageId + '-like').html('Unlike');
            $('#' + currentOptions.domId + '-' + messageId + '-like').attr('data-like', 'true');
            $('#' + currentOptions.domId + '-' + messageId + '-you-like').show();
        } else {
            $('#' + currentOptions.domId + '-' + messageId + '-like').html('Like');
            $('#' + currentOptions.domId + '-' + messageId + '-like').attr('data-like', 'false');
            $('#' + currentOptions.domId + '-' + messageId + '-you-like').hide();
        }
    };

    // Change the like status of the post
    //
    var likePost = function (messageId, like) {
        ManyWhoSocial.likeMessage('SocialNetworkPlugin.LikePost',
                                  currentOptions.stateId,
                                  currentOptions.streamId,
                                  messageId,
                                  like,
                                  null,
                                  function (data, status, xhr) {
                                      // If everything was successful, we set the like status appropriately
                                      assignLikeButtonText(messageId, like);
                                  },
                                  null);
    };

    // Send the share message over to the social network
    //
    var sendShare = function (dialogElementId, postElementId, postText, users) {
        ManyWhoSocial.shareMessage('SocialNetworkPlugin.SendShare',
                                   currentOptions.stateId,
                                   currentOptions.streamId,
                                   { senderId: myData.id, messageText: postText, mentionedWhos: users },
                                   null,
                                   function (data, status, xhr) {
                                       // Remove the post from the input box
                                       $('#' + postElementId).val('');

                                       // Re-enable all of the input fields
                                       $('#' + postElementId).prop('disabled', false);
                                         
                                       // This bit is messy as we're calling a dialog created by the engine so we've got a cyclic dependency really
                                       $('#' + dialogElementId).modal('hide');
                                   },
                                   null);
    };

    // Send the post over to the social network
    //
    var sendPost = function (postElementId, postText, users) {
        ManyWhoSocial.postNewMessage('SocialNetworkPlugin.SendPost',
                                     currentOptions.stateId,
                                     currentOptions.streamId,
                                     { senderId: myData.id, messageText: postText, mentionedWhos: users },
                                     null,
                                     function (data, status, xhr) {
                                         // Update the post id so we don't confuse the realtime updates
                                         $('#' + currentOptions.domId + '-post-id').val(data.id);

                                         // Notify subscribers of the latest post id - but only if we have an active connection to share js
                                         if ($shareJsState != null) {
                                             $shareJsState.insert(0, data.id);
                                         }

                                         // Remove the post from the input box
                                         $('#' + postElementId).val('');

                                         // Put the message onto the page
                                         createPost(currentOptions.domId + '-messages', data, true, true);

                                         // Re-enable all of the input fields
                                         $('#' + postElementId).prop('disabled', false);
                                     },
                                     null);
    };

    // Helper method to extract the search name for the query call to the social network
    //
    var extractor = function (query) {
        var splitStringArray = null;
        var extractedUserQuery = '';

        // Check to see if we have an @ symbol - this gives us the start of the search
        if (hasSign(query, '@')) {
            // Split the string by space@ so we know they're mentioning a user as opposed to entering an email!
            splitStringArray = query.split(' @');

            var searchName = '';

            // Check to make sure the split has something after the @ symbol
            if (splitStringArray.length > 1) {
                // Grab the first word after the @ symbol only
                extractedUserQuery = splitStringArray[splitStringArray.length - 1].split(' ')[0];
            } else {
                // This is not a user query as we have nothing after the @symbol and/or there's no space before the @ symbol
                extractedUserQuery = '';
            }

            // If the query has already been completed (i.e. because the name is contained in square brackets) return blank
            if (extractedUserQuery.indexOf('[') >= 0) {
                extractedUserQuery = '';
            }
        }

        return extractedUserQuery;
    };

    // Helper method that returns true if str contains a particular sign (TODO: Understand this a bit more)
    //
    var hasSign = function (str, sign) {
        if (str != null && str != undefined) {
            return str.indexOf(sign) >= 0;
        }

        return true;
    };

    // Helper method to return only unique values in the provided array (TODO: Check this also)
    //
    var getUnique = function (arr) {
        var a = [], l = arr.length;

        for (var i = 0; i < l; i++) {
            for (var j = i + 1; j < l; j++)
                if (arr[i].id === arr[j].id) j = ++i;
            a.push(arr[i]);
        }

        return a;
    };

    // Replace all values in the string (TODO: check why this is needed)
    //
    var replaceAll = function (val, str1, str2, ignore) {
        return val.replace(new RegExp(str1.replace(/([\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, function (c) { return "\\" + c; }), "g" + (ignore ? "i" : "")), str2);
    };

    // Get the list of mentioned users in the message text
    //
    var getMentionedUsers = function (messageText) {
        var mentionedUsersResponse = null;
        var matchedUsers = null;

        // Get the list of uniquely mentioned users - as full objects as opposed to just the name
        var distinctUsers = getUnique(mentionedUsers);

        // Create a new array to store the list of mentioned users
        var mentionedUsersToSend = new Array();

        // Find the full name of the user in the content and wrap the user with '{Full Name}' brackets
        for (var l = 0; l < distinctUsers.length; l++) {
            // Match the user has being in the format of @[Full Name]
            if (hasSign(messageText, '@[' + distinctUsers[l].fullName + ']')) {
                // Replace this in the text so we have a simpler regex to split
                messageText = replaceAll(messageText, '@[' + distinctUsers[l].fullName + ']', distinctUsers[l].fullName);

                // Add the user to our list of mentioned users
                mentionedUsersToSend.push(distinctUsers[l]);
            }
        }

        // Return a helper object with the revised message text and the distinct users
        mentionedUsersResponse = new Object();
        mentionedUsersResponse.mentionedWhosToSend = mentionedUsersToSend;
        mentionedUsersResponse.messageText = messageText;

        // Return the list of user objects and message text back to the calling function
        return mentionedUsersResponse;
    };

    // Validates the post before sending over to the social network.
    //
    var validatePost = function (messageText) {
        var isValid = true;

        if (messageText == null ||
            messageText.trim().length == 0) {
            isValid = false;
        }

        return isValid;
    };

    // Adds type ahead to the provide text element id
    //
    var addTypeAhead = function (textElementId) {
        var objects = [];
        var map = {};

        $('#' + textElementId).typeahead({
            source: function (query, process) {
                var tquery = extractor(this.query);

                if (tquery != null && 
                    tquery.trim().length > 1) {
                    ManyWhoSocial.searchUsersByName('SocialNetworkPlugin.addTypeAhead',
                                                    currentOptions.stateId,
                                                    currentOptions.streamId,
                                                    tquery,
                                                    null,
                                                    function (data, status, xhr) {
                                                        objects = [];
                                                        map = {};

                                                        $.each(data, function (i, object) {
                                                            map[object.fullName] = object;
                                                            objects.push(object.fullName);
                                                        });
                                                        process(objects);
                                                    },
                                                    null);
                }
            },
            updater: function (item) {
                var tquery = null;
                var replacementText = null;

                // The map contains the list of user objects by name - we grab out the additional user data for the
                // social network and create a new user object for our mentioned users list stored locally for this post
                mentionedUsers.push({ id: map[item].id, name: map[item].name, fullName: map[item].fullName });

                // Extract out the actual query from the text of the message
                tquery = extractor(this.$element.val());

                // Construct the text we want to put into the editor
                replacementText = this.$element.val().replace('@' + tquery, '@[' + item + ']');

                // Return the text to the caller
                return replacementText;
            },
            matcher: function (item) {
                return true;
            },
            highlighter: function (item) {
                var who = null;
                var whoSelect = null;

                // Find the who in the map of users returned in the type ahead query
                who = map[item];

                // Create the list of users to be show to select from
                whoSelect = '';
                whoSelect += '<div class="media">';
                whoSelect += '  <a class="pull-left" href="#">';
                whoSelect += '    <img class="media-object avatar" src="' + who.avatarUrl + '" />';
                whoSelect += '  </a>';
                whoSelect += '  <div class="media-body">';
                whoSelect += '    <h5 class="media-heading">' + who.fullName + '</h5>';

                if (who.jobTitle != null) {
                    whoSelect += '    ' + who.jobTitle;
                }

                whoSelect += '  </div>';
                whoSelect += '</div>';

                return whoSelect;
            }
        });
    };

    var methods = {
        init: function (options) {
            var html = '';

            // Get the options provided by the user
            currentOptions = $.extend({}, $.fn.manywhoSocialNetwork.defaults, options);

            // Create the chassis for the social plugin
            html += '<input type="hidden" id="' + currentOptions.domId + '-post-id" value="loading" />';

            // Set the full width status of the feed
            if (currentOptions.isFullWidth == false) {
                html += '<div class="container">';
            } else {
                html += '<div class="container-fluid">';
            }

            html += '  <div class="row-fluid">';

            // The span for the main feed
            html += '    <div class="span12">';

            html += '      <div class="row-fluid" id="' + currentOptions.domId + '-new-posts">';
            html += '        <div class="alert alert-info">';
            html += '          <strong>Feed Update</strong> You have new posts available. <a href="#" id="' + currentOptions.domId + '-update-feed-new-posts">Refresh feed now</a></strong>';
            html += '        </div>';
            html += '      </div>';

            // The tabs for the feed
            html += '      <div class="row-fluid manywho-social-new-posts">';
            html += '        <div class="span12">';
            html += '          <div class="tabbable">';
            html += '            <ul class="nav nav-tabs">';
            html += '              <li class="active"><a href="#' + currentOptions.domId + '-post-tab" data-toggle="tab">Post</a></li>';
            html += '              <li><a href="#' + currentOptions.domId + '-file-tab" data-toggle="tab">File</a></li>';
            html += '            </ul>';
            html += '            <div class="tab-content">';
            html += '              <div class="tab-pane active" id="' + currentOptions.domId + '-post-tab">';
            html += '                <div class="row-fluid">';
            html += '                  <textarea id="' + currentOptions.domId + '-new-post-text" placeholder="What are you working on?" class="span12 typeahead elastic"></textarea>';
            html += '                  <button id="' + currentOptions.domId + '-new-post-button" class="btn btn-success">Share</button>';
            html += '                  <button id="' + currentOptions.domId + '-update-feed-post" class="btn"><i class="icon-refresh"></i> Refresh</button>';
            html += '                </div>';
            html += '              </div>';
            html += '              <div class="tab-pane" id="' + currentOptions.domId + '-file-tab">';
            html += '                <div class="row-fluid">';
            html += '                  <form id="' + currentOptions.domId + '-fileupload" method="POST" enctype="multipart/form-data">';
            html += '                    <div class="row-fluid">';
            html += '                      <div class="span12 fileupload-buttonbar">';
            html += '                        <span class="btn btn-success fileinput-button">';
            html += '                          <i class="icon-plus icon-white"></i> <span>Add files...</span>';
            html += '                          <input type="file" id="files[]" name="files[]">';
            html += '                        </span>';
            html += '                      </div>';
            html += '                    </div>';
            html += '                    <div class="row-fluid fileupload-loading"></div>';
            html += '                    <div class="row-fluid">';
            html += '                      <div class="files" id="manywho-social-uploadedfiles" data-toggle="modal-gallery" data-target="#modal-gallery"></div>';
            html += '                    </div>';
            html += '                  </form>';
            html += '                </div>';
            html += '                <div class="row-fluid">';
            html += '                  <textarea id="' + currentOptions.domId + '-new-file-text" placeholder="Say something about this file..." class="span12 typeahead"></textarea>';
            html += '                  <button id="' + currentOptions.domId + '-new-file-button" class="btn btn-success">Share</button>';
            html += '                  <button id="' + currentOptions.domId + '-update-feed-file" class="btn"><i class="icon-refresh"></i> Refresh</button>';
            html += '                </div>';
            html += '              </div>';
            html += '            </div>';
            html += '          </div>';
            html += '        </div>';
            html += '      </div>';

            // The container for all of the messages to be printed on the screen
            html += '      <div class="row-fluid">';
            html += '        <ul id="' + currentOptions.domId + '-messages" class="media-list messagesContainer">';
            html += '        </ul>';
            html += '      </div>';

            // The button to load more messages
            html += '      <div id="' + currentOptions.domId + '-more" class="row-fluid">';
            html += '        <button id="' + currentOptions.domId + '-more-button" data-nextPage="" class="btn btn-block">More</button>';
            html += '      </div>';

            // Finish up the main column for the messages
            html += '    </div>';

            // Finish up the container for the feed
            html += '  </div>';
            html += '</div>';

            // Print the chassis of the feed to the parent container
            $(this).html(html);
            
            // Hide the new posts UI
            $('#' + currentOptions.domId + '-new-posts').hide();

            try {
                // Make sure we're pointing at the correct collaboration space
                var options = {
                    origin: ManyWhoConstants.NODE_BASE_PATH + '/channel'
                }

                // Open the realtime socket for detecting changes to the feed - based on this stream identifier
                sharejs.open(currentOptions.streamId, 'text', options, function (error, doc) {
                    // Keep the document as a global value
                    $shareJsState = doc;

                    // Detect changes to the doc and print out to the UI to show there are new posts
                    doc.on('insert', function (op) {
                        var postId = null;

                        // Get the document's post id value
                        postId = doc.getText();

                        // Only take the first part of the document as that's our actual id
                        if (postId.length > 0) {
                            postId = postId.substring(0, '0D5i000000AAe5FCAT'.length);
                        }

                        // If the post coming through on the change is not the same one we have stored, then the user needs to update their feed
                        if (postId != null &&
                            postId != $('#' + currentOptions.domId + '-post-id').val()) {
                            // Show the feed update is needed
                            $('#' + currentOptions.domId + '-new-posts').show();
                            // Update the feed post id so we're OK with any future changes
                            $('#' + currentOptions.domId + '-post-id').val(postId);
                        }
                    });
                });
            } catch (error) {
                // For now, do nothing
            }

            // Add type ahead to the main input boxes for posting
            addTypeAhead(currentOptions.domId + '-new-post-text');
            addTypeAhead(currentOptions.domId + '-share-post-text');
            addTypeAhead(currentOptions.domId + '-new-file-text');

            // Make the main input boxes elastic
            $('#' + currentOptions.domId + '-new-post-text').elastic();
            $('#' + currentOptions.domId + '-share-post-text').elastic();
            $('#' + currentOptions.domId + '-new-file-text').elastic();

            // Hide the more button
            $('#' + currentOptions.domId + '-more').hide();

            // Add the click event for new posts
            $('#' + currentOptions.domId + '-new-post-button').click(function (event) {
                event.preventDefault();

                var postText = null;
                var mentionedUsersResponse = null;

                // Grab the text for the post
                postText = $('#' + currentOptions.domId + '-new-post-text').val();

                // Get the list of mentioned users from the post text
                mentionedUsersResponse = getMentionedUsers(postText);

                // Make sure the post text if valid
                if (validatePost(mentionedUsersResponse.messageText) == false) {
                    return;
                }

                // Disable the text area for the post
                $('#' + currentOptions.domId + '-new-post-text').prop('disabled', true);

                // Send it over
                sendPost(currentOptions.domId + '-new-post-text', mentionedUsersResponse.messageText, mentionedUsersResponse.mentionedWhosToSend);
            });

            // Add the click event for share posts
            // The html for the share post is not actually in this plugin, it's in the runtime UI which makes it a little confusing
            // This is so we an put it at the top of the screen rather than the bottom - we effectively inject this functionality into
            // the runtime as with the follow and update feed buttons.
            $('#' + currentOptions.domId + '-share-post-button').click(function (event) {
                event.preventDefault();

                var postText = null;
                var mentionedUsersResponse = null;

                // Grab the text for the post
                postText = $('#' + currentOptions.domId + '-share-post-text').val();

                // Get the list of mentioned users from the post text
                mentionedUsersResponse = getMentionedUsers(postText);

                // Make sure the post text if valid
                if (validatePost(mentionedUsersResponse.messageText) == false) {
                    return;
                }

                // Disable the text area for the post
                $('#' + currentOptions.domId + '-share-post-text').prop('disabled', true);

                // Send it over
                sendShare(currentOptions.domId + '-share-flow-dialog', currentOptions.domId + '-share-post-text', mentionedUsersResponse.messageText, mentionedUsersResponse.mentionedWhosToSend);
            });

            // Add the click event for new file posts
            $('#' + currentOptions.domId + '-new-file-button').click(function (event) {
                event.preventDefault();

                var postText = null;
                var mentionedUsersResponse = null;

                // Grab the text for the post
                postText = $('#' + currentOptions.domId + '-new-file-text').val();

                // Get the list of mentioned users from the post text
                mentionedUsersResponse = getMentionedUsers(postText);

                // Make sure the post text if valid
                if (validatePost(mentionedUsersResponse.messageText) == false) {
                    return;
                }

                // Disable the text area for the post
                $('#' + currentOptions.domId + '-new-file-text').prop('disabled', true);

                // Send it over
                sendFile(mentionedUsersResponse.messageText, mentionedUsersResponse.mentionedWhosToSend);
            });

            // Add the click event to grab more messages
            $('#' + currentOptions.domId + '-more-button').click(function (event) {
                event.preventDefault();

                // Get more messages based on the next page returned in the last call
                getMoreMessages();
            });

            // Add the click event for updating the feed with the latest posts
            $('#' + currentOptions.domId + '-update-feed-post').click(function (event) {
                event.preventDefault();

                // Update the messages in the feed
                updateMessages();

                // Call the feed followers method to get the latest followers of the flow
                getFeedFollowers();
            });

            // Add the click event for updating the feed with the latest posts
            $('#' + currentOptions.domId + '-update-feed-file').click(function (event) {
                event.preventDefault();

                // Update the messages in the feed
                updateMessages();

                // Call the feed followers method to get the latest followers of the flow
                getFeedFollowers();
            });

            // Add the click event for updating the feed with the latest posts based on the alert
            $('#' + currentOptions.domId + '-update-feed-new-posts').click(function (event) {
                event.preventDefault();

                // Update the messages in the feed
                updateMessages();

                // Call the feed followers method to get the latest followers of the flow
                getFeedFollowers();

                // Hide the feed update is needed
                $('#' + currentOptions.domId + '-new-posts').hide();
            });

            // Add the click event for following the flow
            $('#' + currentOptions.domId + '-follow-flow-button').click(function (event) {
                event.preventDefault();

                // Change the status of the following to the opposite
                if ($(this).attr('data-following') == 'true') {
                    followFlow(false);
                }
                else {
                    followFlow(true);
                }
            });

            // Initialize the file upload plugin
            $('#' + currentOptions.domId + '-fileupload').livequery(function () {
                $(this).fileupload({
                    dataType: 'json',
                    url: ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + currentOptions.streamId + '/file',
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('ManyWhoTenant', ManyWhoSharedServices.getTenantId());
                        xhr.setRequestHeader('Authorization', ManyWhoSharedServices.getAuthenticationToken());
                    },
                    maxFileSize: 104857600, // 100MB
                    maxNumberOfFiles: 1,
                    basic: true,
                    completed: function (e, data) {
                        var file = null;

                        // At the moment, we only support uploading one file per post
                        if (data.result != null &&
                            data.result.length > 0) {
                            // Grab the first file from the result list
                            file = data.result[0];
                        }

                        // Pass the file object into the uploaded files array and refresh the UI
                        fileUploaded(file);
                    },
                    uploadTemplate: function (data) {
                        // Create a new array to store the rows of uploaded files
                        var rows = new Array();
                        var row = null;

                        // Go through each of the uploaded files and print out the html
                        $.each(data.files, function (index, file) {
                            row = '';
                            row += '<div class="template-upload row-fluid">';
                            row += '  <p>' + file.name + ' (' + data.formatFileSize(file.size) + ')</p>';

                            // Check to see if there was an error processing the file
                            if (file.error == true) {
                                row += '  <p><span class="label label-important">Error</span>' + file.error + '</p>';
                                row += '  <button class="btn btn-warning cancel"><i class="icon-ban-circle icon-white"></i> Cancel</button>';
                            } else if (data.files.valid == true) {
                                row += '  <div class="progress progress-success progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">';
                                row += '    <div class="bar" style="width:0%;"></div>';
                                row += '  </div>';

                                // If we're not auto uploading files, we need to show the start and cancel buttons
                                if (data.options.autoUpload == false) {
                                    row += '  <button class="btn btn-primary start"><i class="icon-upload icon-white"></i> Start</button>';
                                    row += '  <button class="btn btn-warning cancel"><i class="icon-ban-circle icon-white"></i> Cancel</button>';
                                }
                            }

                            row += '</div>';

                            // Add the row of html to the array
                            rows[rows.length] = row;
                        });

                        return rows;
                    },
                    downloadTemplate: function (data) {
                        // Create a new array to store the rows of downloadable files
                        var rows = new Array();
                        var row = null;

                        // Go through each of the files that can be downloaded and print the html
                        $.each(data.files, function (index, file) {
                            row = '';

                            if (file.error) {
                                row += '<div class="template-upload row-fluid">';
                                row += '  <div class="row-fluid">';
                                row += '    <div>' + file.name + ' (' + data.formatFileSize(file.size) + ')</div>';
                                row += '  </div>';
                                row += '  <div class="row-fluid">';
                                row += '    <div><span class="label label-important">Error</span> ' + file.error + '</div>';
                                row += '  </div>';
                                row += '</div>';
                            } else {
                                row += '<div id="' + file.id + '" data-name="' + file.name + '" data-type="' + file.type + '" class="template-upload row-fluid manywho-social-file">';
                                row += '  <div class="row-fluid">';
                                //row += '    <div>' + (file.thumbnailUrl ? '<img alt="' + file.name + '" src="' + file.thumbnailUrl + '" />' : '') + '</div>';
                                row += '    <div class="span12"><button class="btn btn-danger delete" data-type="DELETE" data-url="' + ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + currentOptions.streamId + '/file/' + file.id + '" ' + (file.delete_with_credentials ? 'data-xhr-fields="{"withCredentials":true}"' : '') + '><i class="icon-trash icon-white"></i> <span>Delete</span></button> ' + file.name + ' (' + data.formatFileSize(file.size) + ')</div>';
                                row += '  </div>';
                                row += '</div>';
                            }

                            // Add the row of html to the array
                            rows[rows.length] = row;
                        });

                        return rows;
                    }
                });

                $(this).bind('fileuploaddestroy', function (e, destroyData) {
                    // Remove uploaded file name, which generated by server(GUID) from array
                    var url = null;
                    var deletedFileId = null;

                    // Get the unique identifier of the deleted file
                    url = destroyData.url;
                    deletedFileId = url.substring(url.lastIndexOf('/') + 1);

                    // Remove the deleted file from our stored array
                    fileDeleted(deletedFileId);
                });
            });

            // Add the pop over functionality when looking at a particular user
            $('.manywho-who-reference').livequery(function () {
                var timeoutObj = null;
                $(this).click(function (e) {
                    // Show the user data for the given element and stored who id
                    getUserData($(this).attr('id'), $(this).attr('data-whoId'));
                });
            });

            // Kick off the calls to populate the social plugin
            populateSocialData(this);
        }
    };

    $.fn.manywhoSocialNetwork = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoSocialNetwork');
        }
    };

    // Option default values
    $.fn.manywhoSocialNetwork.defaults = { stateId: '', token: '', streamId: '', networkName: '', messagesOnPageCount: 10, dateTimeFormat: 'MMMM Do YYYY, h:mm:ss a', isFullWidth: false };

})(jQuery);
