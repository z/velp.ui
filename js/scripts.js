$(function() {
  var players = [];
  var mid = "";
  var m = {};
  var jsonStream = new EventSource('stream.php');
  
  jsonStream.onmessage = function (e) {
    //var message = JSON.parse(e.data);

    function updateScore(column, newScore) {
      $(column).addClass('attn').text(newScore);
      setTimeout(function() {
        $(column).removeClass('attn');
      }, 1000);
    }

    function addTo(type, data) {
      switch (type) {
        case 'gamestart':
          mid = Math.random().toString(36).substr(2, 5);
          m = data;
          var game = "";
          $("#matches").append(
            '<div class="panel panel-primary">' +
              '<div class="panel-heading collapser"><h3 class="panel-title"><a data-toggle="collapse" data-target="#match-' + mid + '" href="#match-' + mid + '">Match ' + m.matchid + '</a></h3></div>' +
              '<div id="match-' + mid + '" class="panel-collapse collapse in">' +
                '<div class="panel-body">' +
                  '<table class="table game-info">' +
                    '<tr>' +
                      '<th>Map Name</th>' +
                      '<th>Match ID</th>' +
                      '<th>Game Type</th>' +
                      '<th>Mutators</th>' +
                    '</tr>' +
                  '</table>' +
                  '<ul class="nav nav-tabs" role="tablist">' +
                    '<li role="presentation" class="active"><a href="#match-' + mid + '-tab-1" aria-controls="tab-1" role="tab" data-toggle="tab">Players</a></li>' +
                    '<li role="presentation"><a href="#match-' + mid + '-tab-2" aria-controls="tab-2" role="tab" data-toggle="tab">Kills</a></li>' +
                    '<li role="presentation"><a href="#match-' + mid + '-tab-3" aria-controls="tab-3" role="tab" data-toggle="tab">Join / Part</a></li>' +
                  '</ul>' +
                  '<div class="col-md-12">' +
                    '<div class="tab-content">' +
                      '<div role="tabpanel" class="tab-pane players active" id="match-' + mid + '-tab-1"></div>' +
                      '<div role="tabpanel" class="tab-pane kills" id="match-' + mid + '-tab-2"></div>' +
                      '<div role="tabpanel" class="tab-pane join-parts" id="match-' + mid + '-tab-3"></div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
          $('#match-' + mid + ' .game-info').append(
            '<tr>' +
              '<td>' + m.mapname + '</td>' +
              '<td>' + m.matchid + '</td>' +
              '<td>' + m.gametype + '</td>' +
              '<td class="mutators"></td>' +
            '</tr>'
          );
          if (m.gametype == "ctf") {
            game = '<th>Caps</th>' +
              '<th>Steals</th>' +
              '<th>Returns</th>' +
              '<th>Drops</th>';
          }
          $('#match-' + mid + ' .players').append(
            '<table class="table match-players">' +
              '<thead>' +
                '<tr>' +
                  '<th>Player ID</th>' +
                  '<th>Team ID</th>' +
                  '<th>Nickname</th>' +
                  '<th>Kills</th>' +
                  '<th>Deaths</th>' +
                  game +
                '</tr>' +
              '</thead>' +
            '</table>'
          );
          $('#match-' + mid + ' .kills').append(
            '<table class="table match-kills">' +
              '<thead>' +
                '<tr>' +
                  '<th>Kill Type</th>' +
                  '<th>Killer</th>' +
                  '<th>Killer Items</th>' +
                  '<th>Cause of Death</th>' +
                  '<th>Target Position</th>' +
                  '<th>Victim</th>' +
                  '<th>Attack Position</th>' +
                  '<th>Victim Items</th>' +
                '</tr>' +
              '</thead>' +
            '</table>'
          );
          $('#match-' + mid + ' .join-parts').append(
            '<table class="table match-join-parts">' +
              '<thead>' +
                '<tr>' +
                  '<th>Type</th>' +
                  '<th>Slot</th>' +
                  '<th>IP</th>' +
                  '<th>Nickname</th>' +
                  '<th>Player ID</th>' +
                  '<th>Team ID</th>' +
                '</tr>' +
              '</thead>' +
            '</table>'
          );
          break;
        case 'gameinfo':
          $('#match-' + mid + ' .game-info .mutators').append('<tr><td>' + JSON.stringify(data.mutators) + '</td></tr>');
          break;
        case 'gameinfoend':
          //$('#match-' + mid + ' .game-info').append('<tr><td>!!</td></tr>');
          break;
        case 'join':
          var game = "";
          players[data.id] = {
            'slot': data.slot,
            'ip': data.ip,
            'nickname': data.nickname,
            'kills': 0,
            'deaths': 0,
            'team': 0
          };
          if (m.gametype == "ctf") {
            var ctfscores = {
              'captures': 0,
              'steals': 0,
              'returns': 0,
              'drops': 0
            };
            players[data.id] = $.extend(players[data.id], ctfscores);
          }
          break;
        case 'team':
          if (m.gametype == "ctf") {
            game = '<td class="captures">' + players[data.id].captures + '</td>' +
              '<td class="steals">' + players[data.id].steals + '</td>' +
              '<td class="returns">' + players[data.id].returns + '</td>' +
              '<td class="drops">' + players[data.id].drops + '</td>';
          }
          players[data.id].team = data.team;
          $('#match-' + mid + ' .match-join-parts').append(
            '<tr>' +
              '<td>Join</td>' +
              '<td>' + players[data.id].slot + '</td>' +
              '<td>' + players[data.id].ip + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td>' + data.id + '</td>' +
              '<td>' + players[data.id].team + '</td>' +
            '</tr>'
          );
          $('#match-' + mid + ' .match-players').append(
            '<tr id="' + mid + '-player-' + data.id + '">' +
              '<td>' + data.id + '</td>' +
              '<td>' + data.team + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td class="kills">' + players[data.id].kills + '</td>' +
              '<td class="deaths">' + players[data.id].deaths + '</td>' +
              game +
            '</tr>'
          );
          break;
        case 'kill':
          players[data['killer-id']].kills++;
          players[data['victim-id']].deaths++;
          $('#match-' + mid + ' .match-kills').append(
            '<tr>' +
              '<td>' + data.killtype + '</td>' +
              '<td>' + players[data['killer-id']].nickname + '</td>' +
              '<td>' + data['killer-items'] + '</td>' +
              '<td>' + data.cod + '</td>' +
              '<td>' + data.targetpos + '</td>' +
              '<td>' + players[data['victim-id']].nickname + '</td>' +
              '<td>' + data.attackpos + '</td>' +
              '<td>' + data['victim-items'] + '</td>' +
            '</tr>'
          );
          updateScore('#' + mid + '-player-' + data['killer-id'] + ' .kills', players[data['killer-id']].kills);
          updateScore('#' + mid + '-player-' + data['victim-id'] + ' .deaths', players[data['victim-id']].kills);
          break;
        case 'ctf':
          switch (data.ctftype) {
            case "capture":
              players[data['player-id']].captures++;
              updateScore('#' + mid + '-player-' + data['player-id'] + ' .captures', players[data['player-id']].captures);
              break;
            case "steal":
              players[data['player-id']].steals++;
              updateScore('#' + mid + '-player-' + data['player-id'] + ' .steals', players[data['player-id']].steals);
              break;
            case "return":
              players[data['player-id']].returns++;
              updateScore('#' + mid + '-player-' + data['player-id'] + ' .returns', players[data['player-id']].returns);
              break;
            case "drop":
              players[data['player-id']].drops++;
              updateScore('#' + mid + '-player-' + data['player-id'] + ' .drops', players[data['player-id']].drops);
              break;
            default:
          }
          break;
        case 'part':
          $('#match-' + mid + ' .match-join-parts').append(
            '<tr>' +
              '<td>Part</td>' +
              '<td>' + players[data.id].slot + '</td>' +
              '<td>' + players[data.id].ip + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td>' + data.id + '</td>' +
              '<td>' + players[data.id].team + '</td>' +
            '</tr>'
          );
          break;
        default:
      }
    }
    
    // handle message
    var event = JSON.parse(e.data);
    //console.log(event);
    addTo(event.type, event);
  };
});
