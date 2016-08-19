'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function ($scope, $http, $window) {

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
    });

    $window.setInterval(function () {
        $scope.currentTime = moment().format('h:mm:ss a');
        $scope.$apply();
    }, 1000);

    $scope.ctr = 0;
    $scope.currentDate = moment().format('MMMM Do YYYY');

    $scope.increment = function(){
      $scope.ctr++;
      $scope.currentDate = moment().add($scope.ctr, 'day').format('MMMM Do YYYY');
      var start = moment().add($scope.ctr, 'day').format('MM/DD/YYYY'),
          end = moment().add($scope.ctr + 1, 'day').format('MM/DD/YYYY');

      $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
          $scope.meds = meds.data;
      });
    }

    $scope.decrement = function(){
      $scope.ctr--;
      $scope.currentDate = moment().add($scope.ctr, 'day').format('MMMM Do YYYY');
      var start = moment().add($scope.ctr, 'day').format('MM/DD/YYYY'),
          end = moment().add($scope.ctr + 1, 'day').format('MM/DD/YYYY');

      $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
          $scope.meds = meds.data;
      });
    }


});
