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

var ManyWhoAjax = {
    callGetRequest : function (callingFunctionName,
                               requestUrl, 
                               requestType, 
                               requestData, 
                               requestDataType,
                               successCallback) {
        // Log the incoming parameter data so we have a record of it
        ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallGetRequest: [RequestUrl]: ' + requestUrl);
        ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallGetRequest: [RequestType]: ' + requestType);
        ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallGetRequest: [RequestData]: ' + requestData);
        ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallGetRequest: [RequestDataType]: ' + requestDataType);

        if (successCallback != null) {
            ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi: [SuccessCallback]: ' + successCallback.name);
        }

        $.ajax({
            url: requestUrl,
            type: requestType,
            data: requestData,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', ManyWhoSharedServices.getAuthenticationToken());

                // Assign the culture if one has been explicity set for this user
                if (ManyWhoSharedServices.getCultureHeader() != null) {
                    xhr.setRequestHeader('Culture', ManyWhoSharedServices.getCultureHeader());
                }
            },
            success: function (data, status, xhr) {
                // Log the response from the call to the server
                ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallGetRequest -> Ajax.Success: [Data]: ' + data);
                ManyWhoLogging.consoleLog(callingFunctionName + ' -> CallGetRequest -> Ajax.Success: [Status]: ' + status);

                if (xhr != null) {
                    ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallGetRequest -> Ajax.Success: [Xhr.Status]: ' + xhr.status);
                }

                if (successCallback != null) {
                    // Call the success function
                    successCallback.call(this, data, status, xhr);
                }
            },
            dataType: requestDataType
        });
    },
    callRestApi : function(callingFunctionName, 
                           requestUrl, 
                           requestType, 
                           requestData, 
                           beforeSend, 
                           successCallback, 
                           errorCallback,
                           headers,
                           useFormContentType,
                           authenticationToken) {
        var ajaxContentType = null;

        // Log the incoming parameter data so we have a record of it
        ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi: [RequestUrl]: ' + requestUrl);
        ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi: [RequestType]: ' + requestType);
        ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi: [RequestData]: ' + requestData);
        
        if (beforeSend != null) {
            ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi: [BeforeSend]: ' + beforeSend.name);
        }
        
        if (successCallback != null) {
            ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi: [SuccessCallback]: ' + successCallback.name);
        }
        
        if (errorCallback != null) {
            ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi: [ErrorCallback]: ' + errorCallback.name);
        }

        if (useFormContentType != null &&
            useFormContentType == true) {
            ajaxContentType = 'application/x-www-form-urlencoded';
        } else {
            ajaxContentType = 'application/json; charset=utf-8';
        }

        $.ajax({
            url: requestUrl,
            type: requestType,
            dataType: 'json',
            contentType: ajaxContentType,
            processData: true,
            data: requestData,
            beforeSend: function (xhr) {
                // If the caller has passed in the authentication token, we use that instead of the one stored in the shared services
                if (authenticationToken != null &&
                    authenticationToken.trim().length > 0) {
                    xhr.setRequestHeader('Authorization', authenticationToken);
                } else {
                    xhr.setRequestHeader('Authorization', ManyWhoSharedServices.getAuthenticationToken());
                }

                // Assign the culture if one has been explicity set for this user
                if (ManyWhoSharedServices.getCultureHeader() != null) {
                    xhr.setRequestHeader('Culture', ManyWhoSharedServices.getCultureHeader());
                }

                // If the calling function has additional headers to add, we add those here
                if (headers != null &&
                    headers.length > 0) {
                    for (var i = 0; i < headers.length; i++) {
                        xhr.setRequestHeader(headers[i].key, headers[i].value);
                    }
                }

                if (beforeSend != null) {
                    beforeSend.call(this);
                }
            },
            success: function (data, status, xhr) {
                // Log the response from the call to the server
                ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi -> Ajax.Success: [Data]: ' + JSON.stringify(data));
                ManyWhoLogging.consoleLog(callingFunctionName + ' -> CallRestApi -> Ajax.Success: [Status]: ' + status);
                
                if (xhr != null) {
                    ManyWhoLogging.consoleLog(callingFunctionName + ' -> ManyWhoAjax.CallRestApi -> Ajax.Success: [Xhr.Status]: ' + xhr.status);
                }

                if (successCallback != null) {
                    // Call the success function
                    successCallback.call(this, data, status, xhr);
                }
            },
            error: function (xhr, status, error) {
                // Log the response from the call to the server
                ManyWhoLogging.consoleError(callingFunctionName + ' -> ManyWhoAjax.CallRestApi -> Ajax.Error: [Error]: ' + error);
                ManyWhoLogging.consoleError(callingFunctionName + ' -> ManyWhoAjax.CallRestApi -> Ajax.Error: [Status]: ' + status);
                
                if (xhr != null) {
                    ManyWhoLogging.consoleError(callingFunctionName + ' -> ManyWhoAjax.CallRestApi -> Ajax.Error: [Xhr.Status]: ' + xhr.status);
                }

                if (errorCallback != null) {
                    // Call the error function
                    errorCallback.call(this, xhr, status, error);
                }
            }
        });
    },
    createHeader: function (headers, key, value) {
        var header = null;

        if (headers == null) {
            headers = new Array();
        }

        header = new Object();
        header.key = key;
        header.value = value;

        headers[headers.length] = header;

        return headers;
    },
    cleanJson : function (input) {
        var output = '';

        if (input != null) {
            var valid = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ :-_.,/<>';

            for (var i = 0; i < input.length; i++) {
                if (valid.indexOf(input.charAt(i)) !== -1) {
                    output += input.charAt(i);
                }
            }
        }

        return output;
    }
}

// http://stackoverflow.com/questions/3593046/jquery-json-to-string
// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof (v);
            if (t == "string") v = '"' + v + '"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

