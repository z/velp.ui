<?php
date_default_timezone_set("America/New_York");
header("Content-Type: text/event-stream\n\n");

$f = fopen("data/all-matches.json", "r");
$ln = 0;

while ($match_line = fgets($f)) {
  ++$ln;

  $curDate = date(DATE_ISO8601);

  echo 'data: ' . $match_line . ' ' . $curDate . "\n\n";

  ob_flush();
  flush();
  usleep(100000);
}

fclose($match_file);

?>
