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

function createNavigationItems(root, navigationItems, navigationItemDataResponses) {
    var html = '';
        
    if (navigationItems != null &&
        navigationItems.length > 0) {
        // Open the navigation printing
        if (root == true) {
            html += '<ul class="nav manywho-navigation-menu">';
        } else {
            html += '<ul class="dropdown-menu">';
        }

        // Go through the navigation item responses and print the html
        if (navigationItems != null &&
            navigationItems.length > 0) {
            for (var i = 0; i < navigationItems.length; i++) {
                var navigationItemDataResponse = null;
                var additional = '';
                var hasSubItems = false;

                // Go through the metadata responses and find the metadata for this navigation item
                if (navigationItemDataResponses != null &&
                    navigationItemDataResponses.length > 0) {
                    for (var j = 0; j < navigationItemDataResponses.length; j++) {
                        if (navigationItemDataResponses[j].navigationItemId == navigationItems[i].id) {
                            navigationItemDataResponse = navigationItemDataResponses[j];
                            break;
                        }
                    }
                }

                // If this item is not visible, we don't need to print it
                if (navigationItemDataResponse.isVisible == false) {
                    continue;
                }

                if (navigationItemDataResponse.isEnabled == false) {
                    additional = ' disabled="disabled"';
                }

                // Check to see if we have any sub navigation
                if (navigationItems[i].navigationItems != null &&
                    navigationItems[i].navigationItems.length > 0) {
                    hasSubItems = true;
                }

                if (navigationItemDataResponse.isCurrent == true) {
                    if (hasSubItems == true) {
                        html += '<li class="active dropdown">';
                    } else {
                        html += '<li class="active">';
                    }
                } else {
                    if (hasSubItems == true) {
                        html += '<li class="dropdown">';
                    } else {
                        html += '<li>';
                    }
                }

                // Create this navigation item
                html += '<a href="#" id="' + navigationItems[i].id + '"' + additional;

                if (hasSubItems == true) {
                    html += ' class="dropdown-toggle" data-toggle="dropdown"';
                }

                html += '>';

                // Make the current element bold
                if (navigationItemDataResponse.isActive == true) {
                    html += '<strong>' + navigationItems[i].label + '</strong>';
                } else {
                    html += navigationItems[i].label;
                }

                if (hasSubItems == true) {
                    html += ' <b class="caret"></b>';
                }

                html += '</a>';

                // Check to see if we have any sub navigation
                if (hasSubItems == true) {
                    // Create the sub-navigation items
                    html += createNavigationItems(false, navigationItems[i].navigationItems, navigationItemDataResponses);
                }

                // Close out the navigation item
                html += '</li>';
            }
        }

        // Close out the navigation
        html += '</ul>';
    }

    return html;
};

(function ($) {

    var methods = {
        init: function (options) {
            var html = null;
            var opts = null;
            var domId = null;

            // Merge the provided options with the defaults
            opts = $.extend({}, $.fn.manywhoNavigation.defaults, options);

            // Check to make sure we have everything we need
            if (opts.tenantId == null) {
                alert('The tenant identifier is required to make the navigation component work.');
            }

            if (opts.stateId == null) {
                alert('The state identifier is required to make the navigation component work.');
            }

            if (opts.stateToken == null) {
                alert('The state token is required to make the navigation component work.');
            }

            if (opts.navigationElementId == null) {
                alert('The navigation element identifier is required to make the navigation component work.');
            }

            // Grab the dom id so we have it
            domId = $(this).attr('id');
            
            // Build the base html we need to make the menu work
            html = '';

            html += '<div id="manywho-navigation" class="navbar';
            
            // Apply inverse as desired
            if (opts.isInverse == true) {
                html += ' navbar-inverse';
            }

            // Fixed to top if desired
            if (opts.isFixedToTop == true) {
                html += ' navbar-fixed-top';
            }

            html += '"></div>';

            html += '<div id="manywho-navigation-data" style="display:none;"></div>';

            // Print to the dom
            $(this).replaceWith(html);

            // Add the data to the dom
            $('#manywho-navigation-data').data('tenantId', opts.tenantId);
            $('#manywho-navigation-data').data('stateId', opts.stateId);
            $('#manywho-navigation-data').data('stateToken', opts.stateToken);
            $('#manywho-navigation-data').data('navigationElementId', opts.navigationElementId);
            $('#manywho-navigation-data').data('navigateFunction', opts.navigateFunction);

            if (opts.isFullWidth == true) {
                $('#manywho-navigation-data').data('containerCss', 'container-fluid');
            } else {
                $('#manywho-navigation-data').data('containerCss', 'container');
            }
        },
        refresh: function () {
            // Grab the dom id so we can get our values
            var domId = $(this).attr('id');

            // Grab the values needed to refresh the navigation
            var tenantId = $('#manywho-navigation-data').data('tenantId');
            var stateId = $('#manywho-navigation-data').data('stateId');
            var stateToken = $('#manywho-navigation-data').data('stateToken');
            var navigationElementId = $('#manywho-navigation-data').data('navigationElementId');
            var navigationFunction = $('#manywho-navigation-data').data('navigateFunction');
            var containerCss = $('#manywho-navigation-data').data('containerCss');

            // Add the tenant to the header so we have it in the request
            var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

            // Dispatch the request to get the navigation
            ManyWhoAjax.callRestApi('ManyWhoNavigation.GetNavigation', 
                                    ManyWhoConstants.BASE_PATH_URL + '/api/run/1/navigation/' + stateId,
                                    'POST',
                                    JSON.stringify({"stateId":stateId,"stateToken":stateToken,"navigationElementId":navigationElementId}),
                                    null,
                                    function (data, status, xhr) {
                                        var html = '';
                                        
                                        html += '<div class="navbar-inner">';
                                        html +=     '<div class="' + containerCss + '">';

                                        // The scaffolding to support a collapsing menu
                                        html +=         '<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">';
                                        html +=             '<span class="icon-bar"></span>';
                                        html +=             '<span class="icon-bar"></span>';
                                        html +=             '<span class="icon-bar"></span>';
                                        html +=         '</button>';

                                        // Add the name of the menu
                                        if (data.label != null &&
                                            data.label.trim().length > 0) {
                                            html += '<a class="brand" href="#">' + data.label + '</a>';
                                        }

                                        // We put everything into the collapse section
                                        html +=         '<div class="nav-collapse collapse">';

                                        // Create the navigation items
                                        html += createNavigationItems(true, data.navigationItemResponses, data.navigationItemDataResponses);

                                        html +=         '</div>';
 
                                        // Finish up the navigation
                                        html +=     '</div>';
                                        html += '</div>';
                                                                                            
                                        // Print the html to the document
                                        $('#manywho-navigation').html(html);

                                        // Add a click event to all navigation links
                                        $('.manywho-navigation-menu').find('a').not('.dropdown-toggle').click(function (event) {
                                            // Grab the identifier - this is our id
                                            var id = $(this).attr('id');

                                            // Tell the user if there isn't a navigate function - so therefore nothing to do
                                            if (navigationFunction == null) {
                                                alert('There is no navigation function specified - so there is nothing to do.');
                                            } else {
                                                // Call the function with the selected identifier
                                                navigationFunction.call(this, id);
                                            }
                                        });
                                    },
                                    function (xhr, status, error) {
                                        alert('something went wrong');
                                    },
                                    headers);
        }
    };

    $.fn.manywhoNavigation = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoNavigation');
        }
    };

    $.fn.manywhoNavigation.defaults = { tenantId: null, stateId: null, stateToken: null, navigationElementId: null, navigateFunction: null, isInverse: true, isFixedToTop: true, isFullWidth: true }

})(jQuery);
