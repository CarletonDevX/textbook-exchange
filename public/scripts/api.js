angular.module('hitsTheBooks').factory('api', function($http, $q) {
    return {
        // Users
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