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

// The rest editor needed for the developer view on the tooling
var restEditor = null;

var ManyWhoSharedServices = {
    createInput: function (inputs, key, value, contentType, objectData, typeElementDeveloperName) {
        var input = null;

        if (inputs == null) {
            inputs = new Array();
        }

        input = new Object();
        input.developerName = key;
        input.contentValue = value;
        input.contentType = contentType;
        input.objectData = objectData;
        input.typeElementDeveloperName = typeElementDeveloperName;

        inputs[inputs.length] = input;

        return inputs;
    },
    getGeneralFlowInputs: function (includeSessionInfo, elementId, groupElementId, elementType, locationX, locationY, height, width, nextElementId, ignoreFlowId) {
        var inputs = new Array();
        var input = null;

        inputs = ManyWhoSharedServices.createInput(inputs, 'Id', elementId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', ManyWhoSharedServices.getAuthorAuthenticationToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        if (includeSessionInfo == true) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'EditingToken', ManyWhoSharedServices.getEditingToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        }

        if (ignoreFlowId == true) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'FlowId', '', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        } else {
            inputs = ManyWhoSharedServices.createInput(inputs, 'FlowId', ManyWhoSharedServices.getFlowId(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        }

        if (elementType != null) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'ElementType', elementType, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        }

        if (locationX != null &&
            locationY != null) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'X', locationX, ManyWhoConstants.CONTENT_TYPE_NUMBER, null, null);
            inputs = ManyWhoSharedServices.createInput(inputs, 'Y', locationY, ManyWhoConstants.CONTENT_TYPE_NUMBER, null, null);
        }

        if (height != null &&
            width != null) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'Height', height, ManyWhoConstants.CONTENT_TYPE_NUMBER, null, null);
            inputs = ManyWhoSharedServices.createInput(inputs, 'Width', width, ManyWhoConstants.CONTENT_TYPE_NUMBER, null, null);
        }

        if (nextElementId != null) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'NextMapElementId', nextElementId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        }

        if (groupElementId != null) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'GroupElementId', groupElementId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        }

        return inputs;
    },
    getGeneralFlowAnnotations: function (graphId) {
        var inputs = new Array();
        var input = null;

        input = new Object();
        input.Key = 'graphId';
        input.Value = graphId;

        inputs[inputs.length] = input;

        return inputs;
    },
    constructRunUrl: function () {
        var fullUrl = null;

        // Start with the base url
        flowUrl = $('#manywho-dialog-select-navigation-location').val();

        // Add the player portion
        flowUrl += '/' + $('#manywho-model-select-run-player').val();

        // Add the flow identifier
        flowUrl += '?flow-id=' + $('#manywho-dialog-select-navigation-location-flow-id').val();

        // Check to see if a version was provided
        if ($('#manywho-dialog-select-navigation-location-flow-version-id').val().trim().length > 0) {
            flowUrl += '&flow-version-id=' + $('#manywho-dialog-select-navigation-location-flow-version-id').val();
        }

        // Check to see if a navigation is available
        if ($('#manywho-model-run-flow-navigation-options').attr('data-isvisible') == 'true') {
            flowUrl += "&navigation-element-id=" + $('#manywho-model-select-run-navigation').val();
        }

        // Assign the link location to the dialog
        $('#manywho-dialog-run-flow-link-location').val(flowUrl);

        // Return the link location so we have it for "run" situations
        return flowUrl;
    },
    // This method is called when the application starts - to initialize all of the shared services components.
    //
    initialize: function (reference) {
        // Check to make sure we haven't already initialized the shared services - we don't want to do it twice - but this method can be called multiple times when
        // running the designer and engine together
        if ($('#manywho-shared-services-data').get(0) == null) {
            // The values store
            var valuesData = '';
            var dialogHtml = '';

            valuesData = '<div id="manywho-shared-services-data"></div>';

            $('#' + reference).append(valuesData);

            dialogHtml += '<div id="manywho-dialog" class="modal container hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title">Loading...</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-runtime" style="overflow: auto;" class="modal-body">';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-outcomes" class="modal-footer">';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            dialogHtml += '<div id="manywho-dialog-developer" class="modal container hide fade">';
            dialogHtml += '    <div id="manywho-dialog-header-developer" class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button-developer" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title-developer">Developer Tooling : JSON Editor</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-runtime-developer" style="overflow: auto; height: 550px;" class="modal-body">';
            dialogHtml += '        <div id="manywho-dialog-developer-rest-editor" style="height: 540px;"></div>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-outcomes-developer" class="modal-footer">';
            dialogHtml += '        <button id="manywho-dialog-delete-button-developer" type="button" class="btn btn-danger">DELETE</button>';
            dialogHtml += '        <button id="manywho-dialog-save-button-developer" type="button" class="btn btn-warning">Save</button>';
            dialogHtml += '        <button id="manywho-dialog-cancel-button-developer" type="button" class="btn">Close</button>';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            dialogHtml += '<div id="manywho-dialog-fullscreen" class="manywho-fullscreen-modal hide fade in" style="display: block;" tabindex="-1" aria-hidden="false">';
            dialogHtml += '    <div id="manywho-dialog-header-fullscreen" class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button-fullscreen" type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title-fullscreen">Loading...</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-runtime-fullscreen" class="modal-body">';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-outcomes-fullscreen" class="manywho-modal-footer modal-footer">';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            dialogHtml += '<div id="manywho-dialog-sub" class="modal hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button-sub" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title-sub">Loading...</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-runtime-sub" style="overflow: auto; height: 450px;" class="modal-body">';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-outcomes-sub" class="modal-footer">';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            dialogHtml += '<div id="manywho-dialog-comment" class="modal hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button-build" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title-comment">New Flow Version</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-run-flow-version-comment" class="modal-body">';
            dialogHtml += '    <div class="row-fluid">';
            dialogHtml += '        <div class="span12">';
            dialogHtml += '            <label class="muted"><strong>Add a comment for this Flow Version:</strong><br/>';
            dialogHtml += '                <input type="text" id="version-comment" />';
            dialogHtml += '            </label>';
            dialogHtml += '        </div>';
            dialogHtml += '    </div>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div class="modal-footer">';
            dialogHtml += '        <button id="manywho-dialog-version-ok" type="button" class="btn btn-primary">Activate</button>';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            dialogHtml += '<div id="manywho-dialog-build" class="modal hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button-build" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title-build">Building Flow</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-build-dialog" style="overflow: auto; height: 450px;" class="modal-body">';
            dialogHtml += '      <p align="center"><img src="https://cdn.manywho.com/images/spinner.gif" height="180" width="180" alt="Building..." /></p>';
            dialogHtml += '      <p align="center" class="muted">Your flow is being prepared!  This may take a little time depending on the size of the flow... please be patient :)</p>';
            dialogHtml += '      <p align="center"><span class="label label-info">Heads up!</span> <span class="muted">Make sure your browser isn\'t blocking popups.</span></p>';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            dialogHtml += '<div id="manywho-dialog-select-navigation" class="modal hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button-select-navigation" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title-select-navigation">Run Flow</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-select-navigation-dialog" class="modal-body">';
            dialogHtml += '        <input type="hidden" id="manywho-dialog-select-navigation-location" value="" />';
            dialogHtml += '        <input type="hidden" id="manywho-dialog-select-navigation-location-flow-id" value="" />';
            dialogHtml += '        <input type="hidden" id="manywho-dialog-select-navigation-location-flow-version-id" value="" />';
            dialogHtml += '        <div class="row-fluid" id="manywho-model-run-flow-player-options" data-isvisible="false">';
            dialogHtml += '            <div class="span12">';
            dialogHtml += '                <label class="muted"><strong>Player:</strong><br/>';
            dialogHtml += '                    <select id="manywho-model-select-run-player"></select>';
            dialogHtml += '                </label>';
            dialogHtml += '            </div>';
            dialogHtml += '        </div>';
            dialogHtml += '        <div class="row-fluid" id="manywho-model-run-flow-navigation-options" data-isvisible="false">';
            dialogHtml += '            <div class="span12">';
            dialogHtml += '                <label class="muted"><strong>Navigation:</strong><br/>';
            dialogHtml += '                    <select id="manywho-model-select-run-navigation"></select>';
            dialogHtml += '                </label>';
            dialogHtml += '            </div>';
            dialogHtml += '        </div>';
            dialogHtml += '        <div class="row-fluid" id="manywho-model-run-flow-link">';
            dialogHtml += '            <label class="muted"><strong>Link to your flow:</strong><br/>';
            dialogHtml += '                <input type="text" id="manywho-dialog-run-flow-link-location" class="span12" value="" />';
            dialogHtml += '            </label>';
            dialogHtml += '        </div>';
            dialogHtml += '        <div class="row-fluid" id="manywho-model-run-flow-debug-options">';
            dialogHtml += '            <div class="span12"><p class="muted">Please select the mode you\'d like to run the flow in:</p></div>';
            dialogHtml += '            <div class="btn-group">';
            dialogHtml += '                <button class="btn btn-inverse dropdown-toggle" data-toggle="dropdown" href="#"><i class="icon-play icon-white"></i> Mode</a> <span class="caret"></span></button>';
            dialogHtml += '                <ul class="dropdown-menu" id="manywho-model-select-run-debug">';
            dialogHtml += '                    <li><a href="#" id="manywho-model-select-run-debug-option-run" data-mode="">Run</a></li>';
            dialogHtml += '                    <li><a href="#" id="manywho-model-select-run-debug-option-debug" data-mode="DEBUG">Debug</a></li>';
            dialogHtml += '                    <li><a href="#" id="manywho-model-select-run-debug-option-debug-stepthrough" data-mode="DEBUG_STEPTHROUGH">Debug Step-by-Step</a></li>';
            dialogHtml += '                </ul>';
            dialogHtml += '            </div>';
            dialogHtml += '        </div>';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            dialogHtml += '<div id="manywho-dialog-loading" class="modal hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button-loading" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title-loading">Loading...</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-loading-dialog" style="overflow: auto; height: 250px;" class="modal-body">';
            dialogHtml += '      <p align="center"><img src="https://cdn.manywho.com/images/spinner.gif" height="180" width="180" alt="Loading..." /></p>';
            dialogHtml += '      <p align="center" class="muted">Flow Builder is loading!</p>';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            $('#' + reference).append(dialogHtml);
            $('#manywho-dialog').modalmanager();
            $('#manywho-dialog-developer').modalmanager();
            $('#manywho-dialog-comment').modalmanager();
            $('#manywho-dialog-sub').modalmanager();
            $('#manywho-dialog-build').modalmanager();
            $('#manywho-dialog-select-navigation').modalmanager();
            $('#manywho-dialog-loading').modalmanager();
            $('#manywho-dialog-fullscreen').hide();

            // Create the rest editor for the developer tooling
            restEditor = ace.edit('manywho-dialog-developer-rest-editor');
            restEditor.setTheme('ace/theme/monokai');
            restEditor.getSession().setMode('ace/mode/javascript');

            $('#manywho-dialog').on('hidden', function () {
                $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                $('#manywho-dialog-title').html('Loading...');
            });

            $('#manywho-dialog-sub').on('hidden', function () {
                $('#manywho-model-runtime-sub').manywhoRuntimeEngine('clear');
                $('#manywho-dialog-title-sub').html('Loading...');
            });

            $('#manywho-model-select-run-player').on('change', function (event) {
                // Construct the url
                ManyWhoSharedServices.constructRunUrl();
            });

            $('#manywho-model-select-run-navigation').on('change', function (event) {
                // Construct the url
                ManyWhoSharedServices.constructRunUrl();
            });

            // User clicks on run
            $('#manywho-model-select-run-debug-option-run').on('click', function (event) {
                // Create the location and open the window
                window.open(ManyWhoSharedServices.constructRunUrl());
            });

            // User clicks on debug
            $('#manywho-model-select-run-debug-option-debug').on('click', function (event) {
                // Grab the location stored in the dialog and debug
                window.open(ManyWhoSharedServices.constructRunUrl() + '&mode=' + $(this).attr('data-mode'));
            });

            // User clicks on debug step through
            $('#manywho-model-select-run-debug-option-debug-stepthrough').on('click', function (event) {
                // Grab the location stored in the dialog and debug
                window.open(ManyWhoSharedServices.constructRunUrl() + '&mode=' + $(this).attr('data-mode'));
            });

            // The registry of extension component widgets for the engine
            var registry = [
                {
                    tag: 'Form Editor', component: ManyWhoTagFormEditor
                },
                {
                    tag: 'Navigation Editor', component: ManyWhoTagNavigationEditor
                },
                {
                    tag: 'Table Editor', component: ManyWhoTagTableEditor
                }
            ];

            $('#manywho-model-runtime').manywhoRuntimeEngine({
                enableAuthentication: false,
                rewriteUrl: false,
                tenantId: ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                selectResultSetSize: 500,
                register: registry
            });

            $('#manywho-model-runtime-sub').manywhoRuntimeEngine({
                enableAuthentication: false,
                rewriteUrl: false,
                tenantId: ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                selectResultSetSize: 500,
                register: registry
            });

            $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine({
                enableAuthentication: false,
                rewriteUrl: false,
                tenantId: ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                selectResultSetSize: 500,
                register: registry
            });

            // Manually add the event for the full screen dialog as it's not a proper dialog
            $('#manywho-dialog-close-button-fullscreen').click(function (event) {
                event.preventDefault();
                $('#manywho-dialog-fullscreen').fadeOut('slow');
                $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine('clear');
                $('#manywho-dialog-title-fullscreen').html('Loading...');
            });
        }
    },
    showCommentDialog: function (show) {
        if (show == true) {
            $('#manywho-dialog-comment').modal('show');
        } else {
            $('#manywho-dialog-comment').modal('hide');
        }
    },
    showBuildDialog: function (show) {
        if (show == true) {
            $('#manywho-dialog-build').modal('show');
        } else {
            $('#manywho-dialog-build').modal('hide');
        }
    },
    showSelectNavigationDialog: function (hasNavigation, location, flowId, flowVersionId) {
        // If the version is null, we blank it
        if (flowVersionId == null) {
            flowVersionId = '';
        }

        // Set the location to the provided location
        $('#manywho-dialog-select-navigation-location').val(location);
        $('#manywho-dialog-select-navigation-location-flow-id').val(flowId);
        $('#manywho-dialog-select-navigation-location-flow-version-id').val(flowVersionId);

        if (hasNavigation == true) {
            // Make sure the navigation options are visible
            $('#manywho-model-run-flow-navigation-options').attr('data-isvisible', 'true');
            $('#manywho-model-run-flow-navigation-options').show();
        } else {
            // Hide the navigation options as we don't have any
            $('#manywho-model-run-flow-navigation-options').attr('data-isvisible', 'false');
            $('#manywho-model-run-flow-navigation-options').hide();
        }

        // Generate the flow location
        ManyWhoSharedServices.constructRunUrl();

        // Show the dialog
        $('#manywho-dialog-select-navigation').modal('show');
    },
    showLoadingDialog: function (show) {
        if (show == true) {
            $('#manywho-dialog-loading').modal({ backdrop: 'static', show: true });
        } else {
            $('#manywho-dialog-loading').modal('hide');
        }
    },
    adjustDialog: function (height, width, enableClose) {
        if (enableClose == false) {
            $('#manywho-dialog-close-button').hide();
        } else {
            $('#manywho-dialog-close-button').show();
        }

        if (width == null) {
            // Remove the sizing attribute
            $('#manywho-dialog').removeAttr('data-width');

            // Make the width of the dialog the same size as the container
            if ($('#manywho-dialog').hasClass('container') == false) {
                $('#manywho-dialog').addClass('container');
            }
        } else {
            $('#manywho-dialog').removeClass('container');
            $('#manywho-dialog').attr('data-width', '760');
        }

        $('#manywho-model-runtime').attr('style', 'overflow: auto; height: ' + height + 'px;');
    },
    adjustSubDialog: function (height, width, enableClose) {
        if (enableClose == false) {
            $('#manywho-dialog-close-button-sub').hide();
        } else {
            $('#manywho-dialog-close-button-sub').show();
        }

        if (width == null) {
            // Remove the sizing attribute
            $('#manywho-dialog-sub').removeAttr('data-width');

            // Make the width of the dialog the same size as the container
            if ($('#manywho-dialog-sub').hasClass('container') == false) {
                $('#manywho-dialog-sub').addClass('container');
            }
        } else {
            $('#manywho-dialog-sub').removeClass('container');
            $('#manywho-dialog-sub').attr('data-width', '760');
        }

        $('#manywho-model-runtime-sub').attr('style', 'overflow: auto; height: ' + height + 'px;');
    },
    showAuthenticationDialog: function (okCallback) {
        var username = null;
        var inputs = null;

        ManyWhoSharedServices.adjustDialog(200, 550, false);

        $('#manywho-dialog').on('hidden', function () {
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        // We want the user to authenticate against the draw plugin API
        inputs = ManyWhoSharedServices.createInput(inputs, 'LoginUrl', ManyWhoConstants.LOGIN_PATH_URL + '/plugins/manywho/api/draw/1/authentication', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        // Also set the directory name so we have it
        inputs = ManyWhoSharedServices.createInput(inputs, 'DirectoryName', 'ManyWho', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        username = ManyWhoUtils.getCookie('AuthorUsername');

        if (username != null &&
            username.trim().length > 0) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'Username', username, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        }

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowAuthenticationDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__DRAW_AUTHENTICATION__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: inputs,
                                       outcomePanel: 'manywho-model-outcomes',
                                       formLabelPanel: 'manywho-dialog-title',
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           var authenticationToken = null;
                                           var manywhoTenantId = null;

                                           // Hide the dialog
                                           $('#manywho-dialog').modal('hide');
                                           $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title').html('Loading...');

                                           // Get the values out of the outputs
                                           authenticationToken = ManyWhoUtils.getOutcomeValue(outputValues, 'AuthenticationToken', null);
                                           manywhoTenantId = ManyWhoUtils.getOutcomeValue(outputValues, 'ManyWhoTenantId', null);

                                           // Get the username so we can keep that for future logins
                                           ManyWhoUtils.setCookie('AuthorUsername', ManyWhoUtils.getOutcomeValue(outputValues, 'Username', null));

                                           // Call the OK callback
                                           okCallback.call(this, authenticationToken, manywhoTenantId);
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   // Hide the loading dialog if it's open
                                   ManyWhoSharedServices.showLoadingDialog(false);

                                   // Show the authentication dialog
                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true, keyboard: false});
                               },
                               null);
    },
    showSubTenantDialog: function (okCallback) {
        var username = null;
        var inputs = null;

        ManyWhoSharedServices.adjustDialog(250, 550, true);

        $('#manywho-dialog').on('hidden', function () {
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', ManyWhoSharedServices.getAuthorAuthenticationToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowSubTenantDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__SUBTENANT__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: inputs,
                                       outcomePanel: 'manywho-model-outcomes',
                                       formLabelPanel: 'manywho-dialog-title',
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           // Hide the dialog
                                           $('#manywho-dialog').modal('hide');
                                           $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title').html('Loading...');

                                           // Call the ok callback if one has been provided
                                           if (okCallback != null) {
                                               okCallback.call(this, outputValues);
                                           }
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   // Hide the loading dialog if it's open
                                   ManyWhoSharedServices.showLoadingDialog(false);

                                   // Show the authentication dialog
                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               null);
    },
    showSubConfigDialog: function (height, width, elementType, domId, elementId, formElementId, inputs, doDelete, okCallback, enableClose) {
        ManyWhoSharedServices.adjustSubDialog(height, width, enableClose);

        if (ManyWhoSharedServices.getEditingToken() != null &&
            ManyWhoSharedServices.getEditingToken().trim().length > 0) {
            inputs = ManyWhoSharedServices.createInput(inputs, 'EditingToken', ManyWhoSharedServices.getEditingToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        }

        inputs = ManyWhoSharedServices.createInput(inputs, 'FlowId', ManyWhoSharedServices.getFlowId(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', ManyWhoSharedServices.getAuthorAuthenticationToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowSubConfigDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: inputs,
                                       outcomePanel: 'manywho-model-outcomes-sub',
                                       formLabelPanel: 'manywho-dialog-title-sub',
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           okCallback.call(this, domId, elementId, formElementId, doDelete, outputValues);

                                           $('#manywho-dialog-sub').modal('hide');
                                           $('#manywho-model-runtime-sub').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title-sub').html('Loading...');
                                       }
                                   }

                                   $('#manywho-model-runtime-sub').manywhoRuntimeEngine('execute', options);

                                   $('#manywho-dialog-sub').modal({ backdrop: 'static', show: true });
                               },
                               null);
    },
    showGraphElementDeveloperDialog: function (elementType, elementId, groupElementId, graphId, operation, locationX, locationY, okCallback, deleteCallback, cancelCallback) {
        var doDelete = false;
        var inputs = null;

        if (elementId == null ||
            (operation != null &&
             operation.toLowerCase() == 'delete')) {
            doDelete = true;
        }

        // Remove any existing click events from the button
        $('#manywho-dialog-cancel-button-developer').off('click');
        $('#manywho-dialog-save-button-developer').off('click');

        // Remove and add the dialog cancel code
        $('#manywho-dialog-developer').off('hidden');
        $('#manywho-dialog-developer').on('hidden', function () {
            cancelCallback.call(this, graphId, doDelete);
        });

        // Get the json for the rest editor
        ManyWhoDeveloper.getElementJSON(elementId,
                                        elementType,
                                        locationX,
                                        locationY,
                                        groupElementId,
                                        function (json) {
                                            $('#manywho-dialog-developer').modal('show');

                                            restEditor.setValue(json);
                                            restEditor.gotoLine(0);

                                            // Remove any existing event handlers so we don't execute all code that's ever been passed to this method!
                                            $('#manywho-dialog-cancel-button-developer').off('click');
                                            $('#manywho-dialog-save-button-developer').off('click');
                                            $('#manywho-dialog-delete-button-developer').off('click');

                                            // Add the event for the close button
                                            $('#manywho-dialog-cancel-button-developer').on('click', function (event) {
                                                // Close has the same functions as the cancel button
                                                cancelCallback.call(this, graphId, doDelete);

                                                // Clear the editor
                                                restEditor.setValue('');

                                                // Close the dialog as requested
                                                $('#manywho-dialog-developer').modal('hide');
                                            });

                                            // Add the event for the save button
                                            $('#manywho-dialog-save-button-developer').on('click', function (event) {
                                                // Tell the caller that the user decided to save
                                                okCallback.call(this, restEditor.getValue(), function (callbackJSON) {
                                                    // Put the resultant JSON back in the editor
                                                    restEditor.setValue(callbackJSON);
                                                });

                                                // Flip the delete flag to "false" as this operation will not cause the dialog to close
                                                doDelete = false;
                                            });

                                            // Add the event for the delete button
                                            $('#manywho-dialog-delete-button-developer').on('click', function (event) {
                                                // Tell the caller that the user decided to delete
                                                deleteCallback.call(this, graphId, elementId);

                                                // Clear the editor
                                                restEditor.setValue('');

                                                // Close the dialog as requested
                                                $('#manywho-dialog-developer').modal('hide');
                                            });
                                        },
                                        null);
    },
    showPageElementConfigDialog: function (elementType, elementId, okCallback, errorFunction) {

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowPageElementConfigDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: ManyWhoSharedServices.getGeneralFlowInputs(false, elementId, null, elementType),
                                       outcomePanel: 'manywho-model-outcomes-fullscreen',
                                       formLabelPanel: 'manywho-dialog-title-fullscreen',
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           $('#manywho-dialog-fullscreen').fadeOut('slow');
                                           $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title-fullscreen').html('Loading...');
                                       }
                                   }

                                   $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine('execute', options);

                                   // Get the window height
                                   var windowHeight = $(window).height();

                                   // The height of the body, should then be the window height, minus the header and outcomes, minus some buffering
                                   // 50 for the header, 60 for the outcomes, 10 for the outer dialog margin, 30 for the padding on the runtime
                                   var runtimeHeight = windowHeight - (50 + 60 + 10 + 30);

                                   // Now apply the values
                                   $('#manywho-model-runtime-fullscreen').css('overflow', 'auto');
                                   $('#manywho-model-runtime-fullscreen').css('height', runtimeHeight + 'px');

                                   // Finally, show the dialog
                                   $('#manywho-dialog-fullscreen').fadeIn('slow');
                               },
                               errorFunction);
    },
    showSharedElementConfigDialog: function (elementType, elementId, okCallback, errorFunction) {
        ManyWhoSharedServices.adjustDialog(475, null, true);

        $('#manywho-dialog').off('hidden');
        $('#manywho-dialog').on('hidden', function () {
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowSharedElementConfigDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: ManyWhoSharedServices.getGeneralFlowInputs(false, elementId, null, elementType),
                                       outcomePanel: 'manywho-model-outcomes',
                                       formLabelPanel: 'manywho-dialog-title',
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           $('#manywho-dialog').modal('hide');
                                           $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title').html('Loading...');
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               errorFunction);
    },
    showNavigationElementConfigDialog: function (elementType, elementId, okCallback, errorFunction) {
        ManyWhoSharedServices.adjustDialog(475, null, true);

        $('#manywho-dialog').off('hidden');
        $('#manywho-dialog').on('hidden', function () {
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowNavigationElementConfigDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: ManyWhoSharedServices.getGeneralFlowInputs(true, elementId, null, elementType),
                                       outcomePanel: 'manywho-model-outcomes',
                                       formLabelPanel: 'manywho-dialog-title',
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           $('#manywho-dialog').modal('hide');
                                           $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title').html('Loading...');

                                           // Check to see if we have a callback function
                                           if (okCallback != null) {
                                               // Call the callback
                                               okCallback.call(this);
                                           }
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               errorFunction);
    },
    showMapElementConfigDialog: function (elementType, elementId, groupElementId, graphId, operation, locationX, locationY, okCallback, cancelCallback) {
        var inputs = null;

        $('#manywho-dialog').off('hidden');

        inputs = ManyWhoSharedServices.getGeneralFlowInputs(true, elementId, groupElementId, elementType, locationX, locationY);
        inputs = ManyWhoSharedServices.createInput(inputs, 'Command', operation, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', ManyWhoSharedServices.getAuthorAuthenticationToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'GroupElementId', groupElementId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        ManyWhoSharedServices.adjustDialog(475, null, true);
        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowMapElementConfigDialog',
                                ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                                'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                                null,
                                null,
                                function (data, status, xhr) {

                                    var options = {
                                        flowId: data.id.id,
                                        flowVersionId: data.id.versionId,
                                        inputs: inputs,
                                        outcomePanel: 'manywho-model-outcomes',
                                        formLabelPanel: 'manywho-dialog-title',
                                        annotations: ManyWhoSharedServices.getGeneralFlowAnnotations(graphId),
                                        mode: ManyWhoSharedServices.getEditorModeId(),
                                        doneCallbackFunction: function (outputValues) {
                                            var flowOutcome = null;
                                            var elementId = null;
                                            var elementDeveloperName = null;

                                            // Get the values out of the outputs
                                            elementId = ManyWhoUtils.getOutcomeValue(outputValues, 'MAP_ELEMENT', 'Id');
                                            elementDeveloperName = ManyWhoUtils.getOutcomeValue(outputValues, 'MAP_ELEMENT', 'DeveloperName');
                                            flowOutcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);

                                            // Check the flow outcome and and respond appropriately
                                            if (flowOutcome == null ||
                                                flowOutcome.toLowerCase() != 'cancel') {
                                                $('#manywho-dialog').attr('data-keep', 'true');
                                                okCallback.call(this, elementType, elementId, graphId, elementDeveloperName, flowOutcome);
                                            } else {
                                                cancelCallback.call(this, graphId, operation, flowOutcome);

                                                // Clear the 'keep' data so it doesn't bleed between calls
                                                $('#manywho-dialog').attr('data-keep', '');
                                                $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                                $('#manywho-dialog-title').html('Loading...');
                                            }

                                            // Hide the dialog
                                            $('#manywho-dialog').modal('hide');
                                            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                            $('#manywho-dialog-title').html('Loading...');
                                        }
                                    }

                                    $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                    $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                                },
                                null);
    },
    showMapElementOutcomeConfigDialog: function (elementId, outcomeId, graphId, operation, nextElementId, okCallback, cancelCallback) {
        var doDelete = false;
        var inputs = null;

        if (outcomeId == null) {
            doDelete = true;
        }

        $('#manywho-dialog').off('hidden');
        $('#manywho-dialog').on('hidden', function () {
            if ($('#manywho-dialog').attr('data-keep') != 'true') {
                cancelCallback.call(this, graphId, doDelete);
            }

            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        inputs = ManyWhoSharedServices.getGeneralFlowInputs(true, elementId, null, null, null, null, null, null, nextElementId);
        inputs = ManyWhoSharedServices.createInput(inputs, 'OutcomeId', outcomeId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'Command', operation, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', ManyWhoSharedServices.getAuthorAuthenticationToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        ManyWhoSharedServices.adjustDialog(200, 550, true);
        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowMapElementOutcomeConfigDialog',
                                ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                                'MANYWHO__OUTCOME__DEFAULT__FLOW',
                                null,
                                null,
                                function (data, status, xhr) {

                                    var options = {
                                        flowId: data.id.id,
                                        flowVersionId: data.id.versionId,
                                        inputs: inputs,
                                        outcomePanel: 'manywho-model-outcomes',
                                        formLabelPanel: 'manywho-dialog-title',
                                        annotations: ManyWhoSharedServices.getGeneralFlowAnnotations(graphId),
                                        mode: ManyWhoSharedServices.getEditorModeId(),
                                        doneCallbackFunction: function (outputValues) {
                                            var flowOutcome = null;
                                            var outcomeId = null;
                                            var outcomeDeveloperName = null;
                                            var outcome = null;

                                            // Get the values out of the outputs
                                            flowOutcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);
                                            outcome = ManyWhoUtils.getOutcomeValue(outputValues, 'Outcome ContentObject', null);
                                            outcomeDeveloperName = ManyWhoUtils.getOutcomeValue(outputValues, 'Outcome ContentObject', 'DeveloperName');
                                            outcomes = ManyWhoUtils.getOutcomeValue(outputValues, 'MAP_ELEMENT', 'outcomes');

                                            // We need to look at the outcomes and find the one that matches the developer name as the outcome object will not
                                            // have the identifier assigned to it
                                            // If this is a delete, we don't bother with this logic as the outcome will actually be correct
                                            if (outcomes != null &&
                                                outcomes.length > 0) {
                                                for (var a = 0; a < outcomes.length; a++) {
                                                    var outcomeEntry = outcomes[a];

                                                    // We need to find the outcome for the developer name so we scan for that property
                                                    if (outcomeEntry.properties != null &&
                                                        outcomeEntry.properties.length > 0) {
                                                        for (var b = 0; b < outcomeEntry.properties.length; b++) {
                                                            if (outcomeEntry.properties[b].developerName != null &&
                                                                outcomeEntry.properties[b].developerName.toLowerCase() == 'developername' &&
                                                                outcomeEntry.properties[b].contentValue.toLowerCase() == outcomeDeveloperName.toLowerCase()) {
                                                                // Grab the outcome and outcome identifier from the list by matching on developer name
                                                                outcomeId = outcomeEntry.externalId;
                                                                outcome = outcomeEntry;
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    if (outcomeId != null &&
                                                        outcomeId.trim().length > 0) {
                                                        break;
                                                    }
                                                }
                                            }

                                            // Check the flow outcome and and respond appropriately
                                            if (flowOutcome == null ||
                                                flowOutcome.toLowerCase() != 'cancel') {
                                                $('#manywho-dialog').attr('data-keep', 'true');
                                                okCallback.call(this, elementId, graphId, outcomeId, outcomeDeveloperName, outcome, flowOutcome);
                                            } else {
                                                cancelCallback.call(this, graphId, doDelete);
                                            }

                                            // Hide the dialog
                                            $('#manywho-dialog').modal('hide');
                                            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                            $('#manywho-dialog-title').html('Loading...');
                                        }
                                    }

                                    $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                    $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                                },
                                null);
    },
    showGroupElementConfigDialog: function (elementType, elementId, graphId, operation, locationX, locationY, height, width, okCallback, cancelCallback) {
        var doDelete = false;

        if (elementId == null) {
            doDelete = true;
        }

        $('#manywho-dialog').off('hidden');
        $('#manywho-dialog').on('hidden', function () {
            if ($('#manywho-dialog').attr('data-keep') != 'true') {
                cancelCallback.call(this, graphId, doDelete);
            }

            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        // Send the inputs needed for the flow to make decisions
        inputs = ManyWhoSharedServices.getGeneralFlowInputs(true, elementId, null, elementType, locationX, locationY, height, width);
        inputs = ManyWhoSharedServices.createInput(inputs, 'Command', operation, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', ManyWhoSharedServices.getAuthorAuthenticationToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        ManyWhoSharedServices.adjustDialog(475, null, true);
        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowGroupElementConfigDialog',
                                ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                                'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                                null,
                                null,
                                function (data, status, xhr) {

                                    var options = {
                                        flowId: data.id.id,
                                        flowVersionId: data.id.versionId,
                                        inputs: inputs,
                                        outcomePanel: 'manywho-model-outcomes',
                                        formLabelPanel: 'manywho-dialog-title',
                                        annotations: ManyWhoSharedServices.getGeneralFlowAnnotations(graphId),
                                        mode: ManyWhoSharedServices.getEditorModeId(),
                                        doneCallbackFunction: function (outputValues) {
                                            var flowOutcome = null;
                                            var elementId = null;
                                            var elementDeveloperName = null;

                                            elementId = ManyWhoUtils.getOutcomeValue(outputValues, 'GROUP_ELEMENT', 'Id');
                                            elementDeveloperName = ManyWhoUtils.getOutcomeValue(outputValues, 'GROUP_ELEMENT', 'DeveloperName');
                                            flowOutcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);

                                            if (flowOutcome == null ||
                                                flowOutcome.toLowerCase() != 'cancel') {
                                                $('#manywho-dialog').attr('data-keep', 'true');
                                                okCallback.call(this, elementType, elementId, graphId, elementDeveloperName, flowOutcome);
                                            } else {
                                                cancelCallback.call(this, graphId, doDelete);
                                            }

                                            // Hide the dialog
                                            $('#manywho-dialog').modal('hide');
                                            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                            $('#manywho-dialog-title').html('Loading...');
                                        }
                                    }

                                    $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                    $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                                },
                                null);
    },
    showFlowConfigDialog: function (elementId, okCallback, cancelCallback, errorFunction) {
        ManyWhoSharedServices.adjustDialog(475, null, true);

        $('#manywho-dialog').off('hidden');
        $('#manywho-dialog').on('hidden', function () {
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowFlowConfigDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__FLOW__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: ManyWhoSharedServices.getGeneralFlowInputs(false, elementId, null, null, null, null, null, null, null, true),
                                       outcomePanel: 'manywho-model-outcomes',
                                       formLabelPanel: 'manywho-dialog-title',
                                       annotations: null,
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           var flowOutcome = null;
                                           var flowEditingToken = null;
                                           var flowId = null;
                                           var flowDeveloperName = null;
                                           var flowDeveloperSummary = null;
                                           var flowStartMapElementId = null;

                                           // Hide the dialog
                                           $('#manywho-dialog').modal('hide');
                                           $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title').html('Loading...');

                                           // Get the values out of the outputs
                                           flowId = ManyWhoUtils.getOutcomeValue(outputValues, 'FLOW', 'Id');
                                           flowDeveloperName = ManyWhoUtils.getOutcomeValue(outputValues, 'FLOW', 'DeveloperName');
                                           flowDeveloperSummary = ManyWhoUtils.getOutcomeValue(outputValues, 'FLOW', 'DeveloperSummary');
                                           flowEditingToken = ManyWhoUtils.getOutcomeValue(outputValues, 'FLOW', 'EditingToken');
                                           flowStartMapElementId = ManyWhoUtils.getOutcomeValue(outputValues, 'FLOW', 'StartMapElementId');
                                           flowOutcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);

                                           if (flowOutcome == null ||
                                               flowOutcome.toLowerCase() != 'cancel') {
                                               okCallback.call(this, flowEditingToken, flowId, flowDeveloperName, flowDeveloperSummary, flowStartMapElementId);
                                           } else {
                                               if (cancelCallback != null) {
                                                   cancelCallback.call(this);
                                               }
                                           }
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               errorFunction);
    },
    showFlowVersionConfigDialog: function (elementId, okCallback, cancelCallback, errorFunction) {
        ManyWhoSharedServices.adjustDialog(475, null, true);

        $('#manywho-dialog').off('hidden');
        $('#manywho-dialog').on('hidden', function () {
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });
        var flowId = ManyWhoSharedServices.getFlowId();
        var authenticationToken = ManyWhoSharedServices.getAuthorAuthenticationToken();
        var inputs = ManyWhoSharedServices.createInput(inputs, 'FlowId', flowId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', authenticationToken, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowFlowVersionConfigDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__FLOW__VERSION__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: inputs,
                                       outcomePanel: 'manywho-model-outcomes',
                                       formLabelPanel: 'manywho-dialog-title',
                                       annotations: null,
                                       mode: ManyWhoSharedServices.getEditorModeId(),
                                       doneCallbackFunction: function (outputValues) {
                                           var flowOutcome = null;
                                           var flowEditingToken = null;
                                           var flowId = null;
                                           var flowDeveloperName = null;
                                           var flowDeveloperSummary = null;
                                           var flowStartMapElementId = null;

                                           // Hide the dialog
                                           $('#manywho-dialog').modal('hide');
                                           $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                           $('#manywho-dialog-title').html('Loading...');
                                           
                                           flowOutcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);

                                           if (flowOutcome == null ||
                                               flowOutcome.toLowerCase() != 'cancel') {
                                               // Get the values out of the outputs
                                               flowId = ManyWhoUtils.getOutcomeValue(outputValues, 'Flow To Open', 'Id');
                                               flowDeveloperName = ManyWhoUtils.getOutcomeValue(outputValues, 'Flow To Open', 'DeveloperName');
                                               flowDeveloperSummary = ManyWhoUtils.getOutcomeValue(outputValues, 'Flow To Open', 'DeveloperSummary');
                                               flowEditingToken = ManyWhoUtils.getOutcomeValue(outputValues, 'Flow To Open', 'EditingToken');
                                               flowStartMapElementId = ManyWhoUtils.getOutcomeValue(outputValues, 'Flow To Open', 'StartMapElementId');
                                               flowOutcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);
                                               flowVersionId = ManyWhoUtils.getOutcomeValue(outputValues, 'Flow Version To Activate', 'Id');
                                               var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', ManyWhoSharedServices.getTenantId());
                                               ManyWhoFlow.revertVersion('ManyWhoSharedServices.ShowFlowVersionConfigDialog', flowId, flowVersionId, flowEditingToken, ManyWhoSharedServices.getAuthorAuthenticationToken(), null, function (data) {
                                                   okCallback.call(this, flowEditingToken, flowId, flowDeveloperName, flowDeveloperSummary, flowStartMapElementId);
                                               }, null, headers);
                                           } else {
                                               if (cancelCallback != null) {
                                                   cancelCallback.call(this);
                                               }
                                           }
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               errorFunction);
    },
    setDeveloperMode: function (mode) {
        $('#manywho-shared-services-data').data('developerMode', mode);
    },
    getDeveloperMode: function () {
        var storedMode = $('#manywho-shared-services-data').data('developerMode');
        var responseMode = false;

        if (storedMode == 'true' ||
            storedMode == true) {
            responseMode = true;
        }

        return responseMode;
    },
    showFlowDeleteDialog: function (elementId, okCallback) {
        alert('to do!');
    },
    setEditingToken: function (editingToken) {
        $('#manywho-shared-services-data').data('editingtoken', editingToken);
    },
    getEditingToken: function () {
        return $('#manywho-shared-services-data').data('editingtoken');
    },
    setEditorModeId: function (mode) {
        $('#manywho-shared-services-data').data('mode', mode);
    },
    getEditorModeId: function () {
        return $('#manywho-shared-services-data').data('mode');
    },
    setFlowId: function (flowId) {
        if (flowId == null) {
            flowId = '';
        }

        $('#manywho-shared-services-data').data('flowid', flowId);
    },
    getFlowId: function () {
        return $('#manywho-shared-services-data').data('flowid');
    },
    setTenantId: function (tenantId) {
        $('#manywho-shared-services-data').data('tenantid', tenantId);
    },
    getTenantId: function () {
        return $('#manywho-shared-services-data').data('tenantid');
    },
    setAuthorAuthenticationToken: function (authenticationToken) {
        $('#manywho-shared-services-data').data('authorauthenticationtoken', authenticationToken);
    },
    getAuthorAuthenticationToken: function () {
        var authenticationToken = $('#manywho-shared-services-data').data('authorauthenticationtoken');

        if (authenticationToken == null ||
            authenticationToken == 'null') {
            authenticationToken = '';
        }

        return authenticationToken;
    },
    setAuthenticationToken: function (authenticationToken) {
        $('#manywho-shared-services-data').data('authenticationtoken', authenticationToken);
    },
    getAuthenticationToken: function () {
        var authenticationToken = $('#manywho-shared-services-data').data('authenticationtoken');

        if (authenticationToken == null ||
            authenticationToken == 'null') {
            authenticationToken = '';
        }

        return authenticationToken;
    },
    setCultureHeader: function (brand, country, language, variant) {
        var culture = null;

        culture = '';
        culture += 'Brand=' + brand;
        culture += '&Country=' + country;
        culture += '&Language=' + language;
        culture += '&Variant=' + variant;

        $('#manywho-shared-services-data').data('culture', culture);
    },
    getCultureHeader: function () {
        var culture = $('#manywho-shared-services-data').data('culture');

        if (culture == null ||
            culture == 'null' ||
            culture.trim().length == 0) {
            culture = null;
        }

        return culture;
    },
    setNetworkId: function (networkId) {
        $('#manywho-shared-services-data').data('networkid', networkId);
    },
    getNetworkId: function () {
        var networkId = $('#manywho-shared-services-data').data('networkid');

        if (networkId == null ||
            networkId == 'null') {
            networkId = '';
        }

        return networkId;
    },
    setEditorFormats: function (formats) {
        $('#manywho-shared-services-data').data('editor-formats', formats);
    },
    getEditorFormats: function () {
        return $('#manywho-shared-services-data').data('editor-formats');
    },
    getDefaultEditorFormats: function () {
        return [
            {
                title: 'Headers', items: [
                   { title: 'Header 1', block: 'h1' },
                   { title: 'Header 2', block: 'h2' },
                   { title: 'Header 3', block: 'h3' },
                   { title: 'Header 4', block: 'h4' },
                   { title: 'Header 5', block: 'h5' },
                   { title: 'Header 6', block: 'h6' }
                ]
            },
            {
                title: 'Inline', items: [
                   { title: 'Bold', icon: "bold", inline: 'strong' },
                   { title: 'Italic', icon: "italic", inline: 'em' },
                   { title: 'Underline', icon: "underline", inline: 'span', styles: { 'text-decoration': 'underline' } },
                   { title: 'Strikethrough', icon: "strikethrough", inline: 'span', styles: { 'text-decoration': 'line-through' } },
                   { title: 'Superscript', icon: "superscript", inline: 'sup' },
                   { title: 'Subscript', icon: "subscript", inline: 'sub' },
                   { title: 'Code', icon: "code", inline: 'code' }
                ]
            },
            {
                title: 'Blocks', items: [
                   { title: 'Paragraph', block: 'p' },
                   { title: 'Blockquote', block: 'blockquote' },
                   { title: 'Div', block: 'div' },
                   { title: 'Pre', block: 'pre' }
                ]
            },
            {
                title: 'Alignment', items: [
                   { title: 'Left', icon: "alignleft", block: 'div', styles: { 'text-align': 'left' } },
                   { title: 'Center', icon: "aligncenter", block: 'div', styles: { 'text-align': 'center' } },
                   { title: 'Right', icon: "alignright", block: 'div', styles: { 'text-align': 'right' } },
                   { title: 'Justify', icon: "alignjustify", block: 'div', styles: { 'text-align': 'justify' } }
                ]
            }
        ];
    }
}
