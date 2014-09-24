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

var ManyWhoTagNavigationEditor = {
    init: function (domId) {
        $('#' + domId).append('<div id="' + domId + '-navigation-editor"></div>');
        $('#' + domId + '-navigation-editor').manywhoNavigationEditor();
    },
    setValue: function (domId, value, objectData, tags) {
        $('#' + domId + '-navigation-editor').manywhoNavigationEditor('setValue', objectData);
    },
    getValue: function (domId) {
        return $('#' + domId + '-navigation-editor').manywhoNavigationEditor('getValue');
    }
}
