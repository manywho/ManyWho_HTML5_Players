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

var ManyWhoPlayer = {
    loadAll: function (callingFunctionName,
                       tenantId,
                       loadBeforeSend,
                       loadSuccessCallback,
                       loadErrorCallback) {
        if (tenantId != null &&
            tenantId.trim().length > 0) {
            var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/' + tenantId + '/player';
            var requestType = 'GET';
            var requestData = '';

            ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoPlayer.LoadAll', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback);
        }
    }
}
