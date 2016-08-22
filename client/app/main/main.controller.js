'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function ($scope, $http, $window, $resource, $timeout) {

    //Variable Declarations

    $scope.message = "";
    $scope.audio = new Audio('../assets/audio/alert.mp3');
    $scope.isShown = false;
    $scope.time_start = new Date(moment());
    $scope.static_date = moment().format('MMMM Do YYYY');
    $scope.miss_ic = "../assets/images/miss_mark.png";
    $scope.complete_ic = "../assets/images/complete_unmark.png";
    $scope.isMiss = true;
    $scope.currentTime = moment().format('h:mm:ss a');

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY'),
        colors = Array("#F44336","#4CAF50", "#2196F3", "#FFC107"),
        num_colors = 4;

    //Initial Get of Data from server

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
        if($scope.meds.length == 0){
          angular.element('#no_task' ).css('display', 'inline');
        }
    });

    //Handles Events in the Banner

    $window.setInterval(function () {

        //Update Clock
        $scope.currentTime = moment().format('h:mm:ss a');
        $scope.$apply();
        var current = new Date(moment()),
            late = new Date(moment($scope.time_start).add(6, 'minutes'));

        //Close notif if more than 1 minute open (for missed only)
        if(late < current && $scope.isShown == true){
          $scope.close_notif();
        }
    }, 1000);

    angular.element('#indicator_missed').css('transform', 'scale(1)');
    angular.element('#indicator_completed').css('transform', 'scale(0)');

    $scope.change_list = function(complete){
      if(complete){
        angular.element('#miss_title').css('color', '#dddddd');
        angular.element('#complete_title').css('color', '#4CAF50');
        $scope.miss_ic = "../assets/images/miss_unmark.png";
        $scope.complete_ic = "../assets/images/complete_mark.png";
        $scope.isMiss = false;
        angular.element('#indicator_missed').css('transform', 'scale(0)');
        angular.element('#indicator_missed').css('background-color', '#dddddd');
        angular.element('#indicator_completed').css('transform', 'scale(1)');
        angular.element('#indicator_completed').css('background-color', '#43A047');
      }else{
        angular.element('#miss_title').css('color', '#F44336');
        angular.element('#complete_title').css('color', '#dddddd');
        $scope.miss_ic = "../assets/images/miss_mark.png";
        $scope.complete_ic = "../assets/images/complete_unmark.png";
        $scope.isMiss = true;
        angular.element('#indicator_missed').css('transform', 'scale(1)');
        angular.element('#indicator_missed').css('background-color', '#E53935');
        angular.element('#indicator_completed').css('transform', 'scale(0)');
        angular.element('#indicator_completed').css('background-color', '#dddddd');
      }
    }

    $scope.close_notif = function(){
      $("#notifs").css("display", "none");
      $scope.audio.pause();
      $scope.isShown = false;
    }

    $scope.varying_colors = function(i, length){
      return {
        "background-color": colors[(length-i)%num_colors]
      }
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

    $scope.set_complete = function(m, length, index, complete_length){
      var data = {
        completed: true,
        d:{

        }
      }

      $http({
          method: 'PUT',
          url: '/api/medications/' + m._id,
          data: JSON.stringify(data)
        })
        .then(function (success) {
        }, function (error) {
          errorCallback(error.data);
        });

        var div_id = '#to_do-' + index;
        angular.element('#to_do-0' ).css('opacity', '0');
        if(!$scope.isMiss){
          for(var i = 0; i < complete_length; i++){
              div_id = '#miss_comp-' + i;
              angular.element(div_id).css('transform', 'translateY(81px)');
          }
        }

        $timeout(function(){
          for(var i = 0; i < length; i++){
            if(i > index){
              div_id = '#to_do-' + i;
              angular.element(div_id).css('transform', 'translateY(-239px)');
            }
          }
        }, 500);

        $timeout(function(){
          $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
            $scope.meds = meds.data;
            if($scope.meds.length == 0){
              angular.element('#no_task').css('display', 'inline');
            }
          });
        }, 1500);
    }

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

    $scope.show_complete_btn = function(m, length, index, miss_length){
      var time_val = new Date(m.time),
          late = new Date(moment().subtract(5, 'minutes')),
          late_n = new Date(moment().subtract(5, 'minutes').subtract(1, 'seconds').subtract(50, 'milliseconds')),
          late_l = new Date(moment().subtract(5, 'minutes').subtract(2, 'seconds').subtract(50, 'milliseconds')),
          advance = new Date(moment().add(5, 'minutes')),
          current = new Date(moment()),
          current_l = new Date(moment().subtract(1, 'seconds'));
      if ($scope.ctr == 0){

        if(time_val >= current_l && time_val <= current){
          $scope.audio.pause();
          $scope.audio = new Audio('../assets/audio/alert.mp3');
          $scope.audio.play();
          $scope.message= "Time to administer "+ m.name + ". Make sure to only use "+ m.dosage + ". Also alert the storage if supplies is low.";
          $('#notifs').css('display', 'initial');
          $scope.isShown = true;
        }else if(time_val >= late_l && time_val <= late_n){
          $scope.audio.pause();
          $scope.audio = new Audio('../assets/audio/late.mp3');
          $scope.audio.play();
          $scope.message= "Uh-Oh You forgot to administer "+ m.name + " by "+ moment(time_val).format('h:mm:ss a') + ".";
          $('#notifs').css('display', 'initial');
          $scope.isShown = true;
          $scope.time_start = time_val;

          var div_id = '#to_do-' + index;
          angular.element('#to_do-0' ).css('opacity', '0');

          if($scope.isMiss){
            for(var i = 0; i < miss_length; i++){
                div_id = '#miss_comp-' + i;
                angular.element(div_id).css('transform', 'translateY(81px)');
            }
          }

          $timeout(function(){
            for(var i = 0; i < length; i++){
              if(i > index){
                div_id = '#to_do-' + i;
                angular.element(div_id).css('transform', 'translateY(-239px)');
              }
            }
          }, 500);

          $timeout(function(){
            $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
              $scope.meds = meds.data;
              if($scope.meds.length == 0){
                angular.element('#no_task').css('display', 'inline');
              }
            });
          }, 1300);

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
                current = new Date(moment().subtract(5, 'minutes').subtract(2, 'seconds'));

            if (time >= current && items[i].completed == false)  {
                result.push(items[i]);
            }
        }
        return result;
      }else{
        return items;
      }
  };
});

angular.module('medicationReminderApp').filter("filter_missed", function() {
  return function(items, isMiss) {
      var result = [];
      if(isMiss){
        for (var i=0; i<items.length; i++){
            var time = new Date(items[i].time),
                current = new Date(moment().subtract(5, 'minutes').subtract(3, 'seconds').subtract(20, 'milliseconds'));

            if (time < current && items[i].completed == false)  {
                result.push(items[i]);
            }
        }
      }else{
        for (var i=0; i<items.length; i++){

            if (items[i].completed == true)  {
                result.push(items[i]);
            }
        }
      }
      return result;
  };
});
