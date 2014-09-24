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

            dialogHtml += '<div id="manywho-dialog" class="modal container hide fade">';
            dialogHtml += '    <div class="modal-header">';
            dialogHtml += '        <button id="manywho-dialog-close-button" type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
            dialogHtml += '        <h3 id="manywho-dialog-title"></h3>';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-runtime" style="overflow: auto; height: 550px;" class="modal-body">';
            dialogHtml += '    </div>';
            dialogHtml += '    <div id="manywho-model-outcomes" class="modal-footer">';
            dialogHtml += '    </div>';
            dialogHtml += '</div>';

            $('#' + reference).append(dialogHtml);
            $('#manywho-dialog').modalmanager();

            // Create the variable element detail form
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
    showAuthenticationDialog: function (okCallback, loginUrl, manywhoTenantId, directoryName, stateId) {
        ManyWhoSharedServices.adjustDialog(200, 550, false);
        ManyWhoFlow.loadByName('ManyWhoSharedServices.ShowAuthenticationDialog',
                               ManyWhoConstants.MANYWHO_ADMIN_TENANT_ID,
                               'MANYWHO__AUTHENTICATION__DEFAULT__FLOW',
                               null,
                               null,
                               function (data, status, xhr) {
                                   var username = null;
                                   var inputs = null;

                                   inputs = ManyWhoSharedServices.createInput(inputs, 'LoginUrl', loginUrl, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                                   inputs = ManyWhoSharedServices.createInput(inputs, 'ManyWhoTenantId', manywhoTenantId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                                   inputs = ManyWhoSharedServices.createInput(inputs, 'DirectoryName', directoryName, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                                   inputs = ManyWhoSharedServices.createInput(inputs, 'StateId', stateId, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);

                                   username = ManyWhoUtils.getCookie('Username');

                                   if (username != null &&
                                       username.trim().length > 0) {
                                       inputs = ManyWhoSharedServices.createInput(inputs, 'Username', username, ManyWhoConstants.CONTENT_TYPE_STRING, null, null);
                                   }

                                   var options = {
                                       flowId: data.id.id,
                                       flowVersionId: data.id.versionId,
                                       inputs: inputs,
                                       outcomePanel: 'manywho-model-outcomes',
                                       formLabelPanel: 'manywho-dialog-title',
                                       // TODO: this seems off, but it matches the current function signature
                                       sessionId: true,
                                       doneCallbackFunction: function (outputValues) {
                                           var authenticationToken = null;

                                           // Hide the dialog
                                           $('#manywho-dialog').modal('hide');

                                           // Get the values out of the outputs
                                           authenticationToken = ManyWhoUtils.getOutcomeValue(outputValues, 'AuthenticationToken', null);

                                           // Get the username so we can keep that for future logins
                                           ManyWhoUtils.setCookie('Username', ManyWhoUtils.getOutcomeValue(outputValues, 'Username', null));

                                           // Call the OK callback
                                           okCallback.call(this, authenticationToken);
                                       }
                                   }

                                   $('#manywho-model-runtime').manywhoRuntimeEngine('execute', options);

                                   $('#manywho-dialog').modal({ backdrop: 'static', show: true });
                               },
                               null);
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
    setEditingToken: function (editingToken) {
        $('#manywho-shared-services-data').data('editingtoken', editingToken);
    },
    getEditingToken: function () {
        return $('#manywho-shared-services-data').data('editingtoken');
    },
    setTenantId: function (tenantId) {
        $('#manywho-shared-services-data').data('tenantid', tenantId);
    },
    getTenantId: function () {
        return $('#manywho-shared-services-data').data('tenantid');
    },
    setFlowId: function (flowId) {
        $('#manywho-shared-services-data').data('flowid', flowId);
    },
    getFlowId: function () {
        return $('#manywho-shared-services-data').data('flowid');
    },
    setAuthenticationToken: function (authenticationToken) {
        // Put the token in the cookie also
        //ManyWhoUtils.setCookie(ManyWhoSharedServices.getFlowId() + 'authenticationToken', authenticationToken, true);

        $('#manywho-shared-services-data').data('authenticationtoken', authenticationToken);
    },
    getAuthenticationToken: function () {
        var authenticationToken = $('#manywho-shared-services-data').data('authenticationtoken');

        //if (authenticationToken == null ||
        //    authenticationToken == 'null') {
        //    // Try to get the token from the cookie
        //    authenticationToken = ManyWhoUtils.getCookie(ManyWhoSharedServices.getFlowId() + 'authenticationToken');
        //}

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
