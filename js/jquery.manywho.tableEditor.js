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

    var generateTableObjectData = function (domId, objectData, columns) {
        var html = '';

        // Check to make sure we do have any data
        if (objectData != null &&
            objectData.length > 0) {
            for (var i = 0; i < objectData.length; i++) {
                html += '<tr data-externalId="' + objectData[i].externalId + '">';

                // Generate the action link
                html += generateDeleteActionButton(domId, objectData[i].id);

                // Now generate the columns from the object data
                if (objectData[i].properties != null &&
                    objectData[i].properties.length > 0) {
                    // Go through the columns as they dictate ordering
                    if (columns != null &&
                        columns.length > 0) {
                        for (var k = 0; k < columns.length; k++) {
                            // Go through the properties to find the one that matches the column
                            for (var j = 0; j < objectData[i].properties.length; j++) {
                                // Check to see if this is the property for our column
                                if (objectData[i].properties[j].typeElementPropertyId.toLowerCase() == columns[k].typeElementPropertyId.toLowerCase()) {
                                    // Add the data to the table
                                    html += '<td data-typeElementDeveloperName="' + objectData[i].properties[j].developerName + '" data-typeElementPropertyId="' + objectData[i].properties[j].typeElementPropertyId + '">' + objectData[i].properties[j].contentValue + '</td>';
                                }
                            }
                        }
                    }
                }

                html += '</tr>';
            }
        }

        // Add the table data to the dom
        $('#' + domId + '-editable-table tbody').html(html);

        // Add the click event for the delete buttons
        $('.manywho-table-outcome-action-delete').on('click', function (event) {
            $(this).closest('tr').remove();
        });

        // Make the table editable
        $('#' + domId + '-editable-table').editableTableWidget();
    };

    var generateDeleteActionButton = function (domId, rowId) {
        var html = '';

        // The first column is for the table actions
        html += '<td class="handle"><ul class="nav nav-pills"><li>';
        html += '<a href="#" id="' + rowId + '-button-delete" class="manywho-table-outcome-action-delete">Delete</a>';
        html += '</li></ul></td>';

        return html;
    };

    var loadTypeElement = function (callingFunctionName,
                                    typeElementId,
                                    loadBeforeSend,
                                    loadSuccessCallback,
                                    loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/element/type/' + typeElementId;
        var requestType = 'GET';
        var requestData = '';
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', ManyWhoSharedServices.getTenantId());

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.LoadTypeElement', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers, null, ManyWhoSharedServices.getAuthorAuthenticationToken());
    };

    var createTable = function (domId, columns) {
        var actionButtons = '';
        var html = '';

        // Create the standard action button for editing entries
        html += '<button id="' + domId + '-editable-table-add-button" class="btn btn-inverse">Add Row</button>';

        // Generate the actual table UI
        html += '<table id="' + domId + '-editable-table" class="table table-striped table-bordered">';
        html += '<thead><tr>';
        
        // Check to see if we do in fact have columns
        if (columns != null &&
            columns.length > 0) {
            // The first column is always an action column
            html += '<th>Action</th>';

            // Now write the individual columns
            for (var i = 0; i < columns.length; i++) {
                html += '<th>' + columns[i].label + '</th>';
            }
        }
        
        html += '</tr></thead>';
        html += '<tbody>';
        html += '</tbody>';
        html += '</table>';

        // Print the table to the dom
        $('#' + domId).html(html);

        // Make the table editable and set the focus to the first cell
        $('#' + domId + '-editable-table').editableTableWidget().find('td:not(.handle):first').focus();

        // Add the click event for the add button
        $('#' + domId + '-editable-table-add-button').on('click', function (event) {
            var row = '';
            var rowId = null;

            // Generate the row identifier as this is not a stored object
            rowId = ManyWhoUtils.getGuid();

            row += '<tr data-externalId="' + rowId + '">';

            // Create the table columns
            if (columns != null &&
                columns.length > 0) {
                // Generate the action link
                row += generateDeleteActionButton(domId, rowId);

                // Go through the columns and create the table correctly
                for (var i = 0; i < columns.length; i++) {
                    row += '<td data-typeElementDeveloperName="' + columns[i].label + '" data-typeElementPropertyId="' + columns[i].typeElementPropertyId + '">&nbsp;</td>';
                }
            }

            row += '</tr>';

            if ($('#' + domId + '-editable-table tbody').children().length == 0) {
                // Add a new row to the table based on the column metadata
                $('#' + domId + '-editable-table tbody').html(row);
            } else {
                // Add a new row to the table based on the column metadata
                $('#' + domId + '-editable-table tbody tr:last').after(row);
            }

            // Add the click event for the delete buttons
            $('#' + rowId + '-button-delete').on('click', function (event) {
                $(this).closest('tr').remove();
            });

            $('#' + domId + '-editable-table').editableTableWidget();
        });
    };

    // Publicly allowed methods
    //
    var methods = {
        init: function (options) {
            var domId = null;
            var opts = null;

            // Get the dom id as we need this for various things
            domId = $(this).attr('id');

            // Get the options out for the table
            opts = $.extend({}, $.fn.manywhoTableEditor.defaults, options);
        },
        validate: function () {
            var failureResult = new Object();

            failureResult.fields = null;
            failureResult.hasFailures = false;

            return failureResult;
        },
        getValue: function () {
            var domId = null;
            var objectDataEntries = null;
            var objectDataOrder = 0;
            var value = null;

            // Get the identifier for the element
            domId = $(this).attr('id');

            // First we go through the children trs
            if ($('#' + domId + '-editable-table').children('tbody').children().length > 0) {
                objectDataEntries = new Array();

                // Go through each tr
                $('#' + domId + '-editable-table').children('tbody').children().each(function (trIndex, trValue) {
                    var objectDataEntry = null;
                    var objectDataProperties = null;

                    objectDataEntry = new Object();

                    // Grab the external identifier
                    objectDataEntry.externalId = $(this).attr('data-externalId');

                    // We don't want to add the header row and that won't have an external id
                    if (objectDataEntry.externalId != null &&
                        objectDataEntry.externalId.trim().length > 0) {
                        // Now we need to go through the tds
                        if ($(this).children('td:not(.handle)').length > 0) {
                            objectDataProperties = new Array();

                            // Go through each td
                            $(this).children('td:not(.handle)').each(function (tdIndex, tdValue) {
                                var name = null;
                                var id = null;
                                var value = null;

                                // Get the data out
                                name = $(this).attr('data-typeelementdevelopername');
                                id = $(this).attr('data-typeelementpropertyid');
                                value = $(this).html();

                                // Add the property to the list
                                objectDataProperties[objectDataProperties.length] = { "developerName": name, "typeElementPropertyId": id, "contentValue": value };
                            });
                        }

                        // Assign the properties
                        objectDataEntry.properties = objectDataProperties;
                        objectDataEntry.order = objectDataOrder;

                        // Assign the entry to the object data
                        objectDataEntries[objectDataEntries.length] = objectDataEntry;

                        objectDataOrder++;
                    }
                });
            }

            // Check to make sure we have data to send back
            if (objectDataEntries != null &&
                objectDataEntries.length > 0) {
                value = JSON.stringify(objectDataEntries);
            }

            return value;
        },
        setValue: function (value, tags) {
            var domId = $(this).attr('id');
            var objectData = null;
            var html = '';

            // Load the type element as we need that to load the list if there is contentValue in tags[0]
            if(tags[0].contentValue != null &&
                tags[0].contentValue != "") {
                loadTypeElement('setValue',
                            tags[0].contentValue,
                            null,
                            function (data, status, xhr) {
                                var columns = null;
                                var columnOrder = 0;

                                // Check to see if we found a type and the associated properties
                                if (data != null &&
                                    data.properties != null &&
                                    data.properties.length > 0) {
                                    columns = new Array();

                                    // Go through each of the properties and turn them into columns
                                    for (var i = 0; i < data.properties.length; i++) {
                                        columns[columns.length] = { "label": data.properties[i].developerName, "typeElementPropertyId": data.properties[i].id, "order": columnOrder };
                                        columnOrder++;
                                    }
                                } else {
                                    alert('A Type could not be found for the provided identifier: ' + tags[0].contentValue);
                                }

                                // Create the table ui
                                createTable(domId, columns);

                                // Check to see if we have a string value coming in
                                if (value != null &&
                                    value.trim().length > 0) {
                                    // We do, so we need to parse the string to JavaScript objects
                                    objectData = jQuery.parseJSON(value);

                                    // Generate the table data for the user
                                    generateTableObjectData(domId, objectData, columns);
                                }
                            },
                            null);
            }
        }
    };

    $.fn.manywhoTableEditor = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoTableEditor');
        }
    };

    // Option default values
    $.fn.manywhoTableEditor.defaults = { columns: null }

})(jQuery);
