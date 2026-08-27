(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TellaMath = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    var NO_PEAK_MESSAGE = "These numbers don't describe a business with a single best combination — try a smaller congestion value.";
    var PRICE_BELOW_COST_MESSAGE = "You lose money on every unit of this product.";
    var NEGATIVE_BEST_MESSAGE = "With these numbers the best you can do is stop selling this product.";
    var BLANK_FIELD_MESSAGE = "This field is required.";
    var NO_INTERACTION_NOTE = "Products no longer interact.";
    var REQUIRED_FIELDS = ['price1', 'priceDrop1', 'cost1', 'price2', 'priceDrop2', 'cost2', 'congestion', 'fixedCost'];

    var SAMPLE_BAKERY = {
        name: 'Bakery — March actuals',
        question: 'A bakery sells puffs and tea. Using this week’s actuals, find a better daily mix.',
        price1: 30,
        priceDrop1: 0.05,
        cost1: 12.50,
        price2: 16,
        priceDrop2: 0.02,
        cost2: 4.50,
        congestion: 0.01,
        fixedCost: 1000,
        currentX: 200,
        currentY: 150,
        labels: {
            product1: 'Puffs',
            product2: 'Tea',
            unit1: 'puffs per day',
            unit2: 'teas per day',
            currency: '₹'
        }
    };

    var SAMPLE_CUSTOM = {
        name: 'Campus café — exam week',
        question: 'A campus café sells espresso and pastry during exam week. How should they mix the two?',
        price1: 2.80,
        priceDrop1: 0.003,
        cost1: 0.55,
        price2: 3.40,
        priceDrop2: 0.004,
        cost2: 1.10,
        congestion: 0.001,
        fixedCost: 220,
        currentX: 320,
        currentY: 140,
        labels: {
            product1: 'Espresso',
            product2: 'Pastry',
            unit1: 'espressos per day',
            unit2: 'pastries per day',
            currency: '€'
        }
    };

    function isBlank(value) {
        return value === null || value === undefined || value === '';
    }

    function coefficients(config) {
        var A = config.price1 - config.cost1;
        var B = config.priceDrop1;
        var C = config.price2 - config.cost2;
        var D = config.priceDrop2;
        var E = config.congestion;
        var F = config.fixedCost;
        return {A: A, B: B, C: C, D: D, E: E, F: F};
    }

    function profit(x, y, config) {
        var c = coefficients(config);
        return c.A * x - c.B * x * x + c.C * y - c.D * y * y - c.E * x * y - c.F;
    }

    function slopeX(x, y, config) {
        var c = coefficients(config);
        return c.A - 2 * c.B * x - c.E * y;
    }

    function slopeY(x, y, config) {
        var c = coefficients(config);
        return c.C - 2 * c.D * y - c.E * x;
    }

    function bestCombination(config) {
        var c = coefficients(config);
        var den = 4 * c.B * c.D - c.E * c.E;
        if (den <= 0) {
            return {error: 'NO_PEAK', message: NO_PEAK_MESSAGE, den: den};
        }
        return {
            bestX: (2 * c.D * c.A - c.E * c.C) / den,
            bestY: (2 * c.B * c.C - c.E * c.A) / den,
            den: den
        };
    }

    function monthlyGain(bestProfit, currentProfit) {
        return Math.round((bestProfit - currentProfit) * 30 / 50) * 50;
    }

    function costOfBeingOff(n, config) {
        return coefficients(config).B * n * n;
    }

    function roundMoney(value) {
        return Math.round(value);
    }

    function roundSlope(value) {
        return Math.round(value * 100) / 100;
    }

    function formatMoney(value, currency) {
        var sign = value < 0 ? '−' : '';
        return sign + (currency || '₹') + Math.abs(roundMoney(value)).toLocaleString('en-IN');
    }

    function formatSlope(value, currency) {
        var rounded = roundSlope(value);
        var sign = rounded < 0 ? '−' : '';
        return sign + (currency || '₹') + Math.abs(rounded).toFixed(2);
    }

    function plotRange(config) {
        var xMax = 400;
        var yMax = 500;
        var cx = Number(config.currentX) || 0;
        var cy = Number(config.currentY) || 0;
        var peak = bestCombination(config);
        if (!peak.error) {
            xMax = Math.max(xMax, Math.ceil(peak.bestX * 1.4));
            yMax = Math.max(yMax, Math.ceil(peak.bestY * 1.4));
        }
        if (cx > xMax) {
            xMax = Math.ceil(cx * 1.15);
        }
        if (cy > yMax) {
            yMax = Math.ceil(cy * 1.15);
        }
        return {xMin: 0, yMin: 0, xMax: xMax, yMax: yMax};
    }

    function validateConfig(config) {
        var errors = {};
        var warnings = [];
        var notes = [];
        var i;
        for (i = 0; i < REQUIRED_FIELDS.length; i++) {
            if (isBlank(config[REQUIRED_FIELDS[i]]) || isNaN(Number(config[REQUIRED_FIELDS[i]]))) {
                errors[REQUIRED_FIELDS[i]] = BLANK_FIELD_MESSAGE;
            }
        }
        if (Object.keys(errors).length) {
            return {ok: false, canPlot: false, errors: errors, warnings: warnings, notes: notes};
        }
        if (config.price1 < config.cost1) {
            warnings.push(PRICE_BELOW_COST_MESSAGE);
        }
        if (config.price2 < config.cost2) {
            warnings.push(PRICE_BELOW_COST_MESSAGE);
        }
        if (Number(config.congestion) === 0) {
            notes.push(NO_INTERACTION_NOTE);
        }
        var peak = bestCombination(config);
        if (peak.error === 'NO_PEAK') {
            return {
                ok: false,
                canPlot: false,
                errors: {congestion: peak.message},
                warnings: warnings,
                notes: notes,
                peak: peak
            };
        }
        var clamped = {bestX: peak.bestX, bestY: peak.bestY};
        if (peak.bestX < 0) {
            warnings.push(NEGATIVE_BEST_MESSAGE);
            clamped.bestX = 0;
        }
        if (peak.bestY < 0) {
            warnings.push(NEGATIVE_BEST_MESSAGE);
            clamped.bestY = 0;
        }
        return {
            ok: true,
            canPlot: true,
            errors: errors,
            warnings: warnings,
            notes: notes,
            peak: peak,
            clamped: clamped
        };
    }

    function slopeSentence(productLabel, slope, currency) {
        var mag = (currency || '₹') + Math.abs(roundSlope(slope)).toFixed(2);
        var unit = productLabel.toLowerCase().replace(/s$/, '');
        if (roundSlope(slope) > 0) {
            return 'each extra ' + unit + ' earns you ' + mag;
        }
        if (roundSlope(slope) < 0) {
            return 'each extra ' + unit + ' loses you ' + mag;
        }
        return 'one more ' + unit + ' does not change profit';
    }

    function cloneSample() {
        return JSON.parse(JSON.stringify(SAMPLE_BAKERY));
    }

    function cloneCustom() {
        return JSON.parse(JSON.stringify(SAMPLE_CUSTOM));
    }

    return {
        SAMPLE_BAKERY: SAMPLE_BAKERY,
        SAMPLE_CUSTOM: SAMPLE_CUSTOM,
        NO_PEAK_MESSAGE: NO_PEAK_MESSAGE,
        coefficients: coefficients,
        profit: profit,
        slopeX: slopeX,
        slopeY: slopeY,
        bestCombination: bestCombination,
        monthlyGain: monthlyGain,
        costOfBeingOff: costOfBeingOff,
        validateConfig: validateConfig,
        plotRange: plotRange,
        roundMoney: roundMoney,
        roundSlope: roundSlope,
        formatMoney: formatMoney,
        formatSlope: formatSlope,
        slopeSentence: slopeSentence,
        cloneSample: cloneSample,
        cloneCustom: cloneCustom
    };
}));
