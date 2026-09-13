# ProjectXIR 0.0.6 compatibility repair

Upstream archive SHA-256: `c67c7fda1925d5f02a3ecd75fdad5c395e8a72249e8e27779db4fcdcc45ed93b`.
Derived package SHA-256: `c9207b60858687eb1b81f805c34fabd3212ea5e7301ec084e328c263e59ec5bc`.

The GitHub ZIP root `ProjectXIR-main` was incompatible with the addon's hard-coded `Project XIR/verifications/PillowInstalled` path. The first correction renamed only the derived package root to `Project XIR`; activation still failed because the upstream archive contains no `verifications` directory. The final derived package adds `verifications/.keep` and changes deprecated Blender API selection assignments (`Object.select` to `Object.select_set`) in `import_XenoModel.py` and `import_rig.py`. No upstream source archive was edited.

Pillow 9.5.0 was already importable in Blender's bundled Python. With the derived package, activation succeeds and `xenoverse_ir.emd` registers. Blender 2.92 emits registration warnings only.
