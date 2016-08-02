angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('PlaylistsCtrl', function ($scope) {
    $scope.playlists = [
      {title: 'Reggae', id: 1},
      {title: 'Chill', id: 2},
      {title: 'Dubstep', id: 3},
      {title: 'Indie', id: 4},
      {title: 'Rap', id: 5},
      {title: 'Cowbell', id: 6}
    ];
  })

  .controller('MapCtrl', function ($scope, $stateParams, LocationsService, $cordovaGeolocation, $ionicLoading, $ionicModal, $timeout, Loading, ApiService) {

    $scope.map = {
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        maxZoom: 18,
        zoomControlPosition: 'bottomleft'
      },
      markers: {},
      events: {
        map: {
          enable: ['context'],
          logic: 'emit'
        }
      }
    };
    $scope.map.center = {};


    locate();

    /**
     * Center map on user's current position
     */
    $scope.locate = function () {
      locate();
    };


    function locate() {
      Loading.show('กรุณารอสักครู่...');
      $scope.locname = 'finding location';
      $scope.locname2 = 'Loading...';
      $cordovaGeolocation
        .getCurrentPosition()
        .then(function (position) {
          console.log($scope.map);
          $scope.map.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 15
          };
          //$scope.map.center.lat  = position.coords.latitude;
          //$scope.map.center.lng = position.coords.longitude;
          //$scope.map.center.zoom = 15;

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            message: "<a href='#/app/map/1'>ดูรายละเอียด</a>",
            focus: true,
            draggable: true
          };
          Loading.hide();
          updatelocation(position.coords.latitude, position.coords.longitude);


        }, function (err) {
          // error
          console.log("Location error!");
          console.log(err);
          $scope.hide($ionicLoading);
        });
    }


    function updatelocation(lat, lng, callback) {
      Loading.show('finding your location...');

      navigator.geolocation.getCurrentPosition(onSuccess, onError);

      function onSuccess(position) {
        $scope.lat = position.coords.latitude;
        $scope.lng = position.coords.longitude;
        ApiService.query('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false', null, null).then(function (respond) {
          $scope.locname = respond.data.results[0].formatted_address;
          $scope.locname2 = respond.data.results[0].address_components[3].long_name;
        });
        Loading.hide();
        callback && callback();
      }

      function onError(error) {
        alert('code: ' + error.code + '\n' +
          'message: ' + error.message + '\n');
      }

    }


    $scope.searchData = {};

    $ionicModal.fromTemplateUrl('templates/search.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.search = function () {
      $scope.modal.show();
    };

    $scope.doSearch = function () {
      console.log('Doing search', $scope.searchData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
  })


  .controller('MaplistCtrl', function ($scope, $stateParams, ApiService) {

    $scope.layerlist = [
      {
        title: "prof_est_04",
        thumbnail_url: "http://demo.geonode.org/uploaded/thumbs/layer-af1986b2-3d3d-11e6-af0f-0e5eb785f415-thumb.png",
        abstract: "No abstract provided"
      },
      {
        title: "mv_substation",
        thumbnail_url: "http://demo.geonode.org/uploaded/thumbs/layer-c36b9e10-3cd5-11e6-902b-0e5eb785f415-thumb.png",
        abstract: "No abstract provided"
      }
    ];


  })


  .controller('HowtoCtrl', function ($scope, $stateParams) {
  })

  .controller('SyncCtrl', function ($scope, $stateParams, Loading, $timeout) {
    $scope.doSync = function () {
      Loading.show('กำลังซิงค์ข้อมูล...');
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        Loading.hide();
      }, 1000);
    };

  })

  .controller('MapSetOfflineCtrl', function ($scope, $stateParams, Loading, $cordovaGeolocation, $ionicActionSheet) {
    $scope.map = {
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        maxZoom: 18,
        zoomControlPosition: 'bottomleft'
      },
      markers: {},
      events: {
        map: {
          enable: ['context'],
          logic: 'emit'
        }
      }
    };
    $scope.map.center = {};


    locate();

    $scope.locate = function () {
      locate();
    };


    function locate() {
      Loading.show('กรุณารอสักครู่...');
      $scope.locname = 'finding location';
      $scope.locname2 = 'Loading...';
      $cordovaGeolocation
        .getCurrentPosition()
        .then(function (position) {
          console.log($scope.map);
          $scope.map.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 15
          };

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            message: "ตำแหน่งปัจจุบันของคุณ",
            focus: true,
            draggable: true
          };
          Loading.hide();

        }, function (err) {
          // error
          console.log("Location error!");
          console.log(err);
          $scope.hide($ionicLoading);
        });
    }

    $scope.actionsheetshow = function () {

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          {text: 'Cache current (bounds)'},
          {text: 'Show cache usage'}
        ],
        destructiveText: 'Clear cache',
        titleText: 'Seting offline map',
        cancelText: 'Cancel',
        cancel: function () {
          // add cancel code..
        },
        buttonClicked: function (index) {
          console.log(index);
          if (index == 0) {
          }
          else if (index == 1) {
          }
          else {
            hideSheet();
          }
          return true;
        }
      });

    };

  })

  .controller('MapDetailCtrl', function ($scope, $stateParams) {
  })

  .controller('LayerDetailCtrl', function ($scope, $stateParams) {
  })


  .controller('MapLayerDetailCtrl', function ($scope, $stateParams, Loading, $cordovaGeolocation, $ionicActionSheet, $timeout) {
    console.log($stateParams);
    $scope.title = $stateParams.id;
    $scope.modestatus = "โหมดดดูรายละเอียด";
    $scope.actionsheetshow = function () {

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          {text: 'ดู'},
          {text: 'เพิ่ม'},
          {text: 'แก้ไข'}
        ],
        titleText: 'Modify layer',
        cancelText: 'Cancel',
        cancel: function () {
          // add cancel code..
        },
        buttonClicked: function (index) {
          console.log(index);
          if (index == 0) {
//ดู
            $scope.modestatus = "โหมดดดูรายละเอียด";
          }
          else if (index == 1) {
//เพิ่ม
            $scope.modestatus = "โหมดเพิ่มข้อมูล";
          }
          else if (index == 2) {
//แก้ไข
            $scope.modestatus = "โหมดแก้ไขข้อมูล";
          }
          else {
            hideSheet();
          }
          return true;
        }
      });

    };

    $scope.activetool = function (type) {
      alert(type);
    }


    $scope.map = {
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        maxZoom: 18,
        zoomControlPosition: 'bottomleft'
      },
      markers: {},
      events: {
        map: {
          enable: ['context'],
          logic: 'emit'
        }
      }
    };
    $scope.map.center = {};

    locate();

    $scope.locate = function () {
      locate();
    };


    function locate() {
      Loading.show('กรุณารอสักครู่...');
      $scope.locname = 'finding location';
      $scope.locname2 = 'Loading...';
      $cordovaGeolocation
        .getCurrentPosition()
        .then(function (position) {
          console.log($scope.map);
          $scope.map.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 15
          };

          $scope.map.markers.now = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            message: "<a href='#/app/layerdetail/1'>ดูรายละเอียด</a>",
            focus: true,
            draggable: true
          };
          Loading.hide();

        }, function (err) {
          // error
          console.log("Location error!");
          console.log(err);
          $scope.hide($ionicLoading);
        });
    }
  });
