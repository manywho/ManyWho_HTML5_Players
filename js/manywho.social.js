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

var ManyWhoSocial = {
    postNewMessage: function (callingFunctionName,
                              stateId,
                              streamId,
                              newMessage,
                              loadBeforeSend,
                              loadSuccessCallback,
                              loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '/message';
        var requestType = 'POST';
        var requestData = JSON.stringify(newMessage);
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.postNewMessage', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    deleteMessage: function (callingFunctionName,
                             stateId,
                             streamId,
                             messageId,
                             loadBeforeSend,
                             loadSuccessCallback,
                             loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '/message/' + messageId;
        var requestType = 'DELETE';
        var requestData = '';
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.deleteMessage', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    likeMessage: function (callingFunctionName,
                           stateId,
                           streamId,
                           messageId,
                           like,
                           loadBeforeSend,
                           loadSuccessCallback,
                           loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '/message/' + messageId + '?like=' + like;
        var requestType = 'POST';
        var requestData = '';
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.likeMessage', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    followStream: function (callingFunctionName,
                            stateId,
                            streamId,
                            follow,
                            loadBeforeSend,
                            loadSuccessCallback,
                            loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '?follow=' + follow;
        var requestType = 'POST';
        var requestData = '';
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.followStream', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    searchUsersByName: function (callingFunctionName,
                                 stateId,
                                 streamId,
                                 name,
                                 loadBeforeSend,
                                 loadSuccessCallback,
                                 loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '/user?name=' + name;
        var requestType = 'GET';
        var requestData = '';
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.searchUsersByName', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    getMyUserInfo: function (callingFunctionName,
                             stateId,
                             streamId,
                             loadBeforeSend,
                             loadSuccessCallback,
                             loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '/user/me';
        var requestType = 'GET';
        var requestData = '';
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.getMyUserInfo', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    getUserInfo: function (callingFunctionName,
                           stateId,
                           streamId,
                           userId,
                           loadBeforeSend,
                           loadSuccessCallback,
                           loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '/user?userId=' + userId;
        var requestType = 'GET';
        var requestData = '';
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.getUserInfo', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    getStreamFollowers: function (callingFunctionName,
                                  stateId,
                                  streamId,
                                  loadBeforeSend,
                                  loadSuccessCallback,
                                  loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId + '/follower';
        var requestType = 'GET';
        var requestData = '';
        var headers = null;

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.getStreamFollowers', requestUrl, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    },
    getStreamMessages: function (callingFunctionName,
                                 stateId,
                                 streamId,
                                 page,
                                 loadBeforeSend,
                                 loadSuccessCallback,
                                 loadErrorCallback) {
        var requestUrl = ManyWhoConstants.BASE_PATH_URL + '/api/social/1/stream/' + streamId;
        var requestType = 'GET';
        var requestData = '';
        var headers = null;
        var urlParameters = '';

        urlParameters = '?pageSize=10';

        if (page != null &&
            page.trim().length > 0)
        {
            urlParameters += '&page=' + page;
        }

        // Create a header for the state id
        headers = ManyWhoAjax.createHeader(null, 'ManyWhoState', stateId);

        ManyWhoAjax.callRestApi(callingFunctionName + ' -> ManyWhoSocial.getStreamMessages', requestUrl + urlParameters, requestType, requestData, loadBeforeSend, loadSuccessCallback, loadErrorCallback, headers);
    }
}
