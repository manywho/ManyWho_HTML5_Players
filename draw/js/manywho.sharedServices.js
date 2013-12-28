﻿/*!

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
            dialogHtml += '        <h3 id="manywho-dialog-title-select-navigation">Select Navigation</h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-select-navigation-dialog" class="modal-body">';
            dialogHtml += '        <input type="hidden" id="manywho-dialog-select-navigation-location" value="" />';
            dialogHtml += '        <div class="row-fluid"><p class="muted">Please select the navigation you\'d like to use:</p></div>';
            dialogHtml += '        <div class="btn-group">';
            dialogHtml += '            <button class="btn btn-inverse dropdown-toggle" data-toggle="dropdown" href="#"><i class="icon-globe icon-white"></i> Navigation</a> <span class="caret"></span></button>';
            dialogHtml += '            <ul class="dropdown-menu" id="manywho-model-select-run-navigation">';
            dialogHtml += '            </ul>';
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

            $('#manywho-model-runtime').manywhoRuntimeEngine({ enableAuthentication: false, rewriteUrl: false, tenantId: ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID });
            $('#manywho-model-runtime-sub').manywhoRuntimeEngine({ enableAuthentication: false, rewriteUrl: false, tenantId: ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID });
            $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine({ enableAuthentication: false, rewriteUrl: false, tenantId: ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID });

            // Manually add the event for the full screen dialog as it's not a proper dialog
            $('#manywho-dialog-close-button-fullscreen').click(function (event) {
                event.preventDefault();
                $('#manywho-dialog-fullscreen').fadeOut('slow');
                $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine('clear');
                $('#manywho-dialog-title-fullscreen').html('Loading...');
            });
        }
    },
    showBuildDialog: function (show) {
        if (show == true) {
            $('#manywho-dialog-build').modal('show');
        } else {
            $('#manywho-dialog-build').modal('hide');
        }
    },
    showSelectNavigationDialog: function (show, location) {
        if (show == true) {
            // Set the location to the provided location
            $('#manywho-dialog-select-navigation-location').val(location);
            $('#manywho-dialog-select-navigation').modal('show');
        } else {
            $('#manywho-dialog-select-navigation').modal('hide');
        }
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
        var inputs = null;

        ManyWhoSharedServices.adjustDialog(200, 550, false);

        $('#manywho-dialog').on('hidden', function () {
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        // We want the user to authenticate against the draw plugin API
        inputs = ManyWhoSharedServices.createInput(inputs, 'LoginUrl', ManyWhoConstants.BASE_PATH_URL + '/plugins/manywho/api/draw/1/authentication', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        // Also set the directory name so we have it
        inputs = ManyWhoSharedServices.createInput(inputs, 'DirectoryName', 'ManyWho', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowAuthenticationDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__DRAW_AUTHENTICATION__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {
                                   $('#manywho-model-runtime').manywhoRuntimeEngine('run',
                                                                                    null,
                                                                                    data.id.id,
                                                                                    data.id.versionId,
                                                                                    inputs,
                                                                                    function (outputValues) {
                                                                                        var authenticationToken = null;
                                                                                        var manywhoTenantId = null;

                                                                                        // Hide the dialog
                                                                                        $('#manywho-dialog').modal('hide');
                                                                                        $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                                                                        $('#manywho-dialog-title').html('Loading...');

                                                                                        // Get the values out of the outputs
                                                                                        authenticationToken = ManyWhoUtils.getOutcomeValue(outputValues, 'AuthenticationToken', null);
                                                                                        manywhoTenantId = ManyWhoUtils.getOutcomeValue(outputValues, 'ManyWhoTenantId', null);

                                                                                        // Call the OK callback
                                                                                        okCallback.call(this, authenticationToken, manywhoTenantId);
                                                                                    },
                                                                                    'manywho-model-outcomes',
                                                                                    'manywho-dialog-title',
                                                                                    null,
                                                                                    ManyWhoSharedServices.getEditorModeId());

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
                                   $('#manywho-model-runtime-sub').manywhoRuntimeEngine('run',
                                                                                        null,
                                                                                        data.id.id,
                                                                                        data.id.versionId,
                                                                                        inputs,
                                                                                        function (outputValues) {
                                                                                            okCallback.call(this, domId, elementId, formElementId, doDelete, outputValues);

                                                                                            $('#manywho-dialog-sub').modal('hide');
                                                                                            $('#manywho-model-runtime-sub').manywhoRuntimeEngine('clear');
                                                                                            $('#manywho-dialog-title-sub').html('Loading...');
                                                                                        },
                                                                                        'manywho-model-outcomes-sub',
                                                                                        'manywho-dialog-title-sub',
                                                                                        null,
                                                                                        ManyWhoSharedServices.getEditorModeId());

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
                                   $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine('run',
                                                                                               null,
                                                                                               data.id.id,
                                                                                               data.id.versionId,
                                                                                               ManyWhoSharedServices.getGeneralFlowInputs(false, elementId, null, elementType),
                                                                                               function (outputValues) {
                                                                                                   $('#manywho-dialog-fullscreen').fadeOut('slow');
                                                                                                   $('#manywho-model-runtime-fullscreen').manywhoRuntimeEngine('clear');
                                                                                                   $('#manywho-dialog-title-fullscreen').html('Loading...');
                                                                                               },
                                                                                               'manywho-model-outcomes-fullscreen',
                                                                                               'manywho-dialog-title-fullscreen',
                                                                                               null,
                                                                                               ManyWhoSharedServices.getEditorModeId());

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
        ManyWhoSharedServices.adjustDialog(550, null, true);

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
                                   $('#manywho-model-runtime').manywhoRuntimeEngine('run',
                                                                                    null,
                                                                                    data.id.id,
                                                                                    data.id.versionId,
                                                                                    ManyWhoSharedServices.getGeneralFlowInputs(false, elementId, null, elementType),
                                                                                    function (outputValues) {
                                                                                        $('#manywho-dialog').modal('hide');
                                                                                        $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                                                                        $('#manywho-dialog-title').html('Loading...');
                                                                                    },
                                                                                    'manywho-model-outcomes',
                                                                                    'manywho-dialog-title',
                                                                                    null,
                                                                                    ManyWhoSharedServices.getEditorModeId());

                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               errorFunction);
    },
    showNavigationElementConfigDialog: function (elementType, elementId, okCallback, errorFunction) {
        ManyWhoSharedServices.adjustDialog(550, null, true);

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
                                   $('#manywho-model-runtime').manywhoRuntimeEngine('run',
                                                                                    null,
                                                                                    data.id.id,
                                                                                    data.id.versionId,
                                                                                    ManyWhoSharedServices.getGeneralFlowInputs(true, elementId, null, elementType),
                                                                                    function (outputValues) {
                                                                                        $('#manywho-dialog').modal('hide');
                                                                                        $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                                                                        $('#manywho-dialog-title').html('Loading...');

                                                                                        // Check to see if we have a callback function
                                                                                        if (okCallback != null) {
                                                                                            // Call the callback
                                                                                            okCallback.call(this);
                                                                                        }
                                                                                    },
                                                                                    'manywho-model-outcomes',
                                                                                    'manywho-dialog-title',
                                                                                    null,
                                                                                    ManyWhoSharedServices.getEditorModeId());

                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               errorFunction);
    },
    showMapElementConfigDialog: function (elementType, elementId, groupElementId, graphId, operation, locationX, locationY, okCallback, cancelCallback) {
        var doDelete = false;
        var inputs = null;

        if (elementId == null ||
            (operation != null &&
             operation.toLowerCase() == 'delete')) {
            doDelete = true;
        }

        $('#manywho-dialog').off('hidden');
        $('#manywho-dialog').on('hidden', function () {
            if ($('#manywho-dialog').attr('data-keep') != 'true') {
                cancelCallback.call(this, graphId, doDelete);
            }

            // Clear the 'keep' data so it doesn't bleed between calls
            $('#manywho-dialog').attr('data-keep', '');
            $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
            $('#manywho-dialog-title').html('Loading...');
        });

        inputs = ManyWhoSharedServices.getGeneralFlowInputs(true, elementId, groupElementId, elementType, locationX, locationY);
        inputs = ManyWhoSharedServices.createInput(inputs, 'Command', operation, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        inputs = ManyWhoSharedServices.createInput(inputs, 'AuthenticationToken', ManyWhoSharedServices.getAuthorAuthenticationToken(), ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

        ManyWhoSharedServices.adjustDialog(550, null, true);
        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowMapElementConfigDialog',
                                ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                                'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                                null,
                                null,
                                function (data, status, xhr) {
                                    $('#manywho-model-runtime').manywhoRuntimeEngine('run',
                                                                                    null,
                                                                                    data.id.id,
                                                                                    data.id.versionId,
                                                                                    inputs,
                                                                                    function (outputValues) {
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
                                                                                            cancelCallback.call(this, graphId, doDelete);
                                                                                        }

                                                                                        // Hide the dialog
                                                                                        $('#manywho-dialog').modal('hide');
                                                                                        $('#manywho-model-runtime').manywhoRuntimeEngine('clear');
                                                                                        $('#manywho-dialog-title').html('Loading...');
                                                                                    },
                                                                                    'manywho-model-outcomes',
                                                                                    'manywho-dialog-title',
                                                                                    ManyWhoSharedServices.getGeneralFlowAnnotations(graphId),
                                                                                    ManyWhoSharedServices.getEditorModeId());

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
                                    $('#manywho-model-runtime').manywhoRuntimeEngine('run',
                                                                                    null,
                                                                                    data.id.id,
                                                                                    data.id.versionId,
                                                                                    inputs,
                                                                                    function (outputValues) {
                                                                                        var flowOutcome = null;
                                                                                        var outcomeId = null;
                                                                                        var outcomeDeveloperName = null;
                                                                                        var outcome = null;

                                                                                        // Get the values out of the outputs
                                                                                        flowOutcome = ManyWhoUtils.getOutcomeValue(outputValues, 'FlowOutcome', null);
                                                                                        outcome = ManyWhoUtils.getOutcomeValue(outputValues, 'Outcome ContentObject', null);
                                                                                        outcomeId = ManyWhoUtils.getOutcomeValue(outputValues, 'Outcome ContentObject', 'Id');
                                                                                        outcomeDeveloperName = ManyWhoUtils.getOutcomeValue(outputValues, 'Outcome ContentObject', 'DeveloperName');

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
                                                                                    },
                                                                                    'manywho-model-outcomes',
                                                                                    'manywho-dialog-title',
                                                                                    ManyWhoSharedServices.getGeneralFlowAnnotations(graphId),
                                                                                    ManyWhoSharedServices.getEditorModeId());

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

        ManyWhoSharedServices.adjustDialog(550, null, true);
        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowGroupElementConfigDialog',
                                ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                                'MANYWHO__' + elementType.toUpperCase() + '__DEFAULT__FLOW',
                                null,
                                null,
                                function (data, status, xhr) {
                                    $('#manywho-model-runtime').manywhoRuntimeEngine('run',
                                                                                    null,
                                                                                    data.id.id,
                                                                                    data.id.versionId,
                                                                                    inputs,
                                                                                    function (outputValues) {
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
                                                                                    },
                                                                                    'manywho-model-outcomes',
                                                                                    'manywho-dialog-title',
                                                                                    ManyWhoSharedServices.getGeneralFlowAnnotations(graphId),
                                                                                    ManyWhoSharedServices.getEditorModeId());

                                    $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                                },
                                null);
    },
    showFlowConfigDialog: function (elementId, okCallback, cancelCallback, errorFunction) {
        ManyWhoSharedServices.adjustDialog(550, null, true);

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
                                   $('#manywho-model-runtime').manywhoRuntimeEngine('run',
                                                                                    null,
                                                                                    data.id.id,
                                                                                    data.id.versionId,
                                                                                    ManyWhoSharedServices.getGeneralFlowInputs(false, elementId, null, null, null, null, null, null, null, true),
                                                                                    function (outputValues) {
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
                                                                                    },
                                                                                    'manywho-model-outcomes',
                                                                                    'manywho-dialog-title',
                                                                                    null,
                                                                                    ManyWhoSharedServices.getEditorModeId());

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
    }
}
