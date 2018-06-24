angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $window, $ionicHistory, $ionicSideMenuDelegate, $state, $cordovaSQLite) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.loginData = {};
    $scope.landinfo = null;
    //  // Form data for the login modal
    //  $scope.loginData = {};
    //
    //  // Create the login modal that we will use later
    //  $ionicModal.fromTemplateUrl('templates/login.html', {
    //    scope: $scope
    //  }).then(function (modal) {
    //    $scope.modal = modal;
    //  });
    //
    //  // Triggered in the login modal to close it
    //  $scope.closeLogin = function () {
    //    $scope.modal.hide();
    //  };
    //
    //  // Open the login modal
    //  $scope.login = function () {
    //    $scope.modal.show();
    //  };
    //
    //  // Perform the login action when the user submits the login form
    //  $scope.doLogin = function () {
    //    console.log('Doing login', $scope.loginData);
    //
    //    // Simulate a login delay. Remove this and replace with your login
    //    // code if using a login system
    //    $timeout(function () {
    //      $scope.closeLogin();
    //    }, 1000);
    //  };
    $scope.activelayer = "ไม่มี";
    $scope.fullname = $window.localStorage.getItem('username');
    $scope.$on('loginsuccess', function (event, args) {
      $scope.fullname = $window.localStorage.getItem('username');
    });


    $scope.$on('layerchanged', function (event, args) {
      $scope.activelayer = args.title;
    });
    //
    //// Perform the login action when the user submits the login form
    $scope.doLogout = function () {
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $window.localStorage.removeItem('user');

   

      $timeout(function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $('.left-buttons').hide();
        $('.right-buttons').hide();
        $ionicSideMenuDelegate.canDragContent(false);
        $state.go('app.login');
      }, 1000);
    };

  })

  .controller('landingCtrl', function ($scope, $window, Loading, $timeout, $ionicHistory, $state, $cordovaSQLite) {
    loginsuccess();
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $('.left-buttons').hide();
    $('.right-buttons').hide();
    var user = $window.localStorage.getItem('user');
    Loading.show('กรุณารอสักครู่');
    if (user) {
      loginsuccess();
    }
    else {
      Loading.hide();
      $timeout(function () { 
        $state.go('app.login');

      }, 3 * 1000);

    }
    function loginsuccess() {
      $timeout(function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $('.left-buttons').show();
        $('.right-buttons').show();
        Loading.hide();
        $state.go('app.map');
      }, 1000);
    }

  })

  .controller('loginCtrl', function ($scope, $stateParams, LocationsService, $cordovaGeolocation, $ionicLoading, $ionicModal, $timeout, Loading, ApiService, $ionicSideMenuDelegate, $state, $ionicHistory, $window, $cordovaSQLite, $rootScope) {
    $('.left-buttons').hide();
    $('.right-buttons').hide();
    $ionicSideMenuDelegate.canDragContent(false);
    // Form data for the login modal
    $scope.loginData = {};

    Object.toparams = function ObjecttoParams(obj) {
      var p = [];
      for (var key in obj) {
        p.push(key + '=' + encodeURIComponent(obj[key]));
      }
      return p.join('&');
    };

    $scope.activelayer = "ไม่มี";
    $scope.$on('layerchanged', function (event, args) {
      $scope.activelayer = args.title;
    });

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      Loading.show('กรุณารอสักครู่'); 
      $scope.prms = $.param({
        username: $scope.loginData.username,
        password: $scope.loginData.password
      });
      ApiService.query('POST', 'http://landsportal.dol.go.th:82/dolapp/service/login', null, $scope.prms).then(function (respond) {

        if (respond.data.result != null) {

          $window.localStorage.setItem('user', respond.data.result);
          $window.localStorage.setItem('userid', respond.data.result.id);
          $window.localStorage.setItem('username', respond.data.result.username);
          $window.localStorage.setItem('first_name', respond.data.result.first_name);
          $window.localStorage.setItem('last_name', respond.data.result.last_name);
          $window.localStorage.setItem('groupid', respond.data.result.groupid);

          $rootScope.$broadcast('loginsuccess');

          registerLog(respond.data.result.id, $scope.loginData.username);
          $cordovaSQLite.execute(db, 'DELETE from  layer').then(function (res) {
            $cordovaSQLite.execute(db, 'DELETE from  layer_data').then(function (res) {
              $cordovaSQLite.execute(db, 'DELETE from  meta').then(function (res) {
                loginsuccess();
              });
            });
          });


        }
        else {
          alert('กรุณาตรวจสอบใหม่อีกครั้ง');
          Loading.hide();
        }

      });
    };


    function registerLog(userid, username) {
      $scope.prms = $.param({
        userid: userid,
        username: username,
        ipaddr: '',
        platform: 'mobile',
      });

      ApiService.query('POST', 'http://landsportal.dol.go.th:82/dolapp/service/dolapp_saveuserlog', null, $scope.prms).then(function (respond) {

        if (respond.data.result != null) {

        }

      });


    }

    function loginsuccess() {
      $timeout(function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $('.left-buttons').show();
        $('.right-buttons').show();
        Loading.hide();
        $state.go('app.map');
      }, 1000);
    }
  })

  .controller('MapCtrl', function ($scope, $q, $stateParams, LocationsService, $cordovaGeolocation, $ionicLoading, $ionicModal, $timeout, Loading, ApiService, $ionicSideMenuDelegate, $ionicActionSheet, $window) {
    $ionicSideMenuDelegate.canDragContent(true);

    // ### uncomment
    // cordova.plugins.diagnostic.isLocationEnabled(function (enabled) {
    //   //alert("Location is " + (enabled ? "enabled" : "disabled"));
    //   if (!enabled) {
    //     alert('กรุณาเปิดการใช้งาน Location service');
    //     cordova.plugins.diagnostic.switchToLocationSettings();
    //   }
    // }, function (error) {
    //   alert("The following error occurred: " + error);
    // });


    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      $scope.map = {
        eeuu: {
          lat: 39,
          lng: -100,
          zoom: 4
        },
        tiles: {
          url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        },
        layers: {
          baselayers: {
            xyz: {
              name: 'OpenStreetMap (XYZ)',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            recentimagery: {
              name: 'Digital Globe (Recent Imagery)',
              url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0mpda/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
              type: 'xyz'
            }
            , recent_imagery_with_streets: {
              name: 'Digital Globe (Recent Imagery with Streets)',
              url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0g75k/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
              type: 'xyz'
            },
            bingAerial: {
              name: 'Bing Aerial',
              type: 'bing',
              key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
              layerOptions: {
                type: 'Aerial'
              }
            },
            bingRoad: {
              name: 'Bing Road',
              type: 'bing',
              key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
              layerOptions: {
                type: 'Road'
              }
            },
            bingAerialWithLabels: {
              name: 'Bing Aerial With Labels',
              type: 'bing',
              key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
              layerOptions: {
                type: 'AerialWithLabels'
              }
            }
            ,
            offlinemap: {
              name: 'Offline Map',
              url: 'cdvfile://localhost/persistent/{z}_{x}_{y}.png',
              type: 'xyz'
            }
          },
          overlays: {
            parcellat: {
              name: 'PARCEL',
              type: 'wms',
              url: 'http://wms.dol.go.th/dol/parcel/wms',
              visible: false,
              layerOptions: {
                layers: 'PARCEL',
                format: 'image/png',
                opacity: 1,
                //crs: L.CRS.EPSG900913
              }
            },
            ortho: {
              name: 'ORTHO',
              type: 'wms',
              url: 'http://wms.dol.go.th/dol/ortho/wms?',
              visible: false,
              layerOptions: {
                layers: 'ORTHO_2554',
                format: 'image/png',
                opacity: 1,
              }
            },
            landuse: {
              name: 'LANDUSE',
              type: 'wms',
              url: 'http://landsmms.dol.go.th:8080/geoserver/Landuse/wms?',
              visible: false,
              layerOptions: {
                layers: 'landuse',
                format: 'image/png',
                opacity: .5,
              }
            },
            building: {
              name: 'BUILDING',
              type: 'wms',
              url: 'http://landsmms.dol.go.th:8080/geoserver/building/wms?',
              visible: false,
              layerOptions: {
                layers: 'building_data',
                format: 'image/png',
                opacity: .7,
              }
            },

          }
        },
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
      $scope.map.center = {
        lat: 13.764895,
        lng: 100.538275,
        zoom: 15
      };

      locate();


      if (toState.name == "app.map") {
        if ($scope.activelayer == "ไม่มี") {
          $window.localStorage.setItem('activelayer', $scope.activelayer);
        }
        else {

          for (i = 0; i < $scope.activelayer.length; i++) {
            $scope.map.layers.overlays[$scope.activelayer[i]] = {
              name: $scope.activelayer[i],
              type: 'wms',
              visible: true,
              url: 'http://landsportal.dol.go.th/geoserver/dol/wms',
              layerParams: {
                layers: $scope.activelayer[i],
                format: 'image/png',
                transparent: true,
                opacity: .5,
              }
            };

          }
          $window.localStorage.setItem('activelayer', $scope.activelayer);
          // $scope.map.layers.overlays.wms = {
          //   name: $scope.activelayer,
          //   type: 'wms',
          //   visible: true,
          //   url: 'http://landsportal.dol.go.th/geoserver/dol/wms',
          //   layerParams: {
          //     layers: $scope.activelayer,
          //     format: 'image/png',
          //     transparent: true
          //   }
          // };


        }
      }
      else {
        var activelayer = $window.localStorage.getItem('activelayer');
        if (activelayer != null && activelayer != []) {
          activelayer = activelayer.split(',');
          for (i = 0; i < activelayer.length; i++) {
            $scope.map.layers.overlays[activelayer[i]] = {
              name: activelayer[i],
              type: 'wms',
              visible: true,
              url: 'http://landsportal.dol.go.th/geoserver/dol/wms',
              layerParams: {
                layers: activelayer[i],
                format: 'image/png',
                transparent: true,
                opacity: .5,
              }
            };

          }
        }
      }
    });






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
            message: "ตำแหน่งของคุณ",
            focus: true,
            draggable: true
          };
          Loading.hide();
          //updatelocation(position.coords.latitude, position.coords.longitude);


        }, function (err) {
          // error
          //  alert('กรุณาตรวจสอบ Location service ของท่านว่าเปิดอยู่หรือไม่');
          $timeout(function () {
            Loading.hide();
            console.log("Location error!");
            console.log(err);
          }, 3000);
        });
    }


    // function updatelocation(lat, lng, callback) {
    //   Loading.show('finding your location...');
    //
    //   navigator.geolocation.getCurrentPosition(onSuccess, onError);
    //
    //   function onSuccess(position) {
    //     $scope.lat = position.coords.latitude;
    //     $scope.lng = position.coords.longitude;
    //     ApiService.query('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false', null, null).then(function (respond) {
    //       $scope.locname = respond.data.results[0].formatted_address;
    //       $scope.locname2 = respond.data.results[0].address_components[3].long_name;
    //     });
    //     Loading.hide();
    //     callback && callback();
    //   }
    //
    //   function onError(error) {
    //     Loading.hide();
    //     alert('code: ' + error.code + '\n' +
    //     'message: ' + error.message + '\n');
    //   }
    //
    // }


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

  .controller('LayerlistCtrl', function ($scope, $stateParams, ApiService, $cordovaSQLite, Loading, $window) {
    var user = $window.localStorage.getItem('user');
    var userid = $window.localStorage.getItem('userid');
    $scope.$on('$ionicView.loaded', function (event) {
      $scope.title = $stateParams.title;
      $scope.id = $stateParams.id;
      $scope.type = $stateParams.type;
      var query = "select * from layer_data where status != 0 and layer_id = " + $stateParams.id + " and userid = " + userid + ";";

      var layerlist = [];
      $cordovaSQLite.execute(db, query).then(function (res) {
        console.log(res.rows.length);
        for (var i = 0; i < res.rows.length; i++) {
          layerlist.push({
            id: res.rows.item(i).id,
            layer_id: res.rows.item(i).layer_id,
            title: $scope.title,
            status: res.rows.item(i).status,
            refid: res.rows.item(i).refid,
            metadata: res.rows.item(i).metadata,
            moremetadata: res.rows.item(i).moremetadata,
            ispushtoserver: res.rows.item(i).ispushtoserver,
            last_sync: res.rows.item(i).last_sync,
          });

        }


      }, function (err) {
        console.error(err);
      });
      $scope.layerlist = layerlist;
    });


  })

  .controller('MapLayerlistCtrl', function ($scope, $stateParams, ApiService, $rootScope, $ionicHistory, $http, Loading) {

    $scope.selectedlayers = [];
    $scope.layerselected = {}
    $scope.activelayer = function (title) {
      $scope.selectedlayers = [];
      for (var i = 0; i < $scope.layerlist.length; i++) {
        if ($scope.layerselected[$scope.layerlist[i].name] == true) {
          $scope.selectedlayers.push($scope.layerlist[i].name);
        }

      }

      console.log($scope.selectedlayers);
      $ionicHistory.goBack()
      $rootScope.$broadcast('layerchanged', { title: $scope.selectedlayers });
    };

    $scope.clearlayer = function (title) {
      $ionicHistory.goBack()
      $rootScope.$broadcast('layerchanged', { title: [] });
    };


    // $scope.selectlayer = function (title) {
    //     $scope.selectedlayers.push(title);
    //     console.log($scope.selectedlayers);
    // };
    Loading.show('กรุณารอสักครู่...');
    ApiService.query('GET', 'http://landsportal.dol.go.th:82/dolapp/service/dolapp_layersformobile', null, null).then(function (respond) {
      Loading.hide();
      if (respond.data != null) {
        console.log(respond.data);
        $scope.layerlist = respond.data.result;
      }

    });
    //
    // var layerUrl = "http://110.164.49.42/api/layers/";
    // $http({
    //   method: 'jsonp',
    //   url: layerUrl,
    //   params: {
    //     format: 'jsonp',
    //     callback: 'JSON_CALLBACK'
    //   }
    // }).then(function (response) {
    //   console.log(response);
    //   $scope.layerlist = response.data.objects;
    // });

    //$scope.layerlist = [
    //  {
    //    title: "prof_est_04",
    //    thumbnail_url: "http://demo.geonode.org/uploaded/thumbs/layer-0908d150-50b7-11e6-9a24-0e23392a5c01-thumb.png",
    //    abstract: "No abstract provided"
    //  },
    //  {
    //    title: "mv_substation",
    //    thumbnail_url: "http://demo.geonode.org/uploaded/thumbs/layer-7b146844-5027-11e6-a524-0e23392a5c01-thumb.png",
    //    abstract: "No abstract provided"
    //  }
    //];


  })


  .controller('MaplistCtrl', function ($scope, $stateParams, ApiService, $cordovaSQLite, Loading, $window) {
    var user = $window.localStorage.getItem('user');
    var userid = $window.localStorage.getItem('userid');
    var query = "select * from layer where status = 1;";
    var layerlist = [];
    // ### uncomment
    $cordovaSQLite.execute(db, query).then(function (res) {
      for (var i = 0; i < res.rows.length; i++) {
        layerlist.push({
          layer_id: res.rows.item(i).layer_id,
          title: res.rows.item(i).layer_title,
          layer_type: res.rows.item(i).layer_type,
          last_sync: res.rows.item(i).last_sync,
        });

      }
    }, function (err) {
      console.error(err);
    });
    $scope.layerlist = layerlist;

    $scope.syncdata = function () {
      Loading.show('กำลังซิงค์ข้อมูล...');
      $scope.groupid = $window.localStorage.getItem('groupid');
      $scope.prms = $.param({
        username: $scope.loginData.username,
        groupid: $scope.groupid,
      });

      // alert($scope.groupid);
      ApiService.query('POST', 'http://landsportal.dol.go.th:82/dolapp/service/dolapp_layerlist', null, $scope.prms).then(function (respond) {
        angular.forEach(respond.data.layers, function (value, key) {
          //console.log(value);

          var query = "select * from layer where layer_id = " + value.id + ";";
          $cordovaSQLite.execute(db, query).then(function (res) {
            //console.log(res.rows.length);
            if (res.rows.length > 0) {
              if (value.status == 0) {
                var query2 = "UPDATE layer set status = ? where layer_id = ?;";
                $cordovaSQLite.execute(db, query2, [0, value.id]).then(function (res) {
                  //console.log("insertId: " + res);
                }, function (err) {
                  console.error(err);
                });
              }
              else {
                var query2 = "UPDATE layer set layer_title = ? , layer_type = ?  where layer_id = ?;";
                $cordovaSQLite.execute(db, query2, [value.title.trim(), value.layer_type.trim(), value.id]).then(function (res) {
                }, function (err) {
                  console.error(err);
                });
              }


              //

              $cordovaSQLite.execute(db, 'DELETE from meta').then(function (respond) {

                var layerid = value.id;
                $scope.prms2 = $.param({
                  layerid: value.id,
                });
                ApiService.query('POST', 'http://landsportal.dol.go.th:82/dolapp/service/dolapp_mobileattr', null, $scope.prms2).then(function (respond) {
                  angular.forEach(respond.data.metadata, function (value, key) {
                    var query3 = "INSERT INTO meta (layer_id,meta_title, meta_type,defult_value) VALUES (?,?,?,?)";
                    $cordovaSQLite.execute(db, query3, [layerid, value.attribute.trim(), value.attribute_type.trim(), value.unique_values.trim()]);
                  })
                });
              });

            }
            else {
              var query2 = "INSERT INTO layer (layer_id,layer_title, layer_type,status) VALUES (?,?,?,?)";
              $cordovaSQLite.execute(db, query2, [value.id, value.title.trim(), value.layer_type.trim(), 1]).then(function (res) {
                var layerid = value.id;
                $scope.prms2 = $.param({
                  layerid: value.id,
                });
                ApiService.query('POST', 'http://landsportal.dol.go.th:82/dolapp/service/dolapp_mobileattr', null, $scope.prms2).then(function (respond) {
                  angular.forEach(respond.data.metadata, function (value, key) {
                    var query3 = "INSERT INTO meta (layer_id,meta_title, meta_type,defult_value) VALUES (?,?,?,?)";
                    $cordovaSQLite.execute(db, query3, [layerid, value.attribute.trim(), value.attribute_type.trim(), value.unique_values.trim()]);
                  })
                });


                $scope.prms3 = $.param({
                  layerid: value.id,
                  userid: userid,
                });

                ApiService.query('POST', 'http://landsportal.dol.go.th:82/dolapp/service/dolapp_mobilelayerdata', null, $scope.prms3).then(function (respond) {
                  angular.forEach(respond.data.metadata, function (value, key) {
                    var querylayer = "select * from layer_data where refid = '" + value.id + "' and userid = '" + userid + "';";

                    $cordovaSQLite.execute(db, querylayer).then(function (res) {
                      if (res.rows.length == 0) {
                        var query4 = "INSERT INTO layer_data (layer_id,point,line,polygon,metadata,moremetadata,userid,refid,video,image,ispushtoserver) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                        $cordovaSQLite.execute(db, query4,
                          [
                            value.layer_id
                            , value.json_point
                            , value.json_line
                            , value.json_polygon
                            , value.metadata
                            , value.moremetadata
                            , value.userid
                            , value.id
                            , value.videos
                            , value.images
                            , 0
                          ]
                        ).then(function (res) {
                          console.log(res);
                        }, function (err) {
                          console.error(err);
                        });

                      }
                    });


                  })
                });

              }, function (err) {
                console.error(err);
              });
            }

            var query = "select * from layer where status = 1;";
            var layerlist = [];
            $cordovaSQLite.execute(db, query).then(function (res) {
              for (var i = 0; i < res.rows.length; i++) {
                layerlist.push({
                  title: res.rows.item(i).layer_title,
                  layer_type: res.rows.item(i).layer_type,
                  last_sync: res.rows.item(i).last_sync,
                  layer_id: res.rows.item(i).layer_id,
                });

              }

            }, function (err) {
              console.error(err);
            });

            $scope.layerlist = layerlist;
          }, function (err) {
            console.error(err);
          });


        });

        Loading.hide();
        alert('ซิงค์ข้อมูลเรียบร้อย');
      });


    }


  })

  .controller('HowtoCtrl', function ($scope, $stateParams) {
  })

  .controller('SyncCtrl', function ($scope, $stateParams, Loading, $timeout, $cordovaSQLite, ApiService, $window, $rootScope, $cordovaCamera, $q) {
    var user = $window.localStorage.getItem('user');
    var userid = $window.localStorage.getItem('userid');

    $scope.sync = function () {
      var query = "select * from layer_data where ispushtoserver = 0 and status != 0;";
      $scope.allprogress = 0;
      $scope.alldata = [];
      $cordovaSQLite.execute(db, query).then(function (res) {
        $scope.alldata = res.rows;

        $scope.allprogress = res.rows.length;
      }, function (err) {
        console.error(err);
      });
    }


    $scope.$on('$ionicView.loaded', function (event) {
      $scope.sync();
    });


    $scope.doSync = function () {
      if ($scope.alldata.length > 0) {
        Loading.show('กำลังซิงค์ข้อมูล...');
        // console.log($scope.alldata);


        $scope.i = 0;                     //  set your counter to 1
        function myLoop() {           //  create a loop function
          setTimeout(function () {    //  call a 3s setTimeout when the loop is called
            $scope.prms2 = $.param({
              refid: $scope.alldata.item($scope.i).refid,
              layerid: $scope.alldata.item($scope.i).layer_id,
              point: $scope.alldata.item($scope.i).point,
              line: $scope.alldata.item($scope.i).line,
              polygon: $scope.alldata.item($scope.i).polygon,
              metadata: $scope.alldata.item($scope.i).metadata,
              moremetadata: $scope.alldata.item($scope.i).moremetadata,
              userid: userid,
            });
            ApiService.query('POST', 'http://landsportal.dol.go.th:82/dolapp/service/dolapp_syncdatatoserver', null, $scope.prms2).then(function (respond) {
              //console.log(respond.data);
              if (respond.data.result == true) {
                var layerid = $scope.alldata.item($scope.i).id;
                if ($scope.alldata.item($scope.i).image != "" && $scope.alldata.item($scope.i).image != null) {
                  var fileURL = 'cdvfile://localhost/persistent/' + $scope.alldata.item($scope.i).image;
                  var fileVideoURL = 'cdvfile://localhost/persistent/' + $scope.alldata.item($scope.i).video;
                  console.log(fileURL);
                  console.log(fileVideoURL);

                  var win = function (r) {
                    console.log("Code = " + r.responseCode);
                    console.log("Response = " + r.response);
                    console.log("Sent = " + r.bytesSent);
                    var result = JSON.parse(r.response)
                    console.log("result = " + result.result);
                    if (result.result == true) {
                      nextstep(result.refid, layerid);
                    }

                  }

                  var fail = function (error) {
                    //alert("An error has occurred: Code = " + error.code);
                    console.log("upload error source " + error.source);
                    console.log("upload error target " + error.target);
                    //Loading.hide();
                    nextstep($scope.alldata.item($scope.i).refid, layerid);
                  }


                  function nextstep(refid, layerid) {
                    var query2 = "UPDATE layer_data set ispushtoserver = ?,refid = ? where id = ?;";
                    //console.log(layerid);
                    $cordovaSQLite.execute(db, query2, [1, refid, layerid]);

                    $scope.i++;                     //  increment the counter
                    if ($scope.i < $scope.alldata.length) {            //  if the counter < 10, call the loop function
                      myLoop();             //  ..  again which will trigger another
                    }

                    if ($scope.i == $scope.alldata.length) {
                      Loading.hide();
                      $scope.sync();
                    }
                  }

                  var options = new FileUploadOptions();
                  options.fileKey = "file";
                  options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
                  options.mimeType = "text/plain";


                  var params = {};
                  params.imagename = $scope.alldata.item($scope.i).image;
                  params.refid = $scope.alldata.item($scope.i).refid;
                  params.layerid = $scope.alldata.item($scope.i).layer_id;
                  params.point = $scope.alldata.item($scope.i).point;
                  params.line = $scope.alldata.item($scope.i).line;
                  params.polygon = $scope.alldata.item($scope.i).polygon;
                  params.metadata = $scope.alldata.item($scope.i).metadata;
                  params.moremetadata = $scope.alldata.item($scope.i).moremetadata;
                  params.userid = userid;

                  options.params = params;

                  var ft = new FileTransfer();

                  if ($scope.alldata.item($scope.i).video != "" && $scope.alldata.item($scope.i).video != null) {
                    ft.upload(fileURL, encodeURI("http://landsportal.dol.go.th:82/dolapp/service/dolapp_syncdatatoserver"), null, null, options);
                    var options = new FileUploadOptions();
                    options.fileKey = "video";
                    options.fileName = fileVideoURL.substr(fileVideoURL.lastIndexOf('/') + 1);
                    options.mimeType = "text/plain";

                    var params = {};
                    params.imagename = $scope.alldata.item($scope.i).image;
                    params.videos = $scope.alldata.item($scope.i).video;
                    params.refid = $scope.alldata.item($scope.i).refid;
                    params.layerid = $scope.alldata.item($scope.i).layer_id;
                    params.point = $scope.alldata.item($scope.i).point;
                    params.line = $scope.alldata.item($scope.i).line;
                    params.polygon = $scope.alldata.item($scope.i).polygon;
                    params.metadata = $scope.alldata.item($scope.i).metadata;
                    params.moremetadata = $scope.alldata.item($scope.i).moremetadata;
                    params.userid = userid;

                    options.params = params;

                    var ft = new FileTransfer();
                    ft.upload(fileVideoURL, encodeURI("http://landsportal.dol.go.th:82/dolapp/service/dolapp_syncdatatoserver"), win, fail, options);

                  }
                  else {
                    ft.upload(fileURL, encodeURI("http://landsportal.dol.go.th:82/dolapp/service/dolapp_syncdatatoserver"), win, fail, options);
                  }

                }
                else {
                  var query2 = "UPDATE layer_data set ispushtoserver = ?,refid = ? where id = ?;";
                  $cordovaSQLite.execute(db, query2, [1, respond.data.refid, $scope.alldata.item($scope.i).id]);

                  $scope.i++;                     //  increment the counter
                  if ($scope.i < $scope.alldata.length) {            //  if the counter < 10, call the loop function
                    myLoop();             //  ..  again which will trigger another
                  }

                  if ($scope.i == $scope.alldata.length) {
                    Loading.hide();
                    $scope.sync();
                  }
                }

              }


            });
          }, 300)
        }

        myLoop();
      }
      else {

      }


    };


  })

  .controller('MapSetOfflineCtrl', function ($scope, $stateParams, Loading, $cordovaGeolocation, $ionicActionSheet, $q) {
    $scope.tilelayers = [];
    $scope.currentlat = 13.764895;
    $scope.currentllng = 100.538275;
    $scope.map = {
      eeuu: {
        lat: 13.764895,
        lng: 100.538275,
        zoom: 15
      },
      tiles: {
        url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      },
      layers: {
        baselayers: {
          xyz: {
            name: 'OpenStreetMap (XYZ)',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            type: 'xyz'
          }
        },
        overlays: {}
      },
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
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


    $scope.map.center = {
      lat: 13.764895,
      lng: 100.538275,
      zoom: 15
    };

    /** Converts numeric degrees to radians */
    function toRad(val) {
      return val * Math.PI / 180;
    }

    function getTileURL(lat, lon, zoom) {

      var xtile = parseInt(Math.floor((lon + 180) / 360 * (1 << zoom)));
      var ytile = parseInt(Math.floor((1 - Math.log(Math.tan(toRad(lat)) + 1 / Math.cos(toRad(lat))) / Math.PI) / 2 * (1 << zoom)));
      //return "" + zoom + "/" + xtile + "/" + ytile;
      var maxlayer = 4;
      var alltile = [];
      var tile = zoom + "/" + xtile + "/" + ytile;
      alltile.push(tile);
      for (var x = 1; x <= maxlayer; x++) {
        var tileskip = zoom + "/" + (xtile + x) + "/" + ytile;
        alltile.push(tileskip);
      }

      for (var x = 1; x <= maxlayer; x++) {
        var tileskip = zoom + "/" + (xtile - x) + "/" + ytile;
        alltile.push(tileskip);
      }

      for (var x = 1; x <= maxlayer; x++) {
        var tileskip = zoom + "/" + (xtile + x) + "/" + (ytile + x);
        alltile.push(tileskip);
      }

      for (var x = 1; x <= maxlayer; x++) {
        var tileskip = zoom + "/" + (xtile - x) + "/" + (ytile - x);
        alltile.push(tileskip);
      }


      for (var x = 1; x <= maxlayer; x++) {
        var tileskip = zoom + "/" + (xtile - x) + "/" + (ytile + x);
        alltile.push(tileskip);
      }

      for (var x = 1; x <= maxlayer; x++) {
        var tileskip = zoom + "/" + (xtile + x) + "/" + (ytile - x);
        alltile.push(tileskip);
      }


      for (var y = 1; y <= maxlayer; y++) {
        var tileskip = zoom + "/" + xtile + "/" + (ytile + y);
        alltile.push(tileskip);
      }

      for (var y = 1; y <= maxlayer; y++) {
        var tileskip = zoom + "/" + xtile + "/" + (ytile - y);
        alltile.push(tileskip);
      }


      for (var y = 1; y <= maxlayer; y++) {
        var tileskip = zoom + "/" + (xtile + y) + "/" + (ytile + y);
        alltile.push(tileskip);
      }

      for (var y = 1; y <= maxlayer; y++) {
        var tileskip = zoom + "/" + (xtile - y) + "/" + (ytile - y);
        alltile.push(tileskip);
      }

      for (var y = 1; y <= maxlayer; y++) {
        var tileskip = zoom + "/" + (xtile - y) + "/" + (ytile + y);
        alltile.push(tileskip);
      }

      for (var y = 1; y <= maxlayer; y++) {
        var tileskip = zoom + "/" + (xtile + y) + "/" + (ytile - y);
        alltile.push(tileskip);
      }


      return alltile;
    }


    $scope.$watch("map.center", function (center) {
      var tileresult = [];
      for (var z = 15; z <= 18; z++) {
        tileresult.push(getTileURL(center.lat, center.lng, z));
        //$scope.tilelayers = getTileURL(center.lat, center.lng, z);
      }

      $scope.tilelayers = tileresult;
    });

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
          $scope.currentlat = position.coords.latitude;
          $scope.currentlng = position.coords.longitude;

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
          Loading.hide();
        });
    }

    function saveImageToPhone(url, file, index, index0) {

      var plat = ionic.Platform.device();
      var deferred = $q.defer();
      var url = url;

      var fileTransfer = new FileTransfer();
      var uri = encodeURI(url);

      fileTransfer.download(
        uri,
        'cdvfile://localhost/persistent/' + file + '.png',
        function (entry) {
          console.log(entry);
          deferred.resolve(index + ',' + index0);

        },
        function (error) {
          console.log("error");
          deferred.resolve(index + ',' + index0);

        },
        true
      );

      return deferred.promise;
    }


    $scope.actionsheetshow = function () {

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: 'บันทึกแผนที่หน้าจอ' }, { text: 'ใช้ Offline map' }, { text: 'ใช้ Online map' }
        ],
        titleText: 'ตั้งค่าแผนที่ออฟไลน์',
        cancelText: 'Cancel',
        cancel: function () {
          // add cancel code..
        },
        buttonClicked: function (index) {
          if (index == 0) {
            console.log($scope.tilelayers);

            Loading.show('กรุณารอสักครู่...');


            for (var i = 0; i < $scope.tilelayers.length; i++) {
              var eachtile = $scope.tilelayers[i];
              for (var j = 0; j < eachtile.length; j++) {
                var imageurl = "http://tile.openstreetmap.org/" + eachtile[j] + ".png";
                var imagename = eachtile[j].replace(/\//g, "_");

                saveImageToPhone(imageurl, imagename, j, i).then(function (rs) {
                  //console.log('i=',rs.split(',')[1] );
                  //   console.log('tilelayers= ',$scope.tilelayers.length);
                  //   console.log('j=',j);
                  //   console.log('eachtile=',eachtile.length);
                  if (rs.split(',')[1] == $scope.tilelayers.length - 1 && rs.split(',')[0] == eachtile.length - 1) {
                    console.log('end==========');
                    Loading.hide();
                    alert('บันทึกเสร็จสิ้น');
                  }
                });
              }

            }
          }
          else if (index == 1) {
            $scope.map.tiles = {
              url: 'cdvfile://localhost/persistent/{z}_{x}_{y}.png'
            }

            //var plat = ionic.Platform.device();
            //if (plat == "iOS") {
            //  resolveLocalFileSystemURL(cordova.file.dataDirectory, function (entry) {
            //    console.log('cdvfile URI: ' + entry.toInternalURL());
            //    $scope.image = entry.toInternalURL();
            //    $scope.map.tiles = {
            //      url: 'cdvfile://localhost/persistent/{z}_{x}_{y}.png'
            //    }
            //
            //  });
            //} else {
            //  resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function (entry) {
            //    console.log('cdvfile URI: ' + entry.toInternalURL());
            //    $scope.image = entry.toInternalURL();
            //    $scope.map.tiles = {
            //      url: entry.toInternalURL() + '/{z}_{x}_{y}.png'
            //    }
            //
            //  });
            //
            //}


          }
          else if (index == 2) {
            $scope.map.tiles = {
              url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }

          }
          else {
            hideSheet();
          }
          return true;
        }
      });

    };

  })

  .controller('MapDetailCtrl', function ($scope, $stateParams, $cordovaSQLite, $ionicHistory, $state, Loading, $window, $cordovaCamera, $q, $sce) {

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    }


    var user = $window.localStorage.getItem('user');
    var userid = $window.localStorage.getItem('userid');

    $scope.imagename = "";
    $scope.videoname = "";
    var metalist = [];
    $scope.meta = [];
    $scope.eatchfield = [];
    var query = "select * from meta where layer_id = " + $stateParams.obj.id + ";";
    $cordovaSQLite.execute(db, query).then(function (res) {
      $scope.meta = [];

      for (var i = 0; i < res.rows.length; i++) {
        metalist.push(res.rows.item(i));
      }

      $scope.meta = metalist;
    }, function (err) {
      console.error(err);
    });

    $scope.moremeta = [];
    $scope.addmeta = function () {
      $scope.moremeta.push({ value: null });
    }


    if ($stateParams.obj.mode == "edit") {
      //$scope.images = "";
      var query = "select * from layer_data where id = " + $stateParams.obj.layer_id + ";";
      $cordovaSQLite.execute(db, query).then(function (res) {
        var metadata = res.rows.item(0).metadata;
        var moremetadata = res.rows.item(0).moremetadata;
        $scope.imagename = res.rows.item(0).image;
        $scope.videoname = res.rows.item(0).video;



        $scope.moremeta = [];
        if (moremetadata != null) {
          var morefeild = moremetadata.split('|');
          //alert(moremetadata);
          if (morefeild.length > 0) {
            for (i = 0; i < morefeild.length; i++) {
              var data = morefeild[i];
              $scope.moremeta.push({ value: data });
            }
          }
        }



        $scope.addmeta = function () {
          $scope.moremeta.push({ value: null });
        }



        var feild = metadata.split('|');
        var eachfield = [];
        for (i = 0; i < feild.length; i++) {
          var data = feild[i].split(';');
          eachfield.push({ title: data[0], value: data[1] });
        }
        $scope.eatchfield = eachfield;


        if ($scope.imagename != null) {

          $scope.images = 'cdvfile://localhost/persistent/' + $scope.imagename;
          console.log($scope.images);
        }

        if ($scope.videoname != null) {

          $scope.videos = 'cdvfile://localhost/persistent/' + $scope.videoname;
          console.log($scope.videos);
        }

      }, function (err) {
        console.error(err);
      });
    }

    $scope.mapval = function (eachfield, title) {
      var pos = eachfield.map(function (e) {
        return e.title;
      }).indexOf(title);
      if (pos != -1) {
        return eachfield[pos].value;
      }
      else {
        return "";
      }

    }


    $scope.savedate = function () {
      Loading.show('กรุณารอสักครู่...');
      var path = $stateParams.obj.path.p1.latlngs;
      for (i = 0; i < path.length; i++) {
        delete path[i].draggable;
      }

      var stringToBeInserted = JSON.stringify(path);
      var allmeta = "";
      var i = 0;
      $("input[name^='txtmeta']").each(function () {
        allmeta += metalist[i].meta_title + ";" + $(this).val() + "|";
        i++;
      });

      //$scope.moremeta เพิ่ม

      var strmoremeta = "";
      var i = 0;
      $("input[name^='txtmoremeta']").each(function () {
        strmoremeta += $(this).val() + "|";
        i++;
      });




      //console.log($stateParams.obj.id);
      //console.log(stringToBeInserted);
      //console.log(allmeta.slice("|", -1));

      if ($stateParams.obj.mode == "edit") {

        var query2 = "UPDATE layer_data set point = ?, line = ?,polygon = ? ,metadata = ?,moremetadata = ?,ispushtoserver = ?,image = ?,video = ? where id = ?;";
        switch ($stateParams.obj.type) {
          case "POINT":
            $cordovaSQLite.execute(db, query2, [stringToBeInserted, '', '', allmeta.slice("|", -1), strmoremeta.slice("|", -1), 0, $scope.imagename, $scope.videoname, $stateParams.obj.layer_id]);
            break;
          case "LINE":
            $cordovaSQLite.execute(db, query2, ['', stringToBeInserted, '', allmeta.slice("|", -1), strmoremeta.slice("|", -1), 0, $scope.imagename, $scope.videoname, $stateParams.obj.layer_id]);
            break;
          case "POLYGON":
            $cordovaSQLite.execute(db, query2, ['', '', stringToBeInserted, allmeta.slice("|", -1), strmoremeta.slice("|", -1), 0, $scope.imagename, $scope.videoname, $stateParams.obj.layer_id]);
            break;
        }
      }
      else {
        var query3 = "INSERT INTO layer_data (layer_id,point, line,polygon,metadata,moremetadata,ispushtoserver,userid,image,video) VALUES (?,?,?,?,?,?,?,?,?,?)";
        switch ($stateParams.obj.type) {
          case "POINT":
            $cordovaSQLite.execute(db, query3, [$stateParams.obj.id, stringToBeInserted, '', '', allmeta.slice("|", -1), strmoremeta.slice("|", -1), 0, userid, $scope.imagename, $scope.videoname]);
            break;
          case "LINE":
            $cordovaSQLite.execute(db, query3, [$stateParams.obj.id, '', stringToBeInserted, '', allmeta.slice("|", -1), strmoremeta.slice("|", -1), 0, userid, $scope.imagename, $scope.videoname]);
            break;
          case "POLYGON":
            //console.log(query3);
            //console.log($stateParams.obj.id);
            //console.log(stringToBeInserted);
            //console.log( allmeta.slice("|", -1));
            $cordovaSQLite.execute(db, query3, [$stateParams.obj.id, '', '', stringToBeInserted, allmeta.slice("|", -1), strmoremeta.slice("|", -1), 0, userid, $scope.imagename, $scope.videoname]);
            break;
        }
      }

      //Loading.hide();
      //$ionicHistory.nextViewOptions({
      //  historyRoot: true
      //});

      setTimeout(function () {
        Loading.hide();
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go('app.maplist');
      }, 3000);


    }


    function UniqueValue() {
      var date = new Date();
      return date.toISOString().replace(/[^0-9]/g, "");
    }



    $scope.selImages = function () {

      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        targetWidth: 800,
        targetHeight: 800
      };

      $cordovaCamera.getPicture(options).then(function (imageUri) {
        //$scope.images = "";
        if (ionic.Platform.isAndroid()) {
          imageUri = imageUri.split("?")[0];
        }
        console.log('img', imageUri);
        var file_name_array = imageUri.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        $scope.imagename = 'imagelayer_' + UniqueValue() + '_' + $stateParams.obj.layer_id + "." + file_extension;


        saveImageToPhone(imageUri, $scope.imagename).then(function (fileurl) {
          console.log(fileurl);
          $scope.images = fileurl;
        });

        //$scope.sync();
        //console.log($scope.images);
      }, function (err) {
        //console.log(error);
      });


      function saveImageToPhone(url, file) {

        var deferred = $q.defer();
        var url = url;

        var fileTransfer = new FileTransfer();
        var uri = encodeURI(url);
        console.log('uri', uri);
        fileTransfer.download(
          uri,
          'cdvfile://localhost/persistent/' + file,
          function (entry) {
            //console.log('entry' + entry.toURL());
            deferred.resolve('cdvfile://localhost/persistent/' + file);

          },
          function (error) {
            console.log("error");
            deferred.resolve(false);

          },
          true
        );

        return deferred.promise;
      }


    };


    $scope.selVideos = function () {

      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.VIDEO
      };

      $cordovaCamera.getPicture(options).then(function (imageUri) {
        //$scope.images = "";
        console.log('img', imageUri);
        var file_name_array = imageUri.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        $scope.videoname = 'imagelayer_' + UniqueValue() + '_' + $stateParams.obj.layer_id + "." + file_extension;

        saveImageToPhone(imageUri, $scope.videoname).then(function (fileurl) {
          console.log(fileurl);
          $scope.videos = fileurl;
        });

        //$scope.sync();
        console.log($scope.videos);
      }, function (err) {
        console.log(error);
      });


      function saveImageToPhone(url, file) {

        var deferred = $q.defer();
        var url = url;

        var fileTransfer = new FileTransfer();
        var uri = encodeURI(url);
        if (ionic.Platform.isAndroid()) {
          console.log('uri', 'file://' + uri);
          uri = 'file://' + uri;
        }

        fileTransfer.download(
          uri,
          'cdvfile://localhost/persistent/' + file,
          function (entry) {
            console.log('entry' + entry.toURL());
            deferred.resolve('cdvfile://localhost/persistent/' + file);

          },
          function (error) {
            console.log("error");
            deferred.resolve(false);

          },
          true
        );

        return deferred.promise;
      }


    };


  })

  .controller('LayerDetailCtrl', function ($scope, $stateParams) {
  })

  .controller('MapLayerDetailCtrl', function ($scope, $stateParams, Loading, $cordovaGeolocation, $ionicActionSheet, $timeout, $ionicLoading, $state, $ionicHistory, $cordovaSQLite, $window, $ionicPopup) {

    $scope.title = $stateParams.title;
    $scope.layer_id = $stateParams.id;
    $scope.layer_type = $stateParams.type;
    $scope.modestatus = "โหมดเพิ่มข้อมูล";
    var activelayer = $window.localStorage.getItem('activelayer');
    if (activelayer != null && activelayer != []) {
      activelayer = activelayer.split(',');
    }
    var plat = ionic.Platform.device();
    if (plat == "iOS") {
      resolveLocalFileSystemURL(cordova.file.dataDirectory, function (entry) {
        $scope.imageofflineurl = entry.toInternalURL();

        $scope.map = {
          eeuu: {
            lat: 39,
            lng: -100,
            zoom: 4
          },
          tiles: {
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          },
          layers: {
            baselayers: {
              xyz: {
                name: 'OpenStreetMap (XYZ)',
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                type: 'xyz'
              }
              ,
              recentimagery: {
                name: 'Digital Globe (Recent Imagery)',
                url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0mpda/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
                type: 'xyz'
              }
              , recent_imagery_with_streets: {
                name: 'Digital Globe (Recent Imagery with Streets)',
                url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0g75k/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
                type: 'xyz'
              }
              ,
              bingAerial: {
                name: 'Bing Aerial',
                type: 'bing',
                key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
                layerOptions: {
                  type: 'Aerial'
                }
              },
              bingRoad: {
                name: 'Bing Road',
                type: 'bing',
                key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
                layerOptions: {
                  type: 'Road'
                }
              },
              bingAerialWithLabels: {
                name: 'Bing Aerial With Labels',
                type: 'bing',
                key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
                layerOptions: {
                  type: 'AerialWithLabels'
                }
              }
              ,
              offlinemap: {
                name: 'Offline Map',
                url: 'cdvfile://localhost/persistent/{z}_{x}_{y}.png',
                type: 'xyz'
              }
            },
            overlays: {
              parcellat: {
                name: 'PARCEL',
                type: 'wms',
                url: 'http://wms.dol.go.th/dol/parcel/wms',
                visible: false,
                layerOptions: {
                  layers: 'PARCEL',
                  format: 'image/png',
                  opacity: 1,
                  //crs: L.CRS.EPSG900913
                }
              },
              ortho: {
                name: 'ORTHO',
                type: 'wms',
                url: 'http://wms.dol.go.th/dol/ortho/wms?',
                visible: false,
                layerOptions: {
                  layers: 'ORTHO_2554',
                  format: 'image/png',
                  opacity: 1,
                }
              },

            }
          },
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

        $scope.map.center = {
          lat: 13.764895,
          lng: 100.538275,
          zoom: 12
        };

        for (i = 0; i < activelayer.length; i++) {
          $scope.map.layers.overlays[activelayer[i]] = {
            name: activelayer[i],
            type: 'wms',
            visible: false,
            url: 'http://landsportal.dol.go.th/geoserver/dol/wms',
            layerParams: {
              layers: activelayer[i],
              format: 'image/png',
              transparent: true,
              opacity: .5,
            }
          };

        }




      });
    } else {
      resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function (entry) {
        $scope.imageofflineurl = entry.toInternalURL();

      $scope.map = {
        eeuu: {
          lat: 39,
          lng: -100,
          zoom: 4
        },
        tiles: {
          url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        },
        layers: {
          baselayers: {
            xyz: {
              name: 'OpenStreetMap (XYZ)',
              url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            recentimagery: {
              name: 'Digital Globe (Recent Imagery)',
              url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0mpda/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
              type: 'xyz'
            }
            , recent_imagery_with_streets: {
              name: 'Digital Globe (Recent Imagery with Streets)',
              url: 'https://{s}.tiles.mapbox.com/v4/digitalglobe.nal0g75k/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGlnaXRhbGdsb2JlIiwiYSI6ImNpeDE4a2o5aTAwMTQydG16MjlhOHU0dWQifQ.hArynlkvzaYizbf289K2Vg',
              type: 'xyz'
            },
            bingAerial: {
              name: 'Bing Aerial',
              type: 'bing',
              key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
              layerOptions: {
                type: 'Aerial'
              }
            },
            bingRoad: {
              name: 'Bing Road',
              type: 'bing',
              key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
              layerOptions: {
                type: 'Road'
              }
            },
            bingAerialWithLabels: {
              name: 'Bing Aerial With Labels',
              type: 'bing',
              key: 'AmzwjpBBf7NenPLj7C1wqtrfVng9GAST67AOlqnSX-xY-XUt3JJD0yYV1Csl1LcB',
              layerOptions: {
                type: 'AerialWithLabels'
              }
            }
            ,
            offlinemap: {
              name: 'Offline Map',
              url: 'cdvfile://localhost/persistent/{z}_{x}_{y}.png',
              type: 'xyz'
            }
          },
          overlays: {
            parcellat: {
              name: 'PARCEL',
              type: 'wms',
              url: 'http://wms.dol.go.th/dol/parcel/wms',
              visible: false,
              layerOptions: {
                layers: 'PARCEL',
                format: 'image/png',
                opacity: 1,
                //crs: L.CRS.EPSG900913
              }
            },
            ortho: {
              name: 'ORTHO',
              type: 'wms',
              url: 'http://wms.dol.go.th/dol/ortho/wms?',
              visible: false,
              layerOptions: {
                layers: 'ORTHO_2554',
                format: 'image/png',
                opacity: 1,
              }
            },

          }
        },
        defaults: {
          tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
          maxZoom: 18,
          zoomControlPosition: 'bottomleft'
        },
        markers: {},
        paths: {},
        events: {
          map: {
            enable: ['context'],
            logic: 'emit'
          }
        }
      };
      $scope.map.center = {
        lat: 13.764895,
        lng: 100.538275,
        zoom: 12
      };

      for (i = 0; i < activelayer.length; i++) {
        $scope.map.layers.overlays[activelayer[i]] = {
          name: activelayer[i],
          type: 'wms',
          visible: true,
          url: 'http://landsportal.dol.go.th/geoserver/dol/wms',
          layerParams: {
            layers: activelayer[i],
            format: 'image/png',
            transparent: true,
            opacity: .5,
          }
        };

      }

      });

    }


    //$scope.map = {
    //  eeuu: {
    //    lat: 39,
    //    lng: -100,
    //    zoom: 10
    //  },
    //  layers: {
    //    baselayers: {
    //      xyz: {
    //        name: 'OpenStreetMap (XYZ)',
    //        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    //        type: 'xyz'
    //      },
    //      googleTerrain: {
    //        name: 'Google Terrain',
    //        layerType: 'TERRAIN',
    //        type: 'google'
    //      },
    //      googleHybrid: {
    //        name: 'Google Hybrid',
    //        layerType: 'HYBRID',
    //        type: 'google'
    //      },
    //      googleRoadmap: {
    //        name: 'Google Streets',
    //        layerType: 'ROADMAP',
    //        type: 'google'
    //      }
    //    },
    //    overlays: {}
    //  },
    //  defaults: {
    //    tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    //    maxZoom: 20,
    //    zoomControlPosition: 'bottomleft'
    //  },
    //  markers: {},
    //  paths: {},
    //  events: {
    //    map: {
    //      enable: ['context'],
    //      logic: 'emit'
    //    }
    //  }
    //};

    $scope.iscopy = false;
    $scope.actionsheetshow = function () {

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: 'คัดลอก Layer' },
          { text: 'ลบ Layer' }
        ],
        titleText: 'เพิ่มเติม',
        cancelText: 'Cancel',
        cancel: function () {
          // add cancel code..
        },
        buttonClicked: function (index) {
          if (index == 0) {
            $stateParams.mode = 'new';
            $scope.iscopy = true;
          }
          else if (index == 1) {
            deletelayer($stateParams.layer_id);
          }
          else {
            hideSheet();
          }
          return true;
        }
      });

    };

    function deletelayer(layerid) {
      $scope._layerid = layerid;
      $ionicPopup.show({
        title: 'แจ้งเตือน',
        subTitle: 'ยืนยันการลบ',
        scope: $scope,
        buttons: [
          { text: 'ยกเลิก', onTap: function (e) { return true; } },
          {
            text: '<b>ยืนยัน</b>',
            type: 'button-positive',
            onTap: function (e) {
              //alert("layer_id: " + $scope._layerid);
              var query2 = "UPDATE layer_data set status = ? where id = ?;";
              $cordovaSQLite.execute(db, query2, [0, $scope._layerid]).then(function (res) {
                setTimeout(function () {
                  $ionicHistory.nextViewOptions({
                    historyRoot: true
                  });
                  $state.go('app.maplist');
                }, 500);
              }, function (err) {
                console.error(err);
              });

            }
          },]
      });

    }

    $scope.back = function (isdone) {
      $ionicHistory.goBack();
    };

    var polygon = [];
    $scope.addpoint = function (isdone) {
      if ($scope.layer_type == 'POINT') {
        var path = [];
        var objs = [];

        if (isdone == -1) {
          path = [];
          objs = [];
          polygon = [];
          $scope.map.paths = {};
          $scope.map.markers = {};
        }
        else {
          if (isdone == 1) {
            if (polygon.length > 0) {
              $ionicHistory.nextViewOptions({
                historyRoot: false
              });
              $state.go('app.mapdetail', {
                obj: {
                  id: $scope.layer_id,
                  layer_id: $stateParams.layer_id,
                  type: $scope.layer_type,
                  path: $scope.map.paths,
                  mode: $stateParams.mode
                }
              })
            }
            else {
              alert('คุณยังไม่ได้เพิ่มจุด');
            }

          }
          else {
            var obj = {
              lat: $scope.map.center.lat,
              lng: $scope.map.center.lng
            };
          }


          if (obj != null) {
            polygon = [];
            polygon.push(obj);
            for (i = 0; i < polygon.length; i++) {
              objs[i] = polygon[i];
              path.push(polygon[i]);
              $scope.map.markers = objs;
            }

            $scope.map.paths = {
              p1: {
                latlngs: path,
              }
            };

          }
        }

      }

      if ($scope.layer_type == 'LINE') {
        var path = [];
        var objs = [];

        if (isdone == -1) {
          path = [];
          objs = [];
          polygon = [];
          $scope.map.paths = {};
          $scope.map.markers = {};
        }
        else {
          if (isdone == 1) {
            if (polygon.length > 1) {
              $ionicHistory.nextViewOptions({
                historyRoot: false
              });
              $state.go('app.mapdetail', {
                obj: {
                  id: $scope.layer_id,
                  layer_id: $stateParams.layer_id,
                  type: $scope.layer_type,
                  path: $scope.map.paths,
                  mode: $stateParams.mode
                }
              })
            }
            else {
              alert('ต้องเพิ่มอย่างน้อย 2 จุด');
            }

          }
          else {
            var obj = {
              lat: $scope.map.center.lat,
              lng: $scope.map.center.lng
            };
          }


          if (obj != null) {
            polygon.push(obj);
            for (i = 0; i < polygon.length; i++) {
              objs[i] = polygon[i];
              path.push(polygon[i]);
              $scope.map.markers = objs;
            }


            $scope.map.paths = {
              p1: {
                color: '#F00000',
                weight: 5,
                latlngs: path,
              }
            };


          }
        }

      }

      if ($scope.layer_type == 'POLYGON') {
        var path = [];
        var objs = [];

        if (isdone == -1) {
          path = [];
          objs = [];
          polygon = [];
          $scope.map.paths = {};
          $scope.map.markers = {};
        }
        else {
          if (isdone == 1) {
            if (polygon.length > 0) {
              var obj = polygon[0];
            }
            else {
              alert('คุณยังไม่ได้เพิ่มจุด');
            }

          }
          else {
            var obj = {
              lat: $scope.map.center.lat,
              lng: $scope.map.center.lng
            };
          }


          if (obj != null) {
            polygon.push(obj);
            for (i = 0; i < polygon.length; i++) {
              objs[i] = polygon[i];
              path.push(polygon[i]);
              $scope.map.markers = objs;
            }


            $scope.map.paths = {
              p1: {
                color: '#008000',
                weight: 2,
                latlngs: path,
              }
            };

            if (isdone == 1) {
              //console.log('next to add meta');
              //console.log($scope.map.paths);
              $ionicHistory.nextViewOptions({
                historyRoot: false
              });

              console.log({
                id: $scope.layer_id,
                layer_id: $stateParams.layer_id,
                type: $scope.layer_type,
                path: $scope.map.paths,
                mode: $stateParams.mode
              });

              $state.go('app.mapdetail', {
                obj: {
                  id: $scope.layer_id,
                  layer_id: $stateParams.layer_id,
                  type: $scope.layer_type,
                  path: $scope.map.paths,
                  mode: $stateParams.mode
                }
              })
            }
          }
        }

      }
    };

    if ($stateParams.mode == 'edit') {
      var query = "select * from layer_data where id = " + $stateParams.layer_id + ";";
      $cordovaSQLite.execute(db, query).then(function (res) {
        if ($scope.layer_type == 'POINT') {
          path = [];
          objs = [];
          polygon = JSON.parse(res.rows.item(0).point);
          for (i = 0; i < polygon.length; i++) {
            objs[i] = polygon[i];
            path.push(polygon[i]);
            objs[i].draggable = true;
            $scope.map.markers = objs;
          }
          $scope.map.paths = {
            p1: {
              latlngs: path,
            }
          };
          $scope.map.center = {
            lat: path[0].lat,
            lng: path[0].lng,
            zoom: 18
          };
        }
        if ($scope.layer_type == 'LINE') {
          path = [];
          objs = [];
          polygon = JSON.parse(res.rows.item(0).line);
          for (i = 0; i < polygon.length; i++) {
            objs[i] = polygon[i];
            path.push(polygon[i]);
            objs[i].draggable = true;
            $scope.map.markers = objs;
          }
          $scope.map.paths = {
            p1: {
              color: '#F00000',
              weight: 5,
              latlngs: path,
            }
          };
          $scope.map.center = {
            lat: path[0].lat,
            lng: path[0].lng,
            zoom: 18
          };

        }
        if ($scope.layer_type == 'POLYGON') {
          path = [];
          objs = [];
          polygon = JSON.parse(res.rows.item(0).polygon);
          for (i = 0; i < polygon.length; i++) {
            objs[i] = polygon[i];
            path.push(polygon[i]);
            objs[i].draggable = true;
            $scope.map.markers = objs;
          }
          $scope.map.paths = {
            p1: {
              color: '#008000',
              weight: 2,
              latlngs: path,
            }
          };
          $scope.map.center = {
            lat: path[0].lat,
            lng: path[0].lng,
            zoom: 18
          };
        }

      }, function (err) {
        console.error(err);
      });

    }
    if ($stateParams.mode == 'new') {
      //locate();
    }


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

          Loading.hide();
        });
    }
  });
