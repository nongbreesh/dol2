/**
 * Created by Breeshy on 7/3/2016 AD.
 */
angular.module('starter.services', [])
  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  })
  .factory('More', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      title: 'เกี่ยวกับเรา',
      menu: 'aboutus',
      image: 'img/ic_shop.png'
    }, {
      id: 1,
      title: 'ประกาศทางร้าน',
      menu: 'announce',
      image: 'img/ic_announce.png'
    }, {
      id: 2,
      title: 'คลังภาพ',
      menu: 'gallery',
      image: 'img/ic_gallery.png'
    }, {
      id: 3,
      title: 'ติดต่อเรา',
      menu: 'contact',
      image: 'img/ic_map.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  })
  .factory('GetDistance', function () {
    return {
      data: function (lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1 / 180
        var radlat2 = Math.PI * lat2 / 180
        var theta = lon1 - lon2
        var radtheta = Math.PI * theta / 180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180 / Math.PI
        dist = dist * 60 * 1.1515
        if (unit == "K") {
          dist = dist * 1.609344
        }
        if (unit == "N") {
          dist = dist * 0.8684
        }
        return dist
      }
    }
  })
  .factory('QueryService', function ($http, $q, apiUrl) {
    return {
      query: function (method, url, data) {
        var deferred = $q.defer();
        $http({
          method: method,
          url: apiUrl + url,
          data: $.param(data),
          headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
        }).then(function (data) {
          if (!data.config) {
            console.log('Server error occured.');
          }
          deferred.resolve(data);
        }, function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }
    };

  })
  .factory('ApiService', function ($http, $q) {
    return {
      query: function (method, url, params, data) {
        var deferred = $q.defer();
        $http({
          method: method,
          url: url,
          params: params,
          data: data
        }).then(function (data) {
          if (!data.config) {
            console.log('Server error occured.');
          }
          deferred.resolve(data);
        }, function (error) {
          deferred.reject(error);
        });

        return deferred.promise;
      }
    };

  })
  .factory('CallbackAPI', function (firebaseurl) {
    return {
      submit: function () {
        var myFirebaseRef = new Firebase(firebaseurl);
        myFirebaseRef.set({
          id: "0000001",
          title: "New Ordered",
          author: "App",
          date: Date.now(),
        });
      }
    };

  })
  .factory('Auth', function($firebaseAuth) {
    var endPoint = "https://rareukcafe.firebaseio.com/" ;
    var usersRef = new Firebase(endPoint);
    //return $firebaseAuth(usersRef);
    return usersRef;
  })
  .factory('Loading', function ($ionicLoading) {
    return {
      show: function (text) {
        $ionicLoading.show({
          template: '<ion-spinner icon="android"></ion-spinner><br/>' + text,
        });
      },
      hide: function () {
        $ionicLoading.hide();
      }
    };
  }).factory('Service', function ($http, $q) {
  return {
    getCategory: function () {
      var deferred = $q.defer();
      $http({
        url: 'http://underwhere.in/dishscan/service/load_group_list2',
        method: "POST"
      }).success(function (items) {
        deferred.resolve(items);
      });

      return deferred.promise;
    },
    getData: function () {
      var deferred = $q.defer();
      $http({
        url: 'http://api.underwhere.in/api/get_all_trips/',
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function (obj) {
          var str = [];
          for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: {limit: 10}
      }).success(function (items) {
        deferred.resolve(items);
      });

      return deferred.promise;
    }
  }
}).factory('StorageService', function ($localStorage) {
  var _getAll = function () {
    return $localStorage.things;
  };
  var _add = function (thing) {
    $localStorage.things.push(thing);
  }
  var _remove = function (thing) {
    $localStorage.things.splice($localStorage.things.indexOf(thing), 1);
  }
  return {
    getAll: _getAll,
    add: _add,
    remove: _remove
  };
}).service('cartAmount', function () {
  var property = 0;

  return {
    getProperty: function () {
      return property;
    },
    setProperty: function (value) {
      property = value;
    }
  };
}).service('digits', function () {
  return {
    value: function (input) {
      if (input < 10) {
        input = '0' + input;
      }

      return input;
    }
  }
}).service('genGUID', function ($q, $window, token, QueryService) {
  var value = "";


  return {
    value: function () {
      var deferred = $q.defer();


      var genDeviceID = function () {
        var deviceid = $window.localStorage.getItem('deviceid');
        if (deviceid == null) {
          var deviceid = guid();

          var Prms = {
            "token": token,
            "deviceid": deviceid
          };
          QueryService.query('POST', 'checkDeviceID', Prms).then(function (response) {
            console.log('device = ' + response.data.result);
            if (response.data.result == true) {

            }
            else {
              genDeviceID();
            }
          });

          deferred.resolve(deviceid);
        }
        else{
          var Prms = {
            "token": token,
            "deviceid": deviceid
          };
          QueryService.query('POST', 'checkDeviceID', Prms).then(function (response) {
            console.log('device = ' + response.data.result);
            if (response.data.result == true) {

            }
          });

          deferred.resolve(deviceid);
        }

      }

      genDeviceID();

      function guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }


      return deferred.promise;
    }
  };
});

