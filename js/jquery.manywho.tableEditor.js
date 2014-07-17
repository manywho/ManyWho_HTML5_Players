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

    var generateTableObjectData = function (domId, objectData) {
        var html = '';

        // Check to make sure we do have any data
        if (objectData != null &&
            objectData.length > 0) {
            for (var i = 0; i < objectData.length; i++) {
                html += '<tr>';

                // Generate the action link
                html += generateDeleteActionButton(domId, objectData[i].id);

                // Add the click event for the delete buttons
                $('#' + rowId + '-button-delete').on('click', function (event) {
                    $(this).parent('tr').remove();
                });

                // Now generate the columns from the object data
                if (objectData.properties != null &&
                    objectData.properties.length > 0) {
                    for (var j = 0; j < objectData.properties.length; j++) {
                        // Add the data to the table
                        html += '<td data-typeElementDeveloperName="' + objectData.properties[j].developerName + '" data-typeElementPropertyId="' + objectData.properties[j].typeElementPropertyId + '">' + objectData.properties[j].contentValue + '</td>';
                    }
                }

                html += '</tr>';
            }
        }

        // Add the table data to the dom
        $('#' + domId + '-editable-table tbody').html(html);

        // Make the table editable
        $('#' + domId + '-editable-table').editableTableWidget();
    };

    var generateDeleteActionButton = function (domId, rowId) {
        var html = '';

        // The first column is for the table actions
        html += '<td class="handle"><ul class="nav nav-pills"><li>';
        html += '<a href="#" id="' + rowId + '-button-delete" class="manywho-table-outcome-action">Delete</a>';
        html += '</li></ul></td>';

        return html;
    };

    var createTable = function (domId, columns) {
        var actionButtons = '';
        var html = '';

        // Create the standard action button for editing entries
        html += '<button id="' + domId + '-editable-table-add-button">Add Row</button>';

        // Generate the actual table UI
        html += '<table id="' + domId + '-editable-table" class="table table-striped">';
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

            row += '<tr>';

            // Create the table columns
            if (columns != null &&
                columns.length > 0) {
                // Generate the action link
                row += generateDeleteActionButton(domId, rowId);

                // Go through the columns and create the table correctly
                for (var i = 0; i < columns.length; i++) {
                    row += '<td data-typeElementDeveloperName="' + columns[i].developerName + '" data-typeElementPropertyId="' + columns[i].typeElementPropertyId + '">&nbsp;</td>';
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
                $(this).('tr').remove();
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

            // Create the table ui
            createTable(domId, opts.columns);
        },
        validate: function () {
            var failureResult = new Object();

            failureResult.fields = null;
            failureResult.hasFailures = false;

            return failureResult;
        },
        getValue: function () {
            var domId = null;

            // Get the identifier for the element
            domId = $(this).attr('id');

            alert('not implemented');

            // return [navigationElement];
        },
        setValue: function (value) {
            var domId = $(this).attr('id');
            var objectData = null;
            var html = '';

            // Check to see if we have a string value coming in
            if (value != null &&
                value.trim().length > 0) {
                // We do, so we need to parse the string to JavaScript objects
                objectData = jQuery.parseJSON(dataToSave);

                // Generate the table data for the user
                generateTableObjectData(domId, objectData);
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
