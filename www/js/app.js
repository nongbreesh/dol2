// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// Database instance.
var db;
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'leaflet-directive', 'ngCordova', 'LocalStorageModule'])

  .run(function ($ionicPlatform, $cordovaSQLite, $rootScope) {
    $rootScope.appReady = { status: false };
    $ionicPlatform.ready(function () {
      $rootScope.appReady.status = true;
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
        cordova.plugins.Keyboard.disableScroll(false);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }


      if (window.cordova) {
        db = $cordovaSQLite.openDB({name: "dol.db", location: 'default'});
      }
      else {
        db = window.openDatabase("sqlite", "1.0", "dol", 1000000);
      }




      //$cordovaSQLite.execute(db,'drop table tilelayer');
      //$cordovaSQLite.execute(db,'drop table layer');
      //$cordovaSQLite.execute(db,'drop table meta');
      //$cordovaSQLite.execute(db,'drop table layer_data');

      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS tilelayer (id INTEGER PRIMARY KEY AUTOINCREMENT, ,tilevalue TEXT)');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS layer (id INTEGER PRIMARY KEY AUTOINCREMENT, layer_id INTEGER, layer_title TEXT, layer_type TEXT, status INTEGER,last_sync DEFAULT CURRENT_TIMESTAMP)');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS meta (id INTEGER PRIMARY KEY AUTOINCREMENT, layer_id INTEGER, meta_title TEXT, meta_type TEXT,defult_value TEXT,status INTEGER DEFAULT 1)');
      $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS layer_data (id INTEGER PRIMARY KEY AUTOINCREMENT, layer_id INTEGER, point TEXT, line TEXT, polygon TEXT, metadata TEXT ,moremetadata TEXT, ispushtoserver INTEGER,userid INTEGER,refid INTEGER,video TEXT,image TEXT,last_sync DEFAULT CURRENT_TIMESTAMP, status INTEGER DEFAULT 1)');




    });
  })

  .config(function ($stateProvider, $urlRouterProvider, $compileProvider) {

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|content):|data:image\//);

    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.howto', {
        url: '/howto',
        views: {
          'menuContent': {
            templateUrl: 'templates/howto.html',
            controller: 'HowtoCtrl'
          }
        }
      })
      .state('app.sync', {
        url: '/sync',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/sync.html',
            controller: 'SyncCtrl'
          }
        }
      })
      .state('app.browse', {
        url: '/browse',
        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html'
          }
        }
      })
      .state('app.map', {
        url: '/map',
        views: {
          'menuContent': {
            templateUrl: 'templates/map.html',
            controller: 'MapCtrl'
          }
        }
      })
      .state('app.maplayerlist', {
        url: '/maplayerlist',
        views: {
          'menuContent': {
            templateUrl: 'templates/maplayerlist.html',
            controller: 'MapLayerlistCtrl'
          }
        }
      })
      .state('app.login', {
        url: '/login',
        views: {
          'menuContent': {
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl'
          }
        }
      })
      .state('app.landing', {
        url: '/landing',
        views: {
          'menuContent': {
            templateUrl: 'templates/landing.html',
            controller: 'landingCtrl'
          }
        }
      })
      .state('app.maplist', {
        url: '/maplist',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/maplist.html',
            controller: 'MaplistCtrl'
          }
        }
      })
      .state('app.layerlist', {
        url: '/layerlist/:id/:title/:type',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/layerlist.html',
            controller: 'LayerlistCtrl'
          }
        }
      })
      .state('app.setofflinemap', {
        url: '/setofflinemap',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/setofflinemap.html',
            controller: 'MapSetOfflineCtrl'
          }
        }
      })
      .state('app.mapdetail', {
        url: '/layer',
        cache: false,
        params: {
          obj: null
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/mapdetail.html',
            controller: 'MapDetailCtrl'
          },
          params: { obj: null }
        }
      })
      .state('app.layer', {
        url: '/layer/:id/:layer_id/:title/:type/:mode',
        cache: false,
        views: {
          'menuContent': {
            templateUrl: 'templates/maplayer.html',
            controller: 'MapLayerDetailCtrl'
          }
        }
      })
      .state('app.layerdetail', {
        url: '/layerdetail/:id',
        views: {
          'menuContent': {
            templateUrl: 'templates/layerdetail.html',
            controller: 'LayerDetailCtrl'
          }
        }
      })

      .state('app.single', {
        url: '/playlists/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/landing');
  });
