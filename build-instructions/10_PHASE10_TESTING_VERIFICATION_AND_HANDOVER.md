# Phase 10 — Testing, Verification Dataset & Handover

**Goal:** Prove that the production workshop matches the Build Proposal exactly and is ready for university pilots.

## 10.1 Mandatory Verification Dataset

Load the sample bakery data and confirm every value:

| Check                          | Expected          | Where it appears          |
|--------------------------------|-------------------|---------------------------|
| Coefficient den                | 0.0039            | Internal guard            |
| profit(200, 150)               | ₹1,475            | Screen A / C counter      |
| slopeX(200, 150)               | −₹4.00            | Screen B (puffs free)     |
| slopeY(200, 150)               | +₹3.50            | Screen B after swap       |
| bestX, bestY                   | 150 · 250         | Screen C after Solve      |
| profit(150, 250)               | ₹1,750            | Screen C at peak          |
| slopes at peak                 | 0 · 0             | Arrow vanishes            |
| monthlyGain                    | ₹8,250            | Screen D sentence         |
| costOfBeingOff(10) / (50)      | ₹5 · ₹125 per day | Screen D sensitivity      |

## 10.2 Device & Performance Testing Order

1. Lowest-spec target device — Screen B linked animation first
2. Mid-range Android (sample load < 1 s)
3. Common university laptop browsers (Chrome, Firefox, Edge, Safari)
4. iPad / Android tablet landscape and portrait

## 10.3 Build Priority Reminder (from original proposal)

1. Freeze + slice (Screen B) — Must have  
2. Slope readouts in currency sentences — Must have  
3. Contour map — Must have  
4. Sliders + live counter — Must have  
5. Sample-data loader — Must have  
6. 3-D surface — Should have  
7. Solve button — Should have  
8. Report + PDF — Should have  
9. Breadcrumb / arrow polish — Nice to have  
10. Fully custom learner-entered businesses — Nice to have (post-launch)

## 10.4 Handover Package

Provide the university / client with:

- This entire `build-instructions/` folder
- Short video walkthrough of the four screens using sample data
- Known limitations and offline behaviour notes
- API documentation for the Django endpoints used by the plugin
- Instructions for Moodle administrators to install the local plugin and configure the Django base URL + SSO secret

## 10.5 Final Acceptance Gate

All of the following must be true before declaring the Business Mathematics Multivariable Workshop production-ready:

- [ ] Every number in the verification table matches exactly
- [ ] Screen B animation is smooth on the lowest-spec device
- [ ] Offline core works
- [ ] Moodle SSO / token bridge functions
- [ ] PDF export is single-page and legible in greyscale
- [ ] UI is clean, modern and free of Moodle visual leakage
- [ ] Progress and at least basic gamification persist

Once the gate is passed, the same architecture is ready to receive the AI for Business Management skill modules.