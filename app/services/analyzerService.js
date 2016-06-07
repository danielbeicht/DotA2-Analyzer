(function() {
  'use strict';
  angular
    .module('DotAAnalyzerApp')
    .service('DAAnalyzer', function(datastorage, $log) {

      this.init = function() {
        this.heroes = datastorage.heroes;
        this.heroesValve = datastorage.heroesValve;
        this.matchups = datastorage.matchups;
        this.heroesSortedByIndex = new Array(this.heroes.length);
        this.yourTeamPicks = new Array (5);
        this.enemyTeamPicks = new Array (5);
        this.heroBans = new Array (10);
        this.stacked = [];

        this.yourTeamOverallAdvantage = 0;
        this.enemyTeamOverallAdvantage = 0;

        // Create heroesSortedByIndex Array
        for (var i = 0; i < this.heroes.length; i++) {
          this.heroesSortedByIndex[i] = this.heroes[i];
        }
        this.heroesSortedByIndex.sort(compare);
        function compare(a, b) {
          if (parseInt(a.heroIndex) < parseInt(b.heroIndex))
            return -1;
          if (parseInt(a.heroIndex) > parseInt(b.heroIndex))
            return 1;
        }
      }


      this.yourTeamHeroPick = function(heroIndexParameter) {
        if (heroIndexParameter != null) {
          var i;
          if (!this.heroAlreadyPickedOrBanned(heroIndexParameter)) {
            var heroPicked = false;
            for (i = 0; i < 5; i++) {
              if (this.yourTeamPicks[i] == null) {
                this.yourTeamPicks[i] = this.heroesSortedByIndex[heroIndexParameter];
                heroPicked = true;
                break;
              }
            }
            if (heroPicked == false) {
              // TODO: POPUP Alle 5 Helden bereits gewählt
            }
          }
        }
        this.updateAdvantages();
      }



      this.enemyTeamHeroPick = function(heroIndexParameter) {
        if (heroIndexParameter != null) {
          var i;

          if (!this.heroAlreadyPickedOrBanned(heroIndexParameter)) {
            var heroPicked = false;
            for (i = 0; i < 5; i++) {
              if (this.enemyTeamPicks[i] == null) {
                this.enemyTeamPicks[i] = this.heroesSortedByIndex[heroIndexParameter];
                heroPicked = true;
                //this.enemyTeamOverallAdvantage += this.heroesSortedByIndex[heroIndexParameter].enemyTeamAdvantage; ???
                break;
              }
            }
            if (heroPicked == false) {
              // TODO: POPUP schon 5 Helden gewählt
            }
          }
        }
        this.updateAdvantages();
      }


      this.resetData = function() {
        var i;
        for (i=0; i<5; i++){
          this.yourTeamPicks[i] = null;
          this.enemyTeamPicks[i] = null;
        }
        for (i=0; i<10; i++){
          this.heroBans[i] = null;
        }
        this.updateAdvantages();
      }


      this.updateAdvantages = function() {
        // TODO: Get Info about partaking players

        var i, j;
        for (i = 0; i < this.heroesSortedByIndex.length; i++) {
          var exit = false;
          for (j = 0; j < 5; j++) {
            if (this.yourTeamPicks[j] != null && this.yourTeamPicks[j].heroIndex == i) {
              exit = true;
              break;
            } else if (this.enemyTeamPicks[j] != null && this.enemyTeamPicks[j].heroIndex == i) {
              exit = true;
              break;
            }
          }
          if (!exit) {
            for (j = 0; j < 10; j++) {
              if (this.heroBans[j] != null && this.heroBans[j].heroIndex == i) {
                exit = true;
                break;
              }
            }
          }

          if (exit) {
            this.heroesSortedByIndex[i].yourTeamWinrate = '0.00';
            this.heroesSortedByIndex[i].enemyTeamWinrate = '0.00';
            //continue;
          }
          var teamAdvantage = 0.0;
          var enemyAdvantage = 0.0;
          var teamWinrate = 0.0;
          var enemyWinrate = 0.0;
          var teamHeroCount = 0;
          var enemyHeroCount = 0;

          for (j = 0; j < 5; j++) {
            if (this.enemyTeamPicks[j] != null) {
              teamAdvantage += parseFloat(this.matchups[i][this.enemyTeamPicks[j].heroIndex].Advantage);
              teamWinrate += parseFloat(this.matchups[i][this.enemyTeamPicks[j].heroIndex].Winrate);
              enemyHeroCount++;
            }
          }
          for (j = 0; j < 5; j++) {
            if (this.yourTeamPicks[j] != null) {
              enemyAdvantage += parseFloat(this.matchups[i][this.yourTeamPicks[j].heroIndex].Advantage);
              enemyWinrate += parseFloat(this.matchups[i][this.yourTeamPicks[j].heroIndex].Winrate);
              teamHeroCount++;
            }
          }
          if (teamHeroCount == 0) {
            teamHeroCount = 1;
          }
          if (enemyHeroCount == 0) {
            enemyHeroCount = 1;
          }

          this.heroesSortedByIndex[i].yourTeamAdvantage = parseFloat(teamAdvantage.toFixed(2));
          this.heroesSortedByIndex[i].enemyTeamAdvantage = parseFloat(enemyAdvantage.toFixed(2));
          this.heroesSortedByIndex[i].yourTeamWinrate = (parseFloat(teamWinrate) / parseFloat(enemyHeroCount)).toFixed(2);
          this.heroesSortedByIndex[i].enemyTeamWinrate = (parseFloat(enemyWinrate) / parseFloat(teamHeroCount)).toFixed(2);
        }

        this.yourTeamOverallAdvantage = 0;
        this.enemyTeamOverallAdvantage = 0;
        for (i=0; i < 5; i++) {
          if (this.yourTeamPicks[i] != null) {
            this.yourTeamOverallAdvantage += this.yourTeamPicks[i].yourTeamAdvantage;
          }
          if (this.enemyTeamPicks[i] != null) {
            this.enemyTeamOverallAdvantage += this.enemyTeamPicks[i].enemyTeamAdvantage;
          }
        }

        /* Array stacked stores all ui-bar objects
         yourTeamValue and enemyTeamValue are the calculated values which are needed to display them on a 0-100 ui-bar
         */
        this.getBarValues();
      }

      this.isPositive = function(bar){
        if (bar.isYourTeam)
        {
          return false;
        }else {
          return true;
        }
      }

      this.getBarValues = function(isRadiant) {
        this.stacked = [];
        this.maxAdvantage = 100;
        var multiplier = 100/this.maxAdvantage;
        var radiantTeamValue = this.yourTeamOverallAdvantage/this.maxAdvantage*50;
        var direTeamValue = this.enemyTeamOverallAdvantage/this.maxAdvantage*50;
        if (isRadiant){
          var temp = radiantTeamValue;
          radiantTeamValue = direTeamValue;
          direTeamValue = temp;
        }
        var difference;
        if (radiantTeamValue >= direTeamValue) {
          difference = radiantTeamValue - direTeamValue;
          this.stacked.push({
            value: (this.maxAdvantage/2 - difference)*multiplier.toFixed(2),
            adv: '',
            isPlaceholder: true,
            isYourTeam: true
          });
          this.stacked.push({
            value: (difference*multiplier).toFixed(2),
            adv: (difference).toFixed(2),
            isPlaceholder: false,
            isYourTeam: true
          });
        } else {
          difference = direTeamValue - radiantTeamValue;
          this.stacked.push({
            value: (50),
            adv: '',
            isPlaceholder: true,
            isValue: false,
            isYourTeam: false
          });
          this.stacked.push({
            value: (difference*multiplier).toFixed(2),
            adv: (difference).toFixed(2),
            isPlaceholder: false,
            isValue: true,
            isYourTeam: false
          });
        }
        return this.stacked;
      }

      this.changeProgressbarColor = function(vari, id, isYourTeam) {

        var cols = document.getElementById('progressValue' + id);

        if (cols != null && !isYourTeam){    // TODO WHY?
          var greenValue = ((255/(1.5*(this.maxAdvantage/2)))*vari.value).toFixed(0);
          cols.style.background = 'rgba(' + (255-greenValue) + ', 255, 0, 1)';
        } else if (cols != null && isYourTeam){
          var redValue = ((255/(1.5*(this.maxAdvantage/2)))*vari.value).toFixed(0);
          cols.style.background = 'rgba(255, ' + (255-redValue) + ', 0, 1)';
        }

      };


      this.heroAlreadyPickedOrBanned = function(heroIndexParameter){
        var i;
        var selectedHero = this.heroesSortedByIndex[heroIndexParameter];
        for (i = 0; i < 5; i++) {
          if ((this.yourTeamPicks[i] != null && this.yourTeamPicks[i].heroIndex === selectedHero.heroIndex) || (this.enemyTeamPicks[i] != null && this.enemyTeamPicks[i].heroIndex === selectedHero.heroIndex)) {
            return true;
          }
        }
        for (i = 0; i < 10; i++) {
          if (this.heroBans[i] != null && this.heroBans[i].heroIndex === selectedHero.heroIndex) {
            return true;
          }
        }
        return false;
      }




    });
})();