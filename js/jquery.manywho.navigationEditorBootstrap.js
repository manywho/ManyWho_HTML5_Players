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

    // Provides a unique counter for each node in the navigation tree.
    //
    var getCounter = function () {
        return counter++;
    };

    // Utility method for handling nulls.
    //
    var getArgumentValue = function (value) {
        if (value == null) {
            value = '';
        }

        return value;
    };

    // Create the navigation item based on the id, name, label and location, if they exist.
    //
    var createNavigationItem = function (domId, counter, id, name, label, locationMapElementId, navigationItems) {
        var html = null;

        html = '';
        html += '<li id="navigationitem_' + counter + '" class="manywho-navigation-item" data-id="' + getArgumentValue(id) + '">';
        html +=     '<div class="alert alert-info">';
        html +=         '<button type="button" class="close manywho-navigation-item-delete">&times;</button>';
        html +=         '<i class="icon-align-justify icon-white"></i> ';
        html +=         'Location: <select class="' + domId + '-locations manywho-navigation-item-location" id="' + domId + '-navigationitem-' + counter + '-locations" data-counter="' + counter + '" data-locationid="' + getArgumentValue(locationMapElementId) + '" id="navigationitem_' + counter + '_select"></select> ';
        html +=         'Name: <input type="text" class="input-small manywho-navigation-item-name" id="' + domId + '-navigationitem-' + counter + '-name" value="' + getArgumentValue(name) + '" /> ';
        html +=         'Label: <input type="text" class="input-small manywho-navigation-item-label" id="' + domId + '-navigationitem-' + counter + '-label" value="' + getArgumentValue(label) + '" />';
        html +=     '</div>';

        // Create navigation items if any exist
        if (navigationItems != null &&
            navigationItems.length > 0) {
            // Sort the page containers by the order property so they appear in the correct order
            navigationItems.sort(function (navigationItemA, navigationItemB) {
                var orderA = ManyWhoUtils.grabOrderFromObjectDataEntry(navigationItemA);
                var orderB = ManyWhoUtils.grabOrderFromObjectDataEntry(navigationItemB);

                if (orderA > orderB) {
                    return 1;
                } else if (orderA < orderB) {
                    return -1;
                } else {
                    return 0;
                }
            });

            html += '<ol>';

            // Go through each of the navigation items in the list
            for (var i = 0; i < navigationItems.length; i++) {
                html += createNavigationItem(domId,
                                             getCounter(),
                                             navigationItems[i].externalId,
                                             ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'DeveloperName'),
                                             ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'Label'),
                                             ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'LocationMapElementId'),
                                             ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'NavigationItems'));
            }

            html += '</ol>';
        }

        html += '</li>';

        return html;
    };

    // Get the individual value for a method that will return multiple results
    //
    var parseIndividualValue = function (entry, selector) {
        var selectorValue = null;

        $(entry).children('div').children(selector).each(function (index, value) {
            selectorValue = $(this).val();
            return;
        });

        return selectorValue;
    };

    // Create an object property.
    //
    var createPropertyAPI = function (objectAPI, developerName, contentValue, objectData) {
        var propertyAPI = null;

        propertyAPI = new Object();
        propertyAPI.developerName = developerName;
        propertyAPI.contentValue = contentValue;
        propertyAPI.objectData = objectData;

        objectAPI.properties[objectAPI.properties.length] = propertyAPI;

        return propertyAPI;
    };

    // Create an object.
    //
    var createObjectAPI = function (developerName, externalId) {
        var objectAPI = null;

        objectAPI = new Object();
        objectAPI.externalId = externalId;
        objectAPI.developerName = developerName;
        objectAPI.properties = new Array();

        return objectAPI;
    };

    // Convert the navigation item entry
    //
    var parseNavigationItem = function (domId, entry, order) {
        var navigationItem = null;

        navigationItem = createObjectAPI('NavigationItem', $(entry).attr('data-id'));

        // Get the identifier
        createPropertyAPI(navigationItem, 'Id', $(entry).attr('data-id'), null);

        // Grab the additional settings from the children
        createPropertyAPI(navigationItem, 'DeveloperName', parseIndividualValue(entry, '.manywho-navigation-item-name'), null);
        createPropertyAPI(navigationItem, 'Label', parseIndividualValue(entry, '.manywho-navigation-item-label'), null);
        createPropertyAPI(navigationItem, 'LocationMapElementId', parseIndividualValue(entry, '.manywho-navigation-item-location'), null);
        createPropertyAPI(navigationItem, 'DeveloperSummary', '', null);
        createPropertyAPI(navigationItem, 'Tags', null, null);

        // Assign the order from our counter
        createPropertyAPI(navigationItem, 'Order', '' + order + '', null);

        // Grab the children for this navigation item
        createPropertyAPI(navigationItem, 'NavigationItems', null, parseNavigationTree(domId, entry));

        return navigationItem;
    };

    // Iteratively converts the tree into navigation items
    //
    var parseNavigationTree = function (domId, parent) {
        var order = 0;
        var navigationItems = null;

        // Check to see if this navigation item has any children
        if ($(parent).children('ol').children().length > 0) {
            // Create a new list of navigation items to populate for this navigation item
            navigationItems = new Array();

            $(parent).children('ol').children().each(function (index, value) {
                // Add this navigation item to the parent
                navigationItems[navigationItems.length] = parseNavigationItem(domId, this, order++);
            });
        }

        return navigationItems;
    };

    // Load the map elements for the flow.
    //
    var loadMapElements = function(callingFunctionName,
                                   loadBeforeSend,
                                   loadSuccessCallback,
                                   loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/' + ManyWhoSharedServices.getFlowId() + '/' + ManyWhoSharedServices.getEditingToken() + '/element/map?filter=';
        var requestType = 'GET';
        var requestData = '';
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', ManyWhoSharedServices.getTenantId());

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.LoadMapElements', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers, null, ManyWhoSharedServices.getAuthorAuthenticationToken());
    };

    // Apply the close events to the navigation items.
    //
    var applyCloseEvents = function (domId) {
        // Remove all of the click events for this button so we don't double up
        $('#' + domId).find('.manywho-navigation-item-delete').off('click');

        $('#' + domId).find('.manywho-navigation-item-delete').on('click', function (event) {
            if ($('#' + domId).find('.manywho-navigation-item-delete').length <= 1) {
                // Tell the user they can't delete the only remaining navigation item
                alert('You can\'t delete the one and only navigation item in your navigation!');
                return;
            }

            // Check to make sure there aren't any children
            if ($(this).closest('.manywho-navigation-item').find('.manywho-navigation-item').length == 0) {
                // Remove the navigation element from the dom
                $(this).closest('.manywho-navigation-item').remove();
            } else {
                // Tell the user they can't delete a navigation item if it had children
                alert('You can\'t delete a navigation item if it has child navigation items');
            }
        });
    };

    // Print the locations to all drop-downs.
    //
    var printLocations = function (domId, elementId) {
        var data = null;
        var options = null;

        // If we've been provided with an element id, we use that, otherwise we apply to all
        if (elementId == null) {
            elementId = '.' + domId + '-locations';
        }

        // Remove the onchange listener
        $(elementId).off('change');

        // Grab the map element data
        data = $('#' + domId + '-map-elements').data('mapelements');

        // Check to see if we have any data
        if (data != null &&
            data.length > 0) {
            options = '';
            options += '<option value="">-- please select --</option>';

            // Print the options to the drop-down menu
            for (var i = 0; i < data.length; i++) {
                options += '<option value="' + data[i].id + '">' + data[i].developerName + '</option>';
            }
        }

        // Replace all of the options in the location drop-downs with the list loaded
        $(elementId).html(options);

        // Now set the selects as per the stored data
        $(elementId).each(function (index, value) {
            // Grab the location attribute and use that to assign the value
            $(this).val($(this).attr('data-locationid'));
        });

        // Add the change event handler back
        $(elementId).on('change', function (event) {
            var counter = $(this).attr('data-counter');

            // Check to see if a value has actually been selected
            if ($(this).val() != null &&
                $(this).val().trim().length > 0) {
                // Check to see if the input box for this entry is also empty - we don't want to override values that are already assigned
                if ($('#' + domId + '-navigationitem-' + counter + '-name').val() == null ||
                    $('#' + domId + '-navigationitem-' + counter + '-name').val().trim().length == 0) {
                    // The name entry is blank, so let's assign the name and label according to the selection
                    $('#' + domId + '-navigationitem-' + counter + '-name').val($('#' + $(this).attr('id') + ' option:selected').text());
                    $('#' + domId + '-navigationitem-' + counter + '-label').val($('#' + $(this).attr('id') + ' option:selected').text());
                }
            }
        });
    };

    // Publicly allowed methods
    //
    var methods = {
        init: function (options) {
            var html = '';
            var domId = $(this).attr('id');

            var opts = $.extend({}, $.fn.manywhoNavigationEditor.defaults, options);

            // Print out the basic UI
            html += '<div id="' + domId + '-map-elements" style="display: none;"></div>';
            html += '<div class="row-fluid">';
            html += '    <div class="span1"><img src="https://cdn.manywho.com/extensions/glyphicons/navigation_element_small.png" height="48" width="48" alt="Navigation" style="padding-bottom: 10px;"></div>';
            html += '    <div class="span11">Use the editor below to build your Navigation. Simply click the Add Navigation Item button to build out your navigation, then drag the entries to the right to make them \'child\' navigation items.</div>';
            html += '</div>';
            html += '<div class="row-fluid"><div class="span12">';
            html += '<button id="' + domId + '-add-navigation-item" class="btn">Add Navigation Item</button>';
            html += '</div></div>';
            html += '<input type="hidden" id="manywho-navigation-element-id" value="" /> ';
            html += '<div class="alert alert-info manywho-navigation-editor-menu">';
            html += '    <i class="icon-chevron-right icon-white"></i> ';
            html += '    Navigation Name: <input type="text" class="input-medium" id="manywho-navigation-element-name" value="" /> ';
            html += '    Navigation Label: <input type="text" class="input-medium" id="manywho-navigation-element-label" value="" /> ';
            html += '</div>';
            html += '<div class="row-fluid manywho-navigation-editor">';
            html += '    <ol id="manywho-navigation-editor-sortable" class="manywho-navigation-editor-sortable">';

            // Create a navigation item by default to get the menu going
            html += createNavigationItem(domId, getCounter(), null, null, null, null);

            html += '    </ol>';
            html += '</div>';

            // Print the scaffolding
            $(this).html(html);

            // Create the nested sortable
            $('ol.manywho-navigation-editor-sortable').nestedSortable({
                forcePlaceholderSize: true,
                handle: 'div',
                helper: 'clone',
                items: 'li',
                placeholder: 'placeholder',
                revert: 250,
                tabSize: 25,
                tolerance: 'pointer',
                toleranceElement: '> div',
                maxLevels: 3,
                isTree: true,
                startCollapsed: false
            });

            // Add a button for adding new navigation items
            $('#' + domId + '-add-navigation-item').click(function (event) {
                event.preventDefault();

                // Grab a counter for this element
                var counter = getCounter();

                // Add the navigation item
                $('.manywho-navigation-editor-sortable').append(createNavigationItem(domId, counter, null, null, null, null));

                // Populate the drop-downs
                printLocations(domId, '#' + domId + '-navigationitem-' + counter + '-locations');

                // Add the events for deleting
                applyCloseEvents(domId);
            });

            // Query the list of map elements - we'll use the same list for all nodes
            loadMapElements('Init',
                            null,
                            function (data, status, xhr) {
                                // Save the map elements to the dom
                                $('#' + domId + '-map-elements').data('mapelements', data);

                                // Print the locations to any loaded navigation items
                                printLocations(domId);
                            },
                            null);
        },
        validate: function () {
            var failureResult = new Object();

            failureResult.fields = null;
            failureResult.hasFailures = false;

            return failureResult;
        },
        getValue: function () {
            var order = 0;
            var navigationElement = null;
            var navigationItems = null;
            var domId = $(this).attr('id');

            navigationElement = createObjectAPI('NavigationElement', $('#manywho-navigation-element-id').val());

            createPropertyAPI(navigationElement, 'Id', $('#manywho-navigation-element-id').val(), null);
            createPropertyAPI(navigationElement, 'DeveloperName', $('#manywho-navigation-element-name').val(), null);
            createPropertyAPI(navigationElement, 'Label', $('#manywho-navigation-element-label').val(), null);
            createPropertyAPI(navigationElement, 'DeveloperSummary', '', null);
            createPropertyAPI(navigationElement, 'Tags', null, null);
            createPropertyAPI(navigationElement, 'ElementType', ManyWhoConstants.UI_ELEMENT_TYPE_IMPLEMENTATION_NAVIGATION, null);

            // Create a new array for the navigation items
            navigationItems = new Array();

            // Find all the elements at the root and iterate over those to get children
            $('.manywho-navigation-editor-sortable > .manywho-navigation-item').each(function (index, value) {
                // Go through the tree of navigation items for this navigation item
                navigationItems[navigationItems.length] = parseNavigationItem(domId, this, order++);
            });

            if (navigationItems.length > 0) {
                // Go through the tree of navigation items for this navigation item
                createPropertyAPI(navigationElement, 'NavigationItems', null, navigationItems);
            }

            return [navigationElement];
        },
        setValue: function (objectData) {
            var domId = $(this).attr('id');
            var html = '';

            // Now, print out the navigation items
            if (objectData != null &&
                objectData.length > 0) {
                var subCounter = 0;
                var navigationItems = null;

                // Assign the navigation element values
                $('#manywho-navigation-element-id').val(ManyWhoUtils.getObjectAPIPropertyValue(objectData, null, 'Id'));
                $('#manywho-navigation-element-name').val(ManyWhoUtils.getObjectAPIPropertyValue(objectData, null, 'DeveloperName'));
                $('#manywho-navigation-element-label').val(ManyWhoUtils.getObjectAPIPropertyValue(objectData, null, 'Label'));
                
                // Grab the navigation items property
                navigationItems = ManyWhoUtils.getObjectAPIPropertyValue(objectData, null, 'NavigationItems');

                // Check to see if we have any navigation items
                if (navigationItems != null &&
                    navigationItems.length > 0) {
                    // Sort the page containers by the order property so they appear in the correct order
                    navigationItems.sort(function (navigationItemA, navigationItemB) {
                        var orderA = ManyWhoUtils.grabOrderFromObjectDataEntry(navigationItemA);
                        var orderB = ManyWhoUtils.grabOrderFromObjectDataEntry(navigationItemB);

                        if (orderA > orderB) {
                            return 1;
                        } else if (orderA < orderB) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });

                    // Go through each of the navigation items in the list
                    for (var i = 0; i < navigationItems.length; i++) {
                        html += createNavigationItem(domId,
                                                     subCounter++,
                                                     navigationItems[i].externalId,
                                                     ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'DeveloperName'),
                                                     ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'Label'),
                                                     ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'LocationMapElementId'),
                                                     ManyWhoUtils.getObjectAPIPropertyValue([navigationItems[i]], null, 'NavigationItems'));
                    }

                    // We have an existing navigation menu, so we assign that
                    $('#manywho-navigation-editor-sortable').html(html);
                }

                // Apply the close events
                applyCloseEvents(domId);
            }
        }
    };

    $.fn.manywhoNavigationEditor = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoNavigationEditor');
        }
    };

    // Option default values
    $.fn.manywhoNavigationEditor.defaults = { }

})(jQuery);
