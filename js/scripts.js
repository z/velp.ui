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
          $('#' + type + ' table').append(
            '<tr>' +
              '<td>' + data.mapname + '</td>' +
              '<td>' + data.matchid + '</td>' +
              '<td>' + data.gametype + '</td>' +
            '</tr>'
          );
          $('#players').append('<li><h2>Match ' + match + '</h2><table class="table" id="match-' + match + '"><tr><th>Player ID</th><th>Nickname</th><th>Kills</th><th>Deaths</th></tr></table></li>');
          break;
        case 'gameinfo':
          $('#' + type).append('<li>' +
            'Map Name: ' + JSON.stringify(data.mutators) +
          '</li>');
          break;
        case 'gameinfoend':
          $('#' + type).append('<li>!!</li>');
          break;
        case 'join':
          players[data.id] = { 'nickname': data.nickname, 'kills': 0, 'deaths': 0, 'team': 0 };
          $('#' + type + ' table').append(
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
          $('#' + type + ' table').append(
            '<tr>' +
              '<td>' + data.id + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td>' + data.team + '</td>' +
            '</tr>'
          );
          $('#players #match-' + match).append(
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
          $('#' + type + ' table').append(
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
          $('#' + type + ' table').append(
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
