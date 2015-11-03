angular.module('hitsTheBooks').factory('Api', function($http) {
    return {
        login: function (loginData) {
            return $http.post('/api/login/', loginData);
        },
        logout: function () {
            return $http.post('/api/logout');
        },
        getCurrentUser: function () {
            return $http.get('/api/user');
        },
        getUser: function (userID) {
            return $http.get('/api/user/'+userID);
        },
        getBook: function (isbn) {
            return $http.get('/api/book/'+isbn);
        },
        search: function (query) {
            return $http.get('/api/search?query='+query);
        }
    };
});