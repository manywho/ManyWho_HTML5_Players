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

    var counter = 1;

    var TWILIO_RESPONSE_DEVELOPER_NAME = "Twilio.Twiml.VoiceRequest";
    var TWILIO_CONTAINER_TYPE = "Twilio.Twiml.Response";

    var TWILIO_CONTAINER_GATHER = "Gather";
    var TWILIO_CONTAINER_DIAL = "Dial";

    var TWILIO_COMPONENT_SAY = "Say";
    var TWILIO_COMPONENT_PLAY = "Play";
    var TWILIO_COMPONENT_RECORD = "Record";
    var TWILIO_COMPONENT_SMS = "Sms";
    
    var TWILIO_COMPONENT_DIAL_NUMBER = "Number";
    var TWILIO_COMPONENT_DIAL_SIP = "Sip";
    var TWILIO_COMPONENT_DIAL_CLIENT = "Client";
    var TWILIO_COMPONENT_DIAL_CONFERENCE = "Conference";
    var TWILIO_COMPONENT_DIAL_QUEUE = "Queue";

    var TWILIO_COMPONENT_SECONDARY_ENQUEUE = "Enqueue";
    var TWILIO_COMPONENT_SECONDARY_LEAVE = "Leave";
    var TWILIO_COMPONENT_SECONDARY_HANGUP = "Hangup";
    var TWILIO_COMPONENT_SECONDARY_REDIRECT = "Redirect";
    var TWILIO_COMPONENT_SECONDARY_REJECT = "Reject";
    var TWILIO_COMPONENT_SECONDARY_PAUSE = "Pause";

    var getCounter = function () {
        return counter++;
    };

    var getBufferValue = function () {
        var buffer = 10;

        if ($('body').height() > $(window).height()) {
            buffer = 20;
        }

        return buffer;
    };

    var createSharedElementsDropDown = function (domId, pageComponent) {
        // Add the tenant to the header so we have it in the request
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', ManyWhoSharedServices.getTenantId());

        // Dispatch the request to get the navigation
        ManyWhoAjax.callRestApi('ManyWhoTwimlEditorBootstrap.CreateSharedElementsDropDown',
                                ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/element/value?filter=',
                                'GET',
                                '',
                                null,
                                function (data, status, xhr) {
                                    var valueElementIdId = null;
                                    var valueElementId = null;
                                    var html = '';
                                    
                                    html += '<div style="float:left">';
                                    html += '<select id="' + domId + '-values">';
                                    html += '<option value="">-- Do not store request --</option>';

                                    if (pageComponent != null) {
                                        // Get the value element from the page component
                                        valueElementId = getPropertyValue(pageComponent.properties, 'valuebindingsharedelement').objectData;
                                        if (valueElementId != null &&
                                            valueElementId.length > 0) {
                                            valueElementIdId = getPropertyValue(valueElementId[0].properties, 'id').contentValue;
                                        }
                                    }

                                    // Get the data out and print it to the document
                                    if (data != null &&
                                        data.length > 0) {
                                        // Go through each of the returned shared elements
                                        for (var i = 0; i < data.length; i++) {
                                            var selected = '';

                                            // Check to see if this identifier matches our component
                                            if (valueElementIdId != null &&
                                                valueElementIdId.toLowerCase() == data[i].id.toLowerCase()) {
                                                selected = ' selected';
                                            }

                                            html += '<option' + selected + ' value="' + data[i].id + '">' + data[i].developerName + '</option>';
                                        }
                                    }

                                    html += '</select>';
                                    html += '</div>';

                                    // Append the html to this input
                                    $('#' + domId).replaceWith(html);
                                },
                                function (xhr, status, error) {
                                    alert('something went wrong');
                                },
                                headers,
                                null,
                                ManyWhoSharedServices.getAuthorAuthenticationToken());
    };

    var createPageContainer = function (domId, elementId, parentContainerId, pageContainer) {
        var externalId = null;
        var internalId = null;
        var containerType = null;
        var developerName = null;
        var childPageContainers = null;
        var pageContainerHtml = null;
        var currentCounter = 0;

        // Grab the current counter as we need that to reference our container
        currentCounter = getCounter();

        // Grab the id from the external identifier - we'll always have one of these regardless of "saved" status
        externalId = pageContainer.externalId;

        // Get the property values out
        internalId = getPropertyValue(pageContainer.properties, 'id').contentValue;
        containerType = getPropertyValue(pageContainer.properties, 'containertype').contentValue;
        developerName = getPropertyValue(pageContainer.properties, 'developername').contentValue;
        childPageContainers = getPropertyValue(pageContainer.properties, 'pagecontainers').objectData;

        // Save the page container to the dom
        $('#' + domId + '-page-containers').data(externalId, pageContainer);

        // Now create the page container html
        pageContainerHtml = createPageContainerHtml(domId, currentCounter, containerType, externalId, internalId, developerName);

        // Check to see if we have an element id to replace
        if (elementId == null ||
            elementId.trim().length == 0) {
            // Append the page container to the parent's sortable
            $('#' + parentContainerId).children('.page-sortable').append(pageContainerHtml);
        } else {
            // We have a placeholder element to replace with this new html
            $('#' + elementId).replaceWith(pageContainerHtml);
        }

        $('#' + externalId).children('.manywho-page-container-controls').children('.manywho-edit-page-container').click(function (event) {
            // Get the page container data from the dom
            pageContainer = $('#' + domId + '-page-containers').data(externalId);

            // Show the page object dialog
            showPageObjectDialog(domId, containerType, externalId, false, pageContainer, function () {
                // Update the page container info - which basically re-executes this method
                // We use the external id now as the element exists - this becomes the element id
                updatePageContainer(domId, externalId, null, containerType);
            });
        });

        $('#' + externalId).children('.manywho-page-container-controls').children('.manywho-delete-page-container').click(function (event) {
            // Remove the page container to the dom
            $('#' + domId + '-page-containers').data(externalId, null);

            // Delete the container from the page
            $('#' + externalId).remove();
        });

        // Make the page container sortable
        makeSortable(domId, 'page-sortable-' + currentCounter);

        // Now that we've printed the parent container, we can print any children of this container
        createPageContainers(domId, externalId, childPageContainers);
    };

    var createPageContainers = function (domId, parentContainerId, pageContainers) {
        // Check to see if we actually have any page containers
        if (pageContainers != null &&
            pageContainers.length > 0) {

            // Sort the page containers by the order property so they appear in the correct order
            pageContainers.sort(function (pageContainerA, pageContainerB) {
                var orderA = ManyWhoUtils.grabOrderFromObjectDataEntry(pageContainerA);
                var orderB = ManyWhoUtils.grabOrderFromObjectDataEntry(pageContainerB);

                if (orderA > orderB) {
                    return 1;
                } else if (orderA < orderB) {
                    return -1;
                } else {
                    return 0;
                }
            });

            // Now go through each of the page containers and print them onto the screen
            for (var b = 0; b < pageContainers.length; b++) {
                var pageContainer = pageContainers[b];

                // Create the page container
                createPageContainer(domId, null, parentContainerId, pageContainer);
            }
        }
    };

    var createPageContainerHtml = function (domId, currentCounter, containerType, externalId, internalId, developerName) {
        var html = '';

        html += '<div class="manywho-page-container rendered" id="' + externalId + '" data-internalid="' + handleNullString(internalId) + '">';
        html += '<div class="manywho-page-container-controls">';
        html += '<i class="icon-edit icon-white manywho-edit-page-container"></i> ';
        html += '<span class="manywho-page-container-label"><strong>' + containerType + '</strong>: ' + handleNullString(developerName) + '</span>';
        html += '<i class="icon-trash icon-white pull-right manywho-delete-page-container"></i>';
        html += '</div>';
        html += '<div id="' + domId + '-page-sortable-' + currentCounter + '" class="page-sortable page-sortable-vertical" data-developername="' + developerName + '"></div>';
        html += '</div>';

        return html;
    };

    var createPageComponents = function (domId, pageComponents) {
        // Check to see if we actually have any page components in the array
        if (pageComponents != null &&
            pageComponents.length > 0) {
            // Sort the components by container and then by order so they'll be rendered in the correct way
            pageComponents.sort(function (pageComponentA, pageComponentB) {
                var pageComponentParentA = ManyWhoUtils.grabPageContainerIdFromObjectDataEntry(pageComponentA);
                var pageComponentParentB = ManyWhoUtils.grabPageContainerIdFromObjectDataEntry(pageComponentB);

                if (pageComponentParentA > pageComponentParentB) {
                    return 1;
                } else if (pageComponentParentA < pageComponentParentB) {
                    return -1;
                } else {
                    var pageComponentOrderA = ManyWhoUtils.grabOrderFromObjectDataEntry(pageComponentA);
                    var pageComponentOrderB = ManyWhoUtils.grabOrderFromObjectDataEntry(pageComponentB);

                    // If the page container id's are the same, then we wort by order
                    if (pageComponentOrderA > pageComponentOrderB) {
                        return 1;
                    } else if (pageComponentOrderA < pageComponentOrderB) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
            });

            // Now print each of the page components to the containers
            for (var b = 0; b < pageComponents.length; b++) {
                // Write the page component to the doc
                createPageComponent(domId, null, pageComponents[b]);
            }
        }
    };

    var createPageComponent = function (domId, elementId, pageComponent) {
        var externalId = null;
        var componentType = null;
        var developerName = null;
        var content = null;
        var pageContainerId = null;
        var pageComponentHtml = null;
        var attributes = null;
        var currentCounter = 0;

        // Grab a counter for our element
        currentCounter = getCounter();

        // Grab the external identifier for the component - we'll always have one of these regardless of "saved" status
        externalId = pageComponent.externalId;

        // Get the property values out
        internalId = getPropertyValue(pageComponent.properties, 'id').contentValue;
        developerName = getPropertyValue(pageComponent.properties, 'developername').contentValue;
        componentType = getPropertyValue(pageComponent.properties, 'componenttype').contentValue;
        content = getPropertyValue(pageComponent.properties, 'content').contentValue;
        pageContainerId = getPropertyValue(pageComponent.properties, 'pagecontainerid').contentValue;
        attributes = getPropertyValue(pageComponent.properties, 'attributes').objectData;

        // Save the page components to the dom
        $('#' + domId + '-page-components').data(externalId, pageComponent);

        // Check to see if this is the component for storing the page data
        if (componentType.toLowerCase() == TWILIO_RESPONSE_DEVELOPER_NAME.toLowerCase()) {
            // This is the component for the main response - we don't print it to the page layout
            createSharedElementsDropDown(domId + '-page-builder-valuestomap', pageComponent);
        } else {
            // Create the html for the page component
            pageComponentHtml = createPageComponentHtml(domId, currentCounter, componentType, externalId, internalId, developerName, content);

            // Check to see if we have an element id to replace
            if (elementId == null ||
                elementId.trim().length == 0) {
                // Print the component to the parent container
                $('#' + pageContainerId).children('.page-sortable').append(pageComponentHtml);
            } else {
                // We have a placeholder element to replace with this new html
                $('#' + elementId).replaceWith(pageComponentHtml);
            }

            $('#' + externalId).children('.manywho-page-component-controls').children('.manywho-edit-page-component').click(function (event) {
                // Get the page component data from the dom
                pageComponent = $('#' + domId + '-page-components').data(externalId);

                // Show the page object dialog
                showPageObjectDialog(domId, componentType, externalId, false, pageComponent, function () {
                    // Update the page component info - which basically re-executes this method
                    // We use the external id now as the element exists - this becomes the element id
                    updatePageComponent(domId, externalId, null, componentType);
                });
            });

            $('#' + externalId).children('.manywho-page-component-controls').children('.manywho-delete-page-component').click(function (event) {
                // Remove the page component to the dom
                $('#' + domId + '-page-components').data(externalId, null);

                // Delete the component from the page
                $('#' + externalId).remove();
            });
        }
    };

    var createPageComponentHtml = function (domId, currentCounter, componentType, externalId, internalId, developerName, content) {
        var html = '';

        // Create the page component shell
        html += '<div class="manywho-page-component rendered" id="' + externalId + '" data-internalid="' + internalId + '" data-componenttype="' + componentType + '">';

        // Create the page component controls
        html += '<div class="manywho-page-component-controls">';
        html += '<i class="icon-edit icon-white manywho-edit-page-component"></i> <i class="icon-trash icon-white pull-right manywho-delete-page-component"></i> ';
        html += '<span class="text-info manywho-field-label">' + componentType + '</span>: ' + developerName + '</div>';

        // Now create the shell for the actual component
        html += '<div>';

        if (componentType.toLowerCase() == TWILIO_COMPONENT_SAY.toLowerCase()) {
            html += createTextarea(domId + '-' + externalId, TWILIO_COMPONENT_SAY, 'content', null, 'input-xxlarge', 'What do you want Twilio to say?', 3, content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_DIAL_CONFERENCE.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'content', null, 'input-xxlarge', 'Name of conference room', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_DIAL_CLIENT.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_DIAL_CLIENT, 'content', null, 'input-xxlarge', 'Name of client', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_DIAL_QUEUE.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_DIAL_QUEUE, 'content', null, 'input-xxlarge', 'Name of queue', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_DIAL_SIP.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_DIAL_SIP, 'content', null, 'input-large', 'What is the SIP?', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_DIAL_NUMBER.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_DIAL_NUMBER, 'content', null, 'input-large', 'What number should Twilio dial?', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_SMS.toLowerCase()) {
            html += createTextarea(domId + '-' + externalId, TWILIO_COMPONENT_SMS, 'content', null, 'input-xxlarge', 'What\'s the message?', 3, content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_RECORD.toLowerCase()) {
            html += '<p><i>Perform call recording</i></p>';
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_RECORD, 'content', null, '', '', 'hidden');
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_PLAY.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_PLAY, 'content', null, 'input-xxlarge', 'Link to media file', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_SECONDARY_ENQUEUE.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'content', null, 'input-large', 'Name of queue', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_SECONDARY_HANGUP.toLowerCase()) {
            html += '<p><i>Hangup the call</i></p>';
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_SECONDARY_HANGUP, 'content', null, '', '', 'hidden');
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_SECONDARY_LEAVE.toLowerCase()) {
            html += '<p><i>Leave the queue</i></p>';
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_SECONDARY_LEAVE, 'content', null, '', '', 'hidden');
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_SECONDARY_PAUSE.toLowerCase()) {
            html += '<p><i>Pause</i></p>';
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_SECONDARY_PAUSE, 'content', null, '', '', 'hidden');
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REDIRECT.toLowerCase()) {
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_SECONDARY_REDIRECT, 'content', null, 'input-xxlarge', 'Location to redirect', 'text', content);
        } else if (componentType.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REJECT.toLowerCase()) {
            html += '<p><i>Reject the call</i></p>';
            html += createInput(domId + '-' + externalId, TWILIO_COMPONENT_SECONDARY_REJECT, 'content', null, '', '', 'hidden');
        } else {
            alert('Page component type not supported!');
        }

        // Close out the component implementation shell
        html += '</div>';

        // Close out the component shell
        html += '</div>';

        return html;
    };

    var makeSortable = function (domId, sortableId) {
        $('#' + domId + '-' + sortableId).sortable({
            revert: false,
            dropOnEmpty: true,
            placeholder: 'page-placeholder',
            stop: function (event, ui) {
                var currentCounter = 0;
                var childWidth = 0;
                var addingElement = true;
                var componentHtml = '';
                var componentType = null;
                var containerType = null;
                var inputs = null;
                var specificDialog = '';

                // Check the element to make sure this operation is possible
                //if (ui.item.hasClass('manywho-page-component') == true) {
                //    // Check to make sure this container isn't a group - you can only add containers to a 'group' container
                //    if ($(this).hasClass('page-sortable-group') == true) {
                //        // Blank out the draggable
                //        ui.item.replaceWith('');

                //        // Tell the user what they did wrong
                //        alert('You can only add containers to a group!');

                //        // Tell this code block not to add the element, but to make sure all of the sizing is OK
                //        addingElement = false;

                //        // Return out of this child loop
                //        return;
                //    }
                //}

                // Make sure the validation rules are OK and we're not mixing components and containers
                // Also - make sure this component hasn't already been rendered (which will be the case for re-ordering)
                if (addingElement == true &&
                    ui.item.hasClass('rendered') == false) {
                    // Create a counter so we have a unique identifier for this sortable
                    currentCounter = getCounter();

                    // Check to see if the item being dragged is a container
                    if (ui.item.hasClass('manywho-page-container') == true) {
                        var elementId = null;

                        // Find out the type of container we're creating
                        if (ui.item.hasClass(TWILIO_CONTAINER_DIAL) == true) {
                            containerType = TWILIO_CONTAINER_DIAL;
                        } else if (ui.item.hasClass(TWILIO_CONTAINER_GATHER) == true) {
                            containerType = TWILIO_CONTAINER_GATHER;
                        }

                        // Create the element id
                        elementId = domId + '-page-sortable-' + currentCounter;

                        // Replace the droppable with the generated field placeholder
                        ui.item.replaceWith('<div class="manywho-page-container" id="' + elementId + '"></div>');

                        // Show the page object dialog
                        showPageObjectDialog(domId, containerType, elementId, true, null, function () {
                            // Replace the content of the dragged item with the correct sortable
                            updatePageContainer(domId, elementId, null, containerType);
                        });
                    } else {
                        var elementId = null;

                        // Find out the type of component we're creating
                        if (ui.item.hasClass(TWILIO_COMPONENT_SAY) == true) {
                            componentType = TWILIO_COMPONENT_SAY;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_PLAY) == true) {
                            componentType = TWILIO_COMPONENT_PLAY;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_RECORD) == true) {
                            componentType = TWILIO_COMPONENT_RECORD;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_SMS) == true) {
                            componentType = TWILIO_COMPONENT_SMS;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_DIAL_NUMBER) == true) {
                            componentType = TWILIO_COMPONENT_DIAL_NUMBER;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_DIAL_SIP) == true) {
                            componentType = TWILIO_COMPONENT_DIAL_SIP;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_DIAL_CLIENT) == true) {
                            componentType = TWILIO_COMPONENT_DIAL_CLIENT;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_DIAL_CONFERENCE) == true) {
                            componentType = TWILIO_COMPONENT_DIAL_CONFERENCE;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_DIAL_QUEUE) == true) {
                            componentType = TWILIO_COMPONENT_DIAL_QUEUE;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_SECONDARY_ENQUEUE) == true) {
                            componentType = TWILIO_COMPONENT_SECONDARY_ENQUEUE;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_SECONDARY_HANGUP) == true) {
                            componentType = TWILIO_COMPONENT_SECONDARY_HANGUP;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_SECONDARY_LEAVE) == true) {
                            componentType = TWILIO_COMPONENT_SECONDARY_LEAVE;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_SECONDARY_PAUSE) == true) {
                            componentType = TWILIO_COMPONENT_SECONDARY_PAUSE;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_SECONDARY_REDIRECT) == true) {
                            componentType = TWILIO_COMPONENT_SECONDARY_REDIRECT;
                        } else if (ui.item.hasClass(TWILIO_COMPONENT_SECONDARY_REJECT) == true) {
                            componentType = TWILIO_COMPONENT_SECONDARY_REJECT;
                        }

                        // Create the element id
                        elementId = domId + '-page-component-' + currentCounter;

                        // Replace the droppable with the generated field placeholder
                        ui.item.replaceWith('<div class="manywho-page-component" id="' + elementId + '"></div>');

                        // Show the page object dialog
                        showPageObjectDialog(domId, componentType, elementId, true, null, function () {
                            // We're dragging a component and therefore do not want to make it a sortable
                            updatePageComponent(domId, elementId, null, componentType);
                        });
                    }
                }
            }
        });
    };

    var createPageContainerObjects = function (domId, pageContainerId) {
        var pageContainers = new Array();
        var order = 0;

        // Take the parent container, grab the page sortable child, then grab the children of that that are page containers and iterate
        $('#' + pageContainerId).children('.page-sortable').children('.manywho-page-container').each(function (index, element) {
            var pageContainer = null;
            var pageContainersProperty = null;
            var orderProperty = null;
            var id = null;
            var label = null;
            var containerType = null;

            // Get the id directly from the child element
            id = $(this).attr('id');

            // Grab the page container from the local database
            pageContainer = $('#' + domId + '-page-containers').data(id);

            // Check to make sure the page container is not null - if it is, it's likely the dom has had a fault - but we still want to save
            if (pageContainer != null) {
                // Find the property for the page containers
                for (var a = 0; a < pageContainer.properties.length; a++) {
                    // Check to see if this is the property for page containers
                    if (pageContainer.properties[a].developerName.toLowerCase() == 'pagecontainers') {
                        // We've found the page container property for child page containers
                        pageContainersProperty = pageContainer.properties[a];
                    } else if (pageContainer.properties[a].developerName.toLowerCase() == 'order') {
                        orderProperty = pageContainer.properties[a];
                    }
                }

                // Assign the order property to the order it appears in the UI
                orderProperty.contentValue = '' + order + '';

                // Check to see if this container has any child containers
                if ($(this).children('.page-sortable').children('.manywho-page-container').length > 0) {
                    // Grab the child page containers
                    pageContainersProperty.objectData = createPageContainerObjects(domId, $(this).attr('id'));
                } else {
                    // Add the page containers property, but make it null
                    pageContainersProperty.objectData = null;
                }

                // Add this page container to the list of containers
                pageContainers[pageContainers.length] = pageContainer;

                // Increment the order (this assumes the search returns in the order it's displayed to the user
                order++;
            }
        });

        // If the array is empty, we null it out to keep things clean
        if (pageContainers.length == 0) {
            pageContainers = null;
        }

        return pageContainers;
    };

    var updatePageComponent = function (domId, elementId, externalId, type) {
        // Generate the values and attributes
        var internalId = $('#' + externalId).attr('data-internalid');
        var developerName = $('#' + createInputIdentifier(domId, type, 'developerName')).val();
        var attributes = createPageObjectDialogAttributes(domId, type);

        // Replace the content of the dragged item with the correct sortable
        createPageComponent(domId,
                            elementId,
                            createPageComponentObjectData(type,
                                                          externalId,
                                                          internalId,
                                                          developerName,
                                                          attributes,
                                                          null));
    };

    var updatePageContainer = function (domId, elementId, externalId, type) {
        // Generate the values and attributes
        var internalId = $('#' + externalId).attr('data-internalid');
        var developerName = $('#' + createInputIdentifier(domId, type, 'developerName')).val();
        var attributes = createPageObjectDialogAttributes(domId, type);

        // Replace the content of the dragged item with the correct sortable
        createPageContainer(domId,
                            elementId,
                            null,
                            createPageContainerObjectData(type,
                                                          externalId,
                                                          internalId,
                                                          developerName,
                                                          attributes,
                                                          null));
    };

    var showPageObjectDialog = function (domId, type, elementId, doDelete, pageObject, callback) {
        // Show the dialog as requested
        $('#' + domId + '-dialog-' + type).modal({ backdrop: 'static', show: true });

        // Remove the click event for the button - so we don't have bleeding
        $('#' + domId + '-dialog-' + type + '-buttons-save').off('click');
        $('#' + domId + '-dialog-' + type + '-buttons-cancel').off('click');

        // Assign the values to the dialog based on the page object
        setPageObjectDialog(domId, type, pageObject);

        // Add the click event to the button for the callback
        $('#' + domId + '-dialog-' + type + '-buttons-save').on('click', function () {
            // Perform the callback
            callback.call(this);

            // Hide the dialog
            $('#' + domId + '-dialog-' + type).modal('hide');

            // Clear the dialog
            resetPageObjectDialog(domId, type);
        });

        $('#' + domId + '-dialog-' + type + '-buttons-cancel').on('click', function () {
            // Delete the html if we need to
            if (doDelete == true) {
                $('#' + elementId).remove();
            }

            // Hide the dialog
            $('#' + domId + '-dialog-' + type).modal('hide');

            // Clear the dialog
            resetPageObjectDialog(domId, type);
        });
    };

    var resetPageObjectDialog = function (domId, type) {
        if (type.toLowerCase() == TWILIO_CONTAINER_GATHER.toLowerCase()) {
            resetGatherDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_CONTAINER_DIAL.toLowerCase()) {
            resetDialDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SAY.toLowerCase()) {
            resetSayDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_PLAY.toLowerCase()) {
            resetPlayDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_RECORD.toLowerCase()) {
            resetRecordDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_NUMBER.toLowerCase()) {
            resetDialNumberDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_QUEUE.toLowerCase()) {
            resetDialQueueDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SMS.toLowerCase()) {
            resetSmsDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_SIP.toLowerCase()) {
            resetDialSipDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CLIENT.toLowerCase()) {
            resetDialClientDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CONFERENCE.toLowerCase()) {
            resetDialConferenceDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_ENQUEUE.toLowerCase()) {
            resetSecondaryEnqueueDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_HANGUP.toLowerCase()) {
            resetSecondaryHangupDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_LEAVE.toLowerCase()) {
            resetSecondaryLeaveDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_PAUSE.toLowerCase()) {
            resetSecondaryPauseDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REDIRECT.toLowerCase()) {
            resetSecondaryRedirectDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REJECT.toLowerCase()) {
            resetSecondaryRejectDialogContent(domId);
        }
    };

    var setPageObjectDialog = function (domId, type, pageObject) {
        if (pageObject != null) {
            if (type.toLowerCase() == TWILIO_CONTAINER_GATHER.toLowerCase()) {
                setGatherDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_CONTAINER_DIAL.toLowerCase()) {
                setDialDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SAY.toLowerCase()) {
                setSayDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_PLAY.toLowerCase()) {
                setPlayDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_RECORD.toLowerCase()) {
                setRecordDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_NUMBER.toLowerCase()) {
                setDialNumberDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_QUEUE.toLowerCase()) {
                setDialQueueDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SMS.toLowerCase()) {
                setSmsDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_SIP.toLowerCase()) {
                setDialSipDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CLIENT.toLowerCase()) {
                setDialClientDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CONFERENCE.toLowerCase()) {
                setDialConferenceDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_ENQUEUE.toLowerCase()) {
                setSecondaryEnqueueDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_HANGUP.toLowerCase()) {
                setSecondaryHangupDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_LEAVE.toLowerCase()) {
                setSecondaryLeaveDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_PAUSE.toLowerCase()) {
                setSecondaryPauseDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REDIRECT.toLowerCase()) {
                setSecondaryRedirectDialogContent(domId, pageObject);
            } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REJECT.toLowerCase()) {
                setSecondaryRejectDialogContent(domId, pageObject);
            }
        }
    };

    var createPageObjectDialogAttributes = function (domId, type) {
        var attributes = null;

        if (type.toLowerCase() == TWILIO_CONTAINER_DIAL.toLowerCase()) {
            attributes = createDialDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_CONTAINER_GATHER.toLowerCase()) {
            attributes = createGatherDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SAY.toLowerCase()) {
            attributes = createSayDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CONFERENCE.toLowerCase()) {
            attributes = createDialConferenceDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CLIENT.toLowerCase()) {
            attributes = createDialClientDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_SIP.toLowerCase()) {
            attributes = createDialSipDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_NUMBER.toLowerCase()) {
            attributes = createDialNumberDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_QUEUE.toLowerCase()) {
            attributes = createDialQueueDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SMS.toLowerCase()) {
            attributes = createSmsDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_RECORD.toLowerCase()) {
            attributes = createRecordDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_PLAY.toLowerCase()) {
            attributes = createPlayDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_ENQUEUE.toLowerCase()) {
            attributes = createSecondaryEnqueueDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_HANGUP.toLowerCase()) {
            attributes = createSecondaryHangupDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_LEAVE.toLowerCase()) {
            attributes = createSecondaryLeaveDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_PAUSE.toLowerCase()) {
            attributes = createSecondaryPauseDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REDIRECT.toLowerCase()) {
            attributes = createSecondaryRedirectDialogAttributes(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REJECT.toLowerCase()) {
            attributes = createSecondaryRejectDialogAttributes(domId);
        } else {
            alert('Page object type not supported: ' + type);
        }

        return attributes;
    };

    var generatePageObjectDialog = function (domId, type) {
        var html = '';

        html += '<div id="' + domId + '-dialog-' + type + '" data-width="350" class="modal container hide fade">';
        html += '    <div class="modal-header">';
        html += '        <h3 id="manywho-dialog-title">' + type + '</h3>';
        html += '    </div>';
        html += '    <div id="' + domId + '-dialog-' + type + '-content" style="overflow: auto;" class="modal-body">';

        // Generate the appropriate content based on the type
        if (type.toLowerCase() == TWILIO_CONTAINER_DIAL.toLowerCase()) {
            html += generateDialDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_CONTAINER_GATHER.toLowerCase()) {
            html += generateGatherDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SAY.toLowerCase()) {
            html += generateSayDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CONFERENCE.toLowerCase()) {
            html += generateDialConferenceDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_CLIENT.toLowerCase()) {
            html += generateDialClientDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_SIP.toLowerCase()) {
            html += generateDialSipDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_NUMBER.toLowerCase()) {
            html += generateDialNumberDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_DIAL_QUEUE.toLowerCase()) {
            html += generateDialQueueDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SMS.toLowerCase()) {
            html += generateSmsDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_RECORD.toLowerCase()) {
            html += generateRecordDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_PLAY.toLowerCase()) {
            html += generatePlayDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_ENQUEUE.toLowerCase()) {
            html += generateSecondaryEnqueueDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_HANGUP.toLowerCase()) {
            html += generateSecondaryHangupDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_LEAVE.toLowerCase()) {
            html += generateSecondaryLeaveDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_PAUSE.toLowerCase()) {
            html += generateSecondaryPauseDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REDIRECT.toLowerCase()) {
            html += generateSecondaryRedirectDialogContent(domId);
        } else if (type.toLowerCase() == TWILIO_COMPONENT_SECONDARY_REJECT.toLowerCase()) {
            html += generateSecondaryRejectDialogContent(domId);
        } else {
            alert('Page object type not supported: ' + type);
        }

        html += '    </div>';
        html += '    <div id="' + domId + '-dialog-' + type + '-buttons" class="modal-footer">';
        html += '        <button class="btn btn-primary" id="' + domId + '-dialog-' + type + '-buttons-save" type="button">Save</button>';
        html += '        <button class="btn" id="' + domId + '-dialog-' + type + '-buttons-cancel" type="button">Cancel</button>';
        html += '    </div>';
        html += '</div>';

        return html;
    };

    var generateDialConferenceDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createCheckbox(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'muted', 'Muted');
        html += createSelect(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'beep', 'Beep', ['true', 'false', 'onEnter', 'onExit'], 'true');
        html += createCheckbox(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'startConferenceOnEnter', 'Start Conference On Enter', true);
        html += createCheckbox(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'endConferenceOnExit', 'End Conference On Exit');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitUrl', 'Wait Url', 'input-xlarge', 'Twilio hold music', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitMethod', 'Wait Method', ['POST', 'GET'], 'POST');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'maxParticipants', 'Maximum Participants', 'input-min', '40', 'number');
        html += createSelect(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'record', 'Record', ['do-not-record', 'record-from-answer', 'record-from-ringing']);
        html += createSelect(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'trim', 'Trim', ['trim-silence', 'do-not-trim']);
        html += createInput(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'eventCallbackUrl', 'Event Callback Url', 'input-xlarge', '', 'text');

        return html;
    };
    
    var setDialConferenceDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'developerName')).val(developerName);

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'muted'), getAttributeValue(attributes, 'muted'));
        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'beep'), getAttributeValue(attributes, 'beep'));
        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'startConferenceOnEnter'), getAttributeValue(attributes, 'startConferenceOnEnter'));
        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'endConferenceOnExit'), getAttributeValue(attributes, 'endConferenceOnExit'));

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitUrl')).val(getAttributeValue(attributes, 'waitUrl'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitMethod')).val(getAttributeValue(attributes, 'waitMethod'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'maxParticipants')).val(getAttributeValue(attributes, 'maxParticipants'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'record')).val(getAttributeValue(attributes, 'record'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'trim')).val(getAttributeValue(attributes, 'trim'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'eventCallbackUrl')).val(getAttributeValue(attributes, 'eventCallbackUrl'));
    };

    var resetDialConferenceDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'developerName')).val('');

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'muted'), 'false');
        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'beep'), 'false');
        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'startConferenceOnEnter'), 'false');
        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'endConferenceOnExit'), 'false');

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitUrl')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitMethod')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'maxParticipants')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'record')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'trim')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'eventCallbackUrl')).val('');
    };

    var createDialConferenceDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'muted', convertToBoolean($('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'muted')).val()));
        attributes = updateAttributesObjectData(attributes, 'beep', convertToBoolean($('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'beep')).val()));
        attributes = updateAttributesObjectData(attributes, 'startConferenceOnEnter', convertToBoolean($('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'startConferenceOnEnter')).val()));
        attributes = updateAttributesObjectData(attributes, 'endConferenceOnExit', convertToBoolean($('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'endConferenceOnExit')).val()));
        attributes = updateAttributesObjectData(attributes, 'waitUrl', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitUrl')).val());
        attributes = updateAttributesObjectData(attributes, 'waitMethod', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'waitMethod')).val());
        attributes = updateAttributesObjectData(attributes, 'maxParticipants', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'maxParticipants')).val());
        attributes = updateAttributesObjectData(attributes, 'record', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'record')).val());
        attributes = updateAttributesObjectData(attributes, 'trim', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'trim')).val());
        attributes = updateAttributesObjectData(attributes, 'eventCallbackUrl', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CONFERENCE, 'eventCallbackUrl')).val());

        return attributes;
    };

    var generateDialClientDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'url', 'Url', 'input-xlarge', '', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'method', 'Method', ['POST', 'GET'], 'POST');

        return html;
    };

    var setDialClientDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'url')).val(getAttributeValue(attributes, 'url'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'method')).val(getAttributeValue(attributes, 'method'));
    };

    var resetDialClientDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'url')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'method')).val('');
    };

    var createDialClientDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'url', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'url')).val());
        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_CLIENT, 'method')).val());

        return attributes;
    };

    var generateDialSipDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_DIAL_SIP, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_SIP, 'username', 'Username', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_SIP, 'password', 'Password', 'input-medium', '', 'password');

        return html;
    };

    var setDialSipDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'username')).val(getAttributeValue(attributes, 'username'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'password')).val(getAttributeValue(attributes, 'password'));
    };

    var resetDialSipDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'username')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'password')).val('');
    };

    var createDialSipDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'username', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'username')).val());
        attributes = updateAttributesObjectData(attributes, 'password', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_SIP, 'password')).val());

        return attributes;
    };

    var generateDialNumberDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'sendDigits', 'Send Digits', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'url', 'Url', 'input-xlarge', '', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'method', 'Method', ['POST', 'GET'], 'POST');

        return html;
    };

    var setDialNumberDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'sendDigits')).val(getAttributeValue(attributes, 'sendDigits'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'url')).val(getAttributeValue(attributes, 'url'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'method')).val(getAttributeValue(attributes, 'method'));
    };

    var resetDialNumberDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'sendDigits')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'url')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'method')).val('');
    };

    var createDialNumberDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'sendDigits', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'sendDigits')).val());
        attributes = updateAttributesObjectData(attributes, 'url', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'url')).val());
        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_NUMBER, 'method')).val());

        return attributes;
    };

    var generateSmsDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SMS, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_SMS, 'to', 'To', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_SMS, 'from', 'From', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_SMS, 'action', 'Action', 'input-xlarge', 'Action URL, leave blank for system generated', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_SMS, 'method', 'Method', ['POST', 'GET'], 'POST');
        html += createInput(domId, TWILIO_COMPONENT_SMS, 'statusCallback', 'Status Callback', 'input-xlarge', '', 'text');

        return html;
    };

    var setSmsDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'to')).val(getAttributeValue(attributes, 'to'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'from')).val(getAttributeValue(attributes, 'from'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'action')).val(getAttributeValue(attributes, 'action'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'method')).val(getAttributeValue(attributes, 'method'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'statusCallback')).val(getAttributeValue(attributes, 'statusCallback'));
    };

    var resetSmsDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'to')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'from')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'action')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'method')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'statusCallback')).val('');
    };

    var createSmsDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'to', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'to')).val());
        attributes = updateAttributesObjectData(attributes, 'from', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'from')).val());
        attributes = updateAttributesObjectData(attributes, 'action', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'action')).val());
        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'method')).val());
        attributes = updateAttributesObjectData(attributes, 'statusCallback', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SMS, 'statusCallback')).val());

        return attributes;
    };

    var generateRecordDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_RECORD, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_RECORD, 'action', 'Action', 'input-xlarge', 'Action URL, leave blank for system generated', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_RECORD, 'method', 'Method', ['POST', 'GET'], 'POST');
        html += createInput(domId, TWILIO_COMPONENT_RECORD, 'timeout', 'Timeout', 'input-mini', '5', 'number');
        html += createInput(domId, TWILIO_COMPONENT_RECORD, 'finishOnKey', 'Finish On Key', 'input-mini', '#', 'text');
        html += createInput(domId, TWILIO_COMPONENT_RECORD, 'maxLength', 'Maximum Length', 'input-mini', '3600', 'number');
        html += createCheckbox(domId, TWILIO_COMPONENT_RECORD, 'transcribe', 'Transcribe');
        html += createInput(domId, TWILIO_COMPONENT_RECORD, 'transcribeCallback', 'Transcribe Callback', 'input-xlarge', '', 'text');
        html += createCheckbox(domId, TWILIO_COMPONENT_RECORD, 'playBeep', 'Play Beep');
        html += createSelect(domId, TWILIO_COMPONENT_RECORD, 'trim', 'Trim', ['trim-silence', 'do-not-trim'], 'trim-silence');

        return html;
    };

    var setRecordDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'action')).val(getAttributeValue(attributes, 'action'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'method')).val(getAttributeValue(attributes, 'method'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'timeout')).val(getAttributeValue(attributes, 'timeout'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'finishOnKey')).val(getAttributeValue(attributes, 'finishOnKey'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'maxLength')).val(getAttributeValue(attributes, 'maxLength'));

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'transcribe'), getAttributeValue(attributes, 'transcribe'));

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'transcribeCallback')).val(getAttributeValue(attributes, 'transcribeCallback'));

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'playBeep'), getAttributeValue(attributes, 'playBeep'));

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'trim')).val(getAttributeValue(attributes, 'trim'));
    };

    var resetRecordDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'action')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'method')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'timeout')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'finishOnKey')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'maxLength')).val('');

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'transcribe'), 'false');

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'transcribeCallback')).val('');

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'playBeep'), 'false');

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'trim')).val('');
    };

    var createRecordDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'action', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'action')).val());
        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'method')).val());
        attributes = updateAttributesObjectData(attributes, 'timeout', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'timeout')).val());
        attributes = updateAttributesObjectData(attributes, 'finishOnKey', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'finishOnKey')).val());
        attributes = updateAttributesObjectData(attributes, 'maxLength', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'maxLength')).val());
        attributes = updateAttributesObjectData(attributes, 'transcribe', convertToBoolean($('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'transcribe')).val()));
        attributes = updateAttributesObjectData(attributes, 'transcribeCallback', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'transcribeCallback')).val());
        attributes = updateAttributesObjectData(attributes, 'playBeep', convertToBoolean($('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'playBeep')).val()));
        attributes = updateAttributesObjectData(attributes, 'trim', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_RECORD, 'trim')).val());

        return attributes;
    };

    var generatePlayDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_PLAY, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_PLAY, 'loop', 'Loop', 'input-min', '1', 'number');
        html += createInput(domId, TWILIO_COMPONENT_PLAY, 'digits', 'Digits', 'input-min', 'Number', 'number');

        return html;
    };

    var setPlayDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'loop')).val(getAttributeValue(attributes, 'loop'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'digits')).val(getAttributeValue(attributes, 'digits'));
    };

    var resetPlayDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'loop')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'digits')).val('');
    };

    var createPlayDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'loop', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'loop')).val());
        attributes = updateAttributesObjectData(attributes, 'digits', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_PLAY, 'digits')).val());

        return attributes;
    };

    var generateSecondaryEnqueueDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'action', 'Action', 'input-xlarge', '', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'method', 'Method', ['POST', 'GET'], 'POST');
        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrl', 'Digits', 'input-xlarge', 'http://s3.amazonaws.com/com.twilio.sounds.music/index.xml', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrlMethod', 'Method', ['POST', 'GET'], 'POST');

        return html;
    };

    var setSecondaryEnqueueDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'action')).val(getAttributeValue(attributes, 'action'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'method')).val(getAttributeValue(attributes, 'method'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrl')).val(getAttributeValue(attributes, 'waitUrl'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrlMethod')).val(getAttributeValue(attributes, 'waitUrlMethod'));
    };

    var resetSecondaryEnqueueDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'action')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'method')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrl')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrlMethod')).val('');
    };

    var createSecondaryEnqueueDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'action', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'action')).val());
        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'method')).val());
        attributes = updateAttributesObjectData(attributes, 'waitUrl', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrl')).val());
        attributes = updateAttributesObjectData(attributes, 'waitUrlMethod', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE, 'waitUrlMethod')).val());

        return attributes;
    };

    var generateSecondaryLeaveDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_LEAVE, 'developerName', 'Name', 'input-medium', '', 'text');

        return html;
    };

    var setSecondaryLeaveDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_LEAVE, 'developerName')).val(developerName);
    };

    var resetSecondaryLeaveDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_LEAVE, 'developerName')).val('');
    };

    var createSecondaryLeaveDialogAttributes = function (domId) {
        var attributes = null;

        return attributes;
    };

    var generateSecondaryHangupDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_HANGUP, 'developerName', 'Name', 'input-medium', '', 'text');

        return html;
    };

    var setSecondaryHangupDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_HANGUP, 'developerName')).val(developerName);
    };

    var resetSecondaryHangupDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_HANGUP, 'developerName')).val('');
    };

    var createSecondaryHangupDialogAttributes = function (domId) {
        var attributes = null;

        return attributes;
    };

    var generateSecondaryRedirectDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_REDIRECT, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_SECONDARY_REDIRECT, 'method', 'Method', ['POST', 'GET'], 'POST');

        return html;
    };

    var setSecondaryRedirectDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REDIRECT, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REDIRECT, 'method')).val(getAttributeValue(attributes, 'method'));
    };

    var resetSecondaryRedirectDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REDIRECT, 'method')).val('');
    };

    var createSecondaryRedirectDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REDIRECT, 'method')).val());

        return attributes;
    };

    var generateSecondaryRejectDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_REJECT, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_SECONDARY_REJECT, 'reason', 'Reason', ['rejected', 'busy'], 'rejected');

        return html;
    };

    var setSecondaryRejectDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REJECT, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REJECT, 'reason')).val(getAttributeValue(attributes, 'reason'));
    };

    var resetSecondaryRejectDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REJECT, 'reason')).val('');
    };

    var createSecondaryRejectDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'reason', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_REJECT, 'reason')).val());

        return attributes;
    };

    var generateSecondaryPauseDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_PAUSE, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_COMPONENT_SECONDARY_PAUSE, 'length', 'Length', 'input-min', '1', 'number');

        return html;
    };

    var setSecondaryPauseDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_PAUSE, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_PAUSE, 'length')).val(getAttributeValue(attributes, 'length'));
    };

    var resetSecondaryPauseDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_PAUSE, 'length')).val('');
    };

    var createSecondaryPauseDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'length', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SECONDARY_PAUSE, 'length')).val());

        return attributes;
    };

    var generateDialQueueDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'method', 'Method', ['POST', 'GET'], 'POST');
        html += createInput(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'url', 'Url', 'input-xlarge', 'Url', 'text');

        return html;
    };

    var setDialQueueDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'method')).val(getAttributeValue(attributes, 'method'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'url')).val(getAttributeValue(attributes, 'url'));
    };

    var resetDialQueueDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'method')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'url')).val('');
    };

    var createDialQueueDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'method')).val());
        attributes = updateAttributesObjectData(attributes, 'url', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_DIAL_QUEUE, 'url')).val());

        return attributes;
    };

    var generateSayDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_COMPONENT_SAY, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createSelect(domId, TWILIO_COMPONENT_SAY, 'voice', 'Voice', ['man', 'alice'], 'alice');
        html += createInput(domId, TWILIO_COMPONENT_SAY, 'loop', 'Loop', 'input-min', '1', 'number');
        html += createSelect(domId, TWILIO_COMPONENT_SAY, 'language', 'Language', ['en', 'en-gb', 'es', 'fr', 'de', 'it'], 'en');

        return html;
    };

    var setSayDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'voice')).val(getAttributeValue(attributes, 'voice'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'loop')).val(getAttributeValue(attributes, 'loop'));
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'language')).val(getAttributeValue(attributes, 'language'));
    };

    var resetSayDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'voice')).val('alice');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'loop')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'language')).val('en');
    };

    var createSayDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'voice', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'voice')).val());
        attributes = updateAttributesObjectData(attributes, 'loop', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'loop')).val());
        attributes = updateAttributesObjectData(attributes, 'language', $('#' + createInputIdentifier(domId, TWILIO_COMPONENT_SAY, 'language')).val());

        return attributes;
    };

    var generateDialDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_CONTAINER_DIAL, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_CONTAINER_DIAL, 'action', 'Action', 'input-xlarge', 'Action URL, leave blank for system generated', 'text');
        html += createSelect(domId, TWILIO_CONTAINER_DIAL, 'method', 'Method', ['POST', 'GET'], 'POST');
        html += createInput(domId, TWILIO_CONTAINER_DIAL, 'timeout', 'Timeout', 'input-mini', '5', 'number');
        html += createCheckbox(domId, TWILIO_CONTAINER_DIAL, 'hangupOnStar', 'Hangup On Star');
        html += createInput(domId, TWILIO_CONTAINER_DIAL, 'timeLimit', 'Time Limit', 'input-mini', 'Seconds', 'number');
        html += createInput(domId, TWILIO_CONTAINER_DIAL, 'callerId', 'Caller Id', 'input-medium', 'Valid Phone Number', 'text');
        html += createSelect(domId, TWILIO_CONTAINER_DIAL, 'record', 'Record', ['do-not-record', 'record-from-answer', 'record-from-ringing']);
        html += createSelect(domId, TWILIO_CONTAINER_DIAL, 'trim', 'Trim', ['trim-silence', 'do-not-trim']);

        return html;
    };

    var setDialDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'action')).val(getAttributeValue(attributes, 'action'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'method')).val(getAttributeValue(attributes, 'method'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'timeout')).val(getAttributeValue(attributes, 'timeout'));

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'hangupOnStar'), getAttributeValue(attributes, 'hangupOnStar'));

        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'timeLimit')).val(getAttributeValue(attributes, 'timeLimit'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'callerId')).val(getAttributeValue(attributes, 'callerId'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'record')).val(getAttributeValue(attributes, 'record'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'trim')).val(getAttributeValue(attributes, 'trim'));
    };

    var resetDialDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'action')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'method')).val('POST');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'timeout')).val('');

        assignCheckbox('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'hangupOnStar'), 'false');

        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'timeLimit')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'callerId')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'record')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'trim')).val('');
    };

    var createDialDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'action', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'action')).val());
        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'method')).val());
        attributes = updateAttributesObjectData(attributes, 'timeout', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'timeout')).val());
        attributes = updateAttributesObjectData(attributes, 'hangupOnStar', convertToBoolean($('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'hangupOnStar')).val()));
        attributes = updateAttributesObjectData(attributes, 'timeLimit', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'timeLimit')).val());
        attributes = updateAttributesObjectData(attributes, 'callerId', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'callerId')).val());
        attributes = updateAttributesObjectData(attributes, 'record', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'record')).val());
        attributes = updateAttributesObjectData(attributes, 'trim', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_DIAL, 'trim')).val());

        return attributes;
    };

    var generateGatherDialogContent = function (domId) {
        var html = '';

        html += createInput(domId, TWILIO_CONTAINER_GATHER, 'developerName', 'Name', 'input-medium', '', 'text');
        html += createInput(domId, TWILIO_CONTAINER_GATHER, 'action', 'Action', 'input-xlarge', 'Action URL, leave blank for system generated', 'text');
        html += createSelect(domId, TWILIO_CONTAINER_GATHER, 'method', 'Method', ['POST', 'GET'], 'POST');
        html += createInput(domId, TWILIO_CONTAINER_GATHER, 'timeout', 'Timeout', 'input-mini', '5', 'number');
        html += createInput(domId, TWILIO_CONTAINER_GATHER, 'finishOnKey', 'Finish On Key', 'input-mini', '#', 'text');
        html += createInput(domId, TWILIO_CONTAINER_GATHER, 'numDigits', 'Number of Digits', 'input-mini', 'Unlimited', 'number');

        return html;
    };

    var setGatherDialogContent = function (domId, pageObject) {
        var developerName = null;
        var attributes = null;

        // Get the root values out of the object
        developerName = getPropertyValue(pageObject.properties, 'developerName').contentValue;
        attributes = getPropertyValue(pageObject.properties, 'attributes').objectData;

        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'developerName')).val(developerName);

        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'action')).val(getAttributeValue(attributes, 'action'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'method')).val(getAttributeValue(attributes, 'method'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'timeout')).val(getAttributeValue(attributes, 'timeout'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'finishOnKey')).val(getAttributeValue(attributes, 'finishOnKey'));
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'numDigits')).val(getAttributeValue(attributes, 'numDigits'));
    };

    var resetGatherDialogContent = function (domId) {
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'developerName')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'action')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'method')).val('POST');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'timeout')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'finishOnKey')).val('');
        $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'numDigits')).val('');
    };

    var createGatherDialogAttributes = function (domId) {
        var attributes = null;

        attributes = updateAttributesObjectData(attributes, 'action', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'action')).val());
        attributes = updateAttributesObjectData(attributes, 'method', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'method')).val());
        attributes = updateAttributesObjectData(attributes, 'timeout', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'timeout')).val());
        attributes = updateAttributesObjectData(attributes, 'finishOnKey', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'finishOnKey')).val());
        attributes = updateAttributesObjectData(attributes, 'numDigits', $('#' + createInputIdentifier(domId, TWILIO_CONTAINER_GATHER, 'numDigits')).val());

        return attributes;
    };

    var createInput = function (domId, twimlName, fieldName, label, css, hint, type, content, addRow) {
        var html = '';
        var id = null;

        // Create the identifier for the input
        id = createInputIdentifier(domId, twimlName, fieldName);

        if (addRow != false) {
            // Create the input scaffolding
            html += '<div class="row-fluid">';
        }

        if (label != null) {
            html += '<label for="' + id + '"><span class="text-info manywho-field-label">' + label + '</span></label>';
        }

        html += '<input type="' + type + '" id="' + id + '" value="' + handleNullString(content) + '" placeholder="' + hint + '" class="manywho-runtime-inputbox-field ' + css + '" />';

        if (addRow != false) {
            html += '</div>';
        }

        return html;
    };

    var createTextarea = function (domId, twimlName, fieldName, label, css, hint, rows, content) {
        var html = '';
        var id = null;

        // Create the identifier for the input
        id = createInputIdentifier(domId, twimlName, fieldName);

        // Create the input scaffolding
        html += '<div class="row-fluid">';

        if (label != null) {
            html += '<label for="' + id + '"><span class="text-info manywho-field-label">' + label + '</span></label>';
        }

        html += '<textarea id="' + id + '" placeholder="' + hint + '" class="manywho-runtime-inputbox-field ' + css + '">' + handleNullString(content) + '</textarea>';
        html += '</div>';

        return html;
    };

    var createCheckbox = function (domId, twimlName, fieldName, label) {
        var html = '';
        var id = null;

        // Create the identifier for the input
        id = createInputIdentifier(domId, twimlName, fieldName);

        // Create the input scaffolding
        html += '<div class="row-fluid">';

        if (label != null) {
            html += '<label for="' + id + '">';
        }

        html += '<input type="checkbox" id="' + id + '" /> ';

        if (label != null) {
            html += '<span class="text-info manywho-field-label">' + label + '</span>';
            html += '</label>';
        }

        html += '</div>';

        return html;
    };

    var createSelect = function (domId, twimlName, fieldName, label, values, defaultValue) {
        var html = '';
        var id = null;

        // Create the identifier for the input
        id = createInputIdentifier(domId, twimlName, fieldName);

        // Create the input scaffolding
        html += '<div class="row-fluid">';

        if (label != null) {
            html += '<label for="' + id + '"><span class="text-info manywho-field-label">' + label + '</span></label>';
        }

        html += '<select id="' + id + '">';
        html += '<option value="">-- select --</option>';

        // Create the options from the values
        for (var i = 0; i < values.length; i++) {
            var selected = '';

            if (defaultValue != null &&
                defaultValue.toLowerCase() == values[i].toLowerCase()) {
                selected = ' selected';
            }

            // Generation the option and append to the html
            html += '<option' + selected + ' value="' + values[i] + '">' + values[i] + '</option>';
        }

        html += '</select>';
        html += '</div>';

        return html;
    };

    var assignCheckbox = function (elementId, value) {
        value = handleNullString(value);

        if (value.toLowerCase() == 'true') {
            $(elementId).prop('checked', true);
        } else {
            $(elementId).prop('checked', false);
        }
    };

    var createInputIdentifier = function (domId, twimlName, fieldName) {
        // Make the twiml name lowercase to make life easier
        twimlName = twimlName.toLowerCase();

        return domId + '-' + twimlName + '-' + fieldName;
    };

    var createDraggable = function (domId, component, type) {
        $('#' + domId + '-' + type + '-' + component + '-draggable').draggable({
            connectToSortable: '.page-sortable',
            helper: 'clone',
            scroll: true, // Scroll the page if we hit the edge
            scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
            scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
        });
    };

    var getAttributeValue = function (attributes, name) {
        var key = null;
        var value = null;

        // Check to make sure attributes have been provided
        if (attributes != null &&
            attributes.length > 0) {
            // Go through the list of attribute objects to find the one we're looking for
            for (var i = 0; i < attributes.length; i++) {
                // Get the key value from the properties
                key = getPropertyValue(attributes[i].properties, 'key').contentValue;

                // Check to see if this is the right one
                if (key.toLowerCase() == name.toLowerCase()) {
                    // Now get the property value for the attribute
                    value = getPropertyValue(attributes[i].properties, 'contentvalue').contentValue;
                    break;
                }
            }
        }

        return value;
    };

    var getPropertyValue = function (properties, developerName) {
        var value = null;

        // Create a new value object no matter what
        value = new Object();
        value.contentValue = null;
        value.objectData = null;

        // Check to make sure we do in fact have properties
        if (properties != null &&
            properties.length > 0) {
            // Go through each of the properties to find the one we need
            for (var i = 0; i < properties.length; i++) {
                if (properties[i].developerName.toLowerCase() == developerName.toLowerCase()) {
                    // We have our value, break out of the loop
                    value.contentValue = handleNullString(properties[i].contentValue);
                    value.objectData = properties[i].objectData;

                    break;
                }
            }
        }

        return value;
    };

    var createPageContainerObjectData = function (containerType, externalId, internalId, developerName, attributes, pageContainers) {
        var pageContainer = null;

        pageContainer = new Object();
        pageContainer.properties = new Array();
        pageContainer.developerName = 'pagecontainer';

        if (externalId == null ||
            externalId.trim().length == 0) {
            pageContainer.externalId = ManyWhoUtils.getGuid();
        } else {
            pageContainer.externalId = externalId;
        }

        // Create the properties
        pageContainer.properties[pageContainer.properties.length] = createProperty('id', internalId, null);
        pageContainer.properties[pageContainer.properties.length] = createProperty('developerName', developerName, null);
        pageContainer.properties[pageContainer.properties.length] = createProperty('containerType', containerType, null);
        pageContainer.properties[pageContainer.properties.length] = createProperty('attributes', null, attributes);
        pageContainer.properties[pageContainer.properties.length] = createProperty('pagecontainers', null, pageContainers);
        pageContainer.properties[pageContainer.properties.length] = createProperty('order', null, null);

        return pageContainer;
    }

    var createPageComponentObjectData = function (componentType, externalId, internalId, developerName, attributes, content, pageContainerDeveloperName) {
        var pageComponent = null;

        pageComponent = new Object();
        pageComponent.properties = new Array();
        pageComponent.developerName = 'pagecomponent';

        if (externalId == null ||
            externalId.trim().length == 0) {
            pageComponent.externalId = ManyWhoUtils.getGuid();
        } else {
            pageComponent.externalId = externalId;
        }

        pageComponent.properties[pageComponent.properties.length] = createProperty('id', internalId, null);
        pageComponent.properties[pageComponent.properties.length] = createProperty('developerName', developerName, null);
        pageComponent.properties[pageComponent.properties.length] = createProperty('componentType', componentType, null);
        pageComponent.properties[pageComponent.properties.length] = createProperty('attributes', null, attributes);
        pageComponent.properties[pageComponent.properties.length] = createProperty('content', content, null);
        pageComponent.properties[pageComponent.properties.length] = createProperty('order', null, null);
        pageComponent.properties[pageComponent.properties.length] = createProperty('pagecontainerdevelopername', handleNullString(pageContainerDeveloperName), null);

        return pageComponent;
    }

    var updateAttributesObjectData = function (attributes, key, value) {
        var attribute = null;

        // Check to see if we have an attributes object - if not, create one
        if (attributes == null) {
            attributes = new Array();
        }

        // Create an new attribute object
        attribute = new Object();
        attribute.developerName = 'attribute';
        attribute.externalId = ManyWhoUtils.getGuid();

        // Add the attribute to the list of properties in this object
        attribute.properties = new Array();
        attribute.properties[attribute.properties.length] = createProperty('key', key, null);
        attribute.properties[attribute.properties.length] = createProperty('contentvalue', value, null);

        // Add this to the list of attributes
        attributes[attributes.length] = attribute;

        // Return the object so we can re-use it
        return attributes;
    };

    var createProperty = function (developerName, contentValue, objectData) {
        var property = new Object();

        property.developerName = developerName;
        property.contentValue = contentValue;
        property.objectData = objectData;

        return property;
    };

    var handleNullString = function (value) {
        // If we have a developer name, we add that
        if (value == null) {
            value = '';
        }

        return value;
    };

    var convertToBoolean = function (value) {
        if (value != null &&
            value.trim().toLowerCase() == 'on') {
            value = "true";
        } else {
            value = "false";
        }

        return value;
    };

    // Publicly allowed methods
    var methods = {
        init: function (options) {
            var panel = '';
            var html = '';
            var page = null;
            var domId = $(this).attr('id');
            var pageEditorHeight = null;

            var opts = $.extend({}, $.fn.manywhoFormEditor.defaults, options);

            // The on page databases to store the containers and components for the page element
            html += '<div id="' + domId + '-page-components" style="display: none;"></div>';
            html += '<div id="' + domId + '-page-containers" style="display: none;"></div>';
            html += '<div id="' + domId + '-page-element" style="display: none;"></div>';
            html += '<div id="' + domId + '-page-settings" style="display: none;"></div>';

            // Generate the dialogs for all of the elements
            html += generatePageObjectDialog(domId, TWILIO_CONTAINER_DIAL);
            html += generatePageObjectDialog(domId, TWILIO_CONTAINER_GATHER);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SAY);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_DIAL_CONFERENCE);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_DIAL_CLIENT);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_DIAL_SIP);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_DIAL_NUMBER);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_DIAL_QUEUE);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SMS);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_RECORD);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_PLAY);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SECONDARY_ENQUEUE);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SECONDARY_HANGUP);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SECONDARY_LEAVE);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SECONDARY_PAUSE);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SECONDARY_REDIRECT);
            html += generatePageObjectDialog(domId, TWILIO_COMPONENT_SECONDARY_REJECT);

            html += '    <div class="row-fluid">';
            html += '        <table width="100%"><tr><td id="' + domId + '-page-builder-toolbar" width="10%" valign="top">';

            html += '        <div>';
            html += '            <h5>Container Verbs</h5>';
            html += '            <div id="' + domId + '-' + TWILIO_CONTAINER_DIAL + '-container-draggable" class="btn btn-mini manywho-page-container ' + TWILIO_CONTAINER_DIAL + '">Dial</div>';
            html += '            <div id="' + domId + '-' + TWILIO_CONTAINER_GATHER + '-container-draggable" class="btn btn-mini manywho-page-container ' + TWILIO_CONTAINER_GATHER + '">Gather</div>';
            html += '        </div>';

            html += '        <div>';
            html += '            <h5>Primary Verbs</h5>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SAY + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SAY + '">Say</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_PLAY + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_PLAY + '">Play</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_RECORD + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_RECORD + '">Record</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SMS + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SMS + '">Sms</div>';
            html += '        </div>';

            html += '        <div>';
            html += '            <h5>Secondary Verbs</h5>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SECONDARY_ENQUEUE + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SECONDARY_ENQUEUE + '">Enqueue</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SECONDARY_HANGUP + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SECONDARY_HANGUP + '">Hangup</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SECONDARY_LEAVE + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SECONDARY_LEAVE + '">Leave</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SECONDARY_PAUSE + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SECONDARY_PAUSE + '">Pause</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SECONDARY_REDIRECT + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SECONDARY_REDIRECT + '">Redirect</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_SECONDARY_REJECT + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_SECONDARY_REJECT + '">Reject</div>';
            html += '        </div>';

            html += '        <div>';
            html += '            <h5>Dial Verbs</h5>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_DIAL_CLIENT + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_DIAL_CLIENT + '">Dial Client</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_DIAL_CONFERENCE + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_DIAL_CONFERENCE + '">Dial Conference</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_DIAL_NUMBER + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_DIAL_NUMBER + '">Dial Number</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_DIAL_QUEUE + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_DIAL_QUEUE + '">Dial Queue</div>';
            html += '            <div id="' + domId + '-' + TWILIO_COMPONENT_DIAL_SIP + '-component-draggable" class="btn btn-mini manywho-page-component ' + TWILIO_COMPONENT_DIAL_SIP + '">Dial Sip</div>';
            html += '        </div>';

            html += '        </td>';
            html += '        <td width="90%" valign="top">';

            html += '            <div class="row-fluid">';
            html += '                <div class="span1"><img src="http://status.twilio.com/images/logo.png" height="48" width="48" alt="Page Layout" style="padding-bottom: 10px;" /></div>';
            html += '                <div class="span11">Use the editor below to build your TwiML. Simply drag the elements from the left and drop them on the right.</div>';
            html += '            </div>';

            html += '            <div id="' + domId + '-page-builder" class="page-builder">';
            html += '                <div class="manywho-page-container-controls">';
            html += '                <div style="float:left;"><i class="icon-list-alt icon-white" id="' + domId + '-page-element-edit"></i>&nbsp;</div>';

            html += '                <div style="float:left;">' + createInput(domId, 'name', 'name', null, 'input-medium', 'Enter the TwiML page name', 'text', null, false) + '&nbsp;</div>';

            html += '                <span id="' + domId + '-page-builder-valuestomap"></span>';

            html += '            </div>';

            html += '            <div id="' + domId + '-page-sortable-0" class="page-sortable page-sortable-vertical page-sortable-' + ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW + '">';
            html += '            </div>';

            html += '        </td></tr></table>';
            html += '    </div>';

            // Print the scaffolding into the dom
            $(this).html(html);

            // Generate the model dialogs
            $('#' + domId + '-dialog-' + TWILIO_CONTAINER_DIAL).modalmanager();
            $('#' + domId + '-dialog-' + TWILIO_CONTAINER_GATHER).modalmanager();
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SAY).modalmanager();
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_CONFERENCE);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_CLIENT);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_SIP);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_NUMBER);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_QUEUE);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SMS);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_RECORD);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_PLAY);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_ENQUEUE);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_HANGUP);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_LEAVE);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_PAUSE);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_REDIRECT);
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_REJECT);

            // Hide the dialogs
            $('#' + domId + '-dialog-' + TWILIO_CONTAINER_DIAL).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_CONTAINER_GATHER).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SAY).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_CONFERENCE).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_CLIENT).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_SIP).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_NUMBER).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_DIAL_QUEUE).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SMS).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_RECORD).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_PLAY).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_ENQUEUE).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_HANGUP).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_LEAVE).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_PAUSE).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_REDIRECT).modal('hide');
            $('#' + domId + '-dialog-' + TWILIO_COMPONENT_SECONDARY_REJECT).modal('hide');

            // Grab the height of the parent container so we can adjust the editor accordingly
            pageEditorHeight = $(this).height() - 30;

            // Apply the CSS directly to the page editor
            $('#' + domId + '-page-builder').css('min-height', pageEditorHeight + 'px');
            $('#' + domId + '-page-sortable-0').css('min-height', pageEditorHeight + 'px');

            $('#' + domId + '-page-element-edit').click(function (event) {
                var inputs = null;
                var page = null;

                // Wrap the page containers in an array
                page = [$('#' + domId + '-page-element').data('page')];

                inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                inputs = ManyWhoSharedServices.createInput(inputs, 'PAGE_LAYOUT', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, page, 'PageElement');

                // Open the dialog for creating a new form field
                ManyWhoSharedServices.showSubConfigDialog(250, 175, 'PAGEELEMENTCONTAINER', domId, page.externalId, null, inputs, false, pageElementContainerOkCallback, true);
            });

            // Make all of our test sortables sortable!
            makeSortable(domId, 'page-sortable-0');

            // Make everything draggable
            createDraggable(domId, 'container', TWILIO_CONTAINER_DIAL);
            createDraggable(domId, 'container', TWILIO_CONTAINER_GATHER);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SAY);
            createDraggable(domId, 'component', TWILIO_COMPONENT_PLAY);
            createDraggable(domId, 'component', TWILIO_COMPONENT_RECORD);
            createDraggable(domId, 'component', TWILIO_COMPONENT_DIAL_CONFERENCE);
            createDraggable(domId, 'component', TWILIO_COMPONENT_DIAL_CLIENT);
            createDraggable(domId, 'component', TWILIO_COMPONENT_DIAL_SIP);
            createDraggable(domId, 'component', TWILIO_COMPONENT_DIAL_NUMBER);
            createDraggable(domId, 'component', TWILIO_COMPONENT_DIAL_QUEUE);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SMS);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SECONDARY_ENQUEUE);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SECONDARY_HANGUP);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SECONDARY_LEAVE);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SECONDARY_PAUSE);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SECONDARY_REDIRECT);
            createDraggable(domId, 'component', TWILIO_COMPONENT_SECONDARY_REJECT);

            // Create an empty page object for new pages
            page = new Object();
            page.properties = new Array();

            // Make sure we tell the service the type of element we're saving back
            page.developerName = 'pageelement';

            // Create the properties
            page.properties[page.properties.length] = createProperty(domId, 'pageconditions', null, null);
            page.properties[page.properties.length] = createProperty(domId, 'tags', null, null);
            page.properties[page.properties.length] = createProperty(domId, 'stopconditionsonfirsttrue', 'false', null);
            page.properties[page.properties.length] = createProperty(domId, 'id', null, null);
            page.properties[page.properties.length] = createProperty(domId, 'label', null, null);
            page.properties[page.properties.length] = createProperty(domId, 'elementtype', ManyWhoConstants.UI_ELEMENT_TYPE_IMPLEMENTATION_PAGE_LAYOUT, null);
            page.properties[page.properties.length] = createProperty(domId, 'developername', 'My Form', null);
            page.properties[page.properties.length] = createProperty(domId, 'developersummary', null, null);
            page.properties[page.properties.length] = createProperty(domId, 'pagecontainers', null, null);
            page.properties[page.properties.length] = createProperty(domId, 'pagecomponents', null, null);

            // Store the page in the dom
            $('#' + domId + '-page-element').data('page', page);

            $('div').disableSelection();
        },
        validate: function () {
            var failureResult = new Object();

            failureResult.fields = null;
            failureResult.hasFailures = false;

            return failureResult;
        },
        getValue: function () {
            var domId = $(this).attr('id');
            var pageElement = null;
            var pageComponents = new Array();
            var pageContainers = new Array();
            var pageComponentsProperty = null;
            var pageContainersProperty = null;

            // Create the shell of the object
            pageElement = $('#' + domId + '-page-element').data('page');

            // Get the page container and component properties out as we're going to overwrite their contents
            for (var a = 0; a < pageElement.properties.length; a++) {
                if (pageElement.properties[a].developerName.toLowerCase() == 'pagecontainers') {
                    pageContainersProperty = pageElement.properties[a];
                } else if (pageElement.properties[a].developerName.toLowerCase() == 'pagecomponents') {
                    pageComponentsProperty = pageElement.properties[a];
                } else if (pageElement.properties[a].developerName.toLowerCase() == 'developername') {
                    pageElement.properties[a].contentValue = $('#' + createInputIdentifier(domId, 'name', 'name')).val();
                }
            }

            // Start by grabbing the page containers for the root page element - this will give us our base object for the page element also
            pageContainersProperty.objectData = createPageContainerObjects(domId, domId + '-page-builder');

            // Go through each of the component sortable areas
            $('#' + domId + '-page-builder').find('.page-sortable').each(function (index, element) {
                var pageComponentOrder = 0;
                var pageContainerDeveloperName = null;

                // Grab the parent page container as we'll need that for the developer name
                pageContainerDeveloperName = $(this).attr('data-developername');

                // Now that we have a sortable, got through the children that are components
                $(this).children('.manywho-page-component').each(function (index, element) {
                    var pageComponent = null;
                    var orderProperty = null;
                    var pageContainerDeveloperNameProperty = null;
                    var componentType = null;
                    var externalId = null;

                    // Grab the component object from our database
                    pageComponent = $('#' + domId + '-page-components').data($(this).attr('id'));
                    componentType = $(this).attr('data-componenttype');
                    externalId = $(this).attr('id');

                    // Check to make sure the component isn't null
                    if (pageComponent != null) {
                        // Find the order property for the page component
                        for (var a = 0; a < pageComponent.properties.length; a++) {
                            // Check to see if this is the property for order
                            if (pageComponent.properties[a].developerName.toLowerCase() == 'order') {
                                orderProperty = pageComponent.properties[a];
                            } else if (pageComponent.properties[a].developerName.toLowerCase() == 'pagecontainerdevelopername') {
                                pageContainerDeveloperNameProperty = pageComponent.properties[a];
                            } else if (pageComponent.properties[a].developerName.toLowerCase() == 'content') {
                                contentProperty = pageComponent.properties[a];
                            }
                        }

                        // We need to get the content for this component from the page
                        contentProperty.contentValue = $('#' + createInputIdentifier(domId + '-' + externalId, componentType, 'content')).val();

                        // Assign the page container developer name
                        pageContainerDeveloperNameProperty.contentValue = pageContainerDeveloperName;

                        // Assign the order to how is appears in the container
                        orderProperty.contentValue = '' + pageComponentOrder + '';

                        // Add each page component object to our array
                        pageComponents[pageComponents.length] = pageComponent;

                        // Increment the order of the component
                        pageComponentOrder++;
                    }
                });
            });

            // Before we finally assign the components, we check to see if the user selected a storage value
            if ($('#' + domId + '-page-builder-valuestomap-values').val() != null &&
                $('#' + domId + '-page-builder-valuestomap-values').val().trim().length > 0) {
                var boundPageComponent = null;

                // Create an new value element id object
                valueElementId = new Object();
                valueElementId.developerName = 'sharedelementid';
                valueElementId.externalId = $('#' + domId + '-page-builder-valuestomap-values').val();
                valueElementId.properties = new Array();
                valueElementId.properties[valueElementId.properties.length] = createProperty('id', $('#' + domId + '-page-builder-valuestomap-values').val(), null);

                // Create the page component and add it to the list
                boundPageComponent = createPageComponentObjectData(TWILIO_RESPONSE_DEVELOPER_NAME, ManyWhoUtils.getGuid(), null, TWILIO_RESPONSE_DEVELOPER_NAME, null, null, TWILIO_CONTAINER_TYPE);
                boundPageComponent.properties[boundPageComponent.properties.length] = createProperty('valuebindingsharedelement', null, [valueElementId]);

                // Add the component to our page components
                pageComponents[pageComponents.length] = boundPageComponent;
            }

            // Now add the page components to our page element
            pageComponentsProperty.objectData = pageComponents;

            // Return the page wrapped in an array so it's recognized by the form runtime as an object data value
            return [pageElement];
        },
        setValue: function (objectData) {
            var domId = $(this).attr('id');
            var page = null;
            var currentCounter = 0;
            var parentContainerId = null;
            var inputs = null;

            // Assign the parent container to the page
            parentContainerId = domId + '-page-builder';

            // Check to see if the page object api is not null
            if (objectData != null &&
                objectData.length > 0) {
                // Grab the page object from the object data
                page = objectData[0];

                // Check to see if the page object api has any properties
                if (page.properties != null &&
                    page.properties.length > 0) {
                    var pageComponents = null;
                    var pageContainer = null;
                    var pageContainers = null;

                    // Go through each of the page object api properties and apply them appropriately
                    for (var a = 0; a < page.properties.length; a++) {
                        // Check to see if we're dealing with the page containers property
                        if (page.properties[a].developerName.toLowerCase() == 'pagecontainers') {
                            // Grab the page containers from the page object api
                            pageContainers = page.properties[a].objectData;
                        } else if (page.properties[a].developerName.toLowerCase() == 'pagecomponents') {
                            // Grab the page components from the page object api
                            pageComponents = page.properties[a].objectData;
                        } else if (page.properties[a].developerName.toLowerCase() == 'label') {
                            $('#' + domId + '-page-element-label').html(page.properties[a].contentValue);
                        } else if (page.properties[a].developerName.toLowerCase() == 'id') {
                            $('#' + domId + '-page-element-id').val(page.properties[a].contentValue);
                        } else if (page.properties[a].developerName.toLowerCase() == 'developername') {
                            $('#' + domId + '-page-element-developername').val(page.properties[a].contentValue);
                            $('#' + createInputIdentifier(domId, 'name', 'name')).val(handleNullString(page.properties[a].contentValue));
                        } else if (page.properties[a].developerName.toLowerCase() == 'developersummary') {
                            $('#' + domId + '-page-element-developersummary').val(page.properties[a].contentValue);
                        }
                    }

                    if (pageContainers == null ||
                        pageContainers.length == 0) {
                        // We create the base twiml container to hold the twiml data
                        pageContainer = createPageContainerObjectData(TWILIO_CONTAINER_TYPE, ManyWhoUtils.getGuid(), null, TWILIO_CONTAINER_TYPE, null, null);

                        // Now apply it to the page
                        createPageContainer(domId, null, parentContainerId, pageContainer);
                    } else {
                        // Create the page containers for the page element
                        createPageContainers(domId, parentContainerId, pageContainers);

                        // Create the page components - this method handles sorting and parent placement
                        createPageComponents(domId, pageComponents);
                    }
                }

                // If the shared element dropdown has not been created, create it now
                if ($('#' + domId + '-page-builder-valuestomap-values').length == 0) {
                    createSharedElementsDropDown(domId + '-page-builder-valuestomap', null);
                }

                // Store the page in the dom
                $('#' + domId + '-page-element').data('page', page);
            }
        }
    };

    $.fn.manywhoFormEditor = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoFormEditor');
        }
    };

    // Option default values
    $.fn.manywhoFormEditor.defaults = { isTypeTemplate: false, isButtonMode: false, outcomes: null }

})(jQuery);
