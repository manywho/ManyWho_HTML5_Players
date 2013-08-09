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

    // This method generates the actual HTML for the table component to turn into the fully functioning table.  Tables do not support
    // inline editing of any kind.  To edit a table, you need to create a separate form and outcome for that. TODO: we should add binding
    // for outcomes to bind to table operations - such as edit, delete, etc - in case the UI has multiple tables.  This is also much more
    // mobile friendly as mobile devices don't often have inline table editing - it's just too complicated!
    //
    var generateTableDataHtml = function (field, objectData, formMetaData) {
        var html = '';
        var columns = field.columns;

        // Job number 1 is to create the headings for the table - so the user knows what each column is for
        if (columns != null &&
            columns.length > 0) {

            html += '<thead class="header"><tr>';

            // Go through the list of columns provided and print the header information
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];

                if (column.isDisplayValue == true) {
                    html += '<th>' + column.label + '</th>';
                }
            }

            html += '</tr></thead>';
        }

        // Now we have the header, we can print the individual rows for the table - if we have any data
        if (objectData != null &&
            objectData.length > 0) {
            html += '<tbody>';

            // We only do this ordering on non async data requests - otherwise we leave the remote service to do the ordering for us
            if (formMetaData.objectDataRequest == null) {
                // Check to see if we have an order property - if we do, order by that
                var checkOrderObjectData = objectData[0];

                if (checkOrderObjectData.properties != null &&
                    checkOrderObjectData.properties.length > 0) {
                    var needsOrdering = false;

                    for (var a = 0; a < checkOrderObjectData.properties; a++) {
                        if (checkOrderObjectData.properties[a].developerName.toLowerCase() == 'order') {
                            needsOrdering = true;
                            break;
                        }
                    }

                    // Perform the sort algorithm based on the order property
                    if (needsOrdering == true) {
                        objectData.sort(function (objectDataEntryA, objectDataEntryB) {
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
            }

            // Go through each of the object data records
            for (var i = 0; i < objectData.length; i++) {
                var objectEntry = objectData[i];

                // We add the id to the row so we can identify it for selections
                html += '<tr id="' + objectEntry.externalId + '">';

                // Go through each of the columns and find the matching property.  We do this to ensure the columns
                // are always rendered in the correct order for the headings
                for (var k = 0; k < columns.length; k++) {
                    var column = columns[k];

                    // Check to make sure it's a display column
                    if (column.isDisplayValue == true) {
                        // Now go through the properties to find the one that matches
                        for (var j = 0; j < objectEntry.properties.length; j++) {
                            var property = objectEntry.properties[j];

                            if (column.typeElementEntryId == property.typeElementEntryId) {
                                var fieldValue = '';

                                if (property.contentValue != null) {
                                    fieldValue = property.contentValue;
                                }

                                html += '<td>' + fieldValue + '</td>';
                                break;
                            }
                        }
                    }
                }

                html += '</tr>';
            }

            html += '</tbody>';
        }

        return html;
    }

    // This method generates the select options html based on the object data and selected object data.  This method relies
    // on the fact that the options are generated from object data and not simple array lists.
    //
    var generateSelectOptionsHtml = function (columns, objectData, selectedObjectData, isMultiSelect) {
        var html = null;
        var labelColumn = null;

        html = '';

        // Go through the field columns and identify the value and field columns for the select
        if (columns != null &&
            columns.length > 0) {
            for (var i = 0; i < columns.length; i++) {
                var fieldColumn = columns[i];

                if (fieldColumn.isDisplayValue == true) {
                    labelColumn = fieldColumn.developerName;
                    break;
                }
            }
        } else {
            // TODO: throw an error
        }

        // Make the columns lowercase so we don't have an unwanted case issues
        labelColumn = labelColumn.toLowerCase();

        // We don't include this for multi-selection combos
        if (isMultiSelect == false) {
            // Add a blank entry
            html += '<option value="">-- select --</option>';
        }

        if (objectData != null) {
            // Go through each of the entries in the object data
            for (var i = 0; i < objectData.length; i++) {
                var objectDataEntry = objectData[i];
                var labelEntry = null;
                var isSelected = false;
                var selectedHtml = '';

                // Check to see if this entry is selected (that will be the case for hard-coded object data
                // and unlikely for object data request data - though we do allow the data source to provide this
                if (objectDataEntry.isSelected == true) {
                    isSelected = true;
                } else if (selectedObjectData != null &&
                           selectedObjectData.length > 0) {
                    // If the object data isn't tell us it's selected, then we check through the selected entries - we match on the core
                    // identifier first, but if we have an external id, we can match on that as a secondary measure (this is required
                    // when we dynamically load data - as it won't have an internal id that is consistent).
                    for (var j = 0; j < selectedObjectData.length; j++) {
                        if (objectDataEntry.externalId == selectedObjectData[j].externalId) {
                            // This is a selected entry based on the internal identifiers
                            isSelected = true;
                            break;
                        }
                    }
                }

                if (isSelected == true) {
                    selectedHtml = ' selected';
                }

                // Now we need to go through the properties of the entry and pull out the value and
                // label values.  We may want to assume that the arrays are always in the same order for this
                // piece as it would save a lot of processing (TODO)
                for (var j = 0; j < objectDataEntry.properties.length; j++) {
                    var property = objectDataEntry.properties[j];

                    // Get the label column value so we have it for the user
                    if (property.developerName.toLowerCase() == labelColumn) {
                        labelEntry = property.contentValue;
                        break;
                    }
                }

                // Finally, we create the option using the object data entry identifier
                html += '<option' + selectedHtml + ' value="' + objectDataEntry.externalId + '">' + labelEntry + '</option>';
            }
        }

        return html;
    };

    // This method goes through the selected object data and selects the object that is set to selected in the object data
    // list. As we use the object data identifier as the value piece - we can simply set the value using jquery and it will handle
    // the rest for us.
    //
    var setSelectSelectedOption = function (domId, field, selectedObjectData) {
        if (selectedObjectData != null &&
            selectedObjectData.length > 0) {
            for (var i = 0; i < selectedObjectData.length; i++) {
                if (selectedObjectData[i].isSelected == true) {
                    $('#' + domId + '-' + field.id + '-field').val(selectedObjectData[i].externalId);
                }
            }
        }
    };

    // This is a multi-purpose method that not only generates the table entries from object data, but also applies any
    // object data changes without re-rendering the entire list.
    //
    var createUIForObjectData = function (domId, field, formMetaData, objectData) {
        var html = null;
        var storageObject = null;

        // Update the storage object with the object data
        storageObject = $('#' + domId + '-' + field.id + '-database').data(field.id);

        // If this is the result of an object data request, then we will have a non-null object data request
        // object and the object data parameter will contain the list of values to display (based on the request
        // having been executed.  The form meta data object data then representing the selected options.
        if (formMetaData.objectDataRequest != null) {
            if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
                html = generateSelectOptionsHtml(field.columns, objectData, formMetaData.objectData, field.isMultiSelect);
            } else if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
                html = generateTableDataHtml(field, objectData, formMetaData);
            } else {
                alert('Field type not supported for UI data method: ' + field.componentType);
            }

            // Store the object data coming from the async callback
            storageObject.objectData = objectData;

            // Tell the event manager to ignore events from this field as we do the population
            $('#' + domId + '-manywho-runtime-form-event-data').data(field.id + '-process-events', 'false');

            // Populate the combobox with the options
            $('#' + domId + '-' + field.id + '-field').html(html);

            // Tell the event manager to start managing events again
            $('#' + domId + '-manywho-runtime-form-event-data').data(field.id + '-process-events', 'true');
        } else {
            if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
                html = generateSelectOptionsHtml(field.columns, formMetaData.objectData, null, field.isMultiSelect);
            } else if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
                html = generateTableDataHtml(field, formMetaData.objectData, formMetaData);
            } else {
                alert('Field type not supported for UI data method: ' + field.componentType);
            }

            // Store the object data that came from the metadata
            storageObject.objectData = formMetaData.objectData;

            // Tell the event manager to ignore events from this field as we do the population
            $('#' + domId + '-manywho-runtime-form-event-data').data(field.id + '-process-events', 'false');

            // Populate the table with the header and rows
            $('#' + domId + '-' + field.id + '-field').html(html);

            // Tell the event manager to start managing events again
            $('#' + domId + '-manywho-runtime-form-event-data').data(field.id + '-process-events', 'true');
        }

        if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
            // If we have a multi-select field, we apply the chosen plugin
            if (field.isMultiSelect == true &&
                ((formMetaData.objectData != null && formMetaData.objectData.length > 0) ||
                 (objectData != null && objectData.length > 0))) {
                if ($('#' + domId + '-' + field.id + '-field').hasClass('chzn-done') == false) {
                    // Chosen has not yet been applied - apply it now
                    $('#' + domId + '-' + field.id + '-field').chosen();
                } else {
                    // Chosen has been applied, update it
                    $('#' + domId + '-' + field.id + '-field').trigger('liszt:updated');
                }
            }
        } else if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
            // We need to add the events for the table here
            // Add individual row selection support
            $('#' + domId + '-' + field.id + '-field').find('tr').click(function (e) {
                if ($(this).hasClass('success')) {
                    // Remove the selection from the already selected row
                    $(this).removeClass('success');

                    // Enabled the edit and delete actions if they exist
                    $.each($('#' + domId + '-' + field.id + '-actions').find('button'), function (index) {
                        if ($(this).attr('data-actionbinding') == ManyWhoConstants.ACTION_BINDING_SAVE) {
                            //$(this).attr('disabled', 'disabled');
                        }
                    });
                }
                else {
                    // Remove any selections that exist on the table
                    $('#' + domId + '-' + field.id + '-field').find('tr').removeClass('success');

                    // Make the current row selected
                    $(this).addClass('success');

                    // Enabled the edit and delete actions if they exist
                    $.each($('#' + domId + '-' + field.id + '-actions').find('button'), function (index) {
                        if ($(this).attr('data-actionbinding') == ManyWhoConstants.ACTION_BINDING_SAVE) {
                            //$(this).removeAttr('disabled');
                        }
                    });
                }
            });
        }

        // Write the storage object back to the db
        $('#' + domId + '-' + field.id + '-database').data(field.id, storageObject);
    };

    // This function adds sharedjs to the field so we get the realtime capabilities
    //
    var addFieldCollaboration = function (domId, field) {
        var addSocial = false;

        // Make sure the settings are for this page to have realtime collaboration
        if ($('#' + domId + '-add-social').val() == 'true') {
            // Collaboration also depends on field type
            if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX.toUpperCase()) {
                if (field.contentType.toLowerCase() != ManyWhoConstants.CONTENT_TYPE_PASSWORD.toLowerCase()) {
                    addSocial = true;
                }
            } else if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX.toUpperCase()) {
                addSocial = true;
            }

            // Check to see if we are adding social to the field and add it if necessary!
            if (addSocial == true) {
                var documentElement = document.getElementById(domId + '-' + field.id + '-field');

                // Open the share js connection for this state and this field
                sharejs.open($('#' + domId + '-state-id').val() + '-' + field.id, 'text', ManyWhoConstants.NODE_BASE_PATH + '/nodeApp/channel', function (error, doc) {
                    window.doc = doc;
                    if (error) {
                        console.log(error);
                    } else {
                        documentElement.disabled = false;
                        doc.attach_textarea(documentElement);
                    }
                });
            }
        }
    };

    // This function is used to create the standard field layout for all fields.  This ensures we have a consistent printing
    // of html across all field types - with the flexibility to be adaptive for each type.
    //
    var buildFieldLayout = function (domId, field, formMetaData, eventCallback, fieldHtml) {
        var html = null;
        var span = null;

        html = '';

        // Check to see if the flow is using a specific 'span' tag in their flow
        if (formMetaData.tags != null &&
            formMetaData.tags.length > 0) {
            for (var i = 0; i < formMetaData.tags.length; i++) {
                var tagValue = formMetaData.tags[i];

                // Check to see if the tag is named "span" - if so, we apply that to the div rather than the default style
                if (tagValue.developerName.toLowerCase() == 'span') {
                    span = tagValue.contentValue;
                    break;
                }
            }
        }

        if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_TABLE ||
            field.componentType == ManyWhoConstants.COMPONENT_TYPE_TAG) {
            html += '<div id="' + domId + '-' + field.id + '">';
        } else if (span != null &&
                   span.trim().length > 0) {
            html += '<div id="' + domId + '-' + field.id + '" class="' + span + '">';
        } else {
            html += '<div id="' + domId + '-' + field.id + '" style="display: inline-block; margin-right: 5px;">';
        }

        html += '<div id="' + domId + '-' + field.id + '-properties" class="manywho-form-field-reference" data-fieldid="' + field.id + '" data-required="' + formMetaData.isRequired + '" data-fieldtype="' + field.componentType + '">';
        html += '<div id="' + domId + '-' + field.id + '-database" style="display:none;"></div>';
        html += '<div id="' + domId + '-' + field.id + '-actions" class="manwho-form-field-actions"></div>';

        if (field.label != null &&
            field.label.trim().length > 0 &&
            field.componentType != ManyWhoConstants.COMPONENT_TYPE_IMAGE) {
            html += '<label>';
        }

        // Add the field html here
        html += fieldHtml;

        if (field.label != null &&
            field.label.trim().length > 0 &&
            field.componentType != ManyWhoConstants.COMPONENT_TYPE_IMAGE) {
            html += '<span class="text-info manywho-field-label">' + field.label + '</span></label>';
        }

        // Add in the help information if it has been provided
        if (field.helpInfo != null &&
            field.helpInfo.trim().length > 0) {
            html += '<a class="btn btn-info" href="#" id="' + domId + '-' + field.id + '-help-info"><i class="icon-question-sign icon-white"></i></a>';
        }

        html += '</div>';
        html += '</div>';

        // Add this field to the row of fields
        $('#' + field.pageContainerId).append(html);

        // Add the realtime social stuff to the field
        addFieldCollaboration(domId, field);

        if (field.helpInfo != null &&
            field.helpInfo.trim().length > 0) {
            $('#' + domId + '-' + field.id + '-help-info').popover({ title: 'Help', content: field.helpInfo });
        }

        // Apply the required status
        setRequired(domId, field.id, formMetaData.isRequired);

        // Set the visibility status for the field
        setVisible(domId, formMetaData.id, formMetaData.isVisible, formMetaData.isRequired);

        if (formMetaData.isVisible == true) {
            // Set the enabled status for the field
            setEnabled(domId, formMetaData.id, formMetaData.isEnabled, formMetaData.isRequired);

            // Set the editable status for the field
            setEditable(domId, formMetaData.id, formMetaData.isEditable, formMetaData.isRequired);
        }

        // If the field has events, we want to register those with the event manager
        if (field.hasEvents == true) {
            $('#' + domId + '-manywho-runtime-form-event-data').data(field.id, 'true');
            $('#' + domId + '-manywho-runtime-form-event-data').data(field.id + '-process-events', 'true');

            // Finally - add the event listener to notify the event manager
            $('#' + domId + '-' + field.id + '-field').die('change').live('change', function () {
                eventManager(domId, field.id, eventCallback);
            });
        }
    };

    // The event manager is used to execute events when fields have made changes.  The form runtime does not handle the events
    // inside the component, but rather relies on the parent container to manage events.  This is largely because the event
    // is likely to initiate multiple events on the flow container side - including sync of form metadata.
    //
    var eventManager = function (domId, fieldId, eventCallback) {
        // Check to see if this field has events - based on the information that was provided in the form metadata
        var hasEvents = $('#' + domId + '-manywho-runtime-form-event-data').data(fieldId);
        var processEvents = $('#' + domId + '-manywho-runtime-form-event-data').data(fieldId + '-process-events');

        // If the field has events and we also have a event callback handler, then we call the event
        if (hasEvents == 'true' &&
            processEvents == 'true' &&
            eventCallback != null) {
            eventCallback.call(this, fieldId);
        }
    };

    // This is a utility method that iterates through the provided form meta data list to find the entry
    // that corresponds with the field id.
    //
    var getFormMetaData = function (formMetaData, fieldId) {
        var matchedEntry = null;

        if (formMetaData != null &&
            formMetaData.length > 0) {
            for (var i = 0; i < formMetaData.length; i++) {
                if (formMetaData[i].pageComponentId == fieldId) {
                    matchedEntry = formMetaData[i];
                    break;
                }
            }
        }

        return matchedEntry;
    };

    // This method handles the different field types by generating the specific html that is unique to each of them.  This is one of the
    // only bits that is not generic across all fields.
    //
    var generateFieldHtmlForFieldType = function (domId, field, formMetaData) {
        var fieldHtml = null;
        var fieldType = null;
        var fieldSize = null;
        var multiModifier = null;
        var uiDataType = null;

        // Make sure we don't have case issues with the field type (which is always uppercase)
        fieldType = field.componentType.toUpperCase();

        // Assign the ui data type based on the field
        uiDataType = field.contentType;

        // We have built a tag that allows the author to override the field type of the underlying data. This should be used wisely.  In the use-case
        // we have been using this tag, it has been to get the user to enter a date or number, but to store it as a string (that can store anything)
        if (formMetaData.tags != null &&
            formMetaData.tags.length > 0) {
            for (var i = 0; i < formMetaData.tags.length; i++) {
                var tagValue = formMetaData.tags[i];

                // Check to see if the tag is named "span" - if so, we apply that to the div rather than the default style
                if (tagValue.developerName.toLowerCase() == 'uidatatype') {
                    uiDataType = tagValue.contentValue.toUpperCase();
                    break;
                }
            }
        }

        // We need to map the designers absolute field sizing over to a bootstrap equivalent - the mappings are here
        if (field.size > 0) {
            if (field.size < 10) {
                fieldSize = ' input-mini';
            } else if (field.size < 20) {
                fieldSize = ' input-small';
            } else if (field.size < 30) {
                fieldSize = ' input-medium';
            } else if (field.size < 50) {
                fieldSize = ' input-large';
            } else if (field.size < 70) {
                fieldSize = ' input-xlarge';
            } else {
                fieldSize = ' input-xxlarge';
            }
        }

        if (field.width > 0) {
            if (field.width < 10) {
                fieldSize = ' input-mini';
            } else if (field.width < 20) {
                fieldSize = ' input-small';
            } else if (field.width < 30) {
                fieldSize = ' input-medium';
            } else if (field.width < 50) {
                fieldSize = ' input-large';
            } else if (field.width < 70) {
                fieldSize = ' input-xlarge';
            } else {
                fieldSize = ' input-xxlarge';
            }
        }

        if (fieldType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX.toUpperCase()) {
            if (uiDataType.toLowerCase() == ManyWhoConstants.CONTENT_TYPE_NUMBER.toLowerCase()) {
                fieldHtml = '<input id="' + domId + '-' + field.id + '-field" type="number" class="manywho-runtime-inputbox-field' + fieldSize + '" placeholder="' + field.hintValue + '" maxsize="' + field.maxSize + '" size="' + field.size + '" value="' + formMetaData.contentValue + '" /><br />';
            } else if (uiDataType.toLowerCase() == ManyWhoConstants.CONTENT_TYPE_DATETIME.toLowerCase()) {
                fieldHtml = '<input id="' + domId + '-' + field.id + '-field" type="datetime" class="manywho-runtime-inputbox-field' + fieldSize + '" placeholder="' + field.hintValue + '" maxsize="' + field.maxSize + '" size="' + field.size + '" value="' + formMetaData.contentValue + '" /><br />';
            } else if (uiDataType.toLowerCase() == ManyWhoConstants.CONTENT_TYPE_PASSWORD.toLowerCase()) {
                fieldHtml = '<input id="' + domId + '-' + field.id + '-field" type="password" class="manywho-runtime-inputbox-field' + fieldSize + '" placeholder="' + field.hintValue + '" maxsize="' + field.maxSize + '" size="' + field.size + '" value="' + formMetaData.contentValue + '" /><br />';
            } else {
                fieldHtml = '<input id="' + domId + '-' + field.id + '-field" type="text" class="manywho-runtime-inputbox-field' + fieldSize + '" placeholder="' + field.hintValue + '" maxsize="' + field.maxSize + '" size="' + field.size + '" value="' + formMetaData.contentValue + '" /><br />';
            }
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CONTENT.toUpperCase()) {
            fieldHtml = '';
            fieldHtml += '<div class="btn-toolbar">';
            fieldHtml += '<div class="btn-group" id="' + domId + '-' + field.id + '-field-toolbar">';
            fieldHtml += '<a class="btn" data-wysihtml5-command="bold" title="CTRL+B" href="#"><i class="icon-bold"></i></a>';
            fieldHtml += '<a class="btn" data-wysihtml5-command="italic" title="CTRL+I" href="#"><i class="icon-italic"></i></a>';
            fieldHtml += '<a class="btn" data-wysihtml5-action="change_view"><i class="icon-eye-close"></i></a>';
            fieldHtml += '</div>';
            fieldHtml += '</div>';
            fieldHtml += '<textarea id="' + domId + '-' + field.id + '-field" class="manywho-runtime-content-field" placeholder="' + field.hintValue + '" style="height: ' + (field.height * 10) + 'px; width: ' + (field.width * 4) + 'px;">' + formMetaData.contentValue + '</textarea><br />';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CHECKBOX.toUpperCase()) {
            if (formMetaData.contentValue != null &&
                formMetaData.contentValue.trim().toLowerCase() == 'true') {
                fieldHtml = '<input id="' + domId + '-' + field.id + '-field" type="checkbox" checked="checked" class="manywho-runtime-inputbox-field' + fieldSize + '" /> ';
            } else {
                fieldHtml = '<input id="' + domId + '-' + field.id + '-field" type="checkbox" class="manywho-runtime-inputbox-field' + fieldSize + '" /> ';
            }
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX.toUpperCase()) {
            fieldHtml = '<textarea id="' + domId + '-' + field.id + '-field" class="manywho-runtime-textarea-field' + fieldSize + '" placeholder="' + field.hintValue + '" rows="' + field.height + '" cols="' + field.width + '">' + formMetaData.contentValue + '</textarea><br />';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX.toUpperCase()) {
            multiModifier = '';

            if (field.isMultiSelect == true) {
                multiModifier = ' multiple';
            }

            fieldHtml = '<select id="' + domId + '-' + field.id + '-field"' + multiModifier + ' size="1" class="manywho-runtime-combobox-field"></select><br />';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TABLE.toUpperCase()) {
            fieldHtml = '<div style="overflow: auto; max-height: 300px;"><table id="' + domId + '-' + field.id + '-field" class="table table-hover table-condensed table-bordered manywho-runtime-table-field" data-mode="select"></table></div>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_PRESENTATION.toUpperCase()) {
            fieldHtml = '<div id="' + domId + '-' + field.id + '-field" class="manywho-runtime-presentation-field"></div>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TAG.toUpperCase()) {
            fieldHtml = '<div id="' + domId + '-' + field.id + '-field" class="manywho-runtime-tag-field"></div>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_IMAGE.toUpperCase()) {
            fieldHtml = '<img id="' + domId + '-' + field.id + '-field" class="manywho-runtime-image-field" height="' + field.height + '" width="' + field.width + '" alt="' + field.label + '" src="' + formMetaData.content + '" />';
        }

        return fieldHtml;
    };

    // This is the generic method for creating outcomes.
    //
    var generateOutcome = function (domId, externalDomId, outcomeId, label, onClickFunction, formElementBindingId, formActionBinding, viewStateDomElement, mapElementId) {
        var outcomeDomId = null;
        var buttonClass = 'btn';

        // Check to see if the user wants the outcomes to be printed somewhere else
        if (formElementBindingId != null &&
            formElementBindingId.trim().length > 0) {
            outcomeDomId = domId + '-' + formElementBindingId + '-actions';
        } else if (externalDomId != null &&
                   externalDomId.trim().length > 0) {
            outcomeDomId = externalDomId;
        } else {
            outcomeDomId = domId + '-outcomes';
        }

        if (formActionBinding == ManyWhoConstants.ACTION_BINDING_SAVE ||
            (formElementBindingId != null &&
             formElementBindingId.trim().length > 0)) {
            buttonClass += ' btn-primary';
        } else if (outcomeId.toLowerCase() == ManyWhoConstants.DEBUG_GUID.toLowerCase()) {
            buttonClass += ' btn-warning';
        }

        // Print the outcome button
        $('#' + outcomeDomId).append('<button class="' + buttonClass + ' manywho-outcome-button" id="' + domId + '-' + outcomeId + '" data-actionbinding="' + formActionBinding + '">' + label + '</button>&nbsp;');

        // Make sure we show the field outcomes action div
        if (formElementBindingId != null &&
            formElementBindingId.trim().length > 0) {
            $('#' + outcomeDomId).show();
        }

        $('#' + domId + '-' + outcomeId).click(function (event) {
            // Make sure we don't cause any linking issues or page refreshes
            event.preventDefault();

            // Disable all of the outcome buttons on the form
            $('#' + domId).find('.manywho-outcome-button').attr('disabled', 'disabled');

            if (externalDomId != null &&
                externalDomId.trim().length > 0) {
                $('#' + externalDomId).find('.manywho-outcome-button').attr('disabled', 'disabled');
            }

            // Grab the list of sections and attempt to find the selected tab - we remember this in case we return to this form and step again
            $('#' + domId + '-sections-selector').find('li').each(function (index) {
                // Check to see if this is the active tab - if so we save that info into the dom
                if (viewStateDomElement != null &&
                    $(this).hasClass('active') == true) {
                    $('#' + viewStateDomElement).data(mapElementId, $(this).attr('id'));
                }
            });

            // Check to make sure all of the fields are valid - and prompt the user if they're not
            var isValid = validateFieldValues(domId);

            if (isValid == true) {
                // If the form validates OK, we proceed with the onClick function
                onClickFunction.call(this, outcomeId);
            }
        });
    };

    // This is a utility function for creating all field types in one method.
    //
    var createField = function (domId, field, formMetaData, eventCallback) {
        var fieldHtml = null;

        // If the content value is null, we want to blank it out so the null doesn't get printed into the html
        if (formMetaData.contentValue == null) {
            formMetaData.contentValue = '';
        }

        // If the hint value is null, we blank that out too for the same reason
        if (field.hintValue == null) {
            field.hintValue = '';
        }

        // Generate the field specific html
        fieldHtml = generateFieldHtmlForFieldType(domId, field, formMetaData);

        // Send the input field to the build field call - this will print the field also
        buildFieldLayout(domId, field, formMetaData, eventCallback, fieldHtml);

        // Create the storage object so we have it for updates - this contains the data we need to recreate the field, etc
        storageObject = new Object();
        storageObject.field = field;
        // This contains the data we get from an object data callback or the data from the actual hard-coded meta-data
        storageObject.objectData = formMetaData.objectData;
        storageObject.formMetaData = formMetaData;

        // We store the storage object using the field id as the placeholder - not needed for any particular reason
        $('#' + domId + '-' + field.id + '-database').data(field.id, storageObject);

        // Make the outcome actions area invisible for now
        $('#' + domId + '-' + field.id + '-actions').hide();

        // If we have an object data request or any object data for select type fields, we do that operation here
        if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX ||
            field.componentType == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
            createUIForObjectData(domId, field, formMetaData, null);
        } else if (field.componentType == ManyWhoConstants.COMPONENT_TYPE_TAG) {
            // We have logic here very specific to tag fields as we need to generate those
            if (formMetaData.tags != null &&
                formMetaData.tags.length > 0) {
                // At the moment, this only supports one tag and we always take the first one
                $('#' + domId + '-' + field.id + '-field').manywhoTagComponent({ register: getTagImplementation(domId, formMetaData.tags[0]) });
            }
        }

        // Return the field id as we may need this to help with mash-ups
        return domId + '-' + field.id;
    };

    // This method is used to retrieve the correct tag component implementation from the register
    //
    var getTagImplementation = function (domId, tag) {
        // Get the component out based on the developername rather than the id
        var component = $('#' + domId + '-registry').data(tag.developerName);

        if (component == null) {
            alert('Component could not be found for tag: ' + tag.developerName);
        }

        return component;
    };

    // This is a general purpose method for setting the enabled status on fields.
    //
    var setVisible = function (domId, fieldId, isVisible, isRequired) {
        if (isVisible == true) {
            // Make the field visible
            $('#' + domId + '-' + fieldId).show();
            $('#' + domId + '-' + fieldId).attr('data-visible', 'true');

            // We also want to re-switch on the required status if the field is in fact required
            if (isRequired == true) {
                setRequired(domId, fieldId, true);
            }
        } else {
            // Make the field invisible
            $('#' + domId + '-' + fieldId).hide();
            $('#' + domId + '-' + fieldId).attr('data-visible', 'false');

            // We switch off the required indicators as the field cannot be disabled and required at the same time
            setRequired(domId, fieldId, false);
        }

        // Make sure the cell is visible depending on the visibility of the fields
        setCellVisibilityBasedOnFields(domId, fieldId);
    };

    // This method adds an error message to the field if anything comes back from the service.
    //
    var setMessage = function (domId, fieldId, isValid, message) {
        if (isValid == false) {
            $('#' + domId + '-' + fieldId).append('<div class="alert alert-error manywho-field-message">' + message + '</div>');
        }
    };

    // This method makes the cell invisible if all of the contained fields are not visible - making sure we don't have empty space if all the fields
    // inside the cell have been made invisible.
    //
    var setCellVisibilityBasedOnFields = function (domId, fieldId) {
        var hasVisibleFields = false;

        // Go up the dom and find the parent cell fields and then iterate through that list - we only want the first
        $('#' + domId + '-' + fieldId).parents('.manywho-form-cell-fields-span').each(function (index) {
            // Now that we have the parent, we want to iterate through the child fields
            $(this).children().each(function (childIndex) {
                if ($(this).attr('data-visible') == 'false') {
                } else {
                    hasVisibleFields = true;
                    return false;
                }
            });

            if (hasVisibleFields == true) {
                // Make sure the cell is visible also
                $(this).show();

                return false;
            } else {
                // Hide the whole cell
                $(this).hide();
            }
        });

        return hasVisibleFields;
    };

    // This is a general purpose method for setting the editable status on fields.
    //
    var setEditable = function (domId, fieldId, isEditable, isRequired) {
        if (isEditable == true) {
            // Remove the readonly attribute from the field
            $('#' + domId + '-' + fieldId + '-field').removeAttr('readonly');
            // Remove the readonly attribute from the outcomes
            $('#' + domId + '-' + fieldId + '-actions').find('.manywho-outcome-button').removeAttr('readonly');

            // We also want to re-switch on the required status if the field is in fact required
            if (isRequired == true) {
                setRequired(domId, fieldId, true);
            }
        } else {
            // Add the readonly attribute to the field
            $('#' + domId + '-' + fieldId + '-field').attr('readonly', 'readonly');
            $('#' + domId + '-' + fieldId + '-field').removeClass('manywho-runtime-field-required-failed');

            // Add the readonly attribute to each of the outcomes
            $('#' + domId + '-' + fieldId + '-actions').find('.manywho-outcome-button').attr('readonly', 'readonly');

            // We switch off the required indicators as the field cannot be readonly and required at the same time
            setRequired(domId, fieldId, false);
        }
    };

    // This is a general purpose method for setting the enabled status on fields.
    //
    var setEnabled = function (domId, fieldId, isEnabled, isRequired) {
        if (isEnabled == true) {
            // Remove the disabled attribute from the field
            $('#' + domId + '-' + fieldId + '-field').removeAttr('disabled');
            // Remove the disabled attribute from the outcomes
            $('#' + domId + '-' + fieldId + '-actions').find('.manywho-outcome-button').removeAttr('disabled');

            // We also want to re-switch on the required status if the field is in fact required
            if (isRequired == true) {
                setRequired(domId, fieldId, true);
            }
        } else {
            // Add the disabled attribute to the field
            $('#' + domId + '-' + fieldId + '-field').attr('disabled', 'disabled');
            $('#' + domId + '-' + fieldId + '-field').removeClass('manywho-runtime-field-required-failed');

            // Add the disabled attribute to each of the outcomes
            $('#' + domId + '-' + fieldId + '-actions').find('.manywho-outcome-button').attr('disabled', 'disabled');

            // We switch off the required indicators as the field cannot be disabled and required at the same time
            setRequired(domId, fieldId, false);
        }
    };

    // This is a general purpose method for setting the required status on fields.
    //
    var setRequired = function (domId, fieldId, isRequired) {
        if (isRequired == true) {
            $('#' + domId + '-' + fieldId).addClass('manywho-runtime-field-required');
            $('#' + domId + '-' + fieldId).removeClass('manywho-runtime-field-not-required');
        } else {
            $('#' + domId + '-' + fieldId).removeClass('manywho-runtime-field-required');
            $('#' + domId + '-' + fieldId).addClass('manywho-runtime-field-not-required');
        }
    };

    // This method is used to get the actual field for the field type - we can then get the value from it
    // depending on the field type.
    //
    var getFieldValue = function (domId, fieldId, fieldType) {
        var value = null;

        fieldType = $('#' + domId + '-' + fieldId + '-properties').attr('data-fieldtype');
        fieldType = fieldType.toUpperCase();

        if (fieldType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX) {
            value = $('#' + domId + '-' + fieldId + '-field').val();
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) {
            value = $('#' + domId + '-' + fieldId + '-field').val();
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_NUMBER) {
            value = $('#' + domId + '-' + fieldId + '-field').val();
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_DATETIME) {
            value = $('#' + domId + '-' + fieldId + '-field').val();
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CONTENT) {
            value = $('#' + domId + '-' + fieldId + '-field').val();
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
            // The value will be the unique identifier for the selected object
            value = $('#' + domId + '-' + fieldId + '-field').val();

            // Grab the storage object for this field id - this will contain the object data that was used to populate the ui element
            var storageObject = $('#' + domId + '-' + fieldId + '-database').data(fieldId);

            // Check to see if it's null
            if (storageObject != null &&
                storageObject.objectData != null &&
                storageObject.objectData.length > 0) {
                for (var i = 0; i < storageObject.objectData.length; i++) {
                    var objectData = storageObject.objectData[i];

                    // Check to see if the id of this object matches the selected value
                    if (objectData.externalId == value) {
                        // We have the selected value - convert that into an array as we also support multi-select with this
                        value = [objectData];
                        break;
                    }
                }
            }
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
            // Grab the storage object for this field id - this will contain the object data that was used to populate the ui element
            // and any data that may have been added
            var value = new Array();
            var storageObject = $('#' + domId + '-' + fieldId + '-database').data(fieldId);

            // Find the selected rows and grab the id from the tr
            $.each($('#' + domId + '-' + fieldId + '-field').find('tr.success'), function (index) {
                var mode = null;
                var entryId = $(this).attr('id');

                // Now grab the full object from our storage object and add that to our value array
                if (storageObject != null &&
                    storageObject.objectData != null &&
                    storageObject.objectData.length > 0) {
                    for (var i = 0; i < storageObject.objectData.length; i++) {
                        var objectData = storageObject.objectData[i];

                        // Check to see if the id of this object matches the selected value
                        if (objectData.externalId == entryId) {
                            // We have the selected value - though we may have more, so we don't break
                            value[value.length] = objectData;
                        }
                    }
                }
            });
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CHECKBOX) {
            if ($('#' + domId + '-' + fieldId).attr('data-visible') != 'false') {
                if ($('#' + domId + '-' + fieldId + '-field').attr('checked') != null) {
                    value = 'true';
                } else {
                    value = 'false';
                }
            } else {
                // We don't want to send back a false if the field is disabled - we only do this for checkboxes as they always
                // have a value even if the user hasn't selected anything
                value = null;
            }
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) {
            // Presentation fields don't have a value
            value = null;
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TAG) {
            // Defer the value getting to the tag component implementation
            value = $('#' + domId + '-' + fieldId + '-field').manywhoTagComponent('getValue');
        }

        return value;
    };

    // This method is used to set the actual field for the field type.
    //
    var setFieldValue = function (domId, fieldId, fieldType, value, objectData) {
        fieldType = $('#' + domId + '-' + fieldId + '-properties').attr('data-fieldtype');
        fieldType = fieldType.toUpperCase();

        if (fieldType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX) {
            $('#' + domId + '-' + fieldId + '-field').val(value);
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) {
            $('#' + domId + '-' + fieldId + '-field').val(value);
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_NUMBER) {
            $('#' + domId + '-' + fieldId + '-field').val(value);
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_DATETIME) {
            $('#' + domId + '-' + fieldId + '-field').val(value);
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CONTENT) {
            $('#' + domId + '-' + fieldId + '-field').val(value);
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
            // If the value is null, we blank it so jquery will select the default option
            if (value == null) {
                value = '';
            }

            // The value will be the unique identifier for the selected object
            $('#' + domId + '-' + fieldId + '-field').val(value);
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CHECKBOX) {
            if (value == true ||
                (value != null &&
                 value.toLowerCase() == 'true')) {
                $('#' + domId + '-' + fieldId + '-field').attr('checked', 'checked');
            } else {
                $('#' + domId + '-' + fieldId + '-field').removeAttr('checked');
            }
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) {
            $('#' + domId + '-' + fieldId + '-field').html(value);
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TAG) {
            // Defer the value setting to the tag component implementation
            $('#' + domId + '-' + fieldId + '-field').manywhoTagComponent('setValue', value, objectData);
        }
    };

    // This method validates that the field is in fact valid at the most basic level.  We may want to add additional support to 
    // check for things like correct numbers, dates, etc to save any additional server side processing.
    //
    var validateFieldValue = function (domId, fieldId, fieldType) {
        var isValid = true;
        var isRequired = $('#' + domId + '-' + fieldId + '-properties').attr('data-required');

        if (fieldType != ManyWhoConstants.COMPONENT_TYPE_PRESENTATION &&
            (isRequired == true ||
             isRequired == 'true')) {
            var value = getFieldValue(domId, fieldId, fieldType);

            // If the value is an object of any kind, the null test will apply - otherwise we need to do very specific, type
            // specific tests
            if (value == null) {
                isValid == false;
            } else {
                // Check to see if the value is an array first
                if (Object.prototype.toString.call(value) === '[object Array]') {
                    if (value.length == 0) {
                        isValid = false;
                    }
                    // Now check if the value is a string
                } else if (typeof value === 'string') {
                    if (value.trim().length == 0) {
                        isValid = false;
                    }
                }
            }

            // If the field value is not valid, we tag it with the css reference - this allows the UI to indicate to the user that
            // the value isn't right just yet
            if (isValid == false) {
                $('#' + domId + '-' + fieldId).addClass('manywho-runtime-field-required-failed');
            } else {
                $('#' + domId + '-' + fieldId).removeClass('manywho-runtime-field-required-failed');
            }
        }

        return isValid;
    };

    // This method is used to validate every field in the form to check if the user has provided them correctly.
    //
    var validateFieldValues = function (domId) {
        var isValid = true;
        var results = null;

        // Query the results based on the id
        results = $('#' + domId).find('.manywho-form-field-reference');

        // Go through each of the fields in the result set and validate
        for (var i = 0; i < results.length; i++) {
            var result = results[i];

            // Check to see if the field is valid
            if (validateFieldValue(domId, $(result).attr('id'), $(result).attr('field-type')) == false) {
                isValid = false;
            }
        }

        return isValid;
    };

    // This method gets the field values for every field in the form.
    //
    var getFieldValues = function (domId) {
        var value = null;
        var results = null;
        var fields = new Array();

        // Query the results based on the id
        results = $('#' + domId).find('.manywho-form-field-reference');

        // Go through each of the fields in the result set and validate
        for (var i = 0; i < results.length; i++) {
            var result = results[i];

            // Get the attributes from the result object
            var fieldId = $(result).attr('data-fieldid');
            var fieldType = $(result).attr('data-fieldtype');

            // We don't record presentation fields in the value - these are simply for presentation
            if (fieldType != ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) {
                // Get the value from the field - we don't perform validation in this method
                value = getFieldValue(domId, fieldId, fieldType);

                // Add the value to the array
                fields[fields.length] = { 'pageComponentId': fieldId, 'contentValue': value, 'componentType': fieldType };
            }
        }

        return fields;
    };

    // Create the vertical flow block.
    //
    var createPageContainer = function (parentContainerType, parentPageContainerId, containerType, pageContainerId, pageContainerLabel, previouslySelectedTab) {
        var childCount = 0;
        var pageContainerHtml = null;

        pageContainerHtml = '';

        if (parentContainerType != null &&
            parentContainerType.trim().length > 0) {
            // Check to see what the parent properties are - this will dictate how we add the child and what additional html is needed
            if (parentContainerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_GROUP.toLowerCase()) {
                // Add the html for the tab group to the end of the list of tabs
                $('#' + parentPageContainerId + '-tabs-selector').append('<li id="' + pageContainerId + '-tab"><a href="#' + pageContainerId + '-tab-pane" data-toggle="tab">' + pageContainerLabel + '</a></li>');

                // We have a group sections so we build a tab for this panel
                pageContainerHtml += '<div id="' + pageContainerId + '-tab-pane" class="tab-pane">';

                // Get the number of existing tabs
                childCount = $('#' + parentPageContainerId).children().length;
            } else if (parentContainerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW.toLowerCase()) {
                // We have a horizontal flow, so we need to add this new panel as a column rather than a row
                pageContainerHtml += '<div id="' + pageContainerId + '-column" class="span1">';
            }
        }

        // Now we've handled the parent html stuff, we can add the html for this container
        if (containerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_GROUP.toLowerCase()) {
            // Create the group container as tabs
            // The tab container doesn't have a label currently - we ignore labels with this group type for this type of rendering
            pageContainerHtml = '';
            pageContainerHtml += '<div id="' + pageContainerId + '-tabs" class="tabbable">';
            pageContainerHtml += '  <ul id="' + pageContainerId + '-tabs-selector" class="nav nav-tabs">';
            pageContainerHtml += '  </ul>';
            pageContainerHtml += '  <div id="' + pageContainerId + '" class="tab-content">';
            pageContainerHtml += '  </div>';
            pageContainerHtml += '</div>';
        } else {
            pageContainerHtml += '<div id="' + pageContainerId + '-row" class="row-fluid">';

            if (containerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_INLINE_FLOW.toLowerCase()) {
                pageContainerHtml += '<div id="' + pageContainerId + '" class="span12 manywho-form-cell-fields-span">';
            } else {
                pageContainerHtml += '<div id="' + pageContainerId + '" class="span12">';
            }

            // Add the header to the row
            if (pageContainerLabel != null &&
                pageContainerLabel.trim().length > 0 &&
                (parentContainerType == null ||
                 parentContainerType.toLowerCase() != ManyWhoConstants.CONTAINER_TYPE_GROUP.toLowerCase())) {
                pageContainerHtml += '<h3>' + pageContainerLabel + '</h3>';
            }

            pageContainerHtml += '</div>';
            pageContainerHtml += '</div>';
        }

        if (parentContainerType != null &&
            parentContainerType.trim().length > 0) {
            // Add the final div for the more complex parent types
            if (parentContainerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW.toLowerCase() ||
                parentContainerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_GROUP.toLowerCase()) {
                pageContainerHtml += '</div>';
            }
        }

        // Add the html for the container to the parent container
        $('#' + parentPageContainerId).append(pageContainerHtml);

        if (parentContainerType != null &&
            parentContainerType.trim().length > 0) {
            if (parentContainerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_GROUP.toLowerCase()) {
                // Make sure the first tab is active
                if ((previouslySelectedTab == pageContainerId) ||
                    (previouslySelectedTab == null &&
                     childCount == 0)) {
                    $('#' + pageContainerId + '-tab').addClass('active');
                    $('#' + pageContainerId + '-tab-pane').addClass('active');
                }
            } else if (parentContainerType.toLowerCase() == ManyWhoConstants.CONTAINER_TYPE_HORIZONTAL_FLOW.toLowerCase()) {
                // Now we need to rejig the spans so the layout is correct
                reorientSpans('#' + parentPageContainerId);
            }
        }
    };

    // This method does the complex reorientation of the twitter bootstrap spans for the provided selector
    //
    var reorientSpans = function (selector) {
        var columns = 0;
        var columnInterval = 0;

        // Now we need to rejig the spans so the layout is correct
        // We need to actually iterate over the columns to check if they are visible - if not, we don't want to count them
        $(selector).children('div').each(function (index, element) {
            if ($(element).css('display') != 'none') {
                columns++;
            }
        });

        // Get the interval for the spans
        columnInterval = Math.floor(12 / columns);

        // Iterate over the columns
        $(selector).children().each(function (index, element) {
            if ($(element).css('display') != 'none') {
                // Change the span class appropriately
                $(element).attr('class', 'span' + columnInterval);
            }
        });
    };

    // This is an iterative method for assembling the page containers
    //
    var assemblePageContainers = function (parentContainerType, parentPageContainerId, pageContainerResponses) {
        if (pageContainerResponses != null &&
            pageContainerResponses.length > 0) {
            // Sort the page containers so they appear in the right order
            pageContainerResponses.sort(function (pageContainerResponseA, pageContainerResponseB) {
                if (pageContainerResponseA.order > pageContainerResponseB.order) {
                    return 1;
                } else if (pageContainerResponseA.order < pageContainerResponseB.order) {
                    return -1;
                } else {
                    return 0;
                }
            });

            // Go through all of the page containers one-by-one
            for (var i = 0; i < pageContainerResponses.length; i++) {
                var pageContainerResponse = pageContainerResponses[i];

                // Create the actual container
                createPageContainer(parentContainerType, parentPageContainerId, pageContainerResponse.containerType, pageContainerResponse.id, pageContainerResponse.label);

                // If this page container has page containers, we write those now too
                assemblePageContainers(pageContainerResponse.containerType, pageContainerResponse.id, pageContainerResponse.pageContainerResponses);
            }
        }
    };

    // This is the main method for assembling / painting the complete form.
    //
    var assembleForm = function (domId, pageResponse, eventCallback, outcomeResponses, outcomeFunction, externalOutcomeDomId, formLabelPanel, viewStateDomElement, mapElementId) {
        // First we assemble the whole page
        if (pageResponse != null) {
            // Write the label if one exists
            if (pageResponse.label != null &&
                pageResponse.label.trim().length > 0) {
                $('#' + formLabelPanel).html(pageResponse.label);
            }

            // Assemble all of the page containers
            assemblePageContainers(null, domId + '-page', pageResponse.pageContainerResponses);

            // Now that we have our page containers, we add the components
            if (pageResponse.pageComponentResponses != null &&
                pageResponse.pageComponentResponses.length > 0) {
                // Do a dual sort prioritizing page container id first
                pageResponse.pageComponentResponses.sort(function (pageComponentResponseA, pageComponentResponseB) {
                    if (pageComponentResponseA.pageContainerId > pageComponentResponseB.pageContainerId) {
                        return 1;
                    } else if (pageComponentResponseA.pageContainerId < pageComponentResponseB.pageContainerId) {
                        return -1;
                    } else {
                        // If the page container id's are the same, then we wort by order
                        if (pageComponentResponseA.order > pageComponentResponseB.order) {
                            return 1;
                        } else if (pageComponentResponseA.order < pageComponentResponseB.order) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });

                // Now we write out the components
                for (var l = 0; l < pageResponse.pageComponentResponses.length; l++) {
                    var pageComponentResponse = pageResponse.pageComponentResponses[l];

                    // Get the data for this particular component
                    var pageComponentData = getFormMetaData(pageResponse.pageComponentDataResponses, pageComponentResponse.id);

                    // Create the field in our form
                    createField(domId, pageComponentResponse, pageComponentData, eventCallback);
                }
            }

            // Finally, we print our the outcome responses for the user actions
            if (outcomeResponses != null &&
                outcomeResponses.length > 0) {
                // Sort the outcomes so they appear in the right order
                outcomeResponses.sort(function (outcomeA, outcomeB) {
                    if (outcomeA.order > outcomeB.order) {
                        return 1;
                    } else if (outcomeA.order < outcomeB.order) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

                $('#' + domId + '-form-outcome-reference').val(externalOutcomeDomId);

                for (var j = 0; j < outcomeResponses.length; j++) {
                    var outcome = outcomeResponses[j];
                    generateOutcome(domId, externalOutcomeDomId, outcome.id, outcome.label, outcomeFunction, outcome.pageElementBindingId, outcome.pageActionBinding, viewStateDomElement, mapElementId);
                }
            }
        }
    };

    // This form simply updates the values on the form without repainting the whole layout.
    //
    var updateForm = function (domId, formResponse) {
        if (formResponse != null &&
            formResponse.pageComponentDataResponses != null &&
            formResponse.pageComponentDataResponses.length > 0) {
            // Remove all of the error messages
            $('#' + domId).find('.manywho-field-message').remove();

            for (var i = 0; i < formResponse.pageComponentDataResponses.length; i++) {
                var formMetaDataEntry = formResponse.pageComponentDataResponses[i];
                var storageObject = null;

                // Get the storage object for this field
                storageObject = $('#' + domId + '-' + formMetaDataEntry.pageComponentId + '-database').data(formMetaDataEntry.pageComponentId);
                storageObject.formMetaData = formMetaDataEntry;
                // This is a bit redundant until we work through the whole object data piece fully - the logic is right, but it's complicated
                storageObject.objectData = formMetaDataEntry.objectData;

                // Set the storage object for this field
                $('#' + domId + '-' + formMetaDataEntry.pageComponentId + '-database').data(formMetaDataEntry.pageComponentId, storageObject);

                // Set the required status for the field
                setRequired(domId, formMetaDataEntry.pageComponentId, formMetaDataEntry.isRequired);

                // Set the visibility status for the field
                setVisible(domId, formMetaDataEntry.pageComponentId, formMetaDataEntry.isVisible, formMetaDataEntry.isRequired);

                if (formMetaDataEntry.isVisible == true) {
                    // Set the enabled status for the field
                    setEnabled(domId, formMetaDataEntry.pageComponentId, formMetaDataEntry.isEnabled, formMetaDataEntry.isRequired);

                    // Set the editable status for the field
                    setEditable(domId, formMetaDataEntry.pageComponentId, formMetaDataEntry.isEditable, formMetaDataEntry.isRequired);
                }

                // Apply any error messages
                setMessage(domId, formMetaDataEntry.pageComponentId, formMetaDataEntry.isValid, formMetaDataEntry.validationMessage);

                // We only want to follow this path for hard-coded options as the list of object data is the 
                // complete list for those.  For async requests, this is the list of selected object data from the
                // remote source - and therefore should not be used to populate the list, but rather set the selected
                // options
                if (formMetaDataEntry.objectData != null &&
                    formMetaDataEntry.objectData.length > 0 &&
                    formMetaDataEntry.objectDataRequest == null &&
                    storageObject.field.componentType != ManyWhoConstants.COMPONENT_TYPE_TAG) {
                    var found = false;

                    // Reassign the objects based on the object data - this will handle the selection
                    createUIForObjectData(domId, storageObject.field, formMetaDataEntry, null);
                } else if (formMetaDataEntry.objectDataRequest != null &&
                           storageObject.field.componentType != ManyWhoConstants.COMPONENT_TYPE_TAG) {
                    // Now we grab the data in realtime from the data provider
                    ManyWhoObjectDataProxy.load('ManyWhoFormBootStrap.UpdateForm',
                                                $('#' + domId + '-tenant-id').val(),
                                                formMetaDataEntry.objectDataRequest,
                                                null,
                                                assignObjectDataRequestResponse(domId, storageObject.field, formMetaDataEntry),
                                                null);
                } else {
                    if (storageObject.field.componentType == ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) {
                        // We don't have a content value - we only have content
                        setFieldValue(domId, formMetaDataEntry.pageComponentId, storageObject.field.componentType, formMetaDataEntry.content);
                    } else {
                        // We have a content value to apply
                        setFieldValue(domId, formMetaDataEntry.pageComponentId, storageObject.field.componentType, formMetaDataEntry.contentValue, formMetaDataEntry.objectData);
                    }
                }
            }
        }
    };

    // The response function for handling the asynchronous data object request stuff
    //
    var assignObjectDataRequestResponse = function (domId, field, formMetaDataEntry) {
        return function (data, status, xhr) {
            // Assign the options to the selection menu
            createUIForObjectData(domId, field, formMetaDataEntry, data.objectData);
        }
    };

    var methods = {
        init: function (options) {
            var formHtml = '';
            var domId = $(this).attr('id');

            // Get the options provided by the user
            var opts = $.extend({}, $.fn.manywhoFormBootStrap.defaults, options);

            $(this).append('<input type="hidden" id="' + domId + '-form-outcome-reference" value="" />');
            $(this).append('<input type="hidden" id="' + domId + '-tenant-id" value="' + opts.tenantId + '" />');
            $(this).append('<input type="hidden" id="' + domId + '-state-id" value="' + opts.stateId + '" />');
            $(this).append('<input type="hidden" id="' + domId + '-add-social" value="' + opts.addRealtime + '" />');
            $(this).append('<div id="' + domId + '-registry" style="display:none;"></div>');
            $(this).append('<div id="' + domId + '-manywho-runtime-form-event-data" style="display:none;"></div>');

            // Check to see if we have any tag components to register
            if (opts.register != null &&
                opts.register.length > 0) {
                // Go through each of the components in the register
                for (var i = 0; i < opts.register.length; i++) {
                    var componentRegistration = opts.register[i];

                    // Add the component to the registry
                    $('#' + domId + '-registry').data(componentRegistration.tag, componentRegistration.component);
                }
            }

            // Check to see if the form has a label - if so - put that at the top
            if (opts.label != undefined) {
                formHtml += '<div class="page-header">';
                formHtml += '<h1>' + opts.label + '</h1>';
                formHtml += '</div>';
            }

            // Create the chassis for the sections
            formHtml += '<div id="' + domId + '-page"></div>';

            // Create the chassis for the outcomes
            formHtml += '<div id="' + domId + '-outcomes"></div>';

            // Add the form HTML to the element
            $(this).append(formHtml);
        },
        createSection: function (sectionId,
                                 sectionLabel,
                                 showSectionsTabs, 
                                 viewStateDomElement, 
                                 mapElementId) {
            var domId = $(this).attr('id');

            createSection(domId, sectionId, sectionLabel, showSectionsTabs, viewStateDomElement, mapElementId);
        },
        createColumn: function (sectionId,
                                columnId,
                                columnLabel) {
            var domId = $(this).attr('id');

            createColumn(domId, sectionId, columnId, columnLabel);
        },
        createCell: function (columnId,
                              cellId,
                              cellLabel) {
            var domId = $(this).attr('id');

            createCell(domId, columnId, cellId, cellLabel);
        },
        createInputBox: function (section,
                                  column,
                                  cell,
                                  field,
                                  formMetaData,
                                  eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }

            return fieldId;
        },
        createCheckBox: function (section,
                                  column,
                                  cell,
                                  field,
                                  formMetaData,
                                  eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_CHECKBOX) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }

            return fieldId;
        },
        createTextBox: function (section,
                                 column,
                                 cell,
                                 field,
                                 formMetaData,
                                 eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }

            return fieldId;
        },
        createComboBox: function (section,
                                  column,
                                  cell,
                                  field,
                                  formMetaData,
                                  eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }
        },
        createTable: function (section,
                               column,
                               cell,
                               field,
                               formMetaData,
                               eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }

            return fieldId;
        },
        createContent: function (section,
                                 column,
                                 cell,
                                 field,
                                 formMetaData,
                                 eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_CONTENT) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }

            return fieldId;
        },
        createPresentation: function (section,
                                      column,
                                      cell,
                                      field,
                                      formMetaData,
                                      eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }

            return fieldId;
        },
        createTag: function (section,
                             column,
                             cell,
                             field,
                             formMetaData,
                             eventCallback) {
            var fieldId = null;

            if (field.componentType.toUpperCase() == ManyWhoConstants.COMPONENT_TYPE_TAG) {
                fieldId = createField($(this).attr('id'), section, column, cell, field, formMetaData, eventCallback);
            } else {
                // TODO: throw an error
            }

            return fieldId;
        },
        createOutcome: function (externalDomId,
                                 outcomeId,
                                 outcomeLabel,
                                 onClickFunction,
                                 formElementBindingId,
                                 formActionBinding,
                                 viewStateDomElement,
                                 mapElementId) {
            var domId = $(this).attr('id');

            generateOutcome(domId, externalDomId, outcomeId, outcomeLabel, onClickFunction, formElementBindingId, formActionBinding, viewStateDomElement, mapElementId);
        },
        getFields: function () {
            var domId = $(this).attr('id');

            return getFieldValues(domId);
        },
        validateFields: function (id) {
            var domId = $(this).attr('id');

            return validateFieldValues(domId);
        },
        assemble: function (formResponse, eventCallback, outcomeResponses, outcomeFunction, externalOutcomeDomId, formLabelPanel, viewStateDomElement, mapElementId) {
            var domId = $(this).attr('id');

            // If the form assembly is using an external outcome placeholder, we remove the one on this form
            if (externalOutcomeDomId != null &&
                externalOutcomeDomId.trim().length > 0) {
                $('#' + domId + '-outcomes').remove();
            }

            // Call the function to assemble the form
            assembleForm(domId, formResponse, eventCallback, outcomeResponses, outcomeFunction, externalOutcomeDomId, formLabelPanel, viewStateDomElement, mapElementId);

            // Update the form with the form metadata
            updateForm(domId, formResponse);
        },
        update: function (formResponse) {
            var domId = $(this).attr('id');

            updateForm(domId, formResponse);
        },
        destroy: function () {
            var domId = $(this).attr('id');

            // Clear any outcomes - the custom reference and/or the standard reference
            $('#' + $('#' + domId + '-form-outcome-reference').val()).html('');
            $('#' + domId + '-outcomes').html('');

            // Destroy and ckeditors
            //$(this).find('.manywho-runtime-content-field').ckeditor(function () { this.destroy(); });

            $(this).html('');
        },
        reset: function (sectionId) {
            $(this).find('input').removeClass('manywho-runtime-field-required-failed');
            $(this).find('textarea').removeClass('manywho-runtime-field-required-failed');
            $(this).find('select').removeClass('manywho-runtime-field-required-failed');
        },
        finish: function () {
            // Add click events to the table fields
            $.each($(this).find('.manywho-runtime-table-field'), function (index) {
                var mode = null;
                var domId = $(this).attr('id');

                // Find out the edit mode for the table
                mode = $(this).attr('data-mode');

                // This section gives us the correct user experience depending on the mode of the table
                if (mode == 'select') {

                    // Check to see if we have any currently selected entries and enable/disable the buttons accordingly so the initially
                    // loaded state of the outcomes is OK
                    $.each($(this).find('tr'), function (index) {
                        var actions = null;

                        // Get the reference to the actions bar
                        actions = domId.substring(0, domId.length - '-field'.length);
                        actions = actions + '-actions';

                        // This is a selected row
                        if ($(this).hasClass('success')) {
                            // Enabled the edit and delete actions if they exist
                            $.each($('#' + actions).find('button'), function (index) {
                                if ($(this).attr('data-actionbinding') == ManyWhoConstants.ACTION_BINDING_SAVE) {
                                    //$(this).removeAttr('disabled');
                                }
                            });
                        } else {
                            // Enabled the edit and delete actions if they exist
                            $.each($('#' + actions).find('button'), function (index) {
                                if ($(this).attr('data-actionbinding') == ManyWhoConstants.ACTION_BINDING_SAVE) {
                                    //$(this).attr('disabled', 'disabled');
                                }
                            });
                        }
                    });
                } else if (mode == 'multiselect') {
                    $('#' + domId + ' tr').click(function () {
                        $(this).toggleClass('success');
                    });
                }
            });

            // Convert all of the content fields to have the wysihtml5 editor
            $.each($(this).find('.manywho-runtime-content-field'), function (index) {
                var editor = new wysihtml5.Editor($(this).attr('id'), {
                    toolbar: $(this).attr('id') + '-toolbar',
                    parserRules: wysihtml5ParserRules,
                    useLineBreaks: false
                });
            });
        }
    };

    $.fn.manywhoFormBootStrap = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoFormBootStrap');
        }
    };

    // Option default values
    $.fn.manywhoFormBootStrap.defaults = { addRealtime: false, label: '', sectionFormat: 'tabs', columnFormat: 'accordian', toggleHtml: null, register: null };

})(jQuery);
