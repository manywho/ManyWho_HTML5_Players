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

ManyWhoObjectUtils = {
    createPropertyAPI: function (objectAPI, developerName, contentValue, objectData) {
        var propertyAPI = null;

        propertyAPI = new Object();
        propertyAPI.developerName = developerName;
        propertyAPI.contentValue = contentValue;
        propertyAPI.objectData = objectData;

        objectAPI.properties[objectAPI.properties.length] = propertyAPI;

        return propertyAPI;
    },
    createObjectAPI: function (developerName, externalId) {
        var objectAPI = null;

        objectAPI = new Object();
        objectAPI.externalId = externalId;
        objectAPI.developerName = developerName;
        objectAPI.properties = new Array();

        return objectAPI;
    }
};
