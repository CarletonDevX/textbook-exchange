angular.module('hitsTheBooks').factory('Api', ['$rootScope', '$http', 'AUTH_EVENTS', function($rootScope, $http, AUTH_EVENTS) {
    return {
        login: function (loginData) {
            return $http.post('/api/login/', loginData).then(
                function (res) {
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    return res.data;
                }, 
                function (err) {
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    return err;
                }
            );
        },
        logout: function () {
            return $http.post('/api/logout').then(
                function (res) {
                    $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                });
        },
        getCurrentUser: function () {
            return $http.get('/api/user/').then(
                function (res) {
                    return res.data;
                }
            );
        },
        getUser: function (userID) {
            return $http.get('/api/user/'+userID).then(
                function (res) {
                    return res.data;
                }
            );
        },
        getBook: function (isbn) {
            return $http.get('/api/book/'+isbn).then(
                function (res) {
                    return res.data;
                }
            );
        },
        search: function (query) {
            return $http.get('/api/search?query='+query).then(
                function (res) {
                    return res.data;
                }
            );
        }
    }
}]);