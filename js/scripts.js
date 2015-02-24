$(function() {
  var players = [];
  var mid = "";
  var m = {};
  var allevents;
  //var jsonStream = new EventSource('stream.php');
  var sock; // The global web socket.

  // We can create a real web socket instance with a bogus URL.
  // NOTE: This only works in Chrome as it will happily create
  // a web socket in a disconnected state. Other browsers refuse
  // to do so.
  sock = new WebSocket( "ws://mock" );
  
  // This is unchanging production code that doesn't know
  // we're mocking the web socket.
  sock.onmessage = function( e ) {
  //jsonStream.onmessage = function (e) { // alternatively, use a stream
    //var message = JSON.parse(e.data);

    function updateScore(column, newScore) {
      $(column).addClass('attn').text(newScore);
      setTimeout(function() {
        $(column).removeClass('attn');
      }, 1000);
    }

    function highlightUpdate(column) {
      $(column).addClass('attn');
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
              '<td><ul class="mutators"></ul></td>' +
            '</tr>'
          );
          if (m.gametype == "ctf") {
            game = '<th>Caps</th>' +
              '<th>Steals</th>' +
              '<th>Returns</th>' +
              '<th>Drops</th>';
          }
          $('#match-' + mid + ' .players').append(
            '<br /><table class="table match-players">' +
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
          $('#match-' + mid + ' table.match-players').dataTable({
            pageLength: 35
          });
          //$('#match-' + mid + ' table.match-kills').dataTable();
          break;
        case 'gameinfo':
          var mutators = "";
          data.mutators.forEach(function(v, i) { mutators += '<li>' + v + '</li>'; } );
          $('#match-' + mid + ' .game-info .mutators').append(mutators);
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
          var game = "";
          var teamcolor = "";
          players[data.id].team = data.team;
          if (m.gametype == "ctf") {
            if (players[data.id].team == 5) { teamcolor = ' class="red"'; }
            if (players[data.id].team == 14) { teamcolor = ' class="blue"'; }
          }
          $('#match-' + mid + ' .match-join-parts').append(
            '<tr' + teamcolor + '>' +
              '<td>Join</td>' +
              '<td>' + players[data.id].slot + '</td>' +
              '<td>' + players[data.id].ip + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td>' + data.id + '</td>' +
              '<td>' + players[data.id].team + '</td>' +
            '</tr>'
          );
          /*$('#match-' + mid + ' .match-players').append(
            '<tr id="' + mid + '-player-' + data.id + '"' + teamcolor + '>' +
              '<td>' + data.id + '</td>' +
              '<td>' + data.team + '</td>' +
              '<td>' + players[data.id].nickname + '</td>' +
              '<td class="kills">' + players[data.id].kills + '</td>' +
              '<td class="deaths">' + players[data.id].deaths + '</td>' +
              game +
            '</tr>'
          );*/
          if (m.gametype == "ctf") {
            var tRow = $('<tr id="' + mid + '-player-' + data.id + '"' + teamcolor + '>').append(
                '<td>' + data.id + '</td>',
                '<td>' + data.team + '</td>',
                '<td>' + players[data.id].nickname + '</td>',
                '<td class="kills">' + players[data.id].kills + '</td>',
                '<td class="deaths">' + players[data.id].deaths + '</td>',
                '<td class="captures">' + players[data.id].captures + '</td>',
                '<td class="steals">' + players[data.id].steals + '</td>',
                '<td class="returns">' + players[data.id].returns + '</td>',
                '<td class="drops">' + players[data.id].drops + '</td>',
              '</tr>'
            );
          } else {
            var tRow = $('<tr id="' + mid + '-player-' + data.id + '"' + teamcolor + '>').append(
                '<td>' + data.id + '</td>',
                '<td>' + data.team + '</td>',
                '<td>' + players[data.id].nickname + '</td>',
                '<td class="kills">' + players[data.id].kills + '</td>',
                '<td class="deaths">' + players[data.id].deaths + '</td>',
              '</tr>'
            );
          }
          $('#match-' + mid + ' table.match-players').DataTable().row.add(tRow).draw();
          break;
        case 'kill':
          var teamcolor = "";
          if (m.gametype == "ctf") {
            if (players[data['killer-id']].team == 5) { teamcolor = ' class="red"'; }
            if (players[data['killer-id']].team == 14) { teamcolor = ' class="blue"'; }
          }
          players[data['killer-id']].kills++;
          players[data['victim-id']].deaths++;
          $('#match-' + mid + ' .match-kills').prepend(
            '<tr' + teamcolor + '>' +
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
          /*var tRow = $('<tr' + teamcolor + '>').append(
              '<td>' + data.killtype + '</td>',
              '<td>' + players[data['killer-id']].nickname + '</td>',
              '<td>' + data['killer-items'] + '</td>',
              '<td>' + data.cod + '</td>',
              '<td>' + data.targetpos + '</td>',
              '<td>' + players[data['victim-id']].nickname + '</td>',
              '<td>' + data.attackpos + '</td>',
              '<td>' + data['victim-items'] + '</td>',
            '</tr>'
          );
          $('#match-' + mid + ' table.match-kills').DataTable().row.add(tRow).draw();*/
          //updateScore('#' + mid + '-player-' + data['killer-id'] + ' .kills', players[data['killer-id']].kills);
          //updateScore('#' + mid + '-player-' + data['victim-id'] + ' .deaths', players[data['victim-id']].deaths);
          var colKill = $('#match-' + mid + ' table.match-players').DataTable().cell('#' + mid + '-player-' + data['killer-id'], 3).data(players[data['killer-id']].kills).draw().node();
          var colDead = $('#match-' + mid + ' table.match-players').DataTable().cell('#' + mid + '-player-' + data['victim-id'], 4).data(players[data['victim-id']].deaths).draw().node();
          highlightUpdate(colKill);
          highlightUpdate(colDead);
          break;
        case 'ctf':
          var $matchPlayers = $('#match-' + mid + ' table.match-players');
          var cell = '#' + mid + '-player-' + data['player-id'];
          switch (data.ctftype) {
            case "capture":
              players[data['player-id']].captures++;
              //updateScore('#' + mid + '-player-' + data['player-id'] + ' .captures', players[data['player-id']].captures);
              var colCaptures = $matchPlayers.DataTable().cell(cell, 5).data(players[data['player-id']].captures).draw().node();
              highlightUpdate(colCaptures);
              break;
            case "steal":
              players[data['player-id']].steals++;
              //updateScore('#' + mid + '-player-' + data['player-id'] + ' .steals', players[data['player-id']].steals);
              var colSteals = $matchPlayers.DataTable().cell(cell, 6).data(players[data['player-id']].steals).draw().node();
              highlightUpdate(colSteals);
              break;
            case "return":
              players[data['player-id']].returns++;
              //updateScore('#' + mid + '-player-' + data['player-id'] + ' .returns', players[data['player-id']].returns);
              var colReturns = $matchPlayers.DataTable().cell(cell, 7).data(players[data['player-id']].returns).draw().node();
              highlightUpdate(colReturns);
              break;
            case "drop":
              players[data['player-id']].drops++;
              //updateScore('#' + mid + '-player-' + data['player-id'] + ' .drops', players[data['player-id']].drops);
              var colDrops = $matchPlayers.DataTable().cell(cell, 8).data(players[data['player-id']].drops).draw().node();
              highlightUpdate(colDrops);
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

  /*$("#stop").click(function() {
    jsonStream.close();
  });*/

  // Mocks web socket activity by pushing new items onto
  // the mock data array and dispatching a MessageEvent.
  function mockSock() {
    // Dispatch the event directly on the web socket object.
    // The event data is expecting the "data" key for the message
    // data that's delivered to handlers.
    var event = allevents.pop();
    //console.log(event);
    sock.dispatchEvent( new MessageEvent( "message", {
      data: event
    }));
    
    // Send another message in 3 seconds.
    if (allevents.length > 0) {
      setTimeout( mockSock, 50 );
    }
  }

  $.get("data/all-matches.txt", function(data) {
    allevents = data.split('\n');
    allevents.reverse();
    // Starts the mocking activity.        
    mockSock();
  });

});
