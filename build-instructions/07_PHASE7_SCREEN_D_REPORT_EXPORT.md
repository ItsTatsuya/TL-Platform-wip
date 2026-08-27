# Phase 7 — Screen D: The Output the Learner Keeps

**Goal:** One clean, exportable page that the learner can take away. This is the strongest commercial artefact.

## 7.1 Contents

1. **Recommendation sentence** (plain language, no mathematical notation)  
   Example: “Sell 150 puffs and 250 teas instead of 200 and 150 — about ₹8,250 more per month.”

2. **Best combination** — whole units

3. **Value of one more unit** (computed at the *current* position, not the peak)  
   −₹4.00 puffs · +₹3.50 tea

4. **Cost of being off**  
   10 units off ≈ ₹5/day · 50 units off ≈ ₹125/day

5. **Break-even ring** — the contour where profit = 0 (reuse the contour renderer)

6. **Working shown** — the two equations and their solution, collapsed by default, expandable. State remembered per learner.

## 7.2 Export

- Single-page PDF that remains legible when printed in black and white.
- Prefer client-side generation (jsPDF, html2canvas, or similar) so the module stays usable offline.
- Share button (Web Share API or copy link).

## 7.3 Acceptance Criteria

- [ ] Exports as a single-page PDF legible in black and white
- [ ] Recommendation sentence contains no mathematical notation
- [ ] Working section is collapsed on first open and its state is remembered
- [ ] Report regenerates from any saved dataset without re-running the workshop
- [ ] All numbers match the verification dataset

This screen can be polished after the interactive core is solid.