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

var ManyWhoUtils = {

    /*
    * Wrapper method for getting query string parameters as the component behaviour isn't quite right
    * for our needs.
    */
    getQueryStringParam: function (name) {
        var value = $.query.get(name);

        if (value == true ||
            value == 'true') {
            value = '';
        }

        return value;
    },
    updateUrl: function (data, url) {
        // Check to make sure the browser supports the switch of the url
        if (history && history.replaceState) {
            history.replaceState(data, "grab share url page", url);
        }
    },
    getInputQueryStringParams: function () {
        var params = $.query.get();
        var inputs = new Array();

        // See if we have any keys in the query string
        if (params != null) {
            // Go through each of the properties in the params object
            for (var property in params) {
                if (property.indexOf('var_') == 0) {
                    var input = new Object();

                    input.Key = property;
                    input.Value = params[property].subString('var_'.length, params[property].length);

                    inputs[inputs.length] = input;
                }
            }
        }

        // We don't want to return null as it will mess up the stringify method
        return inputs;
    },
    getGuid: function () {
        var guid = '';

        guid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-';
        guid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-';
        guid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-';
        guid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + '-';
        guid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

        return guid;
    },
    getCookie: function (key) {
        return $.cookie(key);
    },
    setCookie: function (key, value, doesExpire) {
        // If the user provided an expiry, use it
        if (doesExpire == true) {
            // Expire in 1 hour - 1/24
            $.cookie(key, value, { expires: 0.04, path: '/' });
        } else {
            $.cookie(key, value, { path: '/' });
        }
    },
    getOutcomeValue: function (outputValues, developerName, typeElementEntryDeveloperName) {
        var returnValue = null;
        var found = false;

        // Check to see if we have any output values
        if (outputValues != null &&
            outputValues.length > 0) {
            // Go through the list of values and grab out the results from the form element response object data
            for (var i = 0; i < outputValues.length; i++) {
                var outputValue = outputValues[i];
                // Check to see if this is the matching output value based on the developer name
                if (outputValue.developerName.toLowerCase() == developerName.toLowerCase()) {
                    // We're grabbing the root value
                    if (typeElementEntryDeveloperName == null) {
                        // If we have object data, we assume this is an object
                        if (outputValue.objectData != null) {
                            returnValue = outputValue.objectData;
                        } else {
                            // Otherwise we simply return the content value
                            returnValue = outputValue.contentValue;
                        }

                        // Tell the algorithm we found the value
                        found = true;
                        break;
                    } else {
                        returnValue = ManyWhoUtils.getObjectAPIPropertyValue(outputValue.objectData, developerName, typeElementEntryDeveloperName);
                        found = true;
                        break;
                    }
                }
            }

            if (found == false) {
                var outputError = 'The value could not be found in the output values from the flow (' + developerName;

                if (typeElementEntryDeveloperName != null) {
                    outputError += '.' + typeElementEntryDeveloperName + ')';
                } else {
                    outputError += ')';
                }

                alert(outputError);
            }
        }

        return returnValue;
    },
    getObjectAPIPropertyValue: function (objectAPIs, developerName, typeElementEntryDeveloperName) {
        var returnValue = null;
        var found = false;

        // We're grabbing an object property
        // Check to see if we have any object data - this will contain the object info
        if (objectAPIs != null &&
            objectAPIs.length > 0) {
            // Go through all of the object data - but we only really want to first record - there should only be one
            for (var j = 0; j < objectAPIs.length; j++) {
                var outputValueProperty = objectAPIs[j];
                // Go through the properties to get the relevant information out
                if (outputValueProperty.properties != null &&
                    outputValueProperty.properties.length > 0) {
                    // Go through each property
                    for (var k = 0; k < outputValueProperty.properties.length; k++) {
                        var property = outputValueProperty.properties[k];

                        // Assign the relevant information
                        if (property.developerName.toLowerCase() == typeElementEntryDeveloperName.toLowerCase()) {
                            if (property.objectData != null &&
                                property.objectData.length > 0) {
                                returnValue = property.objectData;
                            } else {
                                returnValue = property.contentValue;
                            }
                            found = true;
                            break;
                        }
                    }
                }

                // Break out of the loop as we only want the first result
                break;
            }

            if (found == false) {
                var outputError = 'The value could not be found in the object (' + developerName;

                if (typeElementEntryDeveloperName != null) {
                    outputError += '.' + typeElementEntryDeveloperName + ')';
                } else {
                    outputError += ')';
                }

                alert(outputError);
            }
        }

        return returnValue;
    },
    grabOrderFromObjectDataEntry: function (objectDataEntry) {
        var order = 0;

        if (objectDataEntry != null &&
            objectDataEntry.properties != null &&
            objectDataEntry.properties.length > 0) {
            for (var a = 0; a < objectDataEntry.properties.length; a++) {
                if (objectDataEntry.properties[a].developerName.toLowerCase() == 'order') {
                    order = parseInt(objectDataEntry.properties[a].contentValue);
                    break;
                }
            }
        }

        return order;
    },
    grabPageContainerIdFromObjectDataEntry: function (objectDataEntry) {
        var pageContainerId = 0;

        if (objectDataEntry != null &&
            objectDataEntry.properties != null &&
            objectDataEntry.properties.length > 0) {
            for (var a = 0; a < objectDataEntry.properties.length; a++) {
                if (objectDataEntry.properties[a].developerName.toLowerCase() == 'pagecontainerid') {
                    pageContainerId = objectDataEntry.properties[a].contentValue;
                    break;
                }
            }
        }

        return pageContainerId;
    },
    getBooleanValue: function (stringBoolean) {
        var boolean = false;

        // This method is a utility function for converting strings to boolean values
        if (stringBoolean != null &&
            stringBoolean.toLowerCase() == 'true') {
            boolean = true;
        }

        return boolean;
    }
}
