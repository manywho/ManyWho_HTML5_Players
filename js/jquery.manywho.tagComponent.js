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

(function ($) {

    var methods = {
        init: function (options) {
            var htmlOutput = '';
            var opts = $.extend({}, $.fn.manywhoTagComponent.defaults, options);
            var domId = $(this).attr('id');

            // Create a tag to hold the registry of components
            htmlOutput += '<div id="' + domId + '-component" style="display:none;"></div>';

            // Print to the dom
            $(this).html(htmlOutput);

            // This is the component we use for this particular implementation of the tag field
            if (opts.register != null) {
                $('#' + domId + '-component').data('implementation', opts.register);

                // Initialize the component
                opts.register['init'].call(this, domId);
            }
        },
        setValue: function (value, objectData, tags) {
            var domId = $(this).attr('id');
            var component = $('#' + domId + '-component').data('implementation');

            return component['setValue'].call(this, domId, value, objectData, tags);
        },
        getValue: function () {
            var domId = $(this).attr('id');
            var component = $('#' + domId + '-component').data('implementation');

            return component['getValue'].call(this, domId);
        }
    };

    $.fn.manywhoTagComponent = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoTagComponent');
        }
    };

    $.fn.manywhoTagComponent.defaults = {  }

})(jQuery);
