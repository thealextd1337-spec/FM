<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function fail(int $code): void { http_response_code($code); echo '{"ok":false}'; exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405);
if (($_SERVER['HTTP_ORIGIN'] ?? '') !== 'https://fussball.cakamper.at') fail(403);
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail(415);
$raw = file_get_contents('php://input', false, null, 0, 32769);
if ($raw === false || strlen($raw) > 32768) fail(413);
$input = json_decode($raw, true);
if (!is_array($input) || ($input['schema'] ?? null) !== 1 || !in_array(($input['version'] ?? ''), ['0.10','0.11'], true) || !preg_match('/^[a-f0-9-]{36}$/D', $input['id'] ?? '')) fail(400);
if (!in_array($input['formation'] ?? '', ['balanced','bold','compact','custom'], true)) fail(400);
function number($value, float $min, float $max) { if (!is_numeric($value) || !is_finite((float)$value) || $value < $min || $value > $max) fail(400); return 0 + $value; }
$record = ['schema'=>1,'version'=>$input['version'],'date'=>gmdate('Y-m-d'),'id'=>$input['id'],'formation'=>$input['formation'],'press'=>number($input['press'] ?? null,0,1),'direct'=>number($input['direct'] ?? null,0,1)];
foreach (['score','shots'] as $key) { if (!isset($input[$key]) || !is_array($input[$key]) || count($input[$key]) !== 2) fail(400); $record[$key] = array_map(fn($v)=>number($v,0,500), array_values($input[$key])); }
if (!isset($input['players']) || !is_array($input['players']) || count($input['players']) !== 12) fail(400);
$record['players'] = [];
foreach ($input['players'] as $p) {
  if (!is_array($p) || !in_array($p['line'] ?? '', ['def','mid','att','gk'], true)) fail(400);
  $player=['team'=>number($p['team'] ?? null,0,1),'line'=>$p['line'],'age'=>number($p['age'] ?? null,16,50),'form'=>number($p['form'] ?? null,-2,2),'fresh'=>number($p['fresh'] ?? null,0,100),'stats'=>[]];
  foreach (['passes','passComplete','progressive','passLost','duels','duelsWon','interceptions','shots','onTarget','goals','saves','faced','conceded','cleanSheet','rating'] as $key) $player['stats'][$key]=number($p['stats'][$key] ?? null,0,2000);
  $record['players'][]=$player;
}
// PHP files with an immediate exit keep records inaccessible through HTTP,
// even when an Apache access rule is unavailable. No request identifiers are stored.
$directory=__DIR__.'/private';
if (!is_dir($directory) && !mkdir($directory,0700,true)) fail(503);
foreach (glob($directory.'/matches-*.php') ?: [] as $old) if (filemtime($old) < time()-90*86400) unlink($old);
$path=$directory.'/matches-'.gmdate('Y-m-d').'.php';
$handle=fopen($path,'c+');
if (!$handle || !flock($handle,LOCK_EX)) fail(503);
if (fstat($handle)['size'] > 20*1024*1024) { flock($handle,LOCK_UN); fclose($handle); fail(429); }
if (fstat($handle)['size'] === 0) fwrite($handle,"<?php exit; ?>\n");
fseek($handle,0,SEEK_END);
$ok=fwrite($handle,json_encode($record,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)."\n");
fflush($handle);flock($handle,LOCK_UN);fclose($handle);
if ($ok === false) fail(503);
echo '{"ok":true}';
