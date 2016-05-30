/**
 * Created by Daniel on 19.01.2016.
 */
(function () {
    'use strict';

    angular
        .module('DotAAnalyzerApp')
        .controller('lastmatchesCtrl', lastmatchesCtrl);

    lastmatchesCtrl.$inject = ['$scope', '$log', '$http', '$cookies'];

    function lastmatchesCtrl($scope, $log, $http, $cookies) {
        $scope.loggedIn = false;

        $scope.testee = function(){
            return "hi";
        }



        $scope.logout = function() {
            $cookies.remove('user');
            $scope.loginFunction();
        }

        $scope.loginFunction = function(){
            if ($cookies.get('user')){
                //console.log($cookies.get('user'));
                var obj = JSON.parse($cookies.get('user'));
                //console.log(obj);
                $scope.username = obj.displayName;
                $scope.loggedIn = true;
                $scope.steamID = obj.id;
            } else {
                $scope.message = "Not logged in";
                $scope.loggedIn = false;
            }
        }
        $scope.loginFunction();

        // Get Account ID
        var dataObj = {
            steamID : $scope.steamID
        };
        $http({
            method: 'POST',
            url: 'api/getAccountID',
            data: dataObj
        }).then(function successCallback(response) {
            $scope.accountID = response.data;
        }, function errorCallback(response) {
            console.log("Get AccountID failed.")
        });

        // Get latest matches
        var dataObj = {
            accountID : $scope.accountID
        };
        $http({
            method: 'POST',
            url: 'api/getPlayerMatches',
            data: dataObj
        }).then(function successCallback(response) {
            if (response.data == "notfound"){

            } else if (response.data == "false") {
                $scope.showAPIError = true;
            } else {
                //$scope.matches = response.data.result.matches;
                //console.log($scope.matches.result);
                //console.log($scope.matches.result.matches.length);
                //console.log($scope.matches.result.matches[0].match_id);
                $scope.matches = response.data.result.matches;
                console.log(response.data);
                console.log(response.data.result);
                console.log(response.data.result.matches);
                console.log($scope.matches[0].lobby_type);
                parseMatch();
            }
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        }).finally(function() {
            $scope.parsingMatch = false;
            console.log("FERTIG");
        });

        //var test1 = "{'result':{'status':1,'num_results':5,'total_results':500,'results_remaining':495,'matches':[{'match_id':2401236690,'match_seq_num':2101259138,'start_time':1464630975,'lobby_type':8,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':14},{'account_id':4294967295,'player_slot':128,'hero_id':9}]},{'match_id':2401234461,'match_seq_num':2101257033,'start_time':1464630901,'lobby_type':8,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':179188925,'player_slot':0,'hero_id':25},{'account_id':139929264,'player_slot':128,'hero_id':101}]},{'match_id':2401234027,'match_seq_num':2101257076,'start_time':1464630883,'lobby_type':0,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':0},{'account_id':4294967295,'player_slot':1,'hero_id':57},{'account_id':319993913,'player_slot':2,'hero_id':100},{'account_id':4294967295,'player_slot':3,'hero_id':70},{'account_id':4294967295,'player_slot':4,'hero_id':104},{'account_id':4294967295,'player_slot':128,'hero_id':48},{'account_id':4294967295,'player_slot':129,'hero_id':35},{'account_id':4294967295,'player_slot':130,'hero_id':36},{'account_id':4294967295,'player_slot':131,'hero_id':47},{'account_id':4294967295,'player_slot':132,'hero_id':6}]},{'match_id':2401233107,'match_seq_num':2101258209,'start_time':1464630851,'lobby_type':0,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':104},{'account_id':4294967295,'player_slot':1,'hero_id':93},{'account_id':4294967295,'player_slot':2,'hero_id':72},{'account_id':73530395,'player_slot':3,'hero_id':32},{'account_id':4294967295,'player_slot':4,'hero_id':94},{'account_id':335127854,'player_slot':128,'hero_id':79},{'account_id':4294967295,'player_slot':129,'hero_id':71},{'account_id':4294967295,'player_slot':130,'hero_id':28},{'account_id':4294967295,'player_slot':131,'hero_id':9},{'account_id':4294967295,'player_slot':132,'hero_id':40}]},{'match_id':2401231575,'match_seq_num':2101253842,'start_time':1464630798,'lobby_type':0,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':47},{'account_id':4294967295,'player_slot':1,'hero_id':6},{'account_id':281379694,'player_slot':2,'hero_id':30},{'account_id':4294967295,'player_slot':3,'hero_id':56},{'account_id':100122677,'player_slot':4,'hero_id':81},{'account_id':4294967295,'player_slot':128,'hero_id':93},{'account_id':224853373,'player_slot':129,'hero_id':0},{'account_id':4294967295,'player_slot':130,'hero_id':32},{'account_id':4294967295,'player_slot':131,'hero_id':0},{'account_id':4294967295,'player_slot':132,'hero_id':57}]}]}}APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503APIhasproblems503{'result':{'status':1,'num_results':5,'total_results':500,'results_remaining':495,'matches':[{'match_id':2401236690,'match_seq_num':2101259138,'start_time':1464630975,'lobby_type':8,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':14},{'account_id':4294967295,'player_slot':128,'hero_id':9}]},{'match_id':2401234461,'match_seq_num':2101257033,'start_time':1464630901,'lobby_type':8,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':179188925,'player_slot':0,'hero_id':25},{'account_id':139929264,'player_slot':128,'hero_id':101}]},{'match_id':2401234027,'match_seq_num':2101257076,'start_time':1464630883,'lobby_type':0,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':0},{'account_id':4294967295,'player_slot':1,'hero_id':57},{'account_id':319993913,'player_slot':2,'hero_id':100},{'account_id':4294967295,'player_slot':3,'hero_id':70},{'account_id':4294967295,'player_slot':4,'hero_id':104},{'account_id':4294967295,'player_slot':128,'hero_id':48},{'account_id':4294967295,'player_slot':129,'hero_id':35},{'account_id':4294967295,'player_slot':130,'hero_id':36},{'account_id':4294967295,'player_slot':131,'hero_id':47},{'account_id':4294967295,'player_slot':132,'hero_id':6}]},{'match_id':2401233107,'match_seq_num':2101258209,'start_time':1464630851,'lobby_type':0,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':104},{'account_id':4294967295,'player_slot':1,'hero_id':93},{'account_id':4294967295,'player_slot':2,'hero_id':72},{'account_id':73530395,'player_slot':3,'hero_id':32},{'account_id':4294967295,'player_slot':4,'hero_id':94},{'account_id':335127854,'player_slot':128,'hero_id':79},{'account_id':4294967295,'player_slot':129,'hero_id':71},{'account_id':4294967295,'player_slot':130,'hero_id':28},{'account_id':4294967295,'player_slot':131,'hero_id':9},{'account_id':4294967295,'player_slot':132,'hero_id':40}]},{'match_id':2401231575,'match_seq_num':2101253842,'start_time':1464630798,'lobby_type':0,'radiant_team_id':0,'dire_team_id':0,'players':[{'account_id':4294967295,'player_slot':0,'hero_id':47},{'account_id':4294967295,'player_slot':1,'hero_id':6},{'account_id':281379694,'player_slot':2,'hero_id':30},{'account_id':4294967295,'player_slot':3,'hero_id':56},{'account_id':100122677,'player_slot':4,'hero_id':81},{'account_id':4294967295,'player_slot':128,'hero_id':93},{'account_id':224853373,'player_slot':129,'hero_id':0},{'account_id':4294967295,'player_slot':130,'hero_id':32},{'account_id':4294967295,'player_slot':131,'hero_id':0},{'account_id':4294967295,'player_slot':132,'hero_id':57}]}]}}";
        //var obj = JSON.parse(test1);
        //console.log(obj);

        function parseMatch(){
            // Parse matches
            for (var i = 0; i < $scope.matches.length; i++){
                if ($scope.matches[i].lobby_type == 0){
                    for (var j = 0; j < 10; j++){
                        if ($scope.matches[i].players[j].account_id == $scope.accountID){
                            console.log ("Match " + $scope.matches[i].match_id + " pos " + $scope.matches[i].players[j].player_slot);
                        }
                    }

                }
            }
        }






    }








    })();


