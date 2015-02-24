$(function() {
  var players = [];
  var match = "";
  var jsonStream = new EventSource('stream.php');
  
  jsonStream.onmessage = function (e) {
    //var message = JSON.parse(e.data);

    function addTo(type, data) {
      switch (type) {
        case 'gamestart':
          match = Math.random().toString(36).substr(2, 5);
          $("#matches").append(
            '<div class="panel panel-primary">' +
              '<div class="panel-heading collapser"><h3 class="panel-title"><a data-toggle="collapse" data-target="#match-' + match + '" href="#match-' + match + '">Match ' + match + '</a></h3></div>' +
              '<div id="match-' + match + '" class="panel-collapse collapse in">' +
                '<div class="panel-body">' +
                  '<h4>Match ' + match + '</h4>' +
                  '<table class="table game-info">' +
                    '<tr>' +
                      '<th>Map Name</th>' +
                      '<th>Match ID</th>' +
                      '<th>Game Type</th>' +
                      '<th>Mutators</th>' +
                    '</tr>' +
                  '</table>' +
                  '<ul class="nav nav-tabs" role="tablist">' +
                    '<li role="presentation" class="active"><a href="#match-' + match + '-tab-1" aria-controls="tab-1" role="tab" data-toggle="tab">Players</a></li>' +
                    '<li role="presentation"><a href="#match-' + match + '-tab-2" aria-controls="tab-2" role="tab" data-toggle="tab">Kills</a></li>' +
                    '<li role="presentation"><a href="#match-' + match + '-tab-3" aria-controls="tab-3" role="tab" data-toggle="tab">Join / Part</a></li>' +
                  '</ul>' +
                  '<div class="col-md-12">' +
                    '<div class="tab-content">' +
                      '<div role="tabpanel" class="tab-pane players active" id="match-' + match + '-tab-1"></div>' +
                      '<div role="tabpanel" class="tab-pane kills" id="match-' + match + '-tab-2"></div>' +
                      '<div role="tabpanel" class="tab-pane join-parts" id="match-' + match + '-tab-3"></div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
          $('#match-' + match + ' .game-info').append(
            '<tr>' +
              '<td>' + data.mapname + '</td>' +
              '<td>' + data.matchid + '</td>' +
              '<td>' + data.gametype + '</td>' +
              '<td class="mutators"></td>' +
            '</tr>'
          );
          $('#match-' + match + ' .join-parts').append(
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
          $('#match-' + match + ' .kills').append(
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
          $('#match-' + match + ' .players').append(
            '<table class="table match-players">' +
              '<thead>' +
                '<tr>' +
                  '<th>Player ID</th>' +
                  '<th>Team ID</th>' +
                  '<th>Nickname</th>' +
                  '<th>Kills</th>' +
                  '<th>Deaths</th>' +
                '</tr>' +
              '</thead>' +
            '</table>'
          );
          break;
        case 'gameinfo':
          $('#match-' + match + ' .game-info .mutators').append('<tr><td>' + JSON.stringify(data.mutators) + '</td></tr>');
          break;
        case 'gameinfoend':
          //$('#match-' + match + ' .game-info').append('<tr><td>!!</td></tr>');
          break;
        case 'join':
          players[data.id] = {
            'slot': data.slot,
            'ip': data.ip,
            'nickname': data.nickname,
            'kills': 0,
            'deaths': 0,
            'team': 0
          };
          break;
        case 'team':
          players[data.id].team = data.team;
          $('#match-' + match + ' .match-join-parts').append(
            '<tr>' +
              '<td>Join</td>' +
              '<td>' + players[data.id].slot + '</td>' +
              '<td>' + players[data.id].ip + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td>' + data.id + '</td>' +
              '<td class="team">' + players[data.id].team + '</td>' +
            '</tr>'
          );
          $('#match-' + match + ' .match-players').append(
            '<tr id="' + match + '-player-' + data.id + '">' +
              '<td>' + players[data.id].team + '</td>' +
              '<td>' + data.id + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td class="kills">' + players[data.id].kills + '</td>' +
              '<td class="deaths">' + players[data.id].deaths + '</td>' +
            '</tr>'
          );
          break;
        case 'kill':
          players[data['killer-id']].kills++;
          players[data['victim-id']].deaths++;
          $('#match-' + match + ' .match-kills').append(
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
          $('#' + match + '-player-' + data['killer-id'] + ' .kills').addClass('attn').text(players[data['killer-id']].kills);
          $('#' + match + '-player-' + data['victim-id'] + ' .deaths').addClass('attn').text(players[data['victim-id']].deaths);
          setTimeout(function() {
            $('#' + match + '-player-' + data['killer-id'] + ' .kills').removeClass('attn');
            $('#' + match + '-player-' + data['victim-id'] + ' .deaths').removeClass('attn');
          }, 1000);
          break;
        case 'part':
          $('#match-' + match + ' .match-join-parts').append(
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
    console.log(event);
    addTo(event.type, event);
  };
});
