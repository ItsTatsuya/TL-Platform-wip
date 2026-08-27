# Phase 6 — Screen C: Walk Uphill, Then Solve

**Goal:** Learner moves both inputs with sliders, watches profit climb in real time, sees an uphill arrow that shrinks to zero at the peak, and can optionally ask the app to animate to the best combination.

## 6.1 Layout

- Header controls: Optimise · Solve · Show uphill arrow · Reset to actuals
- Main view: Contour map (default) with uphill arrow, breadcrumb trail of visited positions, peak marker
- Two sliders (product 1, product 2) producing only whole numbers
- Live profit counter that updates on every frame of a drag
- Both slope readouts live

## 6.2 Behaviour

- Profit counter must update continuously with no visible stutter.
- Uphill arrow points in the direction of the gradient (slopeX, slopeY); its length is proportional to √(slopeX² + slopeY²) and visibly shrinks to nothing as the learner approaches the top.
- Trail is a faint breadcrumb line (cheap to implement, high presenter value).
- Solve animates the marker to the optimum rather than teleporting; shows before → after profit.
- Reset to actuals is one tap and restores original position + slider values.

## 6.3 Sample Data Targets

- Solve lands on 150 and 250
- Profit transition: ₹1,475 → ₹1,750
- At the peak both slopes are zero and the arrow vanishes

## 6.4 Scope Note (from proposal)

Solve is the least important item on this screen. If time is short, a presenter can compute the answer by hand. The live sliders and continuous profit counter cannot be worked around.

## 6.5 Acceptance Criteria

- [ ] Profit counter updates continuously during a slider drag with no visible stutter
- [ ] Uphill arrow shrinks toward zero length as the marker approaches the best combination
- [ ] Solve lands on 150 / 250 with sample data and shows ₹1,475 → ₹1,750
- [ ] Reset restores the original position in one tap, sliders included
- [ ] Slider step sizes produce only whole numbers

Once green, the learning core of the module is complete.