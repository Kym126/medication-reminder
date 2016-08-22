'use strict';

angular.module('medicationReminderApp').controller('MainCtrl', function ($scope, $http, $window, $resource, $timeout) {

    //Variable and Design Declarations and Initializations

    $scope.message = "";
    $scope.audio = new Audio('../assets/audio/alert.mp3');
    $scope.isShown = false;
    $scope.time_start = new Date(moment());
    $scope.static_date = moment().format('MMMM Do YYYY');
    $scope.miss_ic = "../assets/images/miss_mark.png";
    $scope.complete_ic = "../assets/images/complete_unmark.png";
    $scope.isMiss = true;
    $scope.currentTime = moment().format('h:mm:ss a');
    $scope.static_meds;
    $scope.status_text = "";
    $scope.greeting_text = "Goodmorning";
    $scope.user_name = "Kym";
    angular.element('#indicator_missed').css('transform', 'scale(1)');
    angular.element('#indicator_completed').css('transform', 'scale(0)');
    $scope.ctr = 0;
    $scope.currentDate = "Today";
    $scope.isEnable = true;

    var start = moment().format('MM/DD/YYYY'),
        end = moment().add(1, 'day').format('MM/DD/YYYY'),
        colors = Array("#F44336","#4CAF50", "#2196F3", "#FFC107"),
        num_colors = 4;

    //Initial Get of Data from server

    $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
        $scope.meds = meds.data;
        $scope.static_meds = meds.data;
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

    //Handles the change event for the missed and completed list (Title)
    //changes color, design, etc

    $scope.change_list = function(complete){
      if(complete){

        //If complete tab is active

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

        //If missed tab is active

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

    //Closes the notifications box

    $scope.close_notif = function(){
      $("#notifs").css("display", "none");
      $scope.audio.pause();
      $scope.isShown = false;
    }

    //Handles the changing of colors of the banners in missed and completed list

    $scope.varying_colors = function(i, length){
      return {
        "background-color": colors[(length-i)%num_colors]
      }
    }

    //Handles the sticking of the greeting banner

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


    //Updates the "completed" value of the meds object by PUT
    //Refreshes the lists by doing GET again
    //Handles the animations of the list of tasks

    $scope.set_complete = function(m, length, index, complete_length){

      //Set up the datas to be updated

      var data = {
        completed: true,
        d:{}
      }

      //PUT request to node.js

      $http({
          method: 'PUT',
          url: '/api/medications/' + m._id,
          data: JSON.stringify(data)
        })
        .then(function (success) {
        }, function (error) {
          errorCallback(error.data);
        });

        //animation for the to_do and miss_comp items (opacity and translation)

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

    //Increments the date and refreshes data using GET

    $scope.increment = function(){

      //Shows the no_task div if the meds array is empty

      angular.element('#no_task' ).css('display', 'none');

      //Update variables

      $scope.isEnable = false;
      $scope.ctr++;
      if($scope.ctr == 0){
        $scope.currentDate = "Today";
        $scope.isEnable = true;
      }else{
        $scope.currentDate = moment().add($scope.ctr, 'day').format('MMMM Do YYYY');
      }

      //Set the new range of time

      var start = moment().add($scope.ctr, 'day').format('MM/DD/YYYY'),
          end = moment().add($scope.ctr + 1, 'day').format('MM/DD/YYYY');

      //GET the new data values

      $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
          $scope.meds = meds.data;
          if($scope.meds.length == 0){
            angular.element('#no_task' ).css('display', 'inline');
          }
      });
    }

    //Decrements the date and refreshes data using GET

    $scope.decrement = function(){

      //Shows the no_task div if the meds array is empty

      angular.element('#no_task' ).css('display', 'none');

      //Update variables

      $scope.isEnable = false;
      $scope.ctr--;
      if($scope.ctr == 0){
        $scope.currentDate = "Today";
        $scope.isEnable = true;
      }else{
        $scope.currentDate = moment().add($scope.ctr, 'day').format('MMMM Do YYYY');
      }

      //Set the new range of time

      var start = moment().add($scope.ctr, 'day').format('MM/DD/YYYY'),
          end = moment().add($scope.ctr + 1, 'day').format('MM/DD/YYYY');

      //GET the new data values

      $http.get('/api/medications?start=' + start + '&end=' + end).then(function (meds) {
          $scope.meds = meds.data;
          if($scope.meds.length == 0){
            angular.element('#no_task' ).css('display', 'inline');
          }
      });
    }

    //Decides whether to show or hide the complete button on each task
    //Handles the animations of the missed and complete list
    //Activates the notif sounds and opens the notifications box

    $scope.show_complete_btn = function(m, length, index, miss_length){

      //Set all the nedded variables

      var time_val = new Date(m.time),
          late = new Date(moment().subtract(5, 'minutes')),
          late_n = new Date(moment().subtract(5, 'minutes').subtract(1, 'seconds').subtract(50, 'milliseconds')),
          late_l = new Date(moment().subtract(5, 'minutes').subtract(2, 'seconds').subtract(50, 'milliseconds')),
          advance = new Date(moment().add(5, 'minutes')),
          current = new Date(moment()),
          current_l = new Date(moment().subtract(1, 'seconds'));

      if ($scope.ctr == 0){

        if(time_val >= current_l && time_val <= current){

          //If the current day is today and the time data is equal to the current time
          //Start the audio and open the notifications box

          $scope.audio.pause();
          $scope.audio = new Audio('../assets/audio/alert.mp3');
          $scope.audio.play();
          $scope.message= "Time to administer "+ m.name + ". Make sure to only use "+ m.dosage + ". Also alert the storage if supplies is low.";
          $('#notifs').css('display', 'initial');
          $scope.isShown = true;
        }else if(time_val >= late_l && time_val <= late_n){

          //If the current day is today and the time data is 5 minutes more than the current time
          //Start the audio and open the notifications box


          $scope.audio.pause();
          $scope.audio = new Audio('../assets/audio/late.mp3');
          $scope.audio.play();
          $scope.message= "Uh-Oh You forgot to administer "+ m.name + " by "+ moment(time_val).format('h:mm:ss a') + ".";
          $('#notifs').css('display', 'initial');
          $scope.isShown = true;
          $scope.time_start = time_val;


          //Animates the to_do and miss_comp items (opacity, translate)
          //Refreshes the data by doing GET

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

    //Sets the color of the status bar on the task lists
    //Also shows the status (Missed and Completed) of previous task items

    $scope.set_bg_color = function(data){
      if ($scope.ctr == 0){
        //If list shown is for the current day
        //Set up the needed variables

        var time_val = new Date(data.time),
            late = new Date(moment().subtract(5, 'minutes')),
            late_l = new Date(moment().subtract(5, 'minutes').subtract(2, 'seconds')),
            advance = new Date(moment().add(5, 'minutes'));

        if(time_val >= late && time_val <= advance){

          //If task needs to be done ASAP

          return {
                "background-color": "#FFEB3B"
            }
        }else if (time_val >= late_l && time_val <= late){

          //If time to admisinister is 5 minutes after expected time

          return {
                "background-color": "#F44336"
            }
        }else{

          //If task doesn't need attaention for the moment

          return {
                "background-color": "#4393B9"
            }
        }

      }else if($scope.ctr < 0){

        //If list shown is for days before the current day
        //Show completed or missed status

        if(data.completed == true){
          $scope.status_text = "COMPLETED"
          return {
                "background-color": "#4CAF50"
            }
        }else{
          $scope.status_text = "MISSED"
          return {
                "background-color": "#F44336"
            }
        }

      }else{

        //If list shown is for days after the current day

        return {
              "background-color": "#4393B9"
          }
      }
    }

    //Sets the color of the (Missed, Completed) Status

    $scope.change_text_color = function(completed){
      if(completed){

        //If task is completed

        return {
              "color": "#4CAF50",
              "border-color": "#4CAF50"
          }
      }else{

        //If task is not completed

        return {
              "color": "#F44336",
              "border-color": "#F44336"
          }
      }
    }
});

//Used for formatting the date to be shown

angular.module('medicationReminderApp').filter('cmdate', [
    '$filter', function($filter) {
        return function(input, format) {
            return $filter('date')(new Date(input), format);
        };
    }
]);

//Filter the meds list to get all tasks after the current time

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

//Controls which items are shown in the missed and completed list

angular.module('medicationReminderApp').filter("filter_missed", function() {
  return function(items, isMiss) {
      var result = [];
      if(isMiss){

        //If missed tab is active

        for (var i=0; i<items.length; i++){
            var time = new Date(items[i].time),
                current = new Date(moment().subtract(5, 'minutes').subtract(3, 'seconds').subtract(20, 'milliseconds'));

            if (time < current && items[i].completed == false)  {
                result.push(items[i]);
            }
        }
      }else{

        //If completed tab is active

        for (var i=0; i<items.length; i++){

            if (items[i].completed == true)  {
                result.push(items[i]);
            }
        }
      }
      return result;
  };
});
