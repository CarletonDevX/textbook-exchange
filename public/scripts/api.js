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
        getWatchlist: function () {
            return $http.get('/api/subscriptions').then(
                function (res) {
                    return res.data;
                }
            );
        },
        addToWatchlist: function (isbn) {
            return $http.post('/api/subscriptions/add/'+isbn).then(
                function (res) {
                    return res.data;
                }
            );
        },
        removeFromWatchlist: function (isbn) {
            return $http.post('/api/subscriptions/remove/'+isbn).then(
                function (res) {
                    return res.data;
                }
            );
        },
        getListings: function(isbn) {
            return $http.get('/api/listings/book/'+isbn)
                .then( function (res) {
                    console.log(res);
                    return res.data;
                })
        },
        addListing: function (isbn, data) {
            console.log('data', data);
            return $http.post('/api/listings/add/'+isbn, data)
                .then( function (res) {
                    return res.data;
                });
        },
        updateListing: function (listingID, data) {
            return $http.put('/api/listings/'+listingID, data)
                .then( function (res) {
                    return res.data;
                });
        },
        removeListing: function (listingID, data) {
            return $http.delete('/api/listings/'+listingID)
                .then( function (res) {
                    return res.data;
                });
        },
        completeListing: function (listingID, data) {
            return $http.post('/api/listings/complete/'+listingID)
                .then( function (res) {
                    return res.data;
                });
        },
        makeOffer: function(listingID, msg) {
            var data = {
                message: msg
            }
            return $http.post('/api/listings/offer/'+listingID, data)
                .then( function (res) {
                    return res.data;
                });
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