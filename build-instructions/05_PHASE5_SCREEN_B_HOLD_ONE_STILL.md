# Phase 5 — Screen B: Hold One Input Still (Highest Priority)

**This is the screen the whole module exists for.** Budget development time and testing resources here first. If the linked animation stutters or the two panels drift out of sync, the module fails its only real job.

## 5.1 Layout

- Header: Freeze an input · tea = 150 · puffs = free · | · Swap
- Left panel: 3-D (or contour) landscape with a vertical cutting plane that slides as the frozen value changes
- Right panel: the cut drawn as a plain 2-D curve with a tangent line at the current position
- Large, colour-coded slope sentence at the bottom or side:
  - Green when positive
  - Amber when negative (never pure red)
  - Full sentence: “each extra puff loses you ₹4.00” — never a bare signed number

## 5.2 Behaviour (non-negotiable)

- The two panels animate together in the same frame while the learner drags the frozen value.
- Swap freezes the other input; layout and corner positions stay identical.
- Slope readout updates live during the drag, not only on release.
- Sign is expressed in words.

## 5.3 Verification with Sample Data

At current position (200, 150):

- Puff slope (tea frozen) = −₹4.00
- Tea slope (puffs frozen) = +₹3.50

## 5.4 Performance Requirement

Plane and curve stay in sync at ≥ 30 fps while dragging on the **lowest-spec target device**. Test this device before polishing anything else.

## 5.5 Acceptance Criteria

- [ ] Plane and curve stay in sync at 30 fps or better on the lowest-spec target device
- [ ] Slope readout updates live during the drag
- [ ] Slope is stated as a full sentence in currency units
- [ ] Swapping the frozen input keeps the same layout and corner positions
- [ ] With sample data at 200 puffs / 150 teas the two slope values match the verification numbers exactly

Do not proceed to Screen C until every criterion above is green.