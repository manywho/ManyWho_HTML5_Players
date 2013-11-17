
var ManyWhoDeveloper = {
    saveMapElement: function (mapElementJSON, successCallback, errorCallback) {
        var requestUrl = null;
        var requestType = 'POST';
        var requestData = null;

        // Construct the post URL for creating the map element
        requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/' + ManyWhoSharedServices.getFlowId() + '/' + ManyWhoSharedServices.getEditingToken() + '/element/map';

        // Assign the incoming JSON to the request data
        requestData = mapElementJSON;

        // Execute the ajax request
        ManyWhoAjax.callRestApi('ManyWhoDeveloper.SaveMapElement',
                                requestUrl,
                                requestType,
                                requestData,
                                null,
                                successCallback,
                                errorCallback,
                                null,
                                null,
                                ManyWhoSharedServices.getAuthorAuthenticationToken());
    },
    deleteMapElement: function (elementId, successCallback, errorCallback) {
        var requestUrl = null;
        var requestType = 'DELETE';
        var requestData = null;

        // Construct the post URL for creating the map element
        requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/' + ManyWhoSharedServices.getFlowId() + '/' + ManyWhoSharedServices.getEditingToken() + '/element/map/' + elementId;

        // Execute the ajax request
        ManyWhoAjax.callRestApi('ManyWhoDeveloper.DeleteMapElement',
                                requestUrl,
                                requestType,
                                requestData,
                                null,
                                successCallback,
                                errorCallback,
                                null,
                                null,
                                ManyWhoSharedServices.getAuthorAuthenticationToken());
    },
    saveGroupElement: function (groupElementJSON, successCallback, errorCallback) {
        var requestUrl = null;
        var requestType = 'POST';
        var requestData = null;

        // Construct the post URL for creating the group element
        requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/' + ManyWhoSharedServices.getFlowId() + '/' + ManyWhoSharedServices.getEditingToken() + '/element/group';

        // Assign the incoming JSON to the request data
        requestData = groupElementJSON;

        // Execute the ajax request
        ManyWhoAjax.callRestApi('ManyWhoDeveloper.SaveGroupElement',
                                requestUrl,
                                requestType,
                                requestData,
                                null,
                                successCallback,
                                errorCallback,
                                null,
                                null,
                                ManyWhoSharedServices.getAuthorAuthenticationToken());
    },
    deleteGroupElement: function (elementId, successCallback, errorCallback) {
        var requestUrl = null;
        var requestType = 'DELETE';
        var requestData = null;

        // Construct the post URL for creating the group element
        requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/' + ManyWhoSharedServices.getFlowId() + '/' + ManyWhoSharedServices.getEditingToken() + '/element/group/' + elementId;

        // Execute the ajax request
        ManyWhoAjax.callRestApi('ManyWhoDeveloper.DeleteGroupElement',
                                requestUrl,
                                requestType,
                                requestData,
                                null,
                                successCallback,
                                errorCallback,
                                null,
                                null,
                                ManyWhoSharedServices.getAuthorAuthenticationToken());
    },
    getElementJSON: function (elementId, elementType, locationX, locationY, groupElementId, populateJSONCallback, errorCallback) {
        var requestUrl = null;
        var requestType = 'GET';
        var requestData = null;
        var headers = null;

        // We only want to perform the load if we actually have an element in existence
        if (elementId != null &&
            elementId.trim().length > 0) {
            // Construct the URL to get the element JSON
            requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/draw/1/flow/' + ManyWhoSharedServices.getFlowId() + '/' + ManyWhoSharedServices.getEditingToken() + '/element/map/' + elementId;

            // Create a header for the tenant id
            headers = ManyWhoAjax.createHeader(null, 'ManyWhoTenant', ManyWhoSharedServices.getTenantId());

            // Load the JSON for the map element
            ManyWhoAjax.callRestApi('ManyWhoDeveloper.GetElementJSON',
                                    requestUrl, 
                                    requestType, 
                                    requestData, 
                                    null, 
                                    function (data, status, xhr) {
                                        // Populate the JSON with the callback data
                                        populateJSONCallback.call(this, JSON.stringify(data, undefined, 4));
                                    },
                                    errorCallback,
                                    headers,
                                    null,
                                    ManyWhoSharedServices.getAuthorAuthenticationToken());
        } else {
            // We don't have an element to load, so we create a blank template to edit rather than giving the developer an empty screen
            populateJSONCallback.call(this, ManyWhoDeveloper.createElementJSONTemplate(elementType, locationX, locationY, groupElementId));
        }
    },
    createElementJSONTemplate: function (elementType, x, y, groupElementId) {
        var requestContent = '';

        elementType = elementType.toLowerCase();

        if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_START.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_STEP.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_INPUT.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DECISION.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_OPERATOR.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_SUB_FLOW.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_LOAD.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_SAVE.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_DELETE.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_MESSAGE.toLowerCase() ||
            elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase()) {
            requestContent += '{\n';
            requestContent += '  "id":null,\n';
            requestContent += '  "x":' + x + ',\n';
            requestContent += '  "y":' + y + ',\n';
            requestContent += '  "elementType":"' + elementType.toUpperCase() + '",\n';

            if (groupElementId != null &&
                groupElementId.trim().length > 0) {
                requestContent += '  "groupElementId":"' + groupElementId + '",\n';
            } else {
                requestContent += '  "groupElementId":null,\n';
            }

            requestContent += '  "pageElementId":null,\n';
            requestContent += '  "developerName":null,\n';
            requestContent += '  "developerSummary":null,\n';
            requestContent += '  "postUpdateToStream":false,\n';
            requestContent += '  "postUpdateWhenType":"ON_LOAD",\n';
            requestContent += '  "userContent":"Put some content here for the user",\n';
            requestContent += '  "statusMessage":"Hey, we\'re busy working on that for you...",\n';
            requestContent += '  "postUpdateMessage":"The system is doing some work that you should know about...",\n';
            requestContent += '  "notAuthorizedMessage":"Not going to let you see what we\'re doing, but you can chat if you like :)",\n';

            if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_OPERATOR.toLowerCase()) {
                requestContent += '  "operations":[\n';
                requestContent += '    {\n';
                requestContent += '      "id":null,\n';
                requestContent += '      "order":0,\n';
                requestContent += '      "valueElementToApplyId":{\n';
                requestContent += '        "id":null,\n';
                requestContent += '        "command":null,\n';
                requestContent += '        "typeElementPropertyId":null\n';
                requestContent += '      },\n';
                requestContent += '      "valueElementToReferenceId":{\n';
                requestContent += '        "id":null,\n';
                requestContent += '        "command":null,\n';
                requestContent += '        "typeElementPropertyId":null\n';
                requestContent += '      }\n';
                requestContent += '    }\n';
                requestContent += '  ],\n';
            }

            if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase()) {
                requestContent += '  "viewMessageAction":{\n';
                requestContent += '    "id":null,\n';
                requestContent += '    "developerName":null,\n';
                requestContent += '    "serviceElementId":null,\n';
                requestContent += '    "uriPart":null,\n';
                requestContent += '    "inputs":[\n';
                requestContent += '      {\n';
                requestContent += '        "id":"",\n';
                requestContent += '        "developerName":null,\n';
                requestContent += '        "contentValue":null,\n';
                requestContent += '        "valueElementToReferenceId":{\n';
                requestContent += '          "id":null,\n';
                requestContent += '          "command":null,\n';
                requestContent += '          "typeElementPropertyId":null\n';
                requestContent += '        }\n';
                requestContent += '      }\n';
                requestContent += '    ],\n';
                requestContent += '    "outputs":[\n';
                requestContent += '      {\n';
                requestContent += '        "id":null,\n';
                requestContent += '        "developerName":null,\n';
                requestContent += '        "valueElementToApplyId":{\n';
                requestContent += '          "id":null,\n';
                requestContent += '          "command":null,\n';
                requestContent += '          "typeElementPropertyId":null\n';
                requestContent += '        }\n';
                requestContent += '      }\n';
                requestContent += '    ]\n';
                requestContent += '  },\n';
            }

            if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_MESSAGE.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_INPUT.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase()) {
                requestContent += '  "messageActions":[],\n';
            }

            if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_LOAD.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_SAVE.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_DELETE.toLowerCase()) {
                requestContent += '  "dataActions":[],\n';
            }

            requestContent += '  "outcomes":[\n';
            requestContent += '    {\n';
            requestContent += '      "id":null,\n';
            requestContent += '      "developerName":"go",\n';
            requestContent += '      "developerSummary":"Go to the next step",\n';

            if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_STEP ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_INPUT.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase()) {
                requestContent += '      "label":"Go!",\n';
            }

            requestContent += '      "nextMapElementId":null,\n';
            requestContent += '      "pageActionBindingType":"SAVE",\n';

            if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_STEP ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_INPUT.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase()) {
                requestContent += '      "pageObjectBindingId":"",\n';
            }
            
            requestContent += '      "order":0,\n';

            if (elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_MESSAGE.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_INPUT.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase() ||
                elementType == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DECISION.toLowerCase()) {
                requestContent += '      "comparison":{\n';
                requestContent += '        "id":null,\n';
                requestContent += '        "comparisonType":"AND",\n';
                requestContent += '        "rules":[\n';
                requestContent += '          {\n';
                requestContent += '            "id":null,\n';
                requestContent += '            "leftValueElementToReferenceId":{\n';
                requestContent += '              "id":null,\n';
                requestContent += '              "command":null,\n';
                requestContent += '              "typeElementPropertyId":null\n';
                requestContent += '            },\n';
                requestContent += '            "criteriaType":"EQUAL",\n';
                requestContent += '            "rightValueElementToReferenceId":{\n';
                requestContent += '              "id":null,\n';
                requestContent += '              "command":null,\n';
                requestContent += '              "typeElementPropertyId":null\n';
                requestContent += '            }\n';
                requestContent += '          }\n';
                requestContent += '        ],\n';
                requestContent += '        "comparisons":[],\n';
                requestContent += '        "order":0\n';
                requestContent += '      }\n';
            }

            requestContent += '    }\n';
            requestContent += '  ]\n';
            requestContent += '}';
        } else if (elementType == ManyWhoConstants.GROUP_ELEMENT_TYPE_IMPLEMENTATION_SWIMLANE.toLowerCase()) {
            requestContent += '{\n';
            requestContent += '  "id":null,\n';
            requestContent += '  "x":0,\n';
            requestContent += '  "y":0,\n';
            requestContent += '  "height":0,\n';
            requestContent += '  "width":0,\n';
            requestContent += '  "groupElementId":null,\n';
            requestContent += '  "authorization":{\n';
            requestContent += '    "serviceElementId":null,\n';
            requestContent += '    "globalAuthenticationType":"ALL_USERS",\n';
            requestContent += '    "streamBehaviourType":"USE_EXISTING",\n';
            requestContent += '    "groups":[\n';
            requestContent += '      {\n';
            requestContent += '        "authenticationId":null,\n';
            requestContent += '        "attribute":null\n';
            requestContent += '      }\n';
            requestContent += '    ],\n';
            requestContent += '    "users":[\n';
            requestContent += '      {\n';
            requestContent += '        "authenticationId":null,\n';
            requestContent += '        "attribute":null,\n';
            requestContent += '        "runningUser":false\n';
            requestContent += '      }\n';
            requestContent += '    ],\n';
            requestContent += '    "locations":null\n';
            requestContent += '  }\n';
            requestContent += '}';
        }

        return requestContent;
    }
}