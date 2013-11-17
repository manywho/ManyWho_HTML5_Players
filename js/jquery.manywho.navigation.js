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

function createNavigationItems(root, navigationItems) {
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
                // Create this navigation item
                html += '<li><a href="#" id="' + navigationItems[i].id + '">' + navigationItems[i].label + '</a>';

                // Create the sub-navigation items
                html += createNavigationItems(false, navigationItems.navigationItems);

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
            html += '<input type="hidden" id="' + domId + '-manywho-navigation-tenant-id" value="' + opts.tenantId + '" />';
            html += '<input type="hidden" id="' + domId + '-manywho-navigation-state-id" value="' + opts.stateId + '" />';
            html += '<input type="hidden" id="' + domId + '-manywho-navigation-state-token" value="' + opts.stateToken + '" />';
            html += '<input type="hidden" id="' + domId + '-manywho-navigation-navigation-element-id" value="' + opts.navigationElementId + '" />';
            html += '<div id="' + domId + '-manywho-navigation" class="navbar navbar-inverse navbar-fixed-top"></div>';

            // Print to the dom
            $(this).html(html);

            // This would be the start of a new function...

            //// Grab the dom id so we can get our values
            //domId = $(this).attr('id');

            //// Grab the values needed to refresh the navigation
            //var tenantId = $('#' + domId + '-manywho-navigation-tenant-id').val();
            //var stateId = $('#' + domId + '-manywho-navigation-state-id').val();
            //var stateToken = $('#' + domId + '-manywho-navigation-state-token').val();
            //var navigationElementId = $('#' + domId + '-manywho-navigation-navigation-element-id').val();

            var tenantId = opts.tenantId;
            var stateId = opts.stateId;
            var stateToken = opts.stateToken;
            var navigationElementId = opts.navigationElementId;
            var providedNavigateFunction = opts.navigateFunction;

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
                                        html +=     '<div class="container-fluid">';

                                        // Add the name of the menu
                                        if (data.developerName != null &&
                                            data.developerName.trim().length > 0) {
                                            html +=     '<a class="brand" href="#">' + data.developerName + '</a>';
                                        }

                                        // The scaffolding to support a collapsing menu
                                        html +=         '<a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">';
                                        html +=             '<span class="icon-bar"></span>';
                                        html +=             '<span class="icon-bar"></span>';
                                        html +=             '<span class="icon-bar"></span>';
                                        html +=         '</a>';
 
                                        // We put everything into the collapse section
                                        html +=         '<div class="nav-collapse collapse">';

                                        // Create the navigation items
                                        html += createNavigationItems(true, data.navigationItemResponses);

                                        html +=         '</div>';
 
                                        // Finish up the navigation
                                        html +=     '</div>';
                                        html += '</div>';
                                                                                            
                                        // Print the html to the document
                                        $('#' + domId + '-manywho-navigation').html(html);

                                        // Add a click event to all navigation links
                                        $('.manywho-navigation-menu').find('a').click(function (event) {
                                            // Grab the identifier - this is our id
                                            var id = $(this).attr('id');

                                            // Tell the user if there isn't a navigate function - so therefore nothing to do
                                            if (providedNavigateFunction == null) {
                                                alert('There is no navigation function specified - so there is nothing to do.');
                                            } else {
                                                // Call the function with the selected identifier
                                                providedNavigateFunction.call(this, id);
                                            }
                                        });
                                                    
                                        // Go through the metadata and make sure the navigation is in the right state
                                        if (data.navigationItemDataResponses != null &&
                                            data.navigationItemDataResponses.length > 0) {
                                            for (var i = 0; i < data.navigationItemDataResponses.length; i++) {
                                                var navigationItemDataResponse = data.navigationItemDataResponses[i];
                                                            
                                                if (navigationItemDataResponse.isEnabled == false) {
                                                    $('#' + navigationItemDataResponse.navigationItemId).attr('disabled', 'disabled');
                                                }
                                                            
                                                if (navigationItemDataResponse.isVisible == false) {
                                                    $('#' + navigationItemDataResponse.navigationItemId).hide();
                                                }
                                            }
                                        }
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

    $.fn.manywhoNavigation.defaults = { tenantId: null, stateId: null, stateToken: null, navigationElementId: null, navigateFunction: null }

})(jQuery);
