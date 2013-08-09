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

    // Now we need to get the field "drop" working
    // Then add the highlight area for dragging sections, columns, fields, etc
    // Then work through the column reordering - so that the event checks the number of columns and rejigs the css
    // Then add the action buttons to delete sections, columns, fields, etc
    // Then start building the field flows - and also the column, section, etc flows - even for delete
    // We should treat the form the same way we treat the graph - it should constantly post back and refresh from the form on the server (this would
    // allow for collaborative form building also!!!!


    // If bored, have a look at streaming APIs in .NET - it may be time to start moving to that
    // Also - will want to rejig the WCF stuff over soon too - this needs to be the ASP.NET stuff - ideally before go-live

    // Makes the toolbar buttons draggable to the form
    //
    var createDraggable = function (domId, fieldType) {
        $('#' + domId + '-' + fieldType).draggable({
            connectToSortable: '.manywho-form-section-column-cell-fields',
            helper: 'clone',
            revert: 'invalid'
        });
    };

    // Adds a section to the form as well as a first column
    //
    var addSection = function (domId, sectionObjectData, columnObjectData, cellObjectData) {
        var sectionHtml = null;
        var sectionId = ManyWhoUtils.getGuid();
        var sectionLabel = null;

        // Get the label for the section - if we have one
        if (sectionObjectData != null) {
            if (sectionObjectData.properties != null &&
                sectionObjectData.properties.length > 0) {
                for (var i = 0; i < sectionObjectData.properties.length; i++) {
                    if (sectionObjectData.properties[i].developerName.toLowerCase() == 'label') {
                        sectionLabel = sectionObjectData.properties[i].contentValue;
                        break;
                    }
                }
            }
        }

        if (sectionLabel == null) {
            sectionLabel = '';
        }

        // Set this section to the selected section
        $('#' + domId + '-selected-section').val(sectionId);

        sectionHtml = '';
        sectionHtml += '<div id="' + domId + '-' + sectionId + '-section-row" data-id="' + sectionId + '" class="row-fluid manywho-form-section-grid">';
        sectionHtml +=      '<div id="' + domId + '-' + sectionId + '-section" class="span12">';
        sectionHtml +=          '<div class="manywho-formbuilder-control-left">';
        sectionHtml +=              '<i class="icon-plus-sign"></i>';
        sectionHtml +=              '<i class="icon-minus-sign" id="' + domId + '-section-' + sectionId + '-delete"></i>';
        sectionHtml +=              '<i class="icon-edit" id="' + domId + '-section-' + sectionId + '-edit"></i>';
        sectionHtml +=          '</div>';
        sectionHtml +=          '<div class="manywho-formbuilder-layout-label" id="' + domId + '-' + sectionId + '-section-label">' + sectionLabel + '</div>';
        sectionHtml +=          '<div class="manywho-formbuilder-control-right">';
        sectionHtml +=              '<i class="icon-move"></i>';
        sectionHtml +=          '</div>';
        sectionHtml +=          '<div id="' + domId + '-' + sectionId + '-columns" class="row-fluid manywho-form-section-columns">';
        sectionHtml +=          '</div>';
        sectionHtml +=      '</div>';
        sectionHtml += '</div>';

        $('#' + domId + '-form-sections').append(sectionHtml);

        // Create the events for the controls
        $('#' + domId + '-section-' + sectionId + '-edit').click(function (event) {
            var inputs = null;
            var formsection = $('#' + domId + '-data').data(sectionId);

            // We're storing an object and we need to pass it back in an array
            if (formsection != null) {
                formsection = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormSection', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formsection);

            ManyWhoSharedServices.showSubConfigDialog(450, 175, 'FORMSECTION', domId, domId + '-' + sectionId + '-section-row', sectionId, inputs, false, sectionOkCallback, true);
        });

        $('#' + domId + '-section-' + sectionId + '-delete').click(function (event) {
            var inputs = null;
            var formsection = $('#' + domId + '-data').data(sectionId);

            // We're storing an object and we need to pass it back in an array
            if (formsection != null) {
                formsection = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'delete', ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormSection', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formsection);

            ManyWhoSharedServices.showSubConfigDialog(150, 175, 'FORMSECTION', domId, domId + '-' + sectionId + '-section-row', sectionId, inputs, false, sectionOkCallback, true);
        });

        // Create the section object data and add it to our local database
        $('#' + domId + '-data').data(sectionId, sectionObjectData);

        // Only keep going up the stack if a column object has been provided
        if (columnObjectData != null) {
            // Add a column to this section
            addColumn(domId, sectionId, columnObjectData, cellObjectData);
        }

        $('.manywho-form-section-column').sortable({
            placeholder: 'manywho-sortable-placeholder',
            connectWith: '.manywho-form-section-column'
        });
        $('.manywho-form-section-column').disableSelection();

        return sectionId;
    };

    // Adds a column to the section as well as a first row for the column
    //
    var addColumn = function (domId, sectionId, columnObjectData, cellObjectData) {
        var columns = 0;
        var columnSpan = 0;
        var columnHtml = null;
        var placeholderCss = '';
        var cellId = ManyWhoUtils.getGuid();
        var columnId = ManyWhoUtils.getGuid();
        var columnLabel = null;

        // Get the label for the column - if we have one
        if (columnObjectData != null) {
            if (columnObjectData.properties != null &&
                columnObjectData.properties.length > 0) {
                for (var i = 0; i < columnObjectData.properties.length; i++) {
                    if (columnObjectData.properties[i].developerName.toLowerCase() == 'label') {
                        columnLabel = columnObjectData.properties[i].contentValue;
                        break;
                    }
                }
            }
        }

        if (columnLabel == null) {
            columnLabel = '';
        }

        // Set this column to the selected column
        $('#' + domId + '-selected-column').val(columnId);

        // Get the current number of columns in this section
        columns = $('#' + domId + '-' + sectionId + '-columns').children().length;
        columns = columns + 1;

        // Now calculate the column span
        columnSpan = Math.floor(12 / columns);

        // Create the column html
        columnHtml = '';
        columnHtml += '<div id="' + domId + '-' + sectionId + '-' + columnId + '-column" data-id="' + columnId + '" class="manywho-form-column-grid span1">';
        columnHtml +=       '<div class="manywho-formbuilder-control-left">';
        columnHtml +=           '<i class="icon-plus-sign"></i>';
        columnHtml +=           '<i class="icon-minus-sign" id="' + domId + '-column-' + columnId + '-delete"></i>';
        columnHtml +=           '<i class="icon-edit" id="' + domId + '-column-' + columnId + '-edit"></i>';
        columnHtml +=       '</div>';
        columnHtml +=       '<div class="manywho-formbuilder-layout-label text-info" id="' + domId + '-' + sectionId + '-' + columnId + '-column-label">' + columnLabel + '</div>';
        columnHtml +=       '<div class="manywho-formbuilder-control-right">';
        columnHtml +=           '<i class="icon-move"></i>';
        columnHtml +=       '</div>';
        columnHtml +=       '<div class="manywho-form-section-column-cells" id="' + domId + '-' + sectionId + '-' + columnId + '-cells"></div>';
        columnHtml += '</div>';

        // Add the column and adjust the span for all of the columns
        $('#' + domId + '-' + sectionId + '-columns').append(columnHtml);
        $('#' + domId + '-' + sectionId + '-columns').children().each(function (index, element) {
            $(element).attr('class', 'manywho-form-column-grid span' + columnSpan);
        });

        // Create the events for the controls
        $('#' + domId + '-section-' + columnId + '-edit').click(function (event) {
            var inputs = null;
            var formcolumn = $('#' + domId + '-data').data(columnId);

            // We're storing an object and we need to pass it back in an array
            if (formcolumn != null) {
                formcolumn = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormColumn', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formcolumn);

            ManyWhoSharedServices.showSubConfigDialog(450, 175, 'FORMCOLUMN', domId, domId + '-' + sectionId + '-' + columnId + '-column', columnId, inputs, false, columnOkCallback, true);
        });

        $('#' + domId + '-section-' + columnId + '-delete').click(function (event) {
            var inputs = null;
            var formcolumn = $('#' + domId + '-data').data(columnId);

            // We're storing an object and we need to pass it back in an array
            if (formcolumn != null) {
                formcolumn = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'delete', ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormColumn', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formcolumn);

            ManyWhoSharedServices.showSubConfigDialog(150, 175, 'FORMCOLUMN', domId, domId + '-' + sectionId + '-' + columnId + '-column', columnId, inputs, false, columnOkCallback, true);
        });

        // Create the column object data and add it to our local database
        $('#' + domId + '-data').data(columnId, columnObjectData);

        // Only keep going up the stack if a cell object has been provided
        if (cellObjectData != null) {
            // Add a row to this column
            addCell(domId, sectionId, columnId, cellObjectData);
        }

        // We only want to add the span stuff if we have more than one column - otherwise it messes up the bootstrap layout on drag
        if (columns > 1) {
            placeholderCss = ' span' + columnSpan;
        }

        // Finally, make it a sortable again so we have drag and drop for layout
        $('#' + domId + '-' + sectionId + '-columns').sortable({
            placeholder: 'manywho-sortable-placeholder' + placeholderCss,
            connectWith: '#' + domId + '-' + sectionId + '-columns'
        });
        $('#' + domId + '-' + sectionId + '-columns').disableSelection();

        return columnId;
    };

    // Adds a cell to the column, ready to accept fields
    //
    var addCell = function (domId, sectionId, columnId, cellObjectData) {
        var cellHtml = null;
        var cellId = ManyWhoUtils.getGuid();
        var cellLabel = null;

        // Get the label for the cell - if we have one
        if (cellObjectData != null) {
            if (cellObjectData.properties != null &&
                cellObjectData.properties.length > 0) {
                for (var i = 0; i < cellObjectData.properties.length; i++) {
                    if (cellObjectData.properties[i].developerName.toLowerCase() == 'label') {
                        cellLabel = cellObjectData.properties[i].value;
                        break;
                    }
                }
            }
        }

        if (cellLabel == null) {
            cellLabel = '';
        }

        cellHtml = '';
        cellHtml += '<div id="' + domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-cell-block" data-id="' + cellId + '" class="row-fluid manywho-form-cell-grid">';
        cellHtml +=     '<div id="' + domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-cell" class="span12 manywho-form-cell-grid-block">';
        cellHtml +=         '<div class="manywho-formbuilder-control-left">';
        cellHtml +=             '<i class="icon-plus-sign"></i>';
        cellHtml +=             '<i class="icon-minus-sign" id="' + domId + '-cell-' + cellId + '-delete"></i>';
        cellHtml +=             '<i class="icon-edit" id="' + domId + '-cell-' + cellId + '-edit"></i>';
        cellHtml +=         '</div>';
        cellHtml +=         '<div class="manywho-formbuilder-layout-label text-info" id="' + domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-cell-label">' + cellLabel + '</div>';
        cellHtml +=         '<div class="manywho-formbuilder-control-right">';
        cellHtml +=             '<i class="icon-move"></i>';
        cellHtml +=         '</div>';
        cellHtml +=         '<div id="' + domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-field-block" class="row-fluid">';
        cellHtml +=             '<div id="' + domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-fields" class="span12 manywho-form-section-column-cell-fields manywho-form-field-block">';
        cellHtml +=         '</div>';
        cellHtml +=     '</div>';
        cellHtml += '</div>';

        // Add the cell to the column - no need to add sortable features as the columns are not sortable - only fields (that can be freely moved between columns)
        $('#' + domId + '-' + sectionId + '-' + columnId + '-cells').append(cellHtml);

        // Create the events for the controls
        $('#' + domId + '-cell-' + cellId + '-edit').click(function (event) {
            var inputs = null;
            var formcell = $('#' + domId + '-data').data(cellId);

            // We're storing an object and we need to pass it back in an array
            if (formcell != null) {
                formcell = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormCell', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formcell);

            ManyWhoSharedServices.showSubConfigDialog(450, 175, 'FORMCELL', domId, domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-cell-block', cellId, inputs, false, cellOkCallback, true);
        });

        $('#' + domId + '-cell-' + cellId + '-delete').click(function (event) {
            var inputs = null;
            var formcell = $('#' + domId + '-data').data(cellId);

            // We're storing an object and we need to pass it back in an array
            if (formcell != null) {
                formcell = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'delete', ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormCell', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formcell);

            ManyWhoSharedServices.showSubConfigDialog(150, 175, 'FORMCELL', domId, domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-cell-block', cellId, inputs, false, cellOkCallback, true);
        });

        // Create the column object data and add it to our local database
        $('#' + domId + '-data').data(cellId, cellObjectData);

        // Make cells a sortable again so we have drag and drop for layout
        $('.manywho-form-section-column-cells').sortable({
            placeholder: 'manywho-sortable-placeholder',
            connectWith: '.manywho-form-section-column-cells'
        });
        $('.manywho-form-section-column-cells').disableSelection();

        // Finally, make it a sortable again so we have drag and drop for layout
        $('.manywho-form-section-column-cell-fields').sortable({
            placeholder: 'manywho-form-field-sortable-placeholder',
            connectWith: '.manywho-form-section-column-cell-fields',
            stop: function (event, ui) {
                var fieldType = null;
                var fieldsAreaId = $(event.target).attr('id');

                if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_INPUTBOX) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_INPUTBOX;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_CHECKBOX) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_CHECKBOX;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_TEXTBOX;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_COMBOBOX;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_TABLE) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_TABLE;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_CONTENT) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_CONTENT;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_PRESENTATION;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_IMAGE) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_IMAGE;
                } else if (event.srcElement.className.indexOf(ManyWhoConstants.COMPONENT_TYPE_TAG) >= 0) {
                    fieldType = ManyWhoConstants.COMPONENT_TYPE_TAG;
                }

                // This condition is here so we don't create existing fields simply because they're moved (this method is called during resorts also)
                if (fieldType != null &&
                    fieldType.trim().length > 0) {
                    createField(domId, ui.item, fieldsAreaId, fieldType, true);
                }
            }
        });

        return cellId;
    };

    // Adds a field to the cell
    //
    var addField = function (domId, sectionId, columnId, cellId, fieldObjectData) {
        // We create a spoof of the output values
        var outputValues = null;
        var outputValue = null;
        var fieldType = null;
        var fieldId = null;

        if (fieldObjectData != null) {
            // Get the field type for this field
            if (fieldObjectData.properties != null &&
                fieldObjectData.properties.length > 0) {
                for (var i = 0; i < fieldObjectData.properties.length; i++) {
                    if (fieldObjectData.properties[i].developerName.toLowerCase() == 'fieldtype') {
                        fieldType = fieldObjectData.properties[i].contentValue;
                        break;
                    }
                }
            }

            // Add the base field html
            fieldId = createField(domId, null, domId + '-' + sectionId + '-' + columnId + '-' + cellId + '-fields', fieldType, false);

            // Now construct the output value object
            outputValues = new Array();

            outputValue = new Object();
            outputValue.developerName = 'FlowOutcome';
            outputValue.objectData = null;
            outputValue.contentValue = 'edit';

            outputValues[outputValues.length] = outputValue;

            outputValue = new Object();
            outputValue.developerName = 'FieldType';
            outputValue.objectData = null;
            outputValue.contentValue = fieldType;

            outputValues[outputValues.length] = outputValue;

            outputValue = new Object();
            outputValue.developerName = 'FormField';
            outputValue.objectData = [fieldObjectData];
            outputValue.contentValue = null;

            outputValues[outputValues.length] = outputValue;

            // Now apply the field object data and make sure it's stored on this page
            fieldOkCallback(domId, domId + '-field-' + fieldId, fieldId, false, outputValues);
        }
    };

    // This method creates the html for the field preview
    //
    var createField = function (domId, tempFieldDroppable, fieldsAreaId, fieldType, openSettings) {
        var fieldId = ManyWhoUtils.getGuid();
        var fieldHtml = '';

        fieldHtml += '<div id="' + domId + '-field-' + fieldId + '" data-id="' + fieldId + '" class="manywho-form-field">';
        fieldHtml += '<div class="manywho-formbuilder-control-left">';
        fieldHtml += '<i class="icon-minus-sign" id="' + domId + '-field-' + fieldId + '-delete"></i>';
        fieldHtml += '<i class="icon-edit" id="' + domId + '-field-' + fieldId + '-edit"></i>';
        fieldHtml += '</div>';
        fieldHtml += '<div class="manywho-formbuilder-control-right">';
        fieldHtml += '<i class="icon-move"></i>';
        fieldHtml += '</div>';
        fieldHtml += '<div class="manywho-formbuilder-field">';

        if (fieldType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX) {
            fieldHtml += '<input type="text" class="manywho-inputbox-field" id="' + domId + '-field-' + fieldId + '-input" data-fieldtype="' + fieldType + '" />';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CHECKBOX) {
            fieldHtml += '<input type="checkbox" class="manywho-checkbox-field" id="' + domId + '-field-' + fieldId + '-input" data-fieldtype="' + fieldType + '" />';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) {
            fieldHtml += '<textarea cols="40" rows="3" class="manywho-textbox-field" id="' + domId + '-field-' + fieldId + '-input" data-fieldtype="' + fieldType + '" /></textarea>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_COMBOBOX) {
            fieldHtml += '<select class="manywho-combobox-field" id="' + domId + '-field-' + fieldId + '-input" data-fieldtype="' + fieldType + '" /><option>-- select --</option></select>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TABLE) {
            fieldHtml += '<table class="manywho-table-field" id="' + domId + '-field-' + fieldId + '-input" data-fieldtype="' + fieldType + '" /></table>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_CONTENT) {
            fieldHtml += '<textarea cols="40" rows="3" class="manywho-content-field" id="' + domId + '-field-' + fieldId + '-input" data-fieldtype="' + fieldType + '" /></textarea>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_PRESENTATION) {
            fieldHtml += '<span class="manywho-presentation-field" id="' + domId + '-field-' + fieldId + '-input"></span>';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_IMAGE) {
            fieldHtml += '<img class="manywho-image-field" id="' + domId + '-field-' + fieldId + '-input" />';
        } else if (fieldType == ManyWhoConstants.COMPONENT_TYPE_TAG) {
            fieldHtml += '<span class="manywho-tag-field" id="' + domId + '-field-' + fieldId + '-input"></span>';
        }

        fieldHtml += '<label class="text-info manywho-field-label" id="' + domId + '-field-' + fieldId + '-label"></label>';

        fieldHtml += '</div>';
        fieldHtml += '</div>';

        if (tempFieldDroppable != null) {
            // Replace the temp field this the new html
            tempFieldDroppable.replaceWith(fieldHtml);
        } else {
            $('#' + fieldsAreaId).append(fieldHtml);
        }

        // Create the events for the controls
        $('#' + domId + '-field-' + fieldId + '-edit').click(function (event) {
            var inputs = null;
            var formfield = $('#' + domId + '-data').data(fieldId);

            // We're storing an object and we need to pass it back in an array
            if (formfield != null) {
                formfield = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null);
            inputs = ManyWhoSharedServices.createInput(inputs, 'FieldType', fieldType, ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormField', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formfield);

            ManyWhoSharedServices.showSubConfigDialog(450, 175, 'FORMFIELD', domId, domId + '-field-' + fieldId, fieldId, inputs, false, fieldOkCallback, true);
        });

        $('#' + domId + '-field-' + fieldId + '-delete').click(function (event) {
            var inputs = null;
            var formfield = $('#' + domId + '-data').data(fieldId);

            // We're storing an object and we need to pass it back in an array
            if (formfield != null) {
                formfield = [formfield];
            }

            inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'delete', ManyWhoConstants.CONTENT_TYPE_STRING, null);
            inputs = ManyWhoSharedServices.createInput(inputs, 'FieldType', fieldType, ManyWhoConstants.CONTENT_TYPE_STRING, null);

            // Grab the existing object if one exists
            inputs = ManyWhoSharedServices.createInput(inputs, 'FormField', null, ManyWhoConstants.CONTENT_TYPE_OBJECT, formfield);

            ManyWhoSharedServices.showSubConfigDialog(150, 175, 'FORMFIELD', domId, domId + '-field-' + fieldId, fieldId, inputs, false, fieldOkCallback, true);
        });

        // Temporary to test the inputs are working - we explicitly have an input type for field type to make life easier on the integration
        var inputs = null;

        inputs = ManyWhoSharedServices.createInput(inputs, 'Command', 'edit', ManyWhoConstants.CONTENT_TYPE_STRING, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'FieldType', fieldType, ManyWhoConstants.CONTENT_TYPE_STRING, null);

        if (openSettings != false) {
            // Finally, we show the dialog
            //ManyWhoSharedServices.showSubConfigDialog(450, 175, 'FORMFIELD', domId, domId + '-field-' + fieldId, fieldId, inputs, true, fieldOkCallback, true);
        }

        return fieldId;
    };

    // This method is called by the sub config dialog method after a section definition is completed
    //
    var sectionOkCallback = function (domId, elementId, sectionId, doDelete, outputValues) {
        var flowOutcome = null;
        var label = null;

        flowOutcome = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FlowOutcome', null);
        label = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormSection', 'Label');

        // Check the flow outcome and and respond appropriately
        if (flowOutcome != null) {
            if (flowOutcome.toLowerCase() == 'cancel') {
                if (doDelete == true) {
                    // Remove the section from the form
                    $('#' + elementId).remove();
                }
            } else if (flowOutcome.toLowerCase() == 'delete') {
                // Remove the section from the form
                $('#' + elementId).remove();
            } else if (flowOutcome.toLowerCase() == 'edit') {
                // Get the first entry in the list from the returned object data list
                $('#' + domId + '-data').data(sectionId, ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormSection', null)[0]);
            }
        } else {
            alert('Flow outcome is blank');
        }
    };

    // This method is called by the sub config dialog method after a column definition is completed
    //
    var columnOkCallback = function (domId, elementId, sectionId, doDelete, outputValues) {
        var flowOutcome = null;
        var label = null;

        flowOutcome = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FlowOutcome', null);
        label = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormColumn', 'Label');

        // Check the flow outcome and and respond appropriately
        if (flowOutcome != null) {
            if (flowOutcome.toLowerCase() == 'cancel') {
                if (doDelete == true) {
                    // Remove the column from the form
                    $('#' + elementId).remove();
                }
            } else if (flowOutcome.toLowerCase() == 'delete') {
                // Remove the column from the form
                $('#' + elementId).remove();
            } else if (flowOutcome.toLowerCase() == 'edit') {
                // Get the first entry in the list from the returned object data list
                $('#' + domId + '-data').data(columnId, ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormColumn', null)[0]);
            }
        } else {
            alert('Flow outcome is blank');
        }
    };

    // This method is called by the sub config dialog method after a cell definition is completed
    //
    var cellOkCallback = function (domId, elementId, cellId, doDelete, outputValues) {
        var flowOutcome = null;
        var label = null;

        flowOutcome = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FlowOutcome', null);
        label = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormCell', 'Label');

        // Check the flow outcome and and respond appropriately
        if (flowOutcome != null) {
            if (flowOutcome.toLowerCase() == 'cancel') {
                if (doDelete == true) {
                    // Remove the cell from the form
                    $('#' + elementId).remove();
                }
            } else if (flowOutcome.toLowerCase() == 'delete') {
                // Remove the cell from the form
                $('#' + elementId).remove();
            } else if (flowOutcome.toLowerCase() == 'edit') {
                // Get the first entry in the list from the returned object data list
                $('#' + domId + '-data').data(cellId, ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormCell', null)[0]);
            }
        } else {
            alert('Flow outcome is blank');
        }
    };

    // This method is called by the sub config dialog method after a field definition is completed
    //
    var fieldOkCallback = function (domId, elementId, fieldId, doDelete, outputValues) {
        var fieldType = null;
        var flowOutcome = null;
        var formField = null;

        // Get the field type back from the flow
        fieldType = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FieldType', null);
        flowOutcome = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FlowOutcome', null);

        var hintValue = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'HintValue');
        var helpInfo = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'HelpInfo');
        var label = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'Label');
        var developerName = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'DeveloperName');
        var size = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'Size');
        var maxSize = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'MaxSize');
        var required = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'Required');
        var editable = ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', 'IsEditable');
        var fieldSize = null;

        if (size > 0) {
            if (size < 10) {
                fieldSize = ' input-mini';
            } else if (size < 20) {
                fieldSize = ' input-small';
            } else if (size < 30) {
                fieldSize = ' input-medium';
            } else if (size < 50) {
                fieldSize = ' input-large';
            } else if (size < 70) {
                fieldSize = ' input-xlarge';
            } else {
                fieldSize = ' input-xxlarge';
            }
        }

        $('#' + elementId + '-input').addClass('manywho-runtime-inputbox-field' + fieldSize);

        if (fieldType == ManyWhoConstants.COMPONENT_TYPE_INPUTBOX ||
            fieldType == ManyWhoConstants.COMPONENT_TYPE_TEXTBOX) {
            if (hintValue != null &&
                hintValue.trim().length > 0) {
                $('#' + elementId + '-input').attr('placeholder', hintValue);
            }
        }

        $('#' + elementId + '-input').attr('size', size);
        $('#' + elementId + '-input').attr('maxsize', maxSize);

        if (label != null &&
            label.trim().length > 0) {
            $('#' + elementId + '-label').html(label);
        } else {
            $('#' + elementId + '-label').html('');
        }

        if (helpInfo != null &&
            helpInfo.trim().length > 0) {
            $('#' + elementId + '-label').after('<div class="alert alert-info"><small id="' + elementId + '-help">' + helpInfo + '</small></div>');
        } else {
            $('#' + elementId + '-help').remove();
        }

        if (editable.toLowerCase() == 'true' ||
            editable == true) {
            $('#' + elementId + '-input').removeAttr('readonly');
        } else {
            $('#' + elementId + '-input').attr('readonly', 'readonly');
        }

        if (required.toLowerCase() == 'true' ||
            required == true) {
            $('#' + elementId + '-label').addClass('manywho-runtime-field-required');
            $('#' + elementId + '-label').removeClass('manywho-runtime-field-not-required');
        } else {
            $('#' + elementId + '-label').removeClass('manywho-runtime-field-required');
            $('#' + elementId + '-label').addClass('manywho-runtime-field-not-required');
        }

        // Check the flow outcome and and respond appropriately
        if (flowOutcome != null) {
            if (flowOutcome.toLowerCase() == 'cancel') {
                if (doDelete == true) {
                    // Remove the field from the form
                    $('#' + elementId).remove();
                }
            } else if (flowOutcome.toLowerCase() == 'delete') {
                // Remove the field from the form
                $('#' + elementId).remove();
            } else if (flowOutcome.toLowerCase() == 'edit') {
                // Get the first entry in the list from the returned object data list
                $('#' + domId + '-data').data(fieldId, ManyWhoSharedServices.getOutcomeValue(outputValues, 'FormField', null)[0]);
            }
        } else {
            alert('Flow outcome is blank');
        }
    };

    // This method is used purely to populate the start-up form.  Once we start building forms, we rely on the flow to populate this information, not
    // manual javascript
    //
    var createSectionObjectData = function(guid) {
        var objectAPI = null;

        objectAPI = createObjectAPI(null, ManyWhoConstants.OBJECT_TYPE_FORM_SECTION);

        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_ID, null, null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_DEVELOPER_NAME, 'Section 1', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_LABEL, '', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_ORDER, '0', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_COLUMNS, null, null);

        return objectAPI;
    };

    // This method is used purely to populate the start-up form.  Once we start building forms, we rely on the flow to populate this information, not
    // manual javascript
    //
    var createColumnObjectData = function () {
        var objectAPI = null;
        var propertyAPI = null;

        objectAPI = createObjectAPI(null, ManyWhoConstants.OBJECT_TYPE_FORM_COLUMN);

        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_ID, null, null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_DEVELOPER_NAME, 'Column 1', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_LABEL, '', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_ORDER, '0', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_CELLS, null, null);

        return objectAPI;
    };

    // This method is used purely to populate the start-up form.  Once we start building forms, we rely on the flow to populate this information, not
    // manual javascript
    //
    var createCellObjectData = function () {
        var objectAPI = null;

        objectAPI = createObjectAPI(null, ManyWhoConstants.OBJECT_TYPE_FORM_CELL);

        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_ID, null, null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_DEVELOPER_NAME, 'Cell 1', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_LABEL, '', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_ORDER, '0', null);
        createObjectPropertyAPI(objectAPI, ManyWhoConstants.SERVICE_VALUE_FIELDS, null, null);

        return objectAPI;
    };

    var createObjectAPI = function(externalId, objectType) {
        var objectAPI = null;

        objectAPI = new Object();
        objectAPI.externalId = externalId;
        objectAPI.isChanged = true;
        objectAPI.typeDeveloperName = objectType;
        objectAPI.properties = new Array();

        return objectAPI;
    };

    var createObjectPropertyAPI = function (objectAPI, developerName, value, list) {
        var propertyAPI = null;

        if (objectAPI.properties == null)
        {
            objectAPI.properties = new Array();
        }

        propertyAPI = new Object();
        propertyAPI.developerName = developerName;
        propertyAPI.isChanged = true;
        propertyAPI.objectData = list;
        propertyAPI.typeElementEntryId = null;
        propertyAPI.contentValue = value;

        objectAPI.properties[objectAPI.properties.length] = propertyAPI;

        return propertyAPI;
    };

    var assignOrderProperty = function (order, objectAPI) {
        for (var i = 0; i < objectAPI.properties.length; i++) {
            var propertyAPI = objectAPI.properties[i];

            if (propertyAPI.developerName.toLowerCase() == ManyWhoConstants.SERVICE_VALUE_ORDER.toLowerCase()) {
                propertyAPI.contentValue = '' + order + '';
            }
        }
    };

    var addObjectToProperty = function (parentObjectData, property, childObjectData) {
        for (var i = 0; i < parentObjectData.properties.length; i++) {
            if (parentObjectData.properties[i].developerName.toLowerCase() == property.toLowerCase()) {
                if (parentObjectData.properties[i].objectData == null) {
                    parentObjectData.properties[i].objectData = new Array();
                }

                parentObjectData.properties[i].objectData[parentObjectData.properties[i].objectData.length] = childObjectData;
            }
        }
    };

    // Publicly allowed methods
    var methods = {
        init: function (options) {
            var panel = '';
            var domId = $(this).attr('id');

            var opts = $.extend({}, $.fn.manywhoFormEditor.defaults, options);

            panel += '<div class="container-fluid">';
            panel += '    <div class="row-fluid">';
            panel += '        <div class="span2">';
            panel += '		      <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_INPUTBOX + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_INPUTBOX + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Input Box</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TEXTBOX + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_TEXTBOX + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Text Box</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_CHECKBOX + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_CHECKBOX + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Check Box</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_COMBOBOX + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_COMBOBOX + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Combo Box</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TABLE + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_TABLE + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Table</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_CONTENT + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_CONTENT + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Content</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_PRESENTATION + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_PRESENTATION + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Presentation</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_IMAGE + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_IMAGE + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Image</a></div>';
            panel += '            <div><a id="' + domId + '-' + ManyWhoConstants.COMPONENT_TYPE_TAG + '" class="btn span12 ' + ManyWhoConstants.COMPONENT_TYPE_TAG + '" style="text-align: left;" href="#"><i class="icon-share-alt"></i> Tag</a></div>';
            panel += '        </div>';
            panel += '        <div class="span10">';
            panel += '            <div class="manywho-formeditor-scaffolding-controls">';
            panel += '                <a id="' + domId + '-add-section" class="btn btn-primary" style="text-align: left;" href="#"><i class="icon-plus-sign icon-white"></i> Add Section</a>';
            panel += '                <a id="' + domId + '-add-column" class="btn btn-primary" style="text-align: left;" href="#"><i class="icon-plus-sign icon-white"></i> Add Column</a>';
            panel += '                <a id="' + domId + '-add-cell" class="btn btn-primary" style="text-align: left;" href="#"><i class="icon-plus-sign icon-white"></i> Add Cell</a>';
            panel += '            </div>';
            panel += '            <div id="' + domId + '-manywho-form-canvas" class="manywho-form-canvas">';
            panel += '                <div id="' + domId + '-form-sections" class="manywho-form-section-column">';
            panel += '                </div>';
            panel += '            </div>';
            panel += '        </div>';
            panel += '    </div>';
            panel += '</div>';

            panel += '<div id="' + domId + '-data" style="display:none;"></div>';
            panel += '<input type="hidden" id="' + domId + '-selected-column" />';
            panel += '<input type="hidden" id="' + domId + '-selected-section" />';

            // Print the form panel detail back to the reference form panel
            $(this).html(panel);

            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_CHECKBOX);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_TEXTBOX);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_INPUTBOX);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_COMBOBOX);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_TABLE);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_CONTENT);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_PRESENTATION);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_IMAGE);
            createDraggable(domId, ManyWhoConstants.COMPONENT_TYPE_TAG);

            $('#' + domId + '-add-section').click(function (event) {
                event.preventDefault();
                addSection.call(this, domId);
            });

            $('#' + domId + '-add-column').click(function (event) {
                event.preventDefault();
                addColumn.call(this, domId, $('#' + domId + '-selected-section').val());
            });

            $('#' + domId + '-add-cell').click(function (event) {
                event.preventDefault();
                addCell.call(this, domId, $('#' + domId + '-selected-section').val(), $('#' + domId + '-selected-column').val());
            });

            // Create the blank form so we start with a section, column and cell
            addSection.call(this, domId, createSectionObjectData(), createColumnObjectData(), createCellObjectData());

            $('.manywho-block-fields').disableSelection();
            $('.manywho-form-section-column').disableSelection();
        },
        validate: function() {
            var failureResult = new Object();

            failureResult.fields = null;
            failureResult.hasFailures = false;

            return failureResult;
        },
        getValue: function () {
            // This method basically merries up the objects stored in the database against the current layout of the form and returns the sections as
            // object data ready to be passed back to the flow
            var domId = $(this).attr('id');
            var sectionOrder = 0;
            var sectionsArray = new Array();

            // Step 1: iterate through all of the sections in the form editor
            $('.manywho-form-section-grid').each(function (sectionIndex) {
                var sectionId = null;
                var sectionObjectData = null;
                var columnOrder = 0;

                // Get the section id from the dom
                sectionId = $(this).attr('data-id');

                // Now grab the section object data from our local storage db
                sectionObjectData = $('#' + domId + '-data').data(sectionId);

                // Assign the latest order information to the section
                assignOrderProperty(sectionOrder, sectionObjectData);

                // Step 2: iterate through all of the columns for the section and add them to the root section object
                $(this).find('.manywho-form-column-grid').each(function (columnIndex) {
                    var columnId = null;
                    var columnObjectData = null;
                    var cellOrder = 0;

                    // Get the column id from the dom
                    columnId = $(this).attr('data-id');

                    // Now grab the column object data from our local storage db
                    columnObjectData = $('#' + domId + '-data').data(columnId);

                    // Assign the latest order information to the column
                    assignOrderProperty(columnOrder, columnObjectData);

                    // Step 3: iterate through all of the cells for the column and add them to the parent column object
                    $(this).find('.manywho-form-cell-grid').each(function (cellIndex) {
                        var cellId = null;
                        var cellObjectData = null;
                        var fieldOrder = 0;

                        // Get the cell id from the dom
                        cellId = $(this).attr('data-id');

                        // Now grab the cell object data from our local storage db
                        cellObjectData = $('#' + domId + '-data').data(cellId);

                        // Assign the latest order information to the cell
                        assignOrderProperty(cellOrder, cellObjectData);

                        // Step 4: iterate through all of the fields for the cell and add them to the parent cell object
                        $(this).find('.manywho-form-field').each(function (fieldIndex) {
                            var fieldId = null;
                            var fieldObjectData = null;

                            // Get the field id from the dom
                            fieldId = $(this).attr('data-id');

                            // Now grab the field object data from our local storage db
                            fieldObjectData = $('#' + domId + '-data').data(fieldId);

                            // Assign the latest order information to the field
                            assignOrderProperty(fieldOrder, fieldObjectData);

                            // Add this field to the cell fields property
                            addObjectToProperty(cellObjectData, ManyWhoConstants.SERVICE_VALUE_FIELDS, fieldObjectData);

                            // Increment the field order
                            fieldOrder++;
                        });

                        // Add this cell to the column cells property
                        addObjectToProperty(columnObjectData, ManyWhoConstants.SERVICE_VALUE_CELLS, cellObjectData);

                        // Increment the cell order
                        cellOrder++;
                    });

                    // Add this column to the section columns property
                    addObjectToProperty(sectionObjectData, ManyWhoConstants.SERVICE_VALUE_COLUMNS, columnObjectData);

                    // Increment the column order
                    columnOrder++;
                });

                // Add the section to the sections array
                sectionsArray[sectionsArray.length] = sectionObjectData;

                // Increment the section order
                sectionOrder++;
            });

            return sectionsArray;
        },
        setValue: function (sections) {
            var domId = $(this).attr('id');

            if (sections != null &&
                sections.length > 0) {
                // Clear any existing sections (the default stuff we add for new forms)
                $('#' + domId + '-form-sections').html('');

                // Need to sort the sections here
                for (var i = 0; i < sections.length; i++) {
                    var section = sections[i];

                    // Add the section to our document
                    var sectionId = addSection(domId, section, null, null);

                    if (section.properties != null &&
                        section.properties.length > 0) {
                        // Need to sort the columns here
                        for (var j = 0; j < section.properties.length; j++) {
                            // We need to find the columns property in the section object
                            if (section.properties[j].developerName.toLowerCase() == 'columns') {
                                var columns = section.properties[j].objectData;

                                // Check to make sure we have some columns
                                if (columns != null &&
                                    columns.length > 0) {
                                    for (var a = 0; a < columns.length; a++) {
                                        var column = columns[a];

                                        // Add the column to our document
                                        var columnId = addColumn(domId, sectionId, column, null);

                                        if (column.properties != null &&
                                            column.properties.length > 0) {
                                            // Need to sort the cells here
                                            for (var k = 0; k < column.properties.length; k++) {
                                                if (column.properties[k].peveloperName.toLowerCase() == 'cells') {
                                                    var cells = column.properties[k].objectData;

                                                    // Check to make sure we have some cells
                                                    if (cells != null &&
                                                        cells.length > 0) {
                                                        for (var b = 0; b < cells.length; b++) {
                                                            var cell = cells[b];

                                                            // Add the cell to our document
                                                            var cellId = addCell(domId, sectionId, columnId, cell);

                                                            if (cell.properties != null &&
                                                                cell.properties.length > 0) {
                                                                // Need to sort the fields here
                                                                for (var l = 0; l < cell.properties.length; l++) {
                                                                    if (cell.properties[l].developerName.toLowerCase() == 'fields') {
                                                                        var fields = cell.properties[l].objectData;

                                                                        // Check to make sure we have some fields
                                                                        if (fields != null &&
                                                                            fields.length > 0) {
                                                                            for (var c = 0; c < fields.length; c++) {
                                                                                var field = fields[c];

                                                                                // Finally, add the field to our document
                                                                               addField(domId, sectionId, columnId, cellId, field);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
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
    $.fn.manywhoFormEditor.defaults = { isTypeTemplate: false }

})(jQuery);
