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

    var PAGE_CONTAINER_DIALOG_HEIGHT = 200;
    var PAGE_CONTAINER_DIALOG_WIDTH = 175;
    var PAGE_COMPONENT_DIALOG_HEIGHT = 450;
    var PAGE_COMPONENT_DIALOG_WIDTH = 250;
    var PAGE_ELEMENT_CONTAINER_DIALOG_HEIGHT = 250;
    var PAGE_ELEMENT_CONTAINER_DIALOG_WIDTH = 175;

    var getCounter = function () {
        return counter++;
    };

    var pageComponentOkCallback = function (domId, elementId, formElementId, doDelete, outputValues) {
        var pageComponent = null;

        // Get the page component object back from the response
        pageComponent = ManyWhoUtils.getOutcomeValue(outputValues, 'PageComponent', null);

        // Get the outcome out so we know what to do with the layout
        outcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);

        if (outcome.toLowerCase() == 'delete') {
            // The user is explicitly telling us to delete the page container
            $('#' + elementId).remove();
        } else if (outcome.toLowerCase() == 'cancel' &&
                   doDelete == true) {
            // If the user is canceling and we are doing the delete, remove the element from the dom
            $('#' + elementId).remove();
        } else {
            // Create the page component from the response
            createPageComponent(domId, elementId, pageComponent[0], false);
        }
    };

    var getBufferValue = function () {
        var buffer = 10;

        if ($('body').height() > $(window).height()) {
            buffer = 20;
        }

        return buffer;
    };

    var pageContainerOkCallback = function (domId, elementId, formElementId, doDelete, outputValues) {
        var pageContainerId = null;
        var pageContainer = null;
        var outcome = null;

        // Get the page container object back from the response
        pageContainer = ManyWhoUtils.getOutcomeValue(outputValues, 'PageContainer', null);
        pageContainerId = ManyWhoUtils.getOutcomeValue(outputValues, 'PageContainer', 'Id');

        // Get the outcome out so we know what to do with the layout
        outcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);

        if (outcome.toLowerCase() == 'delete') {
            var orientLayout = false;
            var parentId = null;

            // If the parent is a horizontal container, we need to re-orient the columns
            if ($('#' + elementId).parent().hasClass('page-sortable-horizontal') == true) {
                orientLayout = true;
                parentId = $('#' + elementId).parent().attr('id');
            }

            // The user is explicitly telling us to delete the page container
            $('#' + elementId).remove();

            if (orientLayout == true) {
                orientHorizontalLayout('#' + parentId, getBufferValue());
            }
        } else if (outcome.toLowerCase() == 'cancel') {
            if (doDelete == true) {
                var childId = null;
                var orientLayout = false;
                var parentId = null;

                if (elementId != null &&
                    elementId.trim().length > 0) {
                    childId = elementId;
                } else {
                    childId = pageContainerId;
                }

                // If the parent is a horizontal container, we need to re-orient the columns
                if ($('#' + childId).parent().hasClass('page-sortable-horizontal') == true) {
                    orientLayout = true;
                    parentId = $('#' + childId).parent().attr('id');
                }

                // Remove the element
                $('#' + childId).remove();

                if (orientLayout == true) {
                    orientHorizontalLayout('#' + parentId, getBufferValue());
                }
            }
        } else {
            // Create the page container from the response
            createPageContainer(domId, elementId, null, pageContainer[0], false);

            // If the parent is a horizontal container, we need to re-orient the columns
            if ($('#' + pageContainer[0].externalId).parent().hasClass('page-sortable-horizontal') == true) {
                orientHorizontalLayout('#' + $('#' + pageContainer[0].externalId).parent().attr('id'), getBufferValue());
            }
        }
    };

    var pageElementContainerOkCallback = function (domId, elementId, formElementId, doDelete, outputValues) {
        var pageLabel = null;
        var page = null;
        var outcome = null;

        // Get the page container object back from the response
        page = ManyWhoUtils.getOutcomeValue(outputValues, 'PAGE_LAYOUT', null);
        pageLabel = ManyWhoUtils.getOutcomeValue(outputValues, 'PAGE_LAYOUT', 'Label');

        // Get the outcome out so we know what to do with the layout
        outcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);

        // Write the data back as long as the user didn't hit cancel
        if (outcome.toLowerCase() != 'cancel') {
            $('#' + domId + '-page-element').data('page', page[0]);
            $('#' + domId + '-page-element-label').html(pageLabel);
        }
    };

    var createPageContainer = function (domId, elementId, parentContainerId, pageContainer, isButtonMode) {
        var label = null;
        var id = null;
        var containerType = null;
        var developerName = null;
        var childPageContainers = null;
        var pageContainerHtml = null;
        var currentCounter = 0;

        // Grab the current counter as we need that to reference our container
        currentCounter = getCounter();

        // Grab the id from the external identifier - we'll always have one of these regardless of "saved" status
        id = pageContainer.externalId;

        // Check to see if the page container has any properties
        if (pageContainer.properties != null &&
            pageContainer.properties.length > 0) {
            // Go through each of the properties in the page container and grab out the ones we need
            for (var c = 0; c < pageContainer.properties.length; c++) {
                if (pageContainer.properties[c].developerName.toLowerCase() == 'label') {
                    // Grab the label property
                    label = pageContainer.properties[c].contentValue;
                } else if (pageContainer.properties[c].developerName.toLowerCase() == 'containertype') {
                    // Grab the container type property
                    containerType = pageContainer.properties[c].contentValue;
                } else if (pageContainer.properties[c].developerName.toLowerCase() == 'developername') {
                    // Grab the container type property
                    developerName = pageContainer.properties[c].contentValue;
                } else if (pageContainer.properties[c].developerName.toLowerCase() == 'pagecontainers') {
                    // Grab the page containers for this page container
                    childPageContainers = pageContainer.properties[c].objectData;
                }
            }
        }

        // Save the page container to the dom
        $('#' + domId + '-page-containers').data(id, pageContainer);

        // Check to see if the element exists already in the dom
        if ($('#' + id).length > 0) {
            // The container already exists, so all we need to do in the UI is repaint the label
            $('#' + id).children('.manywho-page-container-controls').children('.manywho-page-container-label').html('<strong>' + label + '</strong>');
        } else {
            // Now create the page container html
            pageContainerHtml = createPageContainerHtml(domId, currentCounter, containerType, id, label, developerName);

            // Check to see if we have an element id to replace
            if (elementId == null ||
                elementId.trim().length == 0) {
                // Append the page container to the parent's sortable
                $('#' + parentContainerId).children('.page-sortable').append(pageContainerHtml);
            } else {
                // We have a placeholder element to replace with this new html
                $('#' + elementId).replaceWith(pageContainerHtml);
            }

            if (isButtonMode == false) {
                // Add the events for this page container
                $('#' + id).children('.manywho-page-container-controls').children('.manywho-edit-page-container').click(function (event) {
                    var inputs = null;
                    var pageContainers = null;

                    // Wrap the page containers in an array
                    pageContainers = [$('#' + domId + '-page-containers').data(id)];

                    inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                    inputs = ManyWhoSharedServices.createInput(inputs, 'PageContainer', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, pageContainers, 'PageContainer');
                    inputs = ManyWhoSharedServices.createInput(inputs, 'ContainerType', ManyWhoUtils.getObjectAPIPropertyValue(pageContainers, 'PageContainer', 'ContainerType'), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                    // Open the dialog for creating a new form field
                    ManyWhoSharedServices.showSubConfigDialog(PAGE_CONTAINER_DIALOG_HEIGHT, PAGE_CONTAINER_DIALOG_WIDTH, 'PAGECONTAINER', domId, id, null, inputs, false, pageContainerOkCallback, true);
                });

                $('#' + id).children('.manywho-page-container-controls').children('.manywho-delete-page-container').click(function (event) {
                    var inputs = null;
                    var pageContainers = null;

                    if ($('#' + id).children('.page-sortable').children().length > 0) {
                        alert('You can\'t delete a Layout Container if it contains child Layout Containers or Components. Delete the children of this Layout Container first!');
                        return;
                    }

                    // Wrap the page containers in an array
                    pageContainers = [$('#' + domId + '-page-containers').data(id)];

                    inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'delete', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                    inputs = ManyWhoSharedServices.createInput(inputs, 'PageContainer', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, pageContainers, 'PageContainer');
                    inputs = ManyWhoSharedServices.createInput(inputs, 'ContainerType', ManyWhoUtils.getObjectAPIPropertyValue(pageContainers, 'PageContainer', 'ContainerType'), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                    // Open the dialog for creating a new form field
                    ManyWhoSharedServices.showSubConfigDialog(PAGE_CONTAINER_DIALOG_HEIGHT, PAGE_CONTAINER_DIALOG_WIDTH, 'PAGECONTAINER', domId, id, null, inputs, false, pageContainerOkCallback, true);
                });

                // Make the page container sortable
                makeSortable(domId, 'page-sortable-' + currentCounter);
            }

            // Now that we've printed the parent container, we can print any children of this container
            createPageContainers(domId, id, childPageContainers, isButtonMode);

            if (containerType == ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW) {
                // Orient this page container to make sure the children are the correct widths
                orientHorizontalLayout('#' + domId + '-page-sortable-' + currentCounter, 0);
            }
        }
    };

    var createPageContainers = function (domId, parentContainerId, pageContainers, isButtonMode) {
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
                createPageContainer(domId, null, parentContainerId, pageContainer, isButtonMode);
            }
        }
    };

    var createPageContainerHtml = function (domId, currentCounter, containerType, pageContainerId, label, developerName) {
        var html = '';

        // Create the page container shell
        html += '<div class="manywho-page-container rendered" id="' + pageContainerId + '">';
        
        // Create the controls and label for this container
        html += '<div class="manywho-page-container-controls">';

        if (containerType == ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW) {
            html += '<i class="icon-resize-vertical icon-white manywho-edit-page-container"></i> ';
        } else if (containerType == ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW) {
            html += '<i class="icon-resize-horizontal icon-white manywho-edit-page-container"></i> ';
        } else if (containerType == ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW) {
            html += '<i class="icon-arrow-right icon-white manywho-edit-page-container"></i> ';
        } else if (containerType == ManyWhoConstants.CONTAINER_TYPE_GROUP) {
            html += '<i class="icon-folder-open icon-white manywho-edit-page-container"></i> ';
        }

        html += '<span class="manywho-page-container-label"><strong>' + label + '</strong></span>';
        html += '<i class="icon-trash icon-white pull-right manywho-delete-page-container"></i>';
        html += '</div>';

        // Create the correct sortable implementation
        if (containerType == ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW) {
            html += '<div id="' + domId + '-page-sortable-' + currentCounter + '" class="page-sortable page-sortable-vertical" data-developername="' + developerName + '"></div>';
        } else if (containerType == ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW) {
            html += '<div id="' + domId + '-page-sortable-' + currentCounter + '" class="page-sortable page-sortable-horizontal" data-developername="' + developerName + '"></div>';
        } else if (containerType == ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW) {
            html += '<div id="' + domId + '-page-sortable-' + currentCounter + '" class="page-sortable page-sortable-inline" data-developername="' + developerName + '"></div>';
        } else if (containerType == ManyWhoConstants.CONTAINER_TYPE_GROUP) {
            html += '<div id="' + domId + '-page-sortable-' + currentCounter + '" class="page-sortable page-sortable-group" data-developername="' + developerName + '"></div>';
        } else {
            alert('Container type not found: ' + containerType);
        }

        // Close out the page container shell
        html += '</div>';

        return html;
    };

    var createPageComponents = function (domId, pageComponents, isButtonMode) {
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
                createPageComponent(domId, null, pageComponents[b], isButtonMode);
            }
        }
    };

    var createPageComponent = function (domId, elementId, pageComponent, isButtonMode) {
        // Check to see if we actually have any page components in the array
        if (pageComponent != null) {
            var label = null;
            var id = null;
            var componentType = null;
            var size = 0;
            var maxSize = 0;
            var height = 0;
            var width = 0;
            var content = null;
            var required = false;
            var editable = true;
            var hintValue = null;
            var helpInfo = null;
            var pageContainerId = null;
            var pageComponentHtml = null;
            var tableColumns = null;
            var currentCounter = 0;

            // Grab a counter for our element
            currentCounter = getCounter();

            // Grab the external identifier for the component - we'll always have one of these regardless of "saved" status
            id = pageComponent.externalId;

            // Check to see if the page component has any properties
            if (pageComponent.properties != null &&
                pageComponent.properties.length > 0) {
                // Go through each of the properties in the page container and grab out the ones we need
                for (var c = 0; c < pageComponent.properties.length; c++) {
                    if (pageComponent.properties[c].developerName.toLowerCase() == 'label') {
                        // Grab the label property
                        label = pageComponent.properties[c].contentValue;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'componenttype') {
                        // Grab the container type property
                        componentType = pageComponent.properties[c].contentValue;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'size') {
                        // Grab the size property
                        size = parseInt(pageComponent.properties[c].contentValue);
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'maxsize') {
                        // Grab the max size property
                        maxSize = parseInt(pageComponent.properties[c].contentValue);
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'height') {
                        // Grab the height property
                        height = parseInt(pageComponent.properties[c].contentValue);
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'width') {
                        // Grab the width property
                        width = parseInt(pageComponent.properties[c].contentValue);
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'content') {
                        // Grab the content property
                        content = pageComponent.properties[c].contentValue;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'required') {
                        // Grab the required property
                        required = pageComponent.properties[c].contentValue ? (pageComponent.properties[c].contentValue.toLowerCase() == 'true') : false;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'editable') {
                        // Grab the editable property
                        editable = pageComponent.properties[c].contentValue ? (pageComponent.properties[c].contentValue.toLowerCase() == 'true') : false;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'hintvalue') {
                        // Grab the hint value property
                        hintValue = pageComponent.properties[c].contentValue;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'helpinfo') {
                        // Grab the help info property
                        helpInfo = pageComponent.properties[c].contentValue;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'pagecontainerid') {
                        // Grab the page container id property
                        pageContainerId = pageComponent.properties[c].contentValue;
                    } else if (pageComponent.properties[c].developerName.toLowerCase() == 'pagecomponentcolumns') {
                        // Grab the columns for the table
                        tableColumns = pageComponent.properties[c].objectData;
                    }
                }
            }

            // Save the page component to the dom
            $('#' + domId + '-page-components').data(id, pageComponent);

            // Create the html for the page component
            pageComponentHtml = createPageComponentHtml(domId, currentCounter, pageContainerId, id, componentType, label, size, maxSize, height, width, content, hintValue, helpInfo, required, editable, tableColumns);

            // Check to see if we have an element id to replace
            if (elementId == null ||
                elementId.trim().length == 0) {
                // Print the component to the parent container
                $('#' + pageContainerId).children('.page-sortable').append(pageComponentHtml);
            } else {
                // We have a placeholder element to replace with this new html
                $('#' + elementId).replaceWith(pageComponentHtml);
            }

            if (isButtonMode == false) {
                // Add the events for this page container
                $('#' + id).children('.manywho-page-component-controls').children('.manywho-edit-page-component').click(function (event) {
                    var inputs = null;
                    var pageComponents = null;
                    var pageComponentType = null;
                    var specificDialog = '';

                    // Wrap the page components in an array
                    pageComponents = [$('#' + domId + '-page-components').data(id)];

                    // Get the page component type
                    pageComponentType = ManyWhoUtils.getObjectAPIPropertyValue(pageComponents, 'PageComponent', 'ComponentType');

                    // If we have a table, we use a different configuration
                    if (pageComponentType != null) {
                        if (pageComponentType.toLowerCase() == ManyWhoConstants.COMPONENT_TYPE_TABLE.toLowerCase()) {
                            specificDialog = '_TABLE';
                        } else if (pageComponentType.toLowerCase() == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX.toLowerCase()) {
                            specificDialog = '_COMBO';
                        }
                    }

                    inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                    inputs = ManyWhoSharedServices.createInput(inputs, 'PageComponent', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, pageComponents, 'PageComponent');
                    inputs = ManyWhoSharedServices.createInput(inputs, 'ComponentType', pageComponentType, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                    // Open the dialog for creating a new form field
                    ManyWhoSharedServices.showSubConfigDialog(PAGE_COMPONENT_DIALOG_HEIGHT, PAGE_COMPONENT_DIALOG_WIDTH, 'PAGECOMPONENT' + specificDialog, domId, id, null, inputs, false, pageComponentOkCallback, true);
                });

                $('#' + id).children('.manywho-page-component-controls').children('.manywho-delete-page-component').click(function (event) {
                    var inputs = null;
                    var pageComponents = null;

                    // Wrap the page components in an array
                    pageComponents = [$('#' + domId + '-page-components').data(id)];

                    inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'delete', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                    inputs = ManyWhoSharedServices.createInput(inputs, 'PageComponent', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, pageComponents, 'PageComponent');
                    inputs = ManyWhoSharedServices.createInput(inputs, 'ComponentType', ManyWhoUtils.getObjectAPIPropertyValue(pageComponents, 'PageComponent', 'ComponentType'), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                    // Open the dialog for creating a new form field
                    ManyWhoSharedServices.showSubConfigDialog(PAGE_COMPONENT_DIALOG_HEIGHT, PAGE_COMPONENT_DIALOG_WIDTH, 'PAGECOMPONENT', domId, id, null, inputs, false, pageComponentOkCallback, true);
                });
            }
        }
    };

    var createPageComponentHtml = function (domId, currentCounter, pageContainerId, pageComponentId, componentType, label, size, maxSize, height, width, content, hintValue, helpInfo, required, editable, tableColumns) {
        var html = '';
        var labelHtml = null;
        var editableHtml = '';
        var componentSizeCss = '';

        // Create the page component shell
        html += '<div class="manywho-page-component rendered" id="' + pageComponentId + '">';

        // Create the page component controls
        html += '<div class="manywho-page-component-controls"><i class="icon-edit icon-white manywho-edit-page-component"></i> <i class="icon-trash icon-white pull-right manywho-delete-page-component"></i> <span class="text-info manywho-field-label">' + label + '</span></div>';

        // Now create the shell for the actual component
        html += '<div>';

        // If the hint value is null, we blank it out
        if (hintValue == null) {
            hintValue = '';
        }

        // Apply the readonly html if the field is not editable
        if (editable == false) {
            editableHtml = ' readonly';
        }

        // Make sure the label reflects the required status
        if (label != null &&
            label.trim().length > 0) {
            if (required == true) {
                labelHtml = '<label class="manywho-page-component-required">';
            } else {
                labelHtml = '<label>';
            }
        } else {
            labelHtml = '';
        }

        // Printing a label wrapper depends on the component type
        if (componentType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX ||
            componentType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX ||
            componentType == ManyWhoConstants.COMPONENT_TYPE_CHECKBOX ||
            componentType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
            html += labelHtml;
        }

        // We need to map the designers absolute field sizing over to a bootstrap equivalent - the mappings are here
        if (size > 0) {
            if (size < 10) {
                componentSizeCss = ' input-mini';
            } else if (size < 20) {
                componentSizeCss = ' input-small';
            } else if (size < 30) {
                componentSizeCss = ' input-medium';
            } else if (size < 50) {
                componentSizeCss = ' input-large';
            } else if (size < 70) {
                componentSizeCss = ' input-xlarge';
            } else {
                componentSizeCss = ' input-xxlarge';
            }
        }

        if (width > 0) {
            if (width < 10) {
                componentSizeCss = ' input-mini';
            } else if (width < 20) {
                componentSizeCss = ' input-small';
            } else if (width < 30) {
                componentSizeCss = ' input-medium';
            } else if (width < 50) {
                componentSizeCss = ' input-large';
            } else if (width < 70) {
                componentSizeCss = ' input-xlarge';
            } else {
                componentSizeCss = ' input-xxlarge';
            }
        }

        if (componentType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX) {
            html += '<input type="text"' + editableHtml + ' class="manywho-page-component-implementation input-large' + componentSizeCss + '" maxlength="' + maxSize + '" placeholder="' + hintValue + '" />';
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) {
            html += '<textarea class="manywho-page-component-implementation' + componentSizeCss + '"' + editableHtml + ' placeholder="' + hintValue + '"></textarea>';
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_CONTENT) {
            html += '<div class="btn-toolbar">';
            html += '<div class="btn-group" id="field-toolbar">';
            html += '<a class="btn" data-wysihtml5-command="bold" title="CTRL+B" href="#"><i class="icon-bold"></i></a>';
            html += '<a class="btn" data-wysihtml5-command="italic" title="CTRL+I" href="#"><i class="icon-italic"></i></a>';
            html += '<a class="btn" data-wysihtml5-action="change_view"><i class="icon-eye-close"></i></a>';
            html += '</div>';
            html += '</div>';

            // Print the label at the bottom as this field doesn't support wrapping labels
            html += labelHtml;

            // Print the text area for the content editor
            html += '<textarea class="manywho-page-component-implementation"' + editableHtml + ' style="height: ' + (height * 12) + 'px; width: ' + (width * 5) + 'px;"></textarea>';
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_CHECKBOX) {
            html += '<input type="checkbox"' + editableHtml + ' class="manywho-page-component-implementation" /> ';
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_TAG) {
            html += '<div class="manywho-page-component-implementation">TAG</div>';

            // Print the label at the bottom as this field doesn't support wrapping labels
            html += labelHtml;
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) {
            html += '<div class="manywho-page-component-implementation">' + content + '</div>';

            // Print the label at the bottom as this field doesn't support wrapping labels
            html += '<label>';
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_IMAGE) {
            html += '<img src="' + content + '" class="manywho-page-component-implementation" alt="' + label + '" height="' + height + '" width="' + width + '" />';

            // Print the label at the bottom as this field doesn't support wrapping labels
            html += labelHtml;
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
            html += '<select class="manywho-page-component-implementation"' + editableHtml + '></select>';
        } else if (componentType == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
            html += '<div>';

            // Check to make sure we have table columns for this table
            if (tableColumns != null &&
                tableColumns.length > 0) {
                // Check to see if we have an order property - if we do, order by that
                var checkOrderObjectData = tableColumns[0];
                var needsOrdering = false;

                // Check to see if we have any properties to order!
                if (checkOrderObjectData.properties != null &&
                    checkOrderObjectData.properties.length > 0) {
                    var needsOrdering = false;

                    // Check to see if a property is in fact called order (which should always be true, but we test it anyway
                    for (var a = 0; a < checkOrderObjectData.properties.length; a++) {
                        if (checkOrderObjectData.properties[a].developerName.toLowerCase() == 'order') {
                            needsOrdering = true;
                            break;
                        }
                    }

                    // Perform the sort algorithm based on the order property
                    if (needsOrdering == true) {
                        tableColumns.sort(function (objectDataEntryA, objectDataEntryB) {
                            var orderA = ManyWhoUtils.grabOrderFromObjectDataEntry(objectDataEntryA);
                            var orderB = ManyWhoUtils.grabOrderFromObjectDataEntry(objectDataEntryB);

                            if (orderA > orderB) {
                                return 1;
                            } else if (orderA < orderB) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                    }
                }

                var rowHtml = '';

                html += '<table class="manywho-page-component-implementation table table-hover table-condensed table-bordered">';
                html += '<thead class="header"><tr>';

                // Now go through the sorted table columns and print them out
                for (var b = 0; b < tableColumns.length; b++) {
                    var tableColumn = tableColumns[b];

                    // Now we need to find the label for this column
                    if (tableColumn.properties != null &&
                        tableColumn.properties.length > 0) {
                        for (var c = 0; c < tableColumn.properties.length; c++) {
                            var tableProperty = tableColumn.properties[c];

                            // Check to see if this is the label property
                            if (tableProperty.developerName.toLowerCase() == 'label') {
                                html += '<th>' + tableProperty.contentValue + '</th>';

                                // Add the dummy row
                                rowHtml += '<td><span class="muted"><i>data</i></span></td>';
                                break;
                            }
                        }
                    }
                }

                html += '</tr></thead>';
                html += '<tbody><tr>';
                html += rowHtml;
                html += '</tr></tbody>';
                html += '</table>';
            }

            html += '</div>';

            // Print the label at the bottom as this field doesn't support wrapping labels
            html += labelHtml;
        }

        // If we have help info, we add a little help button
        if (helpInfo != null &&
            helpInfo.trim().length > 0) {
            html += ' <a href="#"><i class="icon-question-sign"></i></a>';
        }

        if (label != null &&
            label.trim().length > 0) {
            // Close out the label
            html += '</label>';
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
            over: function (event, ui) {
                if ($(this).hasClass('page-sortable-horizontal') == true) {
                    // Count the children in the sortable
                    childCount = $(this).children('div').length;

                    // Subtract 2 from the child count - 1 for the helper, 1 for the placeholder
                    childCount = childCount - 1;

                    // Get the interval for the spans, subracting 12 (oddly not 10 for the child container padding), and 12 (for the parent container padding)
                    // The above stuff and below math is not correct
                    columnInterval = Math.floor(($(this).innerWidth() - (10 * childCount)) / childCount);

                    console.log($(this).attr('id') + ': ' + $(this).innerWidth());

                    // Go through all of the children and re-apply the old span
                    $(this).children('div').each(function (index, element) {
                        if ($(element).hasClass('ui-sortable-helper') == false) {
                            $(this).css('width', columnInterval + 'px');
                            if ($(this).css('display') != 'none') {
                                $(this).css('display', 'inline-block');
                            }
                        }
                    });
                }
            },
            out: function (event, ui) {
                if ($(this).hasClass('page-sortable-horizontal') == true) {
                    var childCount = 0;
                    var columnInterval = 0;

                    // Count the children in the sortable that are actual children that are going to stay!
                    $(this).children('div').each(function (index, element) {
                        // If it's not visible, we don't care about it!  This will be the case when we're dragging a new element "through" a sortable and out
                        // If it's a placeholder, we don't care about it either!  True for both new and existing sorting events
                        if ($(this).css('display') != 'none' &&
                            $(this).hasClass('placeholder') == false) {
                            childCount++;
                        }
                    });

                    //childCount = $(this).children('div').length;
                    childCount = childCount - 1;

                    // Get the interval for the spans now the helper has left
                    columnInterval = Math.floor(($(this).innerWidth() - getBufferValue() - (10 * childCount)) / childCount);

                    // Go through all of the children and re-apply the old span
                    $(this).children('div').each(function (index, element) {
                        $(this).css('width', columnInterval + 'px');
                        if ($(this).css('display') != 'none') {
                            $(this).css('display', 'inline-block');
                        }
                    });
                }
            },
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
                if (ui.item.hasClass('manywho-page-container') == true) {
                    // Go through all of the children and make sure there aren't any components - if so, this is not a valid drop
                    $(this).children('div').each(function (index, element) {
                        if ($(this).hasClass('manywho-page-component') == true) {
                            // Blank out the draggable
                            ui.item.replaceWith('');

                            // Tell the user what they did wrong
                            alert('You can\'t add a child container if the parent already has components!');

                            // Tell this code block not to add the element, but to make sure all of the sizing is OK
                            addingElement = false;

                            // Return out of this child loop
                            return;
                        }
                    });
                } else if (ui.item.hasClass('manywho-page-component') == true) {
                    // Check to make sure this container isn't a group - you can only add containers to a 'group' container
                    if ($(this).hasClass('page-sortable-group') == true) {
                        // Blank out the draggable
                        ui.item.replaceWith('');

                        // Tell the user what they did wrong
                        alert('You can only add containers to a group!');

                        // Tell this code block not to add the element, but to make sure all of the sizing is OK
                        addingElement = false;

                        // Return out of this child loop
                        return;
                    }

                    // Go through all of the children and make sure there aren't any containers - if so, this is not a valid drop
                    $(this).children('div').each(function (index, element) {
                        if ($(this).hasClass('manywho-page-container') == true) {
                            // Blank out the draggable
                            ui.item.replaceWith('');

                            // Tell the user what they did wrong
                            alert('You can\'t add a child component if the parent already has containers!');

                            // Tell this code block not to add the element, but to make sure all of the sizing is OK
                            addingElement = false;

                            // Return out of this child loop
                            return;
                        }
                    });
                }

                //// Count the children in the sortable and grab the parent width
                //childCount = $(this).children('div').length;
                //parentWidth = $(this).innerWidth() - (10 * childCount);

                // Make sure the validation rules are OK and we're not mixing components and containers
                // Also - make sure this component hasn't already been rendered (which will be the case for re-ordering)
                if (addingElement == true &&
                    ui.item.hasClass('rendered') == false) {
                    // Create a counter so we have a unique identifier for this sortable
                    currentCounter = getCounter();

                    // Check to see if the item being dragged is a container
                    if (ui.item.hasClass('manywho-page-container') == true) {
                        // Replace the content of the dragged item with the correct sortable
                        if (ui.item.hasClass(ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW) == true) {
                            containerType = ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW;
                        } else if (ui.item.hasClass(ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW) == true) {
                            containerType = ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW;
                        } else if (ui.item.hasClass(ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW) == true) {
                            containerType = ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW;
                        } else if (ui.item.hasClass(ManyWhoConstants.CONTAINER_TYPE_GROUP) == true) {
                            containerType = ManyWhoConstants.CONTAINER_TYPE_GROUP;
                        }

                        // Replace the droppable with the generated field placeholder
                        ui.item.replaceWith('<div class="manywho-page-container" id="' + domId + '-page-sortable-' + currentCounter + '"></div>');

                        inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                        inputs = ManyWhoSharedServices.createInput(inputs, 'ContainerType', containerType, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                        // Open the dialog for creating a new form field
                        ManyWhoSharedServices.showSubConfigDialog(PAGE_CONTAINER_DIALOG_HEIGHT, PAGE_CONTAINER_DIALOG_WIDTH, 'PAGECONTAINER', domId, domId + '-page-sortable-' + currentCounter, null, inputs, true, pageContainerOkCallback, true);
                    } else {
                        // We're dragging a component and therefore do not want to make it a sortable
                        if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_INPUTBOX) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_INPUTBOX;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_TEXTBOX;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_CONTENT) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_CONTENT;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_CHECKBOX) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_CHECKBOX;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_COMBOBOX;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_TABLE) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_TABLE;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_PRESENTATION;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_IMAGE) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_IMAGE;
                        } else if (ui.item.hasClass(ManyWhoConstants.COMPONENT_TYPE_TAG) == true) {
                            componentType = ManyWhoConstants.COMPONENT_TYPE_TAG;
                        }

                        // Replace the droppable with the generated field placeholder
                        ui.item.replaceWith('<div class="manywho-page-component" id="' + domId + '-page-component-' + currentCounter + '"></div>');

                        inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                        inputs = ManyWhoSharedServices.createInput(inputs, 'ComponentType', componentType, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                        // Grab the container id of the parent
                        inputs = ManyWhoSharedServices.createInput(inputs, 'PageContainerId', $(this).parent().attr('id'), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                        // If we have a table, we use a different configuration
                        if (componentType != null) {
                            if (componentType.toLowerCase() == ManyWhoConstants.COMPONENT_TYPE_TABLE.toLowerCase()) {
                                specificDialog = '_TABLE';
                            } else if (componentType.toLowerCase() == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX.toLowerCase()) {
                                specificDialog = '_COMBO';
                            }
                        }

                        // Open the dialog for creating a new form field
                        ManyWhoSharedServices.showSubConfigDialog(PAGE_COMPONENT_DIALOG_HEIGHT, PAGE_COMPONENT_DIALOG_WIDTH, 'PAGECOMPONENT' + specificDialog, domId, domId + '-page-component-' + currentCounter, null, inputs, true, pageComponentOkCallback, true);
                    }
                }

                // Only call this method if we're dealing with horizontal containers
                if ($(this).hasClass('page-sortable-horizontal') == true) {
                    orientHorizontalLayout(this, 0);
                }

                //// If this is a horizontal sortable, we need to rejig the columns
                //if ($(this).hasClass('page-sortable-horizontal') == true) {
                //    // Get the width for each of the children based on the width of the parent
                //    childWidth = Math.floor((parentWidth - 10) / childCount);

                //    // Go through all of the children and apply the correct width
                //    $(this).children('div').each(function (index, element) {
                //        $(this).css('width', childWidth + 'px');
                //        if ($(this).css('display') != 'none') {
                //            $(this).css('display', 'inline-block');
                //        }
                //    });
                //}
            }
        });
    };

    var orientHorizontalLayout = function (parent, buffer) {
        var childCount = 0;
        var parentWidth = 0;

        // Count the children in the sortable and grab the parent width
        childCount = $(parent).children('div').length;
        parentWidth = $(parent).innerWidth() - buffer - (10 * childCount);

        // If this is a horizontal sortable, we need to rejig the columns
        //if ($(parent).hasClass('page-sortable-horizontal') == true) {
            // Get the width for each of the children based on the width of the parent
            childWidth = Math.floor((parentWidth - 10) / childCount);

            // Go through all of the children and apply the correct width
            $(parent).children('div').each(function (index, element) {
                $(this).css('width', childWidth + 'px');
                if ($(this).css('display') != 'none') {
                    $(this).css('display', 'inline-block');
                }
            });
        //}
    };

    var createProperty = function (domId, developerName, contentValue, objectData) {
        var property = new Object();

        property.developerName = developerName;
        property.contentValue = contentValue;
        property.objectData = objectData;

        return property;
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

            html += '    <div class="row-fluid">';
            html += '        <table width="100%"><tr><td id="' + domId + '-page-builder-toolbar" class="fixed-container" width="10%" valign="top">';

            if (opts.isButtonMode == true) {
                html += '        <div>';
                html += '            <h5>Outcomes</h5>';

                // Check to make sure we have some outcomes - if we do, we add them to the toolbar - but only if they have not been used
                if (outcomes != null &&
                    outcomes.length > 0) {
                    for (var i = 0; i < outcomes.length; i++) {
                        var outcome = outcomes[i];

                        // Check to see if the outcome is bound to something
                        if (outcome.pageObjectBindingId != null &&
                            outcome.pageObjectBindingId.trim().length > 0) {
                            // Place the outcome on the page layout
                            addOutcomeToPage(domId, outcome);
                        } else {
                            // Add the outcome to the page layout editor toolbar
                            html += '            <div id="' + domId + '-outcome-draggable" class="btn manywho-page-outcome"><i class="icon-chevron-right"></i> ' + outcome.developerName + '</div>';
                        }
                    }
                }

                html += '        </div>';
            } else {
                html += '        <div>';
                html += '            <h5>Layouts</h5>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_GROUP + '-container-draggable" class="btn manywho-page-container ' + ManyWhoConstants.CONTAINER_TYPE_GROUP + '"><i class="icon-folder-open"></i> Group</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW + '-container-draggable" class="btn manywho-page-container ' + ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW + '"><i class="icon-resize-vertical"></i> Vertical</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW + '-container-draggable" class="btn manywho-page-container ' + ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW + '"><i class="icon-resize-horizontal"></i> Horizontal</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW + '-container-draggable" class="btn manywho-page-container ' + ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW + '"><i class="icon-arrow-right"></i> Inline</div>';
                html += '        </div>';

                html += '        <p>&nbsp;</p>';

                html += '        <div>';
                html += '            <h5>Components</h5>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_PRESENTATION + '-component-draggable" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_PRESENTATION + '">Presentation</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_INPUTBOX + '-component-draggable" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_INPUTBOX + '">Input</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TEXTBOX + '-component-draggable" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_TEXTBOX + '">Text</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_CONTENT + '-component-draggable" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_CONTENT + '">Rich Text</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_CHECKBOX + '-component-draggable" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_CHECKBOX + '">Checkbox</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TABLE + '-component-draggable" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_TABLE + '">Table</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_COMBOBOX + '-component-draggable" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_COMBOBOX + '">Combobox</div>';
                html += '        </div>';

                html += '        <p>&nbsp;</p>';

                html += '        <div>';
                html += '            <h5>Coming soon!</h5>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_IMAGE + '-component-draggable" disabled="disabled" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_IMAGE + '">Image</div>';
                html += '            <div id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TAG + '-component-draggable" disabled="disabled" class="btn manywho-page-component ' + ManyWhoConstants.COMPONENT_TYPE_TAG + '">Tag</div>';
                html += '        </div>';
            }

            html += '        </td>';
            html += '        <td width="90%" valign="top">';

            html += '            <div class="row-fluid">';
            html += '                <div class="span1"><img src="https://cdn.manywho.com/extensions/glyphicons/page_element_small.png" height="48" width="48" alt="Page Layout" style="padding-bottom: 10px;" /></div>';
            html += '                <div class="span11">Use the editor below to build your Page Layout. Simply drag Layout Container or Components from the left and drop them on the right. We recommend you start by setting out your Layout Containers, then add your Components. Once a Layout Container or Component has been placed, it cannot be moved outside of its immediate parent.</div>';
            html += '            </div>';

            html += '            <div id="' + domId + '-page-builder" class="page-builder">';
            html += '                <div class="manywho-page-container-controls">';
            html += '                <i class="icon-list-alt icon-white" id="' + domId + '-page-element-edit"></i> ';
            html += '                <span class="manywho-page-container-label" id="' + domId + '-page-element-label"></span>';
            html += '            </div>';

            html += '            <div id="' + domId + '-page-sortable-0" class="page-sortable page-sortable-vertical page-sortable-' + ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW + '">';
            html += '            </div>';

            html += '        </td></tr></table>';
            html += '    </div>';

            // Print the scaffolding into the dom
            $(this).html(html);

            // Grab the height of the parent container so we can adjust the editor accordingly
            pageEditorHeight = $(this).height() - 30;

            // Apply the CSS directly to the page editor
            $('#' + domId + '-page-builder').css('min-height', pageEditorHeight + 'px');
            $('#' + domId + '-page-sortable-0').css('min-height', pageEditorHeight + 'px');

            if (opts.isButtonMode == true) {
                $('#' + domId + '-outcome-draggable').draggable({
                    connectToSortable: '.outcome-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });
            } else {
                $('#' + domId + '-page-element-edit').click(function (event) {
                    var inputs = null;
                    var page = null;

                    // Wrap the page containers in an array
                    page = [$('#' + domId + '-page-element').data('page')];

                    inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                    inputs = ManyWhoSharedServices.createInput(inputs, 'PAGE_LAYOUT', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, page, 'PageElement');

                    // Open the dialog for creating a new form field
                    ManyWhoSharedServices.showSubConfigDialog(PAGE_ELEMENT_CONTAINER_DIALOG_HEIGHT, PAGE_ELEMENT_CONTAINER_DIALOG_WIDTH, 'PAGEELEMENTCONTAINER', domId, page.externalId, null, inputs, false, pageElementContainerOkCallback, true);
                });

                // Make all of our test sortables sortable!
                makeSortable(domId, 'page-sortable-0');

                $('#' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_VERTICAL_FLOW + '-container-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW + '-container-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW + '-container-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.CONTAINER_TYPE_GROUP + '-container-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_INPUTBOX + '-component-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TEXTBOX + '-component-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_CONTENT + '-component-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_CHECKBOX + '-component-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_COMBOBOX + '-component-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TABLE + '-component-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                $('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_PRESENTATION + '-component-draggable').draggable({
                    connectToSortable: '.page-sortable',
                    helper: 'clone',
                    scroll: true, // Scroll the page if we hit the edge
                    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                });

                //$('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_IMAGE + '-component-draggable').draggable({
                //    connectToSortable: '.page-sortable',
                //    helper: 'clone',
                //    scroll: true, // Scroll the page if we hit the edge
                //    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                //    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                //});

                //$('#' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TAG + '-component-draggable').draggable({
                //    connectToSortable: '.page-sortable',
                //    helper: 'clone',
                //    scroll: true, // Scroll the page if we hit the edge
                //    scrollSensitivity: 10, // Set the sensitivity of the scroll to 10 (check the JQuery Docs for what this number means)
                //    scrollSpeed: 40 // Set the scrolling speed to 40 (again, check the docs)
                //});

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
            }

            // Store the settings for the page
            $('#' + domId + '-page-settings').data('isButtonMode', opts.isButtonMode);

            $('div').disableSelection();
        },
        validate: function() {
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
            var isButtonMode = null;

            // Create the shell of the object
            pageElement = $('#' + domId + '-page-element').data('page');

            // Get the button mode from the settings
            isButtonMode = $('#' + domId + '-page-settings').data('isButtonMode');

            // Make sure the button mode is a boolean
            if (isButtonMode == true ||
                isButtonMode == 'true') {
                isButtonMode = true;
            } else {
                isButtonMode = false;
            }

            // Get the page container and component properties out as we're going to overwrite their contents
            for (var a = 0; a < pageElement.properties.length; a++) {
                if (pageElement.properties[a].developerName.toLowerCase() == 'pagecontainers') {
                    pageContainersProperty = pageElement.properties[a];
                } else if (pageElement.properties[a].developerName.toLowerCase() == 'pagecomponents') {
                    pageComponentsProperty = pageElement.properties[a];
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

                    // Grab the component object from our database
                    pageComponent = $('#' + domId + '-page-components').data($(this).attr('id'));

                    // Check to make sure the component isn't null
                    if (pageComponent != null) {
                        // Find the order property for the page component
                        for (var a = 0; a < pageComponent.properties.length; a++) {
                            // Check to see if this is the property for order
                            if (pageComponent.properties[a].developerName.toLowerCase() == 'order') {
                                orderProperty = pageComponent.properties[a];
                            } else if (pageComponent.properties[a].developerName.toLowerCase() == 'pagecontainerdevelopername') {
                                pageContainerDeveloperNameProperty = pageComponent.properties[a];
                            }
                        }

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
            var isButtonMode = null;
            var developerName = null;

            // Get the button mode from the settings
            isButtonMode = $('#' + domId + '-page-settings').data('isButtonMode');

            // Make sure the button mode is a boolean
            if (isButtonMode == true ||
                isButtonMode == 'true') {
                isButtonMode = true;
            } else {
                isButtonMode = false;
            }

            // Check to see if the page object api is not null
            if (objectData != null &&
                objectData.length > 0) {
                // Grab the page object from the object data
                page = objectData[0];

                // Check to see if the page object api has any properties
                if (page.properties != null &&
                    page.properties.length > 0) {
                    var pageComponents = null;
                    var pageContainers = null;

                    // Assign the parent container to the page
                    parentContainerId = domId + '-page-builder';

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
                            developerName = page.properties[a].contentValue;
                        } else if (page.properties[a].developerName.toLowerCase() == 'developersummary') {
                            $('#' + domId + '-page-element-developersummary').val(page.properties[a].contentValue);
                        }
                    }

                    // Create the page containers for the page element
                    createPageContainers(domId, parentContainerId, pageContainers, isButtonMode);

                    // Create the page components - this method handles sorting and parent placement
                    createPageComponents(domId, pageComponents, isButtonMode, isButtonMode);
                }

                // Store the page in the dom
                $('#' + domId + '-page-element').data('page', page);
            }

            if (isButtonMode == false) {
                if (developerName == null || developerName.trim() == "") {
                    // We don't have an existing page element, so we should load the dialog immediately so the user is prompted to add the info
                    // Wrap the page in an array (there will be an empty one in the dom)
                    page = [$('#' + domId + '-page-element').data('page')];

                    inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                    inputs = ManyWhoSharedServices.createInput(inputs, 'PAGE_LAYOUT', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, page, 'PageElement');

                    // Open the dialog for creating a new form field
                    ManyWhoSharedServices.showSubConfigDialog(PAGE_ELEMENT_CONTAINER_DIALOG_HEIGHT, PAGE_ELEMENT_CONTAINER_DIALOG_WIDTH, 'PAGEELEMENTCONTAINER', domId, page.externalId, null, inputs, false, pageElementContainerOkCallback, true);
                }
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
