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

function configurePage() {

    // Initialize the shared services
    ManyWhoSharedServices.initialize('shared-services');
    ManyWhoSharedServices.setEditorModeId(ManyWhoUtils.getQueryStringParam('mode'));

    // Hide all of the graph and getting started stuff until we're ready
    $('#flow-graph-wrapper').hide();
    $('#flow-getting-started').hide();

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

    // Create the setup function
    var updateTools = function () {
        var authenticationToken = ManyWhoSharedServices.getAuthorAuthenticationToken();

        if (authenticationToken != null &&
            authenticationToken.trim().length > 0) {
            // Hide the loading dialog if it's showing
            ManyWhoSharedServices.showLoadingDialog(false);

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
                ManyWhoUtils.setCookie('authentication-token', authenticationToken);
                ManyWhoUtils.setCookie('tenant-id', manywhoTenantId);

                // Update the tools menu
                updateTools.call(this);
            });
        }
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
                                                   function (flowEditingToken, flowId, flowDeveloperName, flowDeveloperSummary, flowStartMapElementId) {
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

                                                       // Update the tools
                                                       updateTools.call(this);

                                                       // Synchronize the graph to load all of the elements
                                                       $('#flow-graph').manywhoMxGraph('syncGraph', null);
                                                   },
                                                   null,
                                                   createErrorAlert);
    });

    $("#manage-page-layouts").click(function (event) {
        event.preventDefault();

        ManyWhoSharedServices.showPageElementConfigDialog(ManyWhoConstants.UI_ELEMENT_TYPE_IMPLEMENTATION_PAGE_LAYOUT, null, null, createErrorAlert);
    });

    $("#manage-tags").click(function (event) {
        event.preventDefault();

        ManyWhoSharedServices.showSharedElementConfigDialog('TAG', null, null, createErrorAlert);
    });

    //$("#manage-macros").click(function (event) {
    //    event.preventDefault();

    //    if (ManyWhoSharedServices.getDeveloperMode() == true) {
    //        ManyWhoSharedServices.showSharedElementConfigDialog('MACRO', null, null, createErrorAlert);
    //    } else {
    //        alert('Coming soon!');
    //    }
    //});

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

    // Set up the flow graph
    $('#flow-graph').manywhoMxGraph({ developerMode: ManyWhoSharedServices.getDeveloperMode() });

    $('#manywho-model-runtime-engine-dialog').modalmanager();

    // Set up the runtime engine for running and testing a flow
    $('#manywho-model-runtime-engine').manywhoRuntimeEngine({ enableAuthentication: false, includeHeader: true });

    // Button to allow the user to snapshot and run the flow
    $('#run-flow').click(function (event) {
        event.preventDefault();
        ManyWhoSharedServices.showBuildDialog(true);
        ManyWhoFlow.snapAndRun('ManyWhoBuilder.RunFlow',
                               ManyWhoSharedServices.getFlowId(),
                               ManyWhoSharedServices.getAuthorAuthenticationToken(),
                               null,
                               function (data, status, xhr) {
                                   ManyWhoSharedServices.showBuildDialog(false);
                                   window.open(ManyWhoConstants.BASE_PATH_URL + '/' + ManyWhoSharedServices.getTenantId() + '/play/default?tenant-id=' + ManyWhoSharedServices.getTenantId() + '&flow-id=' + data.id.id + '&flow-version-id=' + data.id.versionId);
                               },
                               createErrorAlert);
    });

    // Button to allow the user to snapshot and run the flow
    $('#activate-flow').click(function (event) {
        event.preventDefault();
        ManyWhoSharedServices.showBuildDialog(true);
        ManyWhoFlow.snapAndRun('ManyWhoBuilder.ActivateFlow',
                               ManyWhoSharedServices.getFlowId(),
                               ManyWhoSharedServices.getAuthorAuthenticationToken(),
                               null,
                               function (data, status, xhr) {
                                   ManyWhoSharedServices.showBuildDialog(false);

                                   // In addition to opening the flow, we also hit the activation API marking this as an official distribution build - we do this as a fire and forget
                                   ManyWhoFlow.activateFlow('ManyWhoBuilder.ActivateFlow', data.id.id, data.id.versionId, ManyWhoSharedServices.getAuthorAuthenticationToken(), null, null, null);

                                   // Now we load the flow which allows the author to then share it with their friends
                                   window.open(ManyWhoConstants.BASE_PATH_URL + '/' + ManyWhoSharedServices.getTenantId() + '/play/default?tenant-id=' + ManyWhoSharedServices.getTenantId() + '&flow-id=' + data.id.id + '&flow-version-id=' + data.id.versionId);
                               },
                               createErrorAlert);
    });

    $('#open-developer-tools').click(function (event) {
        event.preventDefault();

        if ($(this).attr('disabled') != 'disabled') {
            ManyWhoUtils.setCookie('authentication-token', ManyWhoSharedServices.getAuthorAuthenticationToken());
            window.open(ManyWhoConstants.BASE_PATH_URL + '/' + ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID + '/play/build?editing-token=' + ManyWhoSharedServices.getEditingToken() + '&flow-id=' + ManyWhoSharedServices.getFlowId());
        }
    });

    $('#sign-out').click(function (event) {
        event.preventDefault();

        // Get the user to login again
        reLogin(this);
    });

    $('#close-flow').click(function (event) {
        event.preventDefault();

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
    });

    // Update the toolbar
    updateTools.call(this);

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
                                                    $('#flow-graph').manywhoMxGraph('syncGraph', null);
                                                }
                                            },
                                            createErrorAlert);
            }
        }, 10000);
}
