angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $ionicModal, $timeout, localStorageService, $ionicHistory, $ionicSideMenuDelegate, $state) {

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
    $scope.$on('layerchanged', function (event, args) {
      $scope.activelayer = args.title;
    });
    //
    //// Perform the login action when the user submits the login form
    $scope.doLogout = function () {
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      localStorageService.remove('user');
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

  .controller('landingCtrl', function ($scope, localStorageService, Loading, $timeout, $ionicHistory, $state) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $('.left-buttons').hide();
    $('.right-buttons').hide();
    var user = localStorageService.get('user');
    Loading.show('กรุณารอสักครู่');
    if (user) {
      loginsuccess();
    }
    else {
      $timeout(function () {
        Loading.hide();
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

  .controller('loginCtrl', function ($scope, $stateParams, LocationsService, $cordovaGeolocation, $ionicLoading, $ionicModal, $timeout, Loading, ApiService, $ionicSideMenuDelegate, $state, $ionicHistory, localStorageService) {
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
      ApiService.query('POST', 'http://192.168.1.33:82/dolapp/service/login', null, $scope.prms).then(function (respond) {
        console.log(respond.data);
        if (respond.data.result != null) {

          localStorageService.set('user', respond.data.result);
          loginsuccess();
        }
        else {
          alert('กรุณาตรวจสอบใหม่อีกครั้ง');
          Loading.hide();
        }

      });
    };


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

  .controller('MapCtrl', function ($scope, $stateParams, LocationsService, $cordovaGeolocation, $ionicLoading, $ionicModal, $timeout, Loading, ApiService, $ionicSideMenuDelegate) {
    $ionicSideMenuDelegate.canDragContent(true);
    $scope.map = {
      eeuu: {
        lat: 39,
        lng: -100,
        zoom: 4
      },
      layers: {
        baselayers: {
          xyz: {
            name: 'OpenStreetMap (XYZ)',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            type: 'xyz'
          },
          googleTerrain: {
            name: 'Google Terrain',
            layerType: 'TERRAIN',
            type: 'google'
          },
          googleHybrid: {
            name: 'Google Hybrid',
            layerType: 'HYBRID',
            type: 'google'
          },
          googleRoadmap: {
            name: 'Google Streets',
            layerType: 'ROADMAP',
            type: 'google'
          }
        },
        overlays: {}
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
    $scope.map.center = {};


    //locate();

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
          Loading.hide();
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

  .controller('LayerlistCtrl', function ($scope, $stateParams, ApiService, $cordovaSQLite, Loading, localStorageService) {
    var user = localStorageService.get('user');

    $scope.$on('$ionicView.loaded', function (event) {
      $scope.title = $stateParams.title;
      $scope.id = $stateParams.id;
      $scope.type = $stateParams.type;
      db = window.openDatabase("sqlite", "1.0", "dol", 2000);
      var query = "select * from layer_data where layer_id = " + $stateParams.id + " and userid = " + user.id + ";";
      var layerlist = [];
      $cordovaSQLite.execute(db, query).then(function (res) {
        angular.forEach(res.rows, function (value, key) {
          console.log(key + ': ' + value);
          layerlist.push({
            id: value.id,
            layer_id: value.layer_id,
            title: $scope.title,
            metadata: value.metadata,
            ispushtoserver: value.ispushtoserver,
            last_sync: value.last_sync,
          });
        });
      }, function (err) {
        console.error(err);
      });
      $scope.layerlist = layerlist;
    });


  })

  .controller('MaplistCtrl', function ($scope, $stateParams, ApiService, $cordovaSQLite, Loading, localStorageService) {
    var user = localStorageService.get('user');
    db = window.openDatabase("sqlite", "1.0", "dol", 2000);
    var query = "select * from layer where status = 1;";
    var layerlist = [];
    $cordovaSQLite.execute(db, query).then(function (res) {
      angular.forEach(res.rows, function (value, key) {
        console.log(key + ': ' + value);
        layerlist.push({
          layer_id: value.layer_id,
          title: value.layer_title,
          layer_type: value.layer_type,
          last_sync: value.last_sync,
        });
      });
    }, function (err) {
      console.error(err);
    });
    $scope.layerlist = layerlist;

    $scope.syncdata = function () {
      Loading.show('กำลังซิงค์ข้อมูล...');

      $scope.prms = $.param({
        username: $scope.loginData.username,
      });
      ApiService.query('POST', 'http://192.168.1.33:82/dolapp/service/dolapp_layerlist', null, $scope.prms).then(function (respond) {
        angular.forEach(respond.data.layers, function (value, key) {
          //console.log(value);

          var query = "select * from layer where layer_id = " + value.id + ";";
          $cordovaSQLite.execute(db, query).then(function (res) {
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
                console.log(respond);
                var layerid = value.id;
                $scope.prms2 = $.param({
                  layerid: value.id,
                });
                ApiService.query('POST', 'http://192.168.1.33:82/dolapp/service/dolapp_mobileattr', null, $scope.prms2).then(function (respond) {
                  angular.forEach(respond.data.metadata, function (value, key) {
                    var query3 = "INSERT INTO meta (layer_id,meta_title, meta_type,defult_value) VALUES (?,?,?,?)";
                    $cordovaSQLite.execute(db, query3, [layerid, value.attribute.trim(), value.attribute_type.trim(), value.unique_values.trim()]);
                  })
                });
              });


              //

            }
            else {
              var query2 = "INSERT INTO layer (layer_id,layer_title, layer_type,status) VALUES (?,?,?,?)";
              $cordovaSQLite.execute(db, query2, [value.id, value.title.trim(), value.layer_type.trim(), 1]).then(function (res) {
                var layerid = value.id;
                $scope.prms2 = $.param({
                  layerid: value.id,
                });
                ApiService.query('POST', 'http://192.168.1.33:82/dolapp/service/dolapp_mobileattr', null, $scope.prms2).then(function (respond) {
                  angular.forEach(respond.data.metadata, function (value, key) {
                    var query3 = "INSERT INTO meta (layer_id,meta_title, meta_type,defult_value) VALUES (?,?,?,?)";
                    $cordovaSQLite.execute(db, query3, [layerid, value.attribute.trim(), value.attribute_type.trim(), value.unique_values.trim()]);
                  })
                });


                $scope.prms3 = $.param({
                  layerid: value.id,
                  userid: user.id,
                });
                ApiService.query('POST', 'http://192.168.1.33:82/dolapp/service/dolapp_mobilelayerdata', null, $scope.prms3).then(function (respond) {
                  angular.forEach(respond.data.metadata, function (value, key) {

                    var querylayer = "select * from layer_data where refid = '" + value.id + "' and userid = '" + user.id + "';";
                    $cordovaSQLite.execute(db, querylayer).then(function (res) {
                      if (res.rows.length == 0) {
                        var query4 = "INSERT INTO layer_data (layer_id,point,line,polygon,metadata,userid,refid,video,image,ispushtoserver) VALUES (?,?,?,?,?,?,?,?,?,?)";
                        $cordovaSQLite.execute(db, query4,
                          [
                            value.layer_id
                            , value.json_point
                            , value.json_line
                            , value.json_polygon
                            , value.metadata
                            , value.userid
                            , value.id
                            , value.videos
                            , value.images
                            , 0
                          ]
                        ).then(function (res) {
                          // console.error(res);
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
              angular.forEach(res.rows, function (value, key) {
                console.log(key + ': ' + value);
                layerlist.push({
                  title: value.layer_title,
                  layer_type: value.layer_type,
                  last_sync: value.last_sync,
                  layer_id: value.layer_id,
                });
              });
            }, function (err) {
              console.error(err);
            });

            $scope.layerlist = layerlist;
          }, function (err) {
            console.error(err);
          });


        });

        Loading.hide();
      });


    }


  })

  .controller('HowtoCtrl', function ($scope, $stateParams) {
  })

  .controller('SyncCtrl', function ($scope, $stateParams, Loading, $timeout, $cordovaSQLite, ApiService, localStorageService) {
    var user = localStorageService.get('user');
    db = window.openDatabase("sqlite", "1.0", "dol", 2000);

    $scope.sync = function () {
      var query = "select * from layer_data where ispushtoserver = 0;";
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

        var i = 0;                     //  set your counter to 1
        function myLoop() {           //  create a loop function
          setTimeout(function () {    //  call a 3s setTimeout when the loop is called
            $scope.prms2 = $.param({
              refid: $scope.alldata[i].refid,
              layerid: $scope.alldata[i].layer_id,
              point: $scope.alldata[i].point,
              line: $scope.alldata[i].line,
              polygon: $scope.alldata[i].polygon,
              metadata: $scope.alldata[i].metadata,
              userid: user.id,
            });
            ApiService.query('POST', 'http://192.168.1.33:82/dolapp/service/dolapp_syncdatatoserver', null, $scope.prms2).then(function (respond) {
              //console.log(respond.data);
              if (respond.data.result == true) {
                var query2 = "UPDATE layer_data set ispushtoserver = ?,refid = ? where id = ?;";
                $cordovaSQLite.execute(db, query2, [1, respond.data.refid, $scope.alldata[i].id]);
              }
              i++;                     //  increment the counter
              if (i < $scope.alldata.length) {            //  if the counter < 10, call the loop function
                myLoop();             //  ..  again which will trigger another
              }

              if (i == $scope.alldata.length) {
                Loading.hide();
                $scope.sync();
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

  .controller('MapSetOfflineCtrl', function ($scope, $stateParams, Loading, $cordovaGeolocation, $ionicActionSheet,$q) {
    $scope.tilelayers = [];
    $scope.map = {
      eeuu: {
        lat: 13.764895,
        lng: 100.538275,
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
        },
        overlays: {}
      },
      tiles: {
        url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

      },
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        maxZoom: 15,
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


    //$scope.map.defaults = {
    //  tileLayer: 'img/mapTiles/{z}/{x}/{y}.png',
    //  maxZoom: 15,
    //  zoomControlPosition: 'bottomleft'
    //}


    $scope.map.center = {
      lat: 13.764895,
      lng: 100.538275,
      zoom: 11
    };

    /** Converts numeric degrees to radians */
    function toRad(val) {
      return val * Math.PI / 180;
    }

    function getTileURL(lat, lon, zoom) {
      var xtile = parseInt(Math.floor((lon + 180) / 360 * (1 << zoom)));
      var ytile = parseInt(Math.floor((1 - Math.log(Math.tan(toRad(lat)) + 1 / Math.cos(toRad(lat))) / Math.PI) / 2 * (1 << zoom)));
      //return "" + zoom + "/" + xtile + "/" + ytile;

      var alltile = [];
      var tile = zoom + "/" + xtile + "/" + ytile;
      alltile.push(tile);
      for (var x = 1; x <= 5; x++) {
        var tileskip = zoom + "/" + (xtile + x ) + "/" + ytile;
        alltile.push(tileskip);
      }

      for (var x = 1; x <= 5; x++) {
        var tileskip = zoom + "/" + (xtile - x ) + "/" + ytile;
        alltile.push(tileskip);
      }


      for (var y = 1; y <= 5; y++) {
        var tileskip = zoom + "/" + xtile + "/" + (ytile + y );
        alltile.push(tileskip);
      }

      for (var y = 1; y <= 5; y++) {
        var tileskip = zoom + "/" + xtile + "/" + (ytile - y );
        alltile.push(tileskip);
      }

      return alltile;
    }


    $scope.$watch("map.center", function (center) {
      $scope.tilelayers = getTileURL(center.lat, center.lng, center.zoom);
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

    //function saveImageToPhone(url, file) {
    //
    //  var plat = ionic.Platform.device();
    //  var deferred = $q.defer();
    //  var url = url;
    //  if (plat == "iOS") {
    //    var filePath = cordova.file.dataDirectory + "files/img/" + file;
    //  } else {
    //    var filePath = cordova.file.applicationStorageDirectory + "files/img/" + file;
    //  }
    //
    //  var fileTransfer = new FileTransfer();
    //  var uri = encodeURI(url);
    //
    //  fileTransfer.download(
    //    uri,
    //    "img/tilelayer",
    //    function (entry) {
    //      console.log(entry);
    //      deferred.resolve(true);
    //
    //    },
    //    function (error) {
    //      console.log("error");
    //      deferred.resolve(error);
    //
    //    },
    //    true
    //  );
    //
    //  return deferred.promise;
    //}

    //First step check parameters mismatch and checking network connection if available call    download function
    function DownloadFile(URL, Folder_Name, File_Name) {
//Parameters mismatch check
      if (URL == null && Folder_Name == null && File_Name == null) {
        return;
      }
      else {
        //checking Internet connection availablity
        //var networkState = navigator.connection.type;
        //if (networkState == Connection.NONE) {
        //  return;
        //} else {
        //  download(URL, Folder_Name, File_Name); //If available download function call
        //}

        download(URL, Folder_Name, File_Name); //If available download function call
      }
    }

    function download(URL, Folder_Name, File_Name) {
//step to request a file system
      document.addEventListener("deviceready", function() {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, error);
      }, false);

      function fileSystemSuccess(fileSystem) {
        var download_link = encodeURI(URL);
        ext = download_link.substr(download_link.lastIndexOf('.') + 1); //Get extension of URL

        var directoryEntry = fileSystem.root; // to get root path of directory
        directoryEntry.getDirectory(Folder_Name, { create: true, exclusive: false }, onDirectorySuccess, onDirectoryFail); // creating folder in sdcard
        var rootdir = fileSystem.root;
        var fp = rootdir.fullPath; // Returns Fulpath of local directory

        fp = fp + "/" + Folder_Name + "/" + File_Name + "." + ext; // fullpath and name of the file which we want to give
        // download function call
        filetransfer(download_link, fp);
      }

      function onDirectorySuccess(parent) {
        // Directory created successfuly
      }

      function onDirectoryFail(error) {
        //Error while creating directory
        console.log("Unable to create new directory: " + error.code);
      }

      function fileSystemFail(evt) {
        //Unable to access file system
        console.log(evt.target.error.code);
      }
    }


    $scope.actionsheetshow = function () {

      // Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          {text: 'บันทึกแผนที่หน้าจอ'},
        ],
        titleText: 'ตั้งค่าแผนที่ออฟไลน์',
        cancelText: 'Cancel',
        cancel: function () {
          // add cancel code..
        },
        buttonClicked: function (index) {
          if (index == 0) {

            for (var i = 0; i < $scope.tilelayers.length; i++) {
              var imageurl = "http://tile.openstreetmap.org/" + $scope.tilelayers[i] + ".png";
              var imagename = $scope.tilelayers[i].replace(/\//g, "_");

              DownloadFile(imageurl,'img/tilelayer',imagename);
              //DownloadFile(imageurl, imagename).then(function (rs) {
              //  if(rs){
              //    console.log(imageurl);
              //    //var query = "INSERT INTO tilelayer (tilevalue) VALUES (?)";
              //    //$cordovaSQLite.execute(db, query, [layerid, value.attribute.trim(), value.attribute_type.trim(), value.unique_values.trim()]);
              //  }
              //
              //});




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

  .controller('MapDetailCtrl', function ($scope, $stateParams, $cordovaSQLite, $ionicHistory, $state, Loading, localStorageService) {
    var user = localStorageService.get('user');
    // console.log($stateParams);
    var metalist = [];
    $scope.meta = [];
    $scope.eatchfield = [];
    var query = "select * from meta where layer_id = " + $stateParams.obj.id + ";";
    $cordovaSQLite.execute(db, query).then(function (res) {
      $scope.meta = res.rows.SQLResultSetRowList;
      angular.forEach(res.rows, function (value, key) {
        metalist.push(value);
      });
      $scope.meta = metalist;
    }, function (err) {
      console.error(err);
    });

    if ($stateParams.obj.mode == "edit") {
      var query = "select * from layer_data where id = " + $stateParams.obj.layer_id + ";";
      $cordovaSQLite.execute(db, query).then(function (res) {
        var metadata = res.rows[0].metadata
        var feild = metadata.split('|');
        var eachfield = [];
        for (i = 0; i < feild.length; i++) {
          var data = feild[i].split(';');
          eachfield.push({title: data[0], value: data[1]});
        }
        $scope.eatchfield = eachfield;


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

      //console.log($stateParams.obj.id);
      //console.log(stringToBeInserted);
      //console.log(allmeta.slice("|", -1));

      if ($stateParams.obj.mode == "edit") {

        var query2 = "UPDATE layer_data set point = ?, line = ?,polygon = ? ,metadata = ?,ispushtoserver = ? where id = ?;";


        switch ($stateParams.obj.type) {
          case "POINT":
            $cordovaSQLite.execute(db, query2, [stringToBeInserted, '', '', allmeta.slice("|", -1), 0, $stateParams.obj.layer_id]);
            break;
          case "LINE":
            $cordovaSQLite.execute(db, query2, ['', stringToBeInserted, '', allmeta.slice("|", -1), 0, $stateParams.obj.layer_id]);
            break;
          case "POLYGON":
            $cordovaSQLite.execute(db, query2, ['', '', stringToBeInserted, allmeta.slice("|", -1), 0, $stateParams.obj.layer_id]);
            break;
        }
      }
      else {
        var query3 = "INSERT INTO layer_data (layer_id,point, line,polygon,metadata,ispushtoserver,userid) VALUES (?,?,?,?,?,?,?)";
        switch ($stateParams.obj.type) {
          case "POINT":
            $cordovaSQLite.execute(db, query3, [$stateParams.obj.id, stringToBeInserted, '', '', allmeta.slice("|", -1), 0, user.id]);
            break;
          case "LINE":
            $cordovaSQLite.execute(db, query3, [$stateParams.obj.id, '', stringToBeInserted, '', allmeta.slice("|", -1), 0, user.id]);
            break;
          case "POLYGON":
            $cordovaSQLite.execute(db, query3, [$stateParams.obj.id, '', '', stringToBeInserted, allmeta.slice("|", -1), 0, user.id]);
            break;
        }
      }


      Loading.hide();
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });


      $state.go('app.maplist');
    }

  })

  .controller('LayerDetailCtrl', function ($scope, $stateParams) {
  })

  .controller('MapLayerDetailCtrl', function ($scope, $stateParams, Loading, $cordovaGeolocation, $ionicActionSheet, $timeout, $ionicLoading, $state, $ionicHistory, $cordovaSQLite) {
    db = window.openDatabase("sqlite", "1.0", "dol", 2000);
    //console.log($stateParams);
    $scope.title = $stateParams.title;
    $scope.layer_id = $stateParams.id;
    $scope.layer_type = $stateParams.type;
    $scope.modestatus = "โหมดเพิ่มข้อมูล";


    $scope.activetool = function (type) {
      alert(type);
    }


    $scope.map = {
      eeuu: {
        lat: 39,
        lng: -100,
        zoom: 10
      },
      layers: {
        baselayers: {
          xyz: {
            name: 'OpenStreetMap (XYZ)',
            url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            type: 'xyz'
          },
          googleTerrain: {
            name: 'Google Terrain',
            layerType: 'TERRAIN',
            type: 'google'
          },
          googleHybrid: {
            name: 'Google Hybrid',
            layerType: 'HYBRID',
            type: 'google'
          },
          googleRoadmap: {
            name: 'Google Streets',
            layerType: 'ROADMAP',
            type: 'google'
          }
        },
        overlays: {}
      },
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        maxZoom: 20,
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
          polygon = JSON.parse(res.rows[0].point);
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
          polygon = JSON.parse(res.rows[0].line);
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
          polygon = JSON.parse(res.rows[0].polygon);
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
      locate();
    }


    $scope.locate = function () {
      locate();
    };

    $scope.map.center = {
      lat: 13.765139,
      lng: 100.538393,
      zoom: 18
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
