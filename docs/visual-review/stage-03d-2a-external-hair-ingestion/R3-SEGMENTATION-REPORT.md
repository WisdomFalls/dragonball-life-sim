# Stage 03D.2C-R3 proof

Authoritative axes: `+Z` up, `-Y` character FRONT, `+Y` back. With the importer’s `(-1,1,1)` handedness conversion, world `-X` is anatomical LEFT and `+X` anatomical RIGHT. The donor bounds are `(-0.223098,-0.184913,0.605361)` to `(0.208052,0.322551,1.077079)`.

The semantic experiment used the three intact donor submeshes as provisional geometry modules, preserving original coordinates, transforms, and material slots. Modules: `xv2-submesh-0` crown_top_mass (575 vertices/508 polygons), `xv2-submesh-1` front_fringe (914/760), and `xv2-submesh-2` rear_occipital_mass (120/103). No unsupported regions were fabricated. Hair-only renders exclude proxy and helpers; the proxy is retained only in the head-fit diagnostic.

Unsplit and recombined renders use the same camera, transform, lighting, and resolution; they are geometry-equivalent by construction. Diagnostic region colors are inspection-only. `TRUE_FRONT=GREEN`, `ANATOMICAL_X_MAPPING=GREEN`, `HEAD_REGISTRATION=YELLOW` (proxy fit remains inspection-level), and `3D_MODULARIZATION=YELLOW`: deterministic separation is viable for this donor’s three submeshes, but semantic naming remains donor-specific and requires topology review.
