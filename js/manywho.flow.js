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

var ManyWhoFlow = {
    load: function (callingFunctionName,
                    tenantId,
                    flowId,
                    authenticationToken,
                    loadBeforeSend,
                    loadSuccessCallback,
                    loadErrorCallback) {
        if (flowId != null &&
            flowId.trim().length > 0) {
            var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/run/1/flow/' + flowId;
            var requestType = 'GET';
            var requestData = '';

            // Create a header for the tenant id
            var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

            ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.Load', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers, null, authenticationToken);
        } else {
            ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoFlow.Load: Nothing to load with blank flow id.');
        }
    },
    loadAllFromTranslate: function (callingFunctionName,
                                    search,
                                    tenantId,
                                    loadBeforeSend,
                                    loadSuccessCallback,
                                    loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/translate/1/flow?filter=';
        var requestType = 'GET';
        var requestData = '';

        // If the user has provided a search parameter, we add that to the request
        if (search != null &&
            search.trim().length > 0) {
            requestUrl += 'substringof(developerName,\'' + search + '\')';
        }

        // Create a header for the tenant id
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.Load', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    loadFromTranslate: function (callingFunctionName,
                                 tenantId,
                                 flowId,
                                 loadBeforeSend,
                                 loadSuccessCallback,
                                 loadErrorCallback) {
        if (flowId != null &&
            flowId.trim().length > 0) {
            var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/translate/1/flow/' + flowId;
            var requestType = 'GET';
            var requestData = '';

            // Create a header for the tenant id
            var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

            ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.Load', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
        } else {
            ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoFlow.Load: Nothing to load with blank flow id.');
        }
    },
    loginBySession: function (callingFunctionName,
                              tenantId,
                              stateId,
                              loginUrl,
                              sessionId,
                              sessionUrl,
                              authenticationToken,
                              loginBeforeSend,
                              loginSuccessCallback,
                              loginErrorCallback) {
        var authenticationCredentials = null;

        authenticationCredentials = new Object();
        authenticationCredentials.username = null;
        authenticationCredentials.password = null;
        authenticationCredentials.token = null;
        authenticationCredentials.sessionToken = sessionId;
        authenticationCredentials.sessionUrl = sessionUrl;
        authenticationCredentials.loginUrl = loginUrl;

        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/run/1/authentication/' + stateId;
        var requestType = 'POST';
        var requestData = JSON.stringify(authenticationCredentials);

        // Create a header for the tenant id
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.LoginBySession', requestUrl, requestType, requestData, loginBeforeSend, loginSuccessCallback, loginErrorCallback, headers, null, authenticationToken);
    },
    snapAndRun: function (callingFunctionName,
                          flowId,
                          authenticationToken,
                          versionComment,
                          runBeforeSend,
                          runSuccessCallback,
                          runErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/snap/' + flowId;
        var requestType = 'POST';
        var requestData = '"' + versionComment + '"';

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.SnapAndRun', requestUrl, requestType, requestData, runBeforeSend, runSuccessCallback, runErrorCallback, null, null, authenticationToken);
    },
    activateFlow: function (callingFunctionName,
                            flowId,
                            flowVersionId,
                            authenticationToken,
                            activateFlowBeforeSend,
                            activateFlowSuccessCallback,
                            activateFlowErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/activation/' + flowId + '/' + flowVersionId + '/true/true';
        var requestType = 'POST';
        var requestData = '';

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.ActivateFlow', requestUrl, requestType, requestData, activateFlowBeforeSend, activateFlowSuccessCallback, activateFlowErrorCallback, null, null, authenticationToken);
    },
    loadByName: function (callingFunctionName,
                          tenantId,
                          flowName,
                          authenticationToken,
                          loadBeforeSend,
                          loadSuccessCallback,
                          loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/run/1/flow/name/' + flowName;
        var requestType = 'GET';
        var requestData = '';

        // Create a header for the tenant id
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.LoadByName', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers, null, authenticationToken);
    },
    updateGraph: function (callingFunctionName,
                           editingToken,
                           flowId,
                           flowName,
                           flowSummary,
                           flowStartMapElementId,
                           flowMapElements,
                           flowGroupElements,
                           authenticationToken,
                           updateBeforeSend,
                           updateSuccessCallback,
                           updateErrorCallback) {
        var requestUrl = null;
        var requestType = null;
        var requestData = null;
        var stringFlowMapElements = null;
        var stringFlowGroupElements = null;

        if (flowId == null ||
            flowId.trim().length == 0) {
            ManyWhoLogging.consoleError(callingFunctionName + ' -> ManyWhoFlow.UpdateGraph: A flow id must be provided to sync.');
            return;
        } else {
            requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/graph/flow';
            requestType = 'POST';
        }

        if (flowStartMapElementId == null) {
            flowStartMapElementId = '';
        }

        if (flowMapElements != null) {
            stringFlowMapElements = JSON.stringify(flowMapElements);
        }

        if (flowGroupElements != null) {
            stringFlowGroupElements = JSON.stringify(flowGroupElements);
        }

        requestData = '{' +
                    '"editingToken":"' + editingToken + '",' +
                    '"id":{"id":"' + flowId + '"},' +
                    '"developerName":"' + ManyWhoAjax.cleanJson(flowName) + '",' +
                    '"developerSummary":"' + ManyWhoAjax.cleanJson(flowSummary) + '",' +
                    '"startMapElementId":"' + flowStartMapElementId + '",' +
                    '"mapElements":' + stringFlowMapElements + ',' +
                    '"groupElements":' + stringFlowGroupElements +
            '}';

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.UpdateGraph', requestUrl, requestType, requestData, updateBeforeSend, updateSuccessCallback, updateErrorCallback, null, null, authenticationToken);
    },
    syncGraph: function (callingFunctionName,
                         editingToken,
                         flowId,
                         flowName,
                         flowSummary,
                         flowStartMapElementId,
                         flowMapElements,
                         authenticationToken,
                         syncBeforeSend,
                         syncSuccessCallback,
                         syncErrorCallback) {
        var requestUrl = null;
        var requestType = null;
        var requestData = '';

        if (flowId == null ||
            flowId.trim().length == 0) {
            ManyWhoLogging.consoleError(callingFunctionName + ' -> ManyWhoFlow.SyncGraph: A flow id must be provided to sync.');
            return;
        } else {
            requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/graph/flow/' + flowId;
            requestType = 'GET';
        }

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.SyncGraph', requestUrl, requestType, requestData, syncBeforeSend, syncSuccessCallback, syncErrorCallback, null, null, authenticationToken);
    },
    saveFlow: function (callingFunctionName,
                        editingToken,
                        flowId,
                        flowName,
                        flowSummary,
                        allowJumping,
                        authenticationToken,
                        syncBeforeSend,
                        syncSuccessCallback,
                        syncErrorCallback) {
        var requestUrl = null;
        var requestType = null;
        var requestData = null;

        if (flowId == null ||
            flowId.trim().length == 0) {
            ManyWhoLogging.consoleError(callingFunctionName + ' -> ManyWhoFlow.SaveFlow: A flow id must be provided to save.');
            return;
        } else {
            requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow';
            requestType = 'POST';
        }

        requestData = '{' +
                    '"editingToken":"' + editingToken + '",' +
                    '"id":{"id":"' + flowId + '"},' +
                    '"developerName":"' + ManyWhoAjax.cleanJson(flowName) + '",' +
                    '"developerSummary":"' + ManyWhoAjax.cleanJson(flowSummary) + '",' +
                    '"allowJumping":' + allowJumping.toLowerCase() +
            '}';

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.SaveFlow', requestUrl, requestType, requestData, syncBeforeSend, syncSuccessCallback, syncErrorCallback, null, null, authenticationToken);
    },
    stateChangeHappened: function (callingFunctionName,
                                   stateId,
                                   stateToken,
                                   authenticationToken,
                                   changeBeforeSend,
                                   changeSuccessCallback,
                                   changeErrorCallback,
                                   headers) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/run/1/state/' + stateId + '/ping/' + stateToken;
        var requestType = 'GET';
        var requestData = '';

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.StateChangeHappened', requestUrl, requestType, requestData, changeBeforeSend, changeSuccessCallback, changeErrorCallback, headers, null, authenticationToken);
    },
    changeAvailable: function (callingFunctionName,
                               flowId,
                               editingToken,
                               authenticationToken,
                               changeBeforeSend,
                               changeSuccessCallback,
                               changeErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/graph/ping/flow/' + flowId + '/' + editingToken;
        var requestType = 'GET';
        var requestData = '';

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.ChangeAvailable', requestUrl, requestType, requestData, changeBeforeSend, changeSuccessCallback, changeErrorCallback, null, null, authenticationToken);
    },
    revertVersion: function(callingFunctionName,
                                flowId,
                                flowVersionId,
                                editingToken,
                                authenticationToken,
                                loadBeforeSend,
                                successCallback,
                                errorCallback,
                                headers) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/revert/' + flowId + '/' + flowVersionId;
        var requestType = 'POST';
        var requestData = '';

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoFlow.RevertVersion', requestUrl, requestType, requestData, loadBeforeSend, successCallback, errorCallback, headers, null, authenticationToken);
    }
}
