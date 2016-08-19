'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function ($scope, $http, $window) {

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
        if($scope.meds.length == 0){
          angular.element('#no_task' ).css('display', 'inline');
        }
    });

    $scope.currentTime = moment().format('h:mm:ss a');

    $window.setInterval(function () {
        $scope.currentTime = moment().format('h:mm:ss a');
        $scope.$apply();
    }, 1000);

    $scope.ctr = 0;
    $scope.currentDate = "Today";

    $scope.increment = function(){
      angular.element('#no_task' ).css('display', 'none');
      $scope.ctr++;
      if($scope.ctr == 0){
        $scope.currentDate = "Today";
      }else{
        $scope.currentDate = moment().add($scope.ctr, 'day').format('MMMM Do YYYY');
      }
      var start = moment().add($scope.ctr, 'day').format('MM/DD/YYYY'),
          end = moment().add($scope.ctr + 1, 'day').format('MM/DD/YYYY');

      $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
          $scope.meds = meds.data;
          if($scope.meds.length == 0){
            angular.element('#no_task' ).css('display', 'inline');
          }
      });
    }

    $scope.decrement = function(){
      angular.element('#no_task' ).css('display', 'none');
      $scope.ctr--;
      if($scope.ctr == 0){
        $scope.currentDate = "Today";
      }else{
        $scope.currentDate = moment().add($scope.ctr, 'day').format('MMMM Do YYYY');
      }
      var start = moment().add($scope.ctr, 'day').format('MM/DD/YYYY'),
          end = moment().add($scope.ctr + 1, 'day').format('MM/DD/YYYY');

      $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        console.log($scope.meds);
          $scope.meds = meds.data;
          if($scope.meds.length == 0){
            console.log("LOL");
            angular.element('#no_task' ).css('display', 'inline');
          }
      });
    }


});

angular.module('medicationReminderApp').filter('cmdate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);
