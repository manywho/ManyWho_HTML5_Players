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

function configurePage(options) {

    // Initialize the shared services
    ManyWhoSharedServices.initialize('shared-services');
    ManyWhoSharedServices.setEditorModeId(ManyWhoUtils.getQueryStringParam('mode'));

    // Hide all of the graph and getting started stuff until we're ready
    $('#flow-graph-wrapper').hide();
    $('#flow-getting-started').hide();
    $('#flow-graph-loader').hide();

    // Show the loading dialog
    ManyWhoSharedServices.showLoadingDialog(true);

    // Grab the builder mode if the user has provided one
    var developerMode = ManyWhoUtils.getQueryStringParam('developer-mode');

    if (developerMode != null &&
        developerMode.trim().length > 0 &&
        developerMode.trim().toLowerCase() == 'on') {
        ManyWhoSharedServices.setDeveloperMode(true);
    } else {
        ManyWhoSharedServices.setDeveloperMode('');
    }

    // Grab the authentication token from the authentication cookie
    ManyWhoSharedServices.setAuthorAuthenticationToken(ManyWhoUtils.getCookie('authentication-token'));
    ManyWhoSharedServices.setTenantId(ManyWhoUtils.getCookie('tenant-id'));

    // If we have the authentication and tenant information being provided in the options, we use that instead
    if (options &&
        options.authenticationToken &&
        options.tenantId &&
        options.authenticationToken != null &&
        options.authenticationToken.trim().length > 0 &&
        options.tenantId != null &&
        options.tenantId.trim().length > 0) {
        ManyWhoSharedServices.setAuthorAuthenticationToken(options.authenticationToken);
        ManyWhoSharedServices.setTenantId(options.tenantId);
    }

    // Create the function for creating error alerts in the designer
    var createErrorAlert = function (xhr, status, responseMessage) {
        var html = null;
        var message = null;
        var needsLogin = false;

        if (xhr.status == 0) {
            message = '<strong>Yikes! We seem to have lost our backend.</strong> Make sure you\'re connected to the network and we\'ll try to connect again.';
        } else if (xhr.status == 403 || xhr.status == 401) {
            message = '<strong>Hold on there partner!</strong> You don\'t seem to be logged in. <a href="#" id="log-me-in">Log me in</a>!';
            needsLogin = true;
        } else {
            message = '<strong>Whoops! Something went wrong.</strong> ' + xhr.responseText;
        }

        html = '';
        html += '<div class="alert alert-error span12">';
        html += '<button type="button" class="close" data-dismiss="alert">&times;</button>';
        html += message;
        html += '</div>';

        // Assign the error message to the flow error area
        $('#flow-error').html(html);

        // Add the click event to the log me in link if we've provided one
        if (needsLogin == true) {
            $('#log-me-in').click(function (event) {
                event.preventDefault();

                // Clear the message so it's not there post login
                $('#flow-error').html('');

                // The the user to login again
                reLogin(this);
            });
        }
    };

    // Show or hide the flow loader/graph
    //
    var setFlowLoader = function (visible) {
        if (visible == true) {
            $('#flow-graph-wrapper').show();
            $('#flow-graph-loader').show();
        } else {
            $('#flow-graph-loader').hide();
            $('#flow-graph-wrapper').show();
        }
    };

    // Create the setup function
    var updateTools = function () {
        var authenticationToken = ManyWhoSharedServices.getAuthorAuthenticationToken();

        // Hide the flow loader in all situations
        $('#flow-graph-loader').hide();

        if (authenticationToken != null &&
            authenticationToken.trim().length > 0) {
            // Hide the loading dialog if it's showing
            ManyWhoSharedServices.showLoadingDialog(false);

            // Populate the list of players
            populatePlayers();

            // We don't want to do this initialization stuff if the user is already doing stuff
            if (ManyWhoSharedServices.getFlowId() != null &&
                ManyWhoSharedServices.getFlowId().trim().length > 0) {
                $('#flow-graph-wrapper').show();
                $('#flow-getting-started').hide();
                $('.flow-button').removeAttr('disabled');

                if (ManyWhoSharedServices.getDeveloperMode() == true) {
                    $('.flow-button-preview').removeAttr('disabled');
                }
            } else {
                $('#flow-graph-wrapper').hide();
                $('#flow-getting-started').show();
                $('.flow-button').attr('disabled', 'disabled');
                $('.flow-button-preview').attr('disabled', 'disabled');
            }
        } else {
            ManyWhoSharedServices.showAuthenticationDialog(function (authenticationToken, manywhoTenantId) {
                ManyWhoSharedServices.setAuthorAuthenticationToken(authenticationToken);
                ManyWhoSharedServices.setTenantId(manywhoTenantId);

                // Set the authentication token into the cookie also
                ManyWhoUtils.setCookie('authentication-token', authenticationToken, true);
                ManyWhoUtils.setCookie('tenant-id', manywhoTenantId);

                // Set the cookie for moxie manager
                ManyWhoUtils.setCookie('ManyWhoTenant', manywhoTenantId);

                // Update the tenancy information
                populateTenancyInformation();

                // Update the tools menu
                updateTools.call(this);
            });
        }
    };

    var openFlow = function(flowEditingToken, flowId, flowDeveloperName, flowDeveloperSummary, flowStartMapElementId) {
        // If we have a flow loaded already, we save any changes - everything is on the service - so we don't need to wait for this to complete
        if (ManyWhoSharedServices.getFlowId() != null &&
            ManyWhoSharedServices.getFlowId().trim().length > 0) {
            // Save the currently cached model so we have all of the changes
            ManyWhoFlow.saveFlow('ManyWhoBuilder.CloseFlow',
                                    ManyWhoSharedServices.getEditingToken(),
                                    ManyWhoSharedServices.getFlowId(),
                                    $('#flow-developer-name').html(),
                                    $('#flow-developer-summary').html(),
                                    ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                    null,
                                    function (data, status, xhr) {
                                    },
                                    createErrorAlert);
        }

        // Clear the graph of any current flow
        $('#flow-graph').manywhoMxGraph('clear', null);
        $('#flow-graph-wrapper').show();
        $('#flow-getting-started').hide();

        // Assign the relevant information here to the various designer properties
        ManyWhoSharedServices.setEditingToken(flowEditingToken);
        ManyWhoSharedServices.setFlowId(flowId);

        $('#flow-developer-name').html(flowDeveloperName);
        $('#flow-developer-summary').html(flowDeveloperSummary);
        $('#flow-start-map-element-id').val(flowStartMapElementId);

        // Populate the list of navigation elements
        populateNavigationElements();

        // Show the user the "flow loading" screen
        setFlowLoader(true);

        // Synchronize the graph to load all of the elements
        $('#flow-graph').manywhoMxGraph('syncGraph', function () {
            // Update the tools once the sync is complete
            updateTools.call(this);
        });
    };

    var populateTenancyInformation = function () {
        ManyWhoTenant.load('ManyWhoBuilder.PopulateTenancyInformation',
                           true,
                           null,
                           function (data, status, xhr) {
                               // Check to see if we have any data coming back for the tenant
                               if (data != null) {
                                   var subtenantInfo = '';
                                   var replaceEnd = null;

                                   // Clear the list of players
                                   $('#manywho-tenant-name').html(data.developerName);

                                   // We remove the +whatever.com at the end to make the sub-tenants a little neater
                                   replaceEnd = '+' + data.developerName.substring(1);

                                   // Add the beginning piece
                                   subtenantInfo += '<a tabindex="-1" href="#"><i class="icon-chevron-right"></i> Sub-Tenants</a><ul class="dropdown-menu">';

                                   // Check to see if we have any sub tenants for this main tenant
                                   if (data.subTenants != null &&
                                       data.subTenants.length > 0) {
                                       for (var i = 0; i < data.subTenants.length; i++) {
                                           subtenantInfo += '<li><a tabindex="-1" href="#" class="manywho-sub-tenants-drop-down-item" data-subtenant="' + data.subTenants[i].developerName + '">' + data.subTenants[i].developerName.replace(replaceEnd, '') + '</a></li>';
                                       }
                                   } else {
                                       subtenantInfo += '<li><a tabindex="-1" href="#" data-subtenant="None">None</a></li>';
                                   }

                                   // Finish up the menu
                                   subtenantInfo += '</ul>';

                                   // Create the sub-tenants listing as required
                                   $('#manywho-sub-tenants-list').html(subtenantInfo);

                                   $('.manywho-sub-tenants-drop-down-item').on('click', function (event) {
                                       var subTenantUsername = null;

                                       event.preventDefault();

                                       // Change the username to the tenant username
                                       subTenantUsername = ManyWhoUtils.getCookie('AuthorUsername').replace($('#manywho-tenant-name').html(), $(this).attr('data-subtenant'));

                                       // Update the cooking with the new username
                                       ManyWhoUtils.setCookie('AuthorUsername', subTenantUsername);

                                       // Get the user to login again
                                       reLogin(this);
                                   });
                               }
                           },
                           createErrorAlert);
    };

    var populatePlayers = function () {
        ManyWhoPlayer.loadAll('ManyWhoBuilder.PopulatePlayers',
                              ManyWhoSharedServices.getTenantId(),
                              null,
                              function (data, status, xhr) {
                                  // Check to see if we have any players
                                  if (data != null &&
                                      data.length > 0) {
                                      // Clear the list of players
                                      $('#manywho-model-select-run-player').html('');

                                      // Populate the list of players to run the flow in
                                      for (var i = 0; i < data.length; i++) {
                                          $('#manywho-model-select-run-player').append('<option value="' + data[i] + '">' + data[i] + '</option>');
                                      }

                                      // Auto select the default player
                                      $('#manywho-model-select-run-player').val('default');
                                  }
                              },
                              createErrorAlert);
    };

    // Load the navigation elements for the flow.
    //
    var loadNavigationElements = function (callingFunctionName,
                                           loadBeforeSend,
                                           loadSuccessCallback,
                                           loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/' + ManyWhoSharedServices.getFlowId() + '/' + ManyWhoSharedServices.getEditingToken() + '/element/navigation?filter=';
        var requestType = 'GET';
        var requestData = '';
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', ManyWhoSharedServices.getTenantId());

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.LoadNavigationElements', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers, null, ManyWhoSharedServices.getAuthorAuthenticationToken());
    };

    // Populate the list of navigation elements to choose from.
    //
    var populateNavigationElements = function () {
        // Query the list of navigation elements - we'll use the same list for all nodes
        loadNavigationElements('PopulateNavigationElements',
                               null,
                               function (data, status, xhr) {
                                   var html = '';

                                   // Clear the list of navigation entries
                                   $('#manywho-model-select-run-navigation').html('');

                                   if (data != null &&
                                       data.length > 0) {
                                       for (var a = 0; a < data.length; a++) {
                                           // Append the menu with this option
                                           $('#manywho-model-select-run-navigation').append('<option value="' + data[a].id + '">' + data[a].developerName + '</option>');
                                       }
                                   }
                               },
                               null);
    };

    var reLogin = function () {
        // Set the authentication token and tenant to blank
        ManyWhoSharedServices.setAuthorAuthenticationToken('');
        ManyWhoSharedServices.setTenantId('');

        // Set the authentication token and tenant to blank in the cookie
        ManyWhoUtils.setCookie('authentication-token', '');
        ManyWhoUtils.setCookie('tenant-id', '');

        // Clear the graph also so we don't have any data lying around
        $('#flow-graph').manywhoMxGraph('clear');
        $('#flow-graph-wrapper').hide();
        $('#flow-getting-started').show();

        // Tell the designer to update the tools - which will prompt the login
        updateTools.call(this);
    };

    $("#manage-flows").click(function (event) {
        event.preventDefault();
        ManyWhoSharedServices.showFlowConfigDialog(null,
                                                   openFlow,
                                                   null,
                                                   createErrorAlert);
    });

    $("#manage-navigations").click(function (event) {
        event.preventDefault();

        ManyWhoSharedServices.showNavigationElementConfigDialog(ManyWhoConstants.UI_ELEMENT_TYPE_IMPLEMENTATION_NAVIGATION, null, function () {
            // Populate the list of navigation elements
            populateNavigationElements();
        }, createErrorAlert);
    });

    $("#manage-page-layouts").click(function (event) {
        event.preventDefault();

        ManyWhoSharedServices.showPageElementConfigDialog(ManyWhoConstants.UI_ELEMENT_TYPE_IMPLEMENTATION_PAGE_LAYOUT, null, null, createErrorAlert);
    });

    $("#manage-tags").click(function (event) {
        event.preventDefault();

        ManyWhoSharedServices.showSharedElementConfigDialog('TAG', null, null, createErrorAlert);
    });

    $("#manage-types").click(function (event) {
        event.preventDefault();

        ManyWhoSharedServices.showSharedElementConfigDialog('TYPE', null, null, createErrorAlert);
    });

    $("#manage-values").click(function (event) {
        event.preventDefault();
        ManyWhoSharedServices.showSharedElementConfigDialog(ManyWhoConstants.SHARED_ELEMENT_TYPE_IMPLEMENTATION_VARIABLE, null, null, createErrorAlert);
    });

    $("#manage-services").click(function (event) {
        event.preventDefault();
        ManyWhoSharedServices.showSharedElementConfigDialog(ManyWhoConstants.SERVICE_ELEMENT_TYPE_IMPLEMENTATION_SERVICE, null, null, createErrorAlert);
    });

    $("#manage-assets").click(function (event) {
    				event.preventDefault();
    				moxman.browse({
    								title: "Assets",
												leftpanel: false
    				});
    });

    // Set up the flow graph
    $('#flow-graph').manywhoMxGraph({ developerMode: ManyWhoSharedServices.getDeveloperMode() });

    $('#manywho-model-runtime-engine-dialog').modalmanager();

    // Set up the runtime engine for running and testing a flow
    $('#manywho-model-runtime-engine').manywhoRuntimeEngine({ enableAuthentication: false, includeHeader: true });

    // Button to allow the user to snapshot and run the flow
    $('#run-flow').click(function (event) {
        event.preventDefault();

        if ($(this).attr('disabled') != 'disabled') {
            ManyWhoSharedServices.showBuildDialog(true);
            ManyWhoFlow.snapAndRun('ManyWhoBuilder.RunFlow',
                                   ManyWhoSharedServices.getFlowId(),
                                   ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                   null,
                                   function (data, status, xhr) {
                                       var location = null;

                                       ManyWhoSharedServices.showBuildDialog(false);

                                       // Assign the location
                                       location = ManyWhoConstants.BASE_PATH_URL + '/' + ManyWhoSharedServices.getTenantId() + '/play'; // + getSelectedPlayer() + '?flow-id=' + data.id.id + '&flow-version-id=' + data.id.versionId;

                                       // Check to see if the navigation has any entries for the user to select from
                                       if ($('#manywho-model-select-run-navigation').html() != null &&
                                           $('#manywho-model-select-run-navigation').html().trim().length > 0) {
                                           // Show the navigation selection menu
                                           ManyWhoSharedServices.showSelectNavigationDialog(true, location, data.id.id, data.id.versionId);
                                       } else {
                                           // Show the dialog, but no need to have navigation selection
                                           ManyWhoSharedServices.showSelectNavigationDialog(false, location, data.id.id, data.id.versionId);
                                       }
                                   },
                                   createErrorAlert);
        }
    });

    // Button to allow the user to snapshot and run the flow
    $('#activate-flow').click(function (event) {
        event.preventDefault();

        if ($(this).attr('disabled') != 'disabled') {
            ManyWhoSharedServices.showBuildDialog(true);
            ManyWhoFlow.snapAndRun('ManyWhoBuilder.ActivateFlow',
                                   ManyWhoSharedServices.getFlowId(),
                                   ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                   null,
                                   function (data, status, xhr) {
                                       var location = null;

                                       ManyWhoSharedServices.showBuildDialog(false);

                                       // Assign the location
                                       location = ManyWhoConstants.BASE_PATH_URL + '/' + ManyWhoSharedServices.getTenantId() + '/play'; // + getSelectedPlayer() + '?flow-id=' + data.id.id;

                                       // In addition to opening the flow, we also hit the activation API marking this as an official distribution build - we do this as a fire and forget
                                       ManyWhoFlow.activateFlow('ManyWhoBuilder.ActivateFlow', data.id.id, data.id.versionId, ManyWhoSharedServices.getAuthorAuthenticationToken(), null, null, null);

                                       // Check to see if the navigation has any entries for the user to select from
                                       if ($('#manywho-model-select-run-navigation').html() != null &&
                                           $('#manywho-model-select-run-navigation').html().trim().length > 0) {
                                           // Show the navigation selection menu
                                           ManyWhoSharedServices.showSelectNavigationDialog(true, location, data.id.id, null);
                                       } else {
                                           // Show the dialog, but no need to have navigation selection
                                           ManyWhoSharedServices.showSelectNavigationDialog(false, location, data.id.id, null);
                                       }
                                   },
                                   createErrorAlert);
        }
    });

    $('#open-developer-tools').click(function (event) {
        event.preventDefault();

        if ($(this).attr('disabled') != 'disabled') {
            ManyWhoUtils.setCookie('authentication-token', ManyWhoSharedServices.getAuthorAuthenticationToken(), true);
            window.open(ManyWhoConstants.BASE_PATH_URL + '/' + ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID + '/play/build?editing-token=' + ManyWhoSharedServices.getEditingToken() + '&flow-id=' + ManyWhoSharedServices.getFlowId());
        }
    });

    $('#open-translate-tools').click(function (event) {
        event.preventDefault();

        if ($(this).attr('disabled') != 'disabled') {
            ManyWhoUtils.setCookie('authentication-token', ManyWhoSharedServices.getAuthorAuthenticationToken(), true);
            window.open(ManyWhoConstants.BASE_PATH_URL + '/' + ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID + '/play/translate?editing-token=' + ManyWhoSharedServices.getEditingToken() + '&flow-id=' + ManyWhoSharedServices.getFlowId());
        }
    });

    $('#sign-out').click(function (event) {
        event.preventDefault();

        // Get the user to login again
        reLogin(this);
    });

    $('#create-sub-tenant').click(function (event) {
        event.preventDefault();

        // Open the sub-tenant flow dialog
        ManyWhoSharedServices.showSubTenantDialog(function (outputValues) {
            // Populate the sub-tenants again
            populateTenancyInformation();
        });
    });

    $('#close-flow').click(function (event) {
        event.preventDefault();

        if ($(this).attr('disabled') != 'disabled') {
            // Save the currently cached model so we have all of the changes
            ManyWhoFlow.saveFlow('ManyWhoBuilder.CloseFlow',
                                 ManyWhoSharedServices.getEditingToken(),
                                 ManyWhoSharedServices.getFlowId(),
                                 $('#flow-developer-name').html(),
                                 $('#flow-developer-summary').html(),
                                 ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                 null,
                                 function (data, status, xhr) {
                                 },
                                 createErrorAlert);

            // Clear the graph also so we don't have any data lying around - we don't wait for the save flow async call to complete
            $('#flow-graph').manywhoMxGraph('clear');
            $('#flow-graph-wrapper').hide();
            $('#flow-getting-started').show();

            // Tell the designer to update the tools accordingly
            updateTools.call(this);
        }
    });

    // Just before we update the tools, we want to see if flow information was passed into this initial page configuration









    // Update the toolbar
    updateTools.call(this);

    // Make sure the graph is the same height as the left menu so we don't have disappearing graph problems
    $('#manywho-flow-container').height($(document).height() - 45);

    // Set the timer to check if any changes to loaded flows have been made
    setInterval(function () {
            if (ManyWhoSharedServices.getFlowId() != null &&
                ManyWhoSharedServices.getFlowId().trim().length > 0) {
                ManyWhoFlow.changeAvailable('ManyWhoBuilder.configurePage',
                                            ManyWhoSharedServices.getFlowId(),
                                            ManyWhoSharedServices.getEditingToken(),
                                            ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                            null,
                                            function (data, status, xhr) {
                                                // Clear any errors as we're now successfully managing to reach the backend
                                                $('#flow-error').html('');

                                                if (data != null &&
                                                    data == true) {
                                                    // Sync the graph so we have the necessary changes
                                                    //$('#flow-graph').manywhoMxGraph('syncGraph', null);
                                                }
                                            },
                                            createErrorAlert);
            }
        }, 10000);
}
