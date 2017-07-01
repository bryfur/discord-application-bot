// script.js

// create the module and name it scotchApp
// also include ngRoute for all our routing needs
var kekguild = angular.module('kekguild', ['ui.router']);

kekguild.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})

// configure our routes
kekguild.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider

        // route for the home page
        .state('home', {
            templateUrl: 'pages/home.html',
            url: '/'
        })

        // route for the about page
        .state('application', {
            templateUrl: 'pages/application.html',
            url: '/application',
            data: { requireLogin: true },
        })

        // route for the contact page
        .state('footage', {
            templateUrl: 'pages/footage.html',
            url: '/footage',
            data: { requireLogin: true },
        })

        .state('login', {
            templateUrl: 'pages/login.html',
            url: '/login'
        });
    $urlRouterProvider.otherwise("/");
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode({
        enabled: false
    });
});

kekguild.controller('MainController', function ($scope, $http, Session) {
    $scope.currentUser = null;

    $http({ method: 'GET', url: '/api/discordauth/user' }).
        then(function (response) {
            if (response.data.username) {
                Session.create(response.data.id, response.data.username);
                $scope.currentUser = response.data;
                $scope.username = response.data.username;
            }
        }, function (response) {
        });
})

kekguild.controller('FormController', function ($scope, $http, Session) {
    $scope.formData = {};
    $scope.formData.id = Session.userId;

    // when landing on the page, try to get users saved form
    $http.get('/api/application/get', { params: { id: Session.userId } }
        ).then(function (result) {
        $scope.formData = result.data;
        console.log(result);
         })
        , (function (result) {
            console.log('Error: ' + result);
        });

    $scope.submit = function () {
        $scope.formData.id = Session.userId;
        console.log($scope.formData);
        $http.post('/api/application/submit', $scope.formData)
            .then(function (data) {
                console.log(data);
            })
            , (function (data) {
                console.log('Error: ' + data);
            });
    }

    $scope.save = function () {
        $scope.formData.id = Session.userId;
        $http.post('/api/application/save', $scope.formData)
            .then(function (data) {
                console.log(data);
            })
            , (function (data) {
                console.log('Error: ' + data);
            });
    }
})

kekguild.service('Session', function () {
    this.create = function (userId, userName, disc) {
        this.userId = userId;
        this.userName = userName;
        this.disc = disc;
    };
    this.destroy = function () {
        this.userId = null;
        this.userName = null;
        this.disc = null;
    };
})

kekguild.run(function ($rootScope, $state, Session) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

        var shouldLogin = toState.data !== undefined
            && toState.data.requireLogin

        if (fromState.url == "^") {
            $http({ method: 'GET', url: '/api/discordauth/user' }).
                then(function (response) {
                    if (!response.data.username && shouldLogin) {
                        $state.go('login');
                        event.preventDefault();
                    }
                }, function (response) {
                });
        } else if (!Session.userId && shouldLogin) {
            $state.go('login');
            event.preventDefault();
        }
    })
})

