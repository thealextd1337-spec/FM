# Doppel 6's 3D system

System state: football iteration v159 with Unity presentation, game version 111. The authoritative implementation is in dist/. This document describes the regular club-world game. The camera prototype and freekickdemo are separate projects.

## Unity presentation

The published HTTP build uses Unity for its 3D match view. world-unity-v151.js sends actual match pictures to the WebGL runtime. Labels follow head positions reported by Unity; ball rotation follows real ball travel. Five camera views and a distance slider affect presentation only. The simulation remains responsible for goals, contact, statistics and saving. Presentation errors retain the 2D fallback. The following THREE, shadow and IK details describe the existing browser renderer, which remains available through engine=browser.

New physical matches use offensive flow v159: reachable receptions and follow-up runs, clear striker runs towards goal, ball- and receiver-aware defending, and shot targets determined independently of goalkeeper reach. Existing results are never recalculated. Measured goal frequency improved; physical mobile-device acceptance and final season balancing remain open.

## Shared simulation and presentation

2D and 3D display the same physical club-world match. The simulation decides goals, contact, possession, offside, restarts, abilities, statistics and career bookings. Rendering must not change the match or consume simulation random numbers. Parallel AI fixtures use the compact match simulation and are not recorded 3D matches.

world-physical-v65.js advances the match approximately every 40 milliseconds, limiting each elapsed real-time slice to 0.05 seconds. MATCH_SPEED converts real time to internal simulation time; the displayed match clock converts that time to football minutes. Pausing must not produce a later time jump.

On devices with a primary touch pointer, 3D uses one render pixel per CSS pixel, without additional antialiasing or dynamic shadows. Existing contact shadows and complete player models remain visible. Match ticks supply fresh snapshots to the screen animation loop instead of drawing additional 3D pictures. Mobile live play and review draw at most 60 pictures per second; actual performance depends on the device. Simulation and review time remain independent of this limit.

Physical positions are normalised field coordinates. Club-world contact tests convert them to metres using a 44-metre width and 68-metre length inside the field boundaries. world-pitch3d-v98.js projects these coordinates to X/Z, turns the presentation after half-time and adds ball height. The simulation coordinates themselves remain unchanged.

## Modules and data flow

- world-physical-v65.js: match creation, time steps, pauses, substitutions and career result booking.
- game.js and pitch-v55.js: movement, dribbling, passes, shots, first-time actions, aerial planning and offside contacts.
- pitch-v56.js and set-pieces-v50.js: reachable tackles, sliding challenges, fouls and restarts.
- world-backpedal-v108.js: tactical defensive targets, marking, forward/backward pursuit, loose-ball pursuit and keeper challenges.
- world-pitch-actions-v99.js and player-ball-events-v111.js: confirmed events translated into temporary animation phases and contact plans.
- world-ball-motion-v110.js and world-corner-ball-v109.js: loose-ball height and velocity, bouncing, rolling resistance and visible movement out of play.
- pitch-motion-v102.js: pausable animation clock, contact metadata, frame buffering, interpolation and procedural poses.
- world-pitch3d-v98.js and pitch-scene-v98.js: player and ball rendering, camera, stadium, kits, labels, shadows, audio and resource lifecycle.
- player-user-bootstrap-v112.js and player-user-meshy-v107.js: Meshy loading, player factory, individual skeletons and materials.
- player-user-motion-v108.js: gait phases, transitions, foot anchors and bounded pelvis correction.
- player-user-ball-actions-v111.js: native shot, pass, throw-in, foul and goalkeeper actions with confirmed hand/foot contacts.
- world-goal-replay-v103.js: goal replay, full-session review, event markers, image enlargement, fullscreen and TV overlay.
- match-ball-events-v117.js: shot, save, rebound and goal accounting.

Presentation and action metadata mainly live in WeakMaps associated with a match or flight. They do not require a career save migration.

## Animation and Meshy assets

requestAnimationFrame renders independently of the simulation tick. v98PitchFrame includes players, owner, ball height, action phases, movement mode, offside and historical TV information. v102Interpolate blends adjacent buffered frames; hidden restart resets are not rendered as visible ball trajectories.

Animations do not decide the match or move physical players. Gait phases follow distance travelled, or filtered movement speed during dribbling. Clip weights, turns, foot anchors and contact corrections express that movement. Ball carriers suppress defensive backward clips and inappropriate stop or idle turns.

The regular game loads football-v130.glb, calibration-v130.json and cloth-mask.png from dist/players/. The rig contains 34 clips. Outfield players and both keepers share the model but have individual skeletons. Stored match kits determine clothing colours; the cloth mask separates clothing and skin. Gloves use the actual hand skin weights.

The loader reports loading, ready or failed. Failed assets leave the procedural player factory available. Successful loading rebuilds an open scene using the same match state. Graphics randomness is separated from match randomness. The offline build embeds the rig, calibration, mask, local Three.js modules and audio. There are no Meshy API calls during a match.

Calibration provides clip durations, phases, stride measurements and contact samples. Foot anchors reduce sliding; inverse joint corrections connect arms and legs to confirmed contacts without inventing unlimited reach or remote possession.

## Ball contacts and goalkeeper actions

Possession, flight and a loose ball are separate states. Reception needs reachable contact. First-time passes and shots prepare before arrival and release at actual contact. Appropriate abilities and pressure affect action choice and quality; the interface displays abilities only as colour levels.

High loose balls retain vertical velocity, lose energy when bouncing and then roll with resistance. Deflections start at the confirmed contact. The visible ball radius is 0.1764 scene metres. Goal and touchline crossings are decided in the shared simulation.

Sliding challenges test body and ball distance during movement, with 18 or 25 centimetres of follow-through beyond the ball. Body contact triggers the foul decision immediately. Ball contact decides a win or loose ball; a missed slide finishes at the end of the movement. Restart preparation is a separate phase.

Keepers face the ball in readiness and during sidesteps. Stationary keepers maintain open low hands and bent knees even when the ball is distant. Generic outfield turns do not override keeper facing.

A save begins at the keeper's current position. Preparation, launch, bounded lateral travel, hand contact, catch or parry, grounding and recovery follow the confirmed plan. Ability, available flight time, height and reach limit saves. Covering the goal geometrically does not guarantee saving every shot.

Catches place the visible ball between the actual gloves. A parrying hand releases its old target early, and the ball remains loose. Defenders keep defending until control or a stoppage is confirmed. Ground goal kicks and distribution from the hands are separate actions.

## Passes into space

world-space-passes-v150.js evaluates free targets, passing lanes and arrival times separately from receiver-bound passes. Passing affects aim and dosage; technique affects execution under pressure. Positioning controls reaction time, while speed and stamina limit arrival. Tactics and deep or wide runs influence selection. Both teams pursue reachable points on the remaining path. The shared movement step tests the actual ball and player paths; another teammate or goalkeeper can make first contact. An unreached ball keeps rolling freely. Offside is captured at release and penalised on involvement. Only newly created loose space passes store a plain intent record for resuming after loading; historical events are not reconstructed. [Evidence and limits](raumpaesse-v150.md).

## Camera, controls and review

Landscape allows 3D TV and a deliberate switch to 2D. Portrait uses 2D. WebGL failure or context loss activates the 2D fallback. The close TV camera follows the ball smoothly; the wide camera provides an overview. Neither changes match decisions.

The magnifier enlarges the image within the page up to 1,280 pixels. A separate fullscreen button uses the browser API or a viewport fallback. Controls appear on hover or briefly after a touch; keyboard focus remains visible. The TV clock, score and competition remain visible.

Review records the rendered rig and ball poses at approximately six snapshots per second across the current 3D session. It interpolates recordings rather than simulating again. Seeking and playback pause the match. Goals, corners, free kicks, offside and penalties have markers with a three-second lead-in. Playback ends paused; Live returns to the current match.

The recording is temporary. Missing 2D or portrait sections and earlier sessions are not reconstructed. Leaving or reloading loses the recording; it is not a video export. Previously recorded poses retain their original appearance after later animation fixes. The 3D help uses the existing pausing live-information dialog.

## Validation and maintenance

Reproducible scenarios cover both team directions. Native pose tests include 30, 60 and 120 frames per second. Measurement with GPU drawing omitted is not a hardware-performance benchmark. Real contacts, grounding, stable paused poses, rendering without match mutation and resource cleanup are separate checks.

The v133 acceptance includes 24 new keeper-facing sequences, related Meshy, foul and slide checks, and two full matches with 15,972 rendered frames without new visible warps. 2D/3D/offline parity confirms identical events, statistics and results. Earlier v131/v132 evidence covers goalkeeper chains, first-time actions, aerial balls, review and mobile fullscreen. These tests do not prove universal correctness or performance on physical mobile devices.

Register new modules in dist/index.html, work/build.cjs and work/server.cjs. Source serving and offline embedding must use the same assets. Before release, compare the footer version, source, build and live bytes. Exclude freekickdemo and do not retrospectively recalculate old saves or historical statistics.

A match viewed in fullscreen exits fullscreen at halftime and opens the tactics screen. Starting the second half restores fullscreen; browsers without native support use the viewport fallback.

The button below the live pitch pauses the match and resumes from the same position. After deliberately selecting an earlier scene, it plays the review. At its end position it returns to the live match. During standing turns, outfield players release old foot anchors smoothly and establish fresh contacts afterwards.

Game version 110: Waiting players face the ball during throw-ins, corners and goal kicks. Moving ball carriers keep native strides and floor correction without horizontal world foot anchors. The shared simulation weighs long shots by distance, angle and an unblocked lane. Regular penalties add a two-second goal view after the decision.
