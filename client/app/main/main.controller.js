'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function ($scope, $http, $window, $resource) {

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY');

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
        if($scope.meds.length == 0){
          angular.element('#no_task' ).css('display', 'inline');
        }
    });

    $scope.message = "";
    $scope.audio = new Audio('../assets/audio/alert.mp3');

    $scope.close_notif = function(){
      $("#notifs").css("display", "none");
      $scope.audio.pause();
    }

    function sticky_relocate() {
      var window_top = $(window).scrollTop();
      var div_top = $('#sticky-anchor').offset().top;
      if (window_top+19 > div_top) {
          $('.kym_hero_unit').addClass('stick');
          $('#sticky-anchor').height($('.kym_hero_unit').outerHeight() -25);
      } else {
          $('.kym_hero_unit').removeClass('stick');
          $('#sticky-anchor').height(0);
      }
    }

    $(function() {
      $(window).scroll(sticky_relocate);
      sticky_relocate();
    });

    $('.kym_hero_unit').removeClass('stick');
    $('#sticky-anchor').height(0);

    var data = {
      time: moment().add(5, 'seconds').format(),
      d:{

      }
    }

    $http({
        method: 'PUT',
        url: '/api/medications/57b6360aa141fb1988c436a0',
        data: JSON.stringify(data)
      })
      .then(function (success) {
        callback(success);
      }, function (error) {
        errorCallback(error.data);
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

    $scope.show_complete_btn = function(m){
      var time_val = new Date(m.time),
          late = new Date(moment().subtract(5, 'minutes')),
          late_l = new Date(moment().subtract(5, 'minutes').subtract(1, 'seconds')),
          advance = new Date(moment().add(5, 'minutes')),
          current = new Date(moment()),
          current_l = new Date(moment().subtract(1, 'seconds'));
      if ($scope.ctr == 0){

        if(time_val >= current_l && time_val <= current){
          $scope.audio.pause();
          $scope.audio = new Audio('../assets/audio/alert.mp3');
          $scope.audio.play();
          $scope.message= "Time to administer "+ m.name + ". Make sure to use only "+ m.dosage + ".";
          $('#notifs').css('display', 'initial');
        }else if(time_val >= late_l && time_val <= late){
          $scope.audio.pause();
          $scope.audio = new Audio('../assets/audio/late.mp3');
          $scope.audio.play();
          $scope.message= "Uh-Oh You forgot to administer "+ m.name + " by "+ moment(time_val).format('h:mm:ss a') + ".";
          $('#notifs').css('display', 'initial');
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
            late_l = new Date(moment().subtract(5, 'minutes').subtract(2, 'seconds')),
            advance = new Date(moment().add(5, 'minutes'));

        if(time_val >= late && time_val <= advance){
          return {
                "background-color": "#FFEB3B"
            }
        }else if (time_val >= late_l && time_val <= late){
          return {
                "background-color": "#F44336"
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
                current = new Date(moment().subtract(5, 'minutes').subtract(1, 'seconds'));

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
