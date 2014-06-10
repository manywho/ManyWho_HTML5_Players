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

// Make these global to make life a little easier
var $progressDiv = null;
var $progressBar = null;
var completedSteps = new Array();

function createNavigationItems(root, navigationItems, navigationItemDataResponses) {
    var html = '';
    var alreadyGenerated = false;
    var activeSet = false;

    // We don't want to regenerate the menu - we edit it post generation
    if ($('#manywho-navigation-data').data('navigationGenerated') == 'yes') {
        alreadyGenerated = true;
    }

    // Check to see if we actually have any navigation items
    if (navigationItems != null &&
        navigationItems.length > 0) {
        // Go through the navigation items and add them to the menu
        for (var i = 0; i < navigationItems.length; i++) {
            var navigationItemDataResponse = null;
            var additional = '';
            var hasSubItems = false;
            var progressStep = null;

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

            if (alreadyGenerated == true) {
                // The order in the bar and the order in the menu should be the same!
                progressStep = $progressBar.getStep(navigationItems[i].order);
            } else {
                // Add the step to the progress bar
                progressStep = $progressBar.addStep(navigationItems[i].label);

                // Add the click event for this menu so the system navigates correctly
                if (navigationItemDataResponse.isEnabled == true) {
                    progressStep.onClick(function (event) {
                        // Call the function with the selected identifier
                        navigationFunction.call(this, navigationItems[i].id);
                        return true;
                    });
                }
            }

            // If this step is active, we add it to the list of active steps that have been visited
            if (navigationItemDataResponse.isActive == true) {
                // Tell the system that this step has been visited
                completedSteps[completedSteps.length] = navigationItems[i].order;

                // Set the completed steps to visited
                for (var j = 0; j < completedSteps.length; j++) {
                    $progressBar.getStep(completedSteps[j]).setVisited(true);
                }
            }

            // If this is the active step, make sure the system remembers
            if (navigationItemDataResponse.isActive == true) {
                $progressBar.setCurrentStep(navigationItems[i].order);
                activeSet = true;
            }
        }

        // We set this to the start as it means the user is likely at the very first step and we don't need to override that location for convenience
        if (activeSet == false) {
            $progressBar.setCurrentStep(0);
        }

        // Refresh the layout now we've done some work
        $progressBar.refreshLayout();

        // Make sure we set the flag to see that navigation has been created
        $('#manywho-navigation-data').data('navigationGenerated', 'yes');
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
            html += '<div id="manywho-navigation"><div id="manywho-navigation-progress-bar"></div></div>';
            html += '<div id="manywho-navigation-data" style="display:none;"></div>';

            // Print to the dom
            $(this).replaceWith(html);

            // Add the data to the dom
            $('#manywho-navigation-data').data('tenantId', opts.tenantId);
            $('#manywho-navigation-data').data('stateId', opts.stateId);
            $('#manywho-navigation-data').data('stateToken', opts.stateToken);
            $('#manywho-navigation-data').data('navigationElementId', opts.navigationElementId);
            $('#manywho-navigation-data').data('navigateFunction', opts.navigateFunction);
            $('#manywho-navigation-data').data('navigationGenerated', 'no');

            // Finally, initialize the progress bar div
            $progressDiv = $("#manywho-navigation-progress-bar");

            // And initialize the progress step component ready to add steps (not done here)
            $progressBar = $progressDiv.progressStep({ 'radius': 35, 'font-size': 15, 'margin': 50, 'labelOffset': 45 });

            // Enable click events
            $progressBar.setClickEnabled(true);
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

            // Add the tenant to the header so we have it in the request
            var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

            // Dispatch the request to get the navigation
            ManyWhoAjax.callRestApi('ManyWhoNavigation.GetNavigation',
                                    ManyWhoConstants.BASE_PATH_URL + '/api/run/1/navigation/' + stateId,
                                    'POST',
                                    JSON.stringify({ "stateId": stateId, "stateToken": stateToken, "navigationElementId": navigationElementId }),
                                    null,
                                    function (data, status, xhr) {
                                        // Create the navigation items
                                        createNavigationItems(true, data.navigationItemResponses, data.navigationItemDataResponses);
                                    },
                                    function (xhr, status, error) {
                                        alert('something went wrong');
                                    },
                                    headers);
        }
    };

    $.fn.manywhoNavigationProgress = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoNavigationProgress');
        }
    };

    $.fn.manywhoNavigationProgress.defaults = { tenantId: null, stateId: null, stateToken: null, navigationElementId: null, navigateFunction: null }

})(jQuery);
