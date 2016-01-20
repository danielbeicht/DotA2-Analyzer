# DotA2-Analyzer
<h1>Online: <a href="http://dotademo.mz-host.de">link textdotademo.mz-host.de</a></h1>
DotA 2 Analyzer is the best tool to analyze hero picks / counter picks

<h2>What is DotA 2 Analyzer?</h2>
DotA 2 Analyzer calculates, which hero picks might be good choice against the enemy picks.
The tool also calculates the best choices for the enemy team, so that you can react by banning those heroes in Captains Mode.

<h2>Calculations</h2>
The calculations are based on Dotabuff advantage data. They does neither include hero synergies nor the distribution of the hero roles.
It only examines the enemy picks.
To mark heroes, that you or your friends might want to play, you can create an account and add players to this account.
You can choose a hero pool for each player within your account, which will be saved in our database.
Whenever you login, you can select the players you are playing with and heroes will be marked with different colors to give you an easy overview.
The DotA 2 Analyzer also calculates an overall advantage of both teams concerning the current picks of both teams.

<h2>Implementation</h2>
The old DotA 2 Analyzer was designed with ASP.Net C#. It was created within 2 weeks during semester break. The performance wasn't rellay great, also it didn't support any kind of asynchronous data transfer. <br>
The new Frontend uses modern technology:
- HTML5
- JavaScript (Framework: AngularJS)
- CSS (Bootstrap)

All database-requests are working asynchronous.
