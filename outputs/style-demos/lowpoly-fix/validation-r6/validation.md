# Validation round 6 (Sonnet 5.5): Unity diagnostics for d85a2e5d

Tested commit `d85a2e5d6f1de72e2d9de75b151bfaf8b7abdb96`, Unity 6000.6.4f1, `-batchmode -nographics`, serial, project `G:/unity/Doppel6-LowPoly-Demo` (synced from base a6289dc3: 2 Editor files). No source change. Full data: `validation.json`.

| Run | Exit | Result |
| --- | --- | --- |
| `LowPolyGround` (15 s) | 0 | 52/52; profile 0/3231; poses 342/342, slides 150/150; coverage gallery 342/342, slides 150/150; shape failures 0; max boot shift 5.08 mm (gallery), 0.92 mm (slides) |
| `Tests` (111 s) | 0 | all gate sets identical to R4 (`tests-v4-r4b`): 2/2020/675/285/20/342/642/15/0, 0 missing/extra/value/passed/limit diffs, historic r15 1600 gate fails as before; visible 14670 + 561 pictures, 0 failed, max shift 4.16 / 4.14 mm |
| `NaturalMotion` (89 s) | 0 | enforced, unfiltered, same gate sets; R18 lock 2102.81884765625; 14670 pictures measured (coverage guard passed) |

Sentinels refused: boots +4 cm (floating, +56 mm shift on both feet), boots -4 cm, right glove inflated (-63.7 mm), scalar +0.05/-0.05 ball gap.

Caveats: in the "one glove inflated" sentinel the unmodified left glove also fails (-47.5 mm at ~0.95 m ball distance), so it proves per-hand quantities, not that the other hand passes (real catch: <1 mm). Coverage-guard failing path not executed. Left foot-ball contact, gloves beyond one catch and every native frame stay unproven.

Unchanged: sourceId 644d9d92... (46 files, verified before/after), scene 0cb721dd..., original assets, imports, the nine served web files, git tree clean. Servers 4411/4412/4413 untouched.
