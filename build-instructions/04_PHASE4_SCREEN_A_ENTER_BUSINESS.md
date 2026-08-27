# Phase 4 — Screen A: Enter the Business

**Goal:** Learner enters (or loads) the seven business numbers; the app immediately draws the profit landscape with a marker at the current position. Nothing mathematical is explained yet.

## 4.1 UI Layout

- Header strip: “Bakery — March actuals” · Plot · Reset · Load sample
- Left panel: clean 7-field input table (or two product cards + congestion + fixed cost)
- Right panel: 3-D surface (fixed camera) **or** contour map toggle
- Persistent profit counter in a consistent corner (used on every screen)
- “You are here” readout of current (x, y)

## 4.2 Behaviour (from Build Proposal)

- Plot must render surface + marker together; the marker is the emotional hook.
- Contour toggle becomes the default view from Screen C onward — implement it here.
- Camera fixed; at most a small drag with snap-back.
- Load sample populates the bakery dataset in one tap and plots in < 1 s on mid-range Android.
- Axes labelled in plain language: “puffs per day”, never “x”.

## 4.3 Technical Notes

- Use pure Canvas or a lightweight library already present in the organisation. Prefer one dependency.
- Grid evaluation: 80 × 80 is sufficient (x: 0–400, y: 0–500 for sample).
- Contour: single colour ramp, light-to-dark, 6–8 rings. No rainbow.
- Marker must sit visibly below the peak with sample data.

## 4.4 Acceptance Criteria

- [ ] Sample data loads and plots in under 1 second on a mid-range Android device
- [ ] Marker sits visibly below the peak with the sample data
- [ ] Axes labelled in words and units
- [ ] Contour map uses one colour ramp, 6–8 rings
- [ ] Profit counter appears in the same screen corner used on every other screen
- [ ] Reset clears to empty or last saved state cleanly

This screen is the entry point; keep it fast and inviting.