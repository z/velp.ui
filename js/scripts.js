$(function() {
  var players = [];
  var match = "";
  var jsonStream = new EventSource('stream.php');
  
  jsonStream.onmessage = function (e) {
    //var message = JSON.parse(e.data);

    function addTo(type, data) {
      switch (type) {
        case 'gamestart':
          match = Math.random().toString(36).substr(2, 5);;
          $('#' + type).append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="gamestart-match-' + match + '">' +
                '<tr>' +
                  '<th>Map Name</th>' +
                  '<th>Match ID</th>' +
                  '<th>Game Type</th>' +
                '</tr>' +
              '</table>' +
            '</li>'
          );
          $('#' + type + ' #gamestart-match-' + match).append(
            '<tr>' +
              '<td>' + data.mapname + '</td>' +
              '<td>' + data.matchid + '</td>' +
              '<td>' + data.gametype + '</td>' +
            '</tr>'
          );
          $('#gameinfo').append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="gameinfo-match-' + match + '">' +
                '<tr>' +
                  '<th>Info</th>' +
                '</tr>' +
              '</table>' +
            '</li>'
          );
          $('#gameinfoend').append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="gameinfoend-match-' + match + '">' +
                '<tr>' +
                  '<th>Info</th>' +
                '</tr>' +
              '</table>' +
            '</li>'
          );
          $('#join').append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="join-match-' + match + '">' +
                '<tr>' +
                  '<th>Slot</th>' +
                  '<th>IP</th>' +
                  '<th>Nickname</th>' +
                  '<th>Player ID</th>' +
                '</tr>' +
              '</table>' +
            '</li>'
          );
          $('#team').append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="team-match-' + match + '">' +
                '<tr>' +
                  '<th>Player ID</th>' +
                  '<th>Nickname</th>' +
                  '<th>Team ID</th>' +
                '</tr>' +
              '</table>' +
            '</li>'
          );
          $('#kill').append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="kill-match-' + match + '">' +
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
              '</table>' +
            '</li>'
          );
          $('#part').append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="part-match-' + match + '">' +
                '<tr><th>Player ID</th></tr>' +
              '</table>' +
            '</li>'
          );
          $('#players').append(
            '<li>' +
              '<h4>Match ' + match + '</h4>' +
              '<table class="table" id="players-match-' + match + '">' +
                '<tr>' +
                  '<th>Player ID</th>' +
                  '<th>Nickname</th>' +
                  '<th>Kills</th>' +
                  '<th>Deaths</th>' +
                '</tr>' +
              '</table>' +
            '</li>'
          );
          break;
        case 'gameinfo':
          $('#' + type + " #gameinfo-match-" + match).append('<tr><td>' + JSON.stringify(data.mutators) + '</td></tr>');
          break;
        case 'gameinfoend':
          $('#' + type + ' #gameinfoend-match-' + match).append('<tr><td>!!</td></tr>');
          break;
        case 'join':
          players[data.id] = { 'nickname': data.nickname, 'kills': 0, 'deaths': 0, 'team': 0 };
          $('#' + type + ' #join-match-' + match).append(
            '<tr>' +
              '<td>' + data.slot + '</td>' +
              '<td>' + data.ip + '</td>' +
              '<td>' + data.nickname + '</td>' +
              '<td>' + data.id + '</td>' +
            '</tr>'
          );
          break;
        case 'team':
          players[data.id].team = data.team;
          $('#' + type + ' #team-match-' + match).append(
            '<tr>' +
              '<td>' + data.id + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td>' + data.team + '</td>' +
            '</tr>'
          );
          $('#players #players-match-' + match).append(
            '<tr id="' + match + '-player-' + data.id + '">' +
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
          $('#' + type + ' #kill-match-' + match).append(
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
          $('#' + type + ' #part-match-' + match).append(
            '<tr>' +
              '<td>' + players[data.id].nickname + '</td>' +
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
