// script.js

// create the module and name it scotchApp
// also include ngRoute for all our routing needs
var kekguild = angular.module('kekguild', ['ui.router', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngCookies']);

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

        // route for the application page
        .state('application', {
            templateUrl: 'pages/application.html',
            url: '/application',
            data: { requireLogin: false },
        })

        // route for the footage page
        .state('footage', {
            templateUrl: 'pages/footage.html',
            url: '/footage',
            data: { requireLogin: true },
        })

        // route for the login page
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
                Session.create(response.data.id, response.data.username, response.data.discriminator);
                $scope.currentUser = response.data;
                $scope.username = response.data.username;
            }else {
                Session.destroy();
            }
        }, function (response) {
        });
})

kekguild.controller('CollapseController', function ($scope) {
  $scope.isNavCollapsed = true;
  $scope.isCollapsed = false;
  $scope.isCollapsedHorizontal = false;
});

kekguild.controller('FormController', function ($scope, $http, Session) {
    $scope.formData = {};
    $scope.formData.id = Session.userId;
    $scope.submitsuccess = false;
    $scope.savesuccess = false;

    if(Session.userId) {
        $scope.login = false;
        // when landing on the page, try to get users saved form
        $http.get('/api/application/get', { params: { id: Session.userId } }
            ).then(function (result) {
            $scope.formData = result.data;
            $scope.accepted = result.data.alreadymember;

            if($scope.accepted){
                $scope.disableform = result.data.alreadymember;
                return;
            }

            if(result.data.submitted && result.data.saved){
                $scope.saved = false;
                $scope.editted = true;
                $scope.submitted = result.data.submitted;
            }
            else{
                $scope.saved = result.data.saved;
                $scope.submitted = result.data.submitted;
            }

            console.log(result);
            })
            , (function (result) {
                console.log('Error: ' + result);
            });
    } else {
        $scope.disableform = true;
        $scope.login = true;
    }

    $scope.submit = function () {
        $scope.formData.id = Session.userId;
        $scope.formData.discordaccount = Session.userName + "#" + Session.disc;
        console.log($scope.formData);
        $http.put('/api/application/submit', $scope.formData)
            .then(function (result) {
                $scope.saved = result.data.saved;
                $scope.submitted = result.data.submitted;
                $scope.editted = false;
                console.log(data);
            })
            , (function (result) {
                console.log('Error: ' + result);
            });
    }

    $scope.save = function () {
        $scope.formData.id = Session.userId;
        $scope.formData.discordaccount = Session.userName + "#" + Session.disc;
        $http.put('/api/application/save', $scope.formData)
            .then(function (result) {
                if(result.data.submitted && result.data.saved)
                    $scope.editted = true;
                else{
                    $scope.saved = result.data.saved;
                    $scope.submitted = result.data.submitted;
                }
                console.log(result);
            })
            , (function (result) {
                console.log('Error: ' + result);
            });
    }
})

kekguild.service('Session', function ($cookies) {
    this.userId =  $cookies.get("userId");
    this.userName = $cookies.get("userName");
    this.disc = $cookies.get("userName");

    this.create = function (userId, userName, disc) {
        this.userId = userId;
        this.userName = userName;
        this.disc = disc;
        $cookies.put("userId", userId);
        $cookies.put("userName", userName);
        $cookies.put("disc", disc);
    };
    this.destroy = function () {
        this.userId = null;
        this.userName = null;
        this.disc = null;
        $cookies.remove("userId");
        $cookies.remove("userName");
        $cookies.remove("disc");
    };
})

kekguild.run(function ($rootScope, $state, Session) {

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

        var shouldLogin = toState.data !== undefined
            && toState.data.requireLogin

        if (!Session.userId && shouldLogin) {
            $state.go('login');
            event.preventDefault();
        }
    })
})