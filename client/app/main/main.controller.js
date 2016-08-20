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
    $scope.isEnable = true;

    $scope.increment = function(){
      angular.element('#no_task' ).css('display', 'none');
      $scope.isEnable = false;
      $scope.ctr++;
      if($scope.ctr == 0){
        $scope.currentDate = "Today";
        $scope.isEnable = true;
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
      $scope.isEnable = false;
      $scope.ctr--;
      if($scope.ctr == 0){
        $scope.currentDate = "Today";
        $scope.isEnable = true;
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

    $scope.show_complete_btn = function(time){
      var time_val = new Date(time),
          late = new Date(moment().subtract(5, 'minutes')),
          advance = new Date(moment().add(5, 'minutes')),
          current = new Date(moment());
      if ($scope.ctr == 0){

        if(time_val == current){
          var audio = new Audio('../assets/audio/alert.mp3');
          audio.play();
        }else if(time_val == late){
          var audio = new Audio('../assets/audio/late.mp3');
          audio.play();
        }

        if(time_val >= late && time_val <= advance){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }

    $scope.set_bg_color = function(data){
      if ($scope.ctr == 0){
        var time_val = new Date(data.time),
            late = new Date(moment().subtract(5, 'minutes')),
            advance = new Date(moment().add(5, 'minutes'));

        if(time_val >= late && time_val <= advance){
          return {
                "background-color": "#FFEB3B"
            }
        }else{
          return {
                "background-color": "#4393B9"
            }
        }
      }else if($scope.ctr < 0){
        if(data.completed == true){
          return {
                "background-color": "#4CAF50"
            }
        }else{
          return {
                "background-color": "#F44336"
            }
        }

      }else{
        return {
              "background-color": "#4393B9"
          }
      }
    }


});

angular.module('medicationReminderApp').filter('cmdate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);

angular.module('medicationReminderApp').filter("filter_after", function() {
  return function(items, isEnable) {
      if(isEnable){
        var result = [];
        for (var i=0; i<items.length; i++){
            var time = new Date(items[i].time),
                current = new Date(moment().subtract(5, 'minutes'));

            if (time >= current)  {
                result.push(items[i]);
            }
        }
        return result;
      }else{
        return items;
      }
  };
});
