# A02: reproduzierbarer Asset-/Animationsaudit

Stand: 2026-10-09T12:12:12.387Z. **Keine neue visuelle Abnahme.** Vollständige JSON-Evidenz in `report.json`; jede Aktion enthält Trigger-, Clip-, Rig-, Kontakt- und Übergangsbelege.

Original: 34 Clips, 28 Gelenke; 2 zusätzliche Pilotclips. Katalog enthält 29 nachweislich vorhandene Clips.

present+integrated: 33; integrated-quality-defect: 8; missing: 1; unproven: 6.

- **stand — Stehen: present+integrated.** Measured footfall/stride/sole on rig at runtime; no ball contact.
- **walk — Gehen: present+integrated.** Measured footfall/stride/sole on rig at runtime; no ball contact.
- **run — Laufen/Joggen: present+integrated.** Measured footfall/stride/sole on rig at runtime; no ball contact.
- **sprint — Sprint: present+integrated.** Measured footfall/stride/sole on rig at runtime; no ball contact.
- **turn — Drehungen Stand/Gehen/Laufen: present+integrated.** Measured footfall/stride/sole on rig at runtime; no ball contact.
- **brake — Bremsen: present+integrated.** Measured footfall/stride/sole on rig at runtime; no ball contact.
- **backpedal — Rückwärtsbewegung: present+integrated.** back_right/back_step_meshy remain unused; backward gait does not prove lateral keeper shuffle.
- **dribble — Dribbling/Ballführung: present+integrated.** Carrier guard and procedural foot reach are source-wired; no dedicated dribble clip. Suitability in tight space and both feet remains visual review.
- **control — Bodenannahme/Kontrolle: present+integrated.** ReceiveContact=.7; post-release contact gate .09 s (receive .12 s), right-foot IK within 1.4 m root and 1 m current ball. Standing support-foot planting.
- **receive — Passempfang: present+integrated.** ReceiveContact=.7; post-release contact gate .09 s (receive .12 s), right-foot IK within 1.4 m root and 1 m current ball. Standing support-foot planting.
- **pass — Bodenpass: present+integrated.** PassContact=.8; post-release contact gate .09 s (receive .12 s), right-foot IK within 1.4 m root and 1 m current ball. Standing support-foot planting.
- **high-pass — Hoher Pass: integrated-quality-defect.** Ground inside-pass pose reused for high delivery; authored crossing action absent.
- **cross — Flanke: integrated-quality-defect.** Ground inside-pass pose reused for high delivery; authored crossing action absent.
- **shot — Schuss: present+integrated.** ShotContact=.46; post-release contact gate .09 s (receive .12 s), right-foot IK within 1.4 m root and 1 m current ball. Standing support-foot planting.
- **volley — Volley: integrated-quality-defect.** Volley uses ground-shot body/foot pose; no dedicated aerial preparation, height or authored volley family.
- **pass-ready — Passvorbereitung: present+integrated.** Progress samples 0..0.8 s before contact; no invented ball release.
- **kick-ready — Schussvorbereitung: present+integrated.** Progress samples 0..0.46 s before contact.
- **header — Kopfball: integrated-quality-defect.** No authored takeoff/header/landing family; locomotion clip continues under head reach.
- **air-ready — Luftballvorbereitung: integrated-quality-defect.** No aerial body preparation/takeoff clip.
- **air-land — Landung nach Luftduell: missing.** No dedicated airLand selection or landing clip in current Unity action catalog.
- **standing-tackle — Stehender Zweikampf: present+integrated.** Standing tackle selects receiveClip and procedural lunge/left-or-right foot at observed contact. Dedicated tackle clip absent; visible reach, stance and return still need review.
- **slide-front — Grätsche von vorn: present+integrated.** Native slide phase reaches a procedural low-body selector using supplied progress and frozen stride; front/side/back contact and floor continuity still need rendered review.
- **slide-side — Grätsche von der Seite: present+integrated.** Native slide phase reaches a procedural low-body selector using supplied progress and frozen stride; front/side/back contact and floor continuity still need rendered review.
- **slide-back — Grätsche von hinten: present+integrated.** Native slide phase reaches a procedural low-body selector using supplied progress and frozen stride; front/side/back contact and floor continuity still need rendered review.
- **slide-gain — Grätsche: Ballgewinn: present+integrated.** Shared procedural slide is source-wired for the native outcomes; separate authored outcome clips are not required. Actual gain/deflection/miss/foul contact and phase exits need visual fixtures.
- **slide-deflect — Grätsche: freier/abgefälschter Ball: present+integrated.** Shared procedural slide is source-wired for the native outcomes; separate authored outcome clips are not required. Actual gain/deflection/miss/foul contact and phase exits need visual fixtures.
- **slide-miss — Grätsche: verfehlt: present+integrated.** Shared procedural slide is source-wired for the native outcomes; separate authored outcome clips are not required. Actual gain/deflection/miss/foul contact and phase exits need visual fixtures.
- **slide-foul — Grätsche: Foulkontakt: present+integrated.** Shared procedural slide is source-wired for the native outcomes; separate authored outcome clips are not required. Actual gain/deflection/miss/foul contact and phase exits need visual fixtures.
- **slide-recover — Grätsche: Aufstehen/Erholung: present+integrated.** Native recovery selects keeper rise with FootballDuelTiming.RiseTime/Recovery. Floor-to-rise continuity still needs rendered review.
- **foul-victim — Foulopfer: Sturz und Aufstehen: present+integrated.** A reused keeper rise after the fall needs floor/body continuity and contact checks on both sides.
- **foul-offender — Foulverursacher/Stolpern: present+integrated.** Existing stumble clip is assigned, catalogued and selected in the foulOffender branch with a bounded FootballDuelTiming.StumbleLength and standing blend. Short-window/floor/return quality still needs rendered review.
- **stumble-general — Stolpern außerhalb Foul: unproven.** No proven native independent stumble trigger; avoid inventing gameplay events merely for animation.
- **keeper-ready — Torwartbereitschaft: present+integrated.** Current gaze/stance source exists; visible readiness before lateral action still needs review.
- **keeper-shuffle — Seitlicher Torwartschritt: present+integrated.** Existing shuffle is assigned, catalogued and selected from measured Lateral; no keeperShuffle action is required. Reversed-cycle right side, readiness, stop/dive/rise transitions still need rendered review.
- **keeper-save — Torwartparade allgemein: present+integrated.** Source thresholds are global-z based while hands/dive lean use local space. Angled orientations and both diving sides require actual review.
- **keeper-dive — Seitliches Hechten: present+integrated.** Source thresholds are global-z based while hands/dive lean use local space. Angled orientations and both diving sides require actual review.
- **keeper-high — Hohe Parade: present+integrated.** Source thresholds are global-z based while hands/dive lean use local space. Angled orientations and both diving sides require actual review.
- **keeper-catch — Torwart fängt/hält: unproven.** Picture contract does not preserve saved/holding, so distinct catch/hold/secure sequence is not proven.
- **keeper-rebound — Torwart Abpraller/Nachfassen: unproven.** Rebound ball remains visible from native frames; no explicit saved vs parry outcome passed and no authored follow-up family proven.
- **keeper-rise — Torwart Aufstehen: present+integrated.** Separate foul rise uses short window, keeper uses full 8.23 s mapped recovery. Fallen pose and floor continuity require visual review.
- **keeper-kick — Torwart Fußabspiel/Abstoß: integrated-quality-defect.** No pickup/ball hold/drop-kick preparation passed; dedicated distribution animation absent.
- **keeper-throw — Torwart Wurf/Rollen: unproven.** No proven native keeperThrow action, no authored roll/throw clip. Existing throw denotes throw-in; do not assume keeper distribution is implemented.
- **throw-in — Einwurf: integrated-quality-defect.** holding/pickup are discarded by picture contract; no full pickup/hold/windup/release follow-through sequence.
- **corner — Eckball: integrated-quality-defect.** Corner preparation/delivery reuses ground-pass movement; dedicated corner clip not required if validated visually, but not yet validated here.
- **free-kick — Freistoß: present+integrated.** No specialised free-kick clip; shot reuse needs ball placement/foot/plant review.
- **penalty — Elfmeter: unproven.** Generic branch is present; full penalty-specific run-up/contact/keeper/result sequence not proven by this source audit.
- **kickoff — Anstoß/Wiederanstoß: unproven.** Reuse pass is possible; dedicated native kickoff action path and complete sequence must be demonstrated in fixture.
- **celebration — Torjubel: present+integrated.** Only booked scoring team while nearly stationary; scorer gets victory; replay/pause and return to restart require review.

## Grenzen

- present+integrated means a source selector exists with existing clips and/or a procedural pose. It does not prove the active Editor scene, WebGL build, visible quality or smartphone performance.
- Missing authored clip families refer to the audited 34 original + 2 pilot clips; an absent authored clip is not a source gap when an existing/procedural alternative is already selected.
- integrated-quality-defect identifies demonstrable generic/partial source substitutions; visual severity is unmeasured.
- No new rig/contact-phase measurement, rendered screenshot/video, device performance measurement or licence decision.
- Source parser depends on explicit clip names and branch syntax. Observed carrier and lateral keeper selectors are inspected separately from p.action labels; unknown syntax remains unproven.
- Native tackle result/legality remains authoritative; origin/outcome details are not inferred as new gameplay states.
