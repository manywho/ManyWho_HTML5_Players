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

var ManyWhoObjectDataProxy = {
    createListFilterWhereEntry: function (columnName,
                                          criteria,
                                          value) {
        var listFilterWhereEntry = new Object();

        listFilterWhereEntry.columnName = columnName;
        listFilterWhereEntry.criteria = criteria;
        listFilterWhereEntry.contentValue = value;

        return listFilterWhereEntry;
    },
    createObjectDataPropertyEntry: function (developerName,
                                             value,
                                             objectDataList) {
        var objectDataTypeProperty = new Object();

        objectDataTypeProperty.developerName = developerName;
        objectDataTypeProperty.contentValue = value;
        objectDataTypeProperty.objectData = objectDataList;

        return objectDataTypeProperty;
    },
    createObjectDataEntry: function (id,
                                     developerName,
                                     properties) {
        var objectDataEntry = new Object();

        objectDataEntry.id = id;
        objectDataEntry.developerName = developerName;
        objectDataEntry.properties = properties;

        return objectDataEntry;
    },
    createListFilter: function (id,
                                parentId,
                                parentPropertyDeveloperName,
                                listFilterWhere,
                                orderByPropertyDeveloperName,
                                orderByDirection,
                                limit) {
        var listFilter = new Object();

        listFilter.id = id;
        listFilter.parentId = parentId;
        listFilter.parentPropertyDeveloperName = parentPropertyDeveloperName;
        listFilter.where = listFilterWhere;
        listFilter.orderByPropertyDeveloperName = orderByPropertyDeveloperName;
        listFilter.orderByDirection = orderByDirection;
        listFilter.limit = limit;

        return listFilter;
    },
    createObjectDataRequest: function (flowId,
                                       serviceElementId,
                                       listFilter,
                                       objectDataType,
                                       dataObjects) {
        var objectDataRequest = new Object();

        objectDataRequest.flowId = flowId;
        objectDataRequest.serviceElementId = serviceElementId;
        objectDataRequest.listFilterAPI = listFilter;
        objectDataRequest.objectDataType = objectDataType;
        objectDataRequest.objectData = dataObjects;

        return objectDataRequest;
    },
    load: function (callingFunctionName,
                    tenantId,
                    objectDataRequest,
                    loadBeforeSend,
                    loadSuccessCallback,
                    loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/service/1/data';
        var requestType = 'POST';
        var requestData = '';

        requestData += JSON.stringify(objectDataRequest);

        // Create a header for the tenant id
        var headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', tenantId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoObjectDataProxy.Load', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    }
}
