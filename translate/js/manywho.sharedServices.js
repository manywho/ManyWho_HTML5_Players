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

var ManyWhoSharedServices = {
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

            dialogHtml += '<div id="manywho-dialog" class="modal hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title"></h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-runtime" style="overflow: auto; height: 200px;" class="modal-body">';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-outcomes" class="modal-footer">';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            $('#' + reference).append(dialogHtml);
            $('#manywho-dialog').modalmanager();

            // Create the authentication dialog
            $('#manywho-dialog').hide();
            $('#manywho-model-runtime').manywhoRuntimeEngine({ enableAuthentication: false, rewriteUrl: false, tenantId: ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID });
        }
    },
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
    showAuthenticationDialog: function (okCallback) {
        var inputs = null;

        // We want the user to authenticate against the draw plugin API
        inputs = ManyWhoSharedServices.createInput(inputs, 'LoginUrl', ManyWhoConstants.LOGIN_PATH_URL + '/plugins/manywho/api/draw/1/authentication', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
        // Also set the directory name so we have it
        inputs = ManyWhoSharedServices.createInput(inputs, 'DirectoryName', 'ManyWho', ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

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

                                           // Call the OK callback
                                           okCallback.call(this, authenticationToken, manywhoTenantId);
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   // Show the authentication dialog
                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               null);
    },
    setEditingToken: function (editingToken) {
        $('#manywho-shared-services-data').data('editingToken', editingToken);
    },
    getEditingToken: function () {
        return $('#manywho-shared-services-data').data('editingToken');
    },
    setFlowId: function (flowId) {
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
    }
}
