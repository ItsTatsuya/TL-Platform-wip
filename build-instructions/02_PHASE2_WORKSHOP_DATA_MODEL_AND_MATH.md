# Phase 2 — Workshop Data Model & Exact Mathematics

**Goal:** Encode the complete mathematical content of the Multivariable Modelling Workshop so that every subsequent UI phase can call pure arithmetic functions and obtain identical results.

**Source of truth:** Workshop Module — Build Proposal (Developers), pages 7–9.

## 2.1 Six Coefficients from Seven Inputs

```javascript
// Inputs (learner-facing names)
const price1, priceDrop1, cost1, price2, priceDrop2, cost2, congestion, fixedCost;

// Derived once
const A = price1 - cost1;          // contribution margin product 1
const B = priceDrop1;
const C = price2 - cost2;
const D = priceDrop2;
const E = congestion;
const F = fixedCost;
```

## 2.2 Core Functions (must be implemented identically in JS and optionally mirrored in Python for tests)

```javascript
function profit(x, y) {
  return A*x - B*x*x + C*y - D*y*y - E*x*y - F;
}

function slopeX(x, y) {          // “what one more unit of product 1 does”
  return A - 2*B*x - E*y;
}

function slopeY(x, y) {
  return C - 2*D*y - E*x;
}

function bestCombination() {
  const den = 4*B*D - E*E;
  if (den <= 0) {
    return { error: "NO_PEAK", message: "These numbers don't describe a business with a single best combination — try a smaller congestion value." };
  }
  const bestX = (2*D*A - E*C) / den;
  const bestY = (2*B*C - E*A) / den;
  return { bestX, bestY, den };
}
```

Additional report helpers:

```javascript
function monthlyGain(bestProfit, currentProfit) {
  return Math.round((bestProfit - currentProfit) * 30 / 50) * 50;   // nearest ₹50
}

function costOfBeingOff(n) {
  return B * n * n;   // per day, for product 1 offset (symmetric treatment for product 2 can be added)
}
```

## 2.3 Sample Bakery Dataset (must reproduce exactly)

| Field                        | Value  |
|-----------------------------|--------|
| Product 1 starting price    | 30     |
| Product 1 price drop / unit | 0.05   |
| Product 1 cost / unit       | 12.50  |
| Product 2 starting price    | 16     |
| Product 2 price drop / unit | 0.02   |
| Product 2 cost / unit       | 4.50   |
| Congestion cost             | 0.01   |
| Fixed cost / day            | 1000   |
| Current position (x, y)     | 200, 150 |

Derived:

- A = 17.5, B = 0.05, C = 11.5, D = 0.02, E = 0.01, F = 1000
- den = 0.0039
- profit(200, 150) = 1475
- slopeX(200, 150) = −4.00
- slopeY(200, 150) = +3.50
- bestX, bestY = 150, 250
- profit(150, 250) = 1750
- monthlyGain ≈ 8250

## 2.4 Data Shape to Persist (Django model or JSONB)

```json
{
  "name": "Bakery — March actuals",
  "price1": 30,
  "priceDrop1": 0.05,
  "cost1": 12.50,
  "price2": 16,
  "priceDrop2": 0.02,
  "cost2": 4.50,
  "congestion": 0.01,
  "fixedCost": 1000,
  "currentX": 200,
  "currentY": 150,
  "labels": {
    "product1": "Puffs",
    "product2": "Tea",
    "unit1": "puffs per day",
    "unit2": "teas per day",
    "currency": "₹"
  }
}
```

**Never store computed values.** Always recompute on load.

## 2.5 Validation Rules (must be enforced both client-side and on any save endpoint)

| Condition                    | Behaviour                          | Message |
|-----------------------------|------------------------------------|---------|
| den ≤ 0                     | Block plotting                     | “These numbers don't describe a business with a single best combination — try a smaller congestion value.” |
| Congestion = 0              | Allow                              | Note that products no longer interact |
| Price < cost                | Allow + warn                       | “You lose money on every unit of this product.” |
| bestX or bestY < 0          | Clamp to 0 + warn                  | “With these numbers the best you can do is stop selling this product.” |
| Any required field blank    | Block plotting                     | Inline field error |
| Current position far off-grid | Expand plot range silently       | Marker always visible |

Rounding:

- Units → whole numbers
- Slopes → two decimal places in currency
- All other money → whole currency units
- Monthly figure → nearest 50

## 2.6 Django Model Suggestion

```python
class WorkshopModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    activity = models.ForeignKey(LearningActivity, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)  # null = sample / shared
    name = models.CharField(max_length=200)
    # the seven numeric fields + labels as JSONField or individual DecimalFields
    config = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

## 2.7 Acceptance Criteria

- [ ] Pure JavaScript functions reproduce every verification value listed above to machine precision (or ±0.01 for currency)
- [ ] Django model can store and retrieve the exact sample data shape
- [ ] Validation messages match the table exactly
- [ ] Unit tests (Python and/or Jest) cover the six expressions and the den ≤ 0 guard

This phase is pure logic. No UI. Once green, the UI phases can trust the math layer completely.