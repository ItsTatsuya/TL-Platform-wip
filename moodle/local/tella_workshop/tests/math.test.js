const test = require('node:test');
const assert = require('node:assert/strict');
const math = require('../amd/src/math.js');

const sample = math.SAMPLE_BAKERY;

test('sample coefficients', () => {
    const c = math.coefficients(sample);
    assert.equal(c.A, 17.5);
    assert.equal(c.B, 0.05);
    assert.equal(c.C, 11.5);
    assert.equal(c.D, 0.02);
    assert.equal(c.E, 0.01);
    assert.equal(c.F, 1000);
});

test('profit and slopes at current position', () => {
    assert.ok(Math.abs(math.profit(200, 150, sample) - 1475) < 0.01);
    assert.ok(Math.abs(math.slopeX(200, 150, sample) - (-4)) < 0.01);
    assert.ok(Math.abs(math.slopeY(200, 150, sample) - 3.5) < 0.01);
});

test('best combination and peak profit', () => {
    const peak = math.bestCombination(sample);
    assert.ok(Math.abs(peak.den - 0.0039) < 1e-12);
    assert.ok(Math.abs(peak.bestX - 150) < 0.01);
    assert.ok(Math.abs(peak.bestY - 250) < 0.01);
    assert.ok(Math.abs(math.profit(150, 250, sample) - 1750) < 0.01);
    assert.ok(Math.abs(math.slopeX(150, 250, sample)) < 0.01);
    assert.ok(Math.abs(math.slopeY(150, 250, sample)) < 0.01);
});

test('monthly gain and cost of being off', () => {
    assert.equal(math.monthlyGain(1750, 1475), 8250);
    assert.equal(math.costOfBeingOff(10, sample), 5);
    assert.equal(math.costOfBeingOff(50, sample), 125);
});

test('custom cafe question has a peak and different products', () => {
    const cafe = math.SAMPLE_CUSTOM;
    assert.equal(cafe.labels.product1, 'Espresso');
    assert.equal(cafe.labels.currency, '€');
    const peak = math.bestCombination(cafe);
    assert.ok(!peak.error);
    assert.ok(peak.bestX > 0);
    assert.ok(peak.bestY > 0);
    const now = math.profit(cafe.currentX, cafe.currentY, cafe);
    const best = math.profit(peak.bestX, peak.bestY, cafe);
    assert.ok(best > now);
});

test('den <= 0 guard', () => {
    const bad = Object.assign({}, sample, {congestion: 1});
    const peak = math.bestCombination(bad);
    assert.equal(peak.error, 'NO_PEAK');
    const result = math.validateConfig(bad);
    assert.equal(result.canPlot, false);
    assert.equal(result.errors.congestion, math.NO_PEAK_MESSAGE);
});
