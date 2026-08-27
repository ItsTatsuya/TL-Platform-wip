define(['local_tella_workshop/math'], function (math) {
    function fromPoint(config, actuals) {
        if (actuals && actuals.x != null) {
            return {x: actuals.x, y: actuals.y};
        }
        return {x: config.currentX, y: config.currentY};
    }

    function recommendation(config, actuals) {
        var labels = config.labels || {};
        var peak = math.bestCombination(config);
        if (peak.error) {
            return peak.message;
        }
        var from = fromPoint(config, actuals);
        var current = math.roundMoney(math.profit(from.x, from.y, config));
        var best = math.roundMoney(math.profit(peak.bestX, peak.bestY, config));
        var gain = math.monthlyGain(best, current);
        return 'Sell ' + Math.round(peak.bestX) + ' ' + (labels.product1 || 'product 1').toLowerCase() +
            ' and ' + Math.round(peak.bestY) + ' ' + (labels.product2 || 'product 2').toLowerCase() +
            ' instead of ' + Math.round(from.x) + ' and ' + Math.round(from.y) +
            ' — about ' + math.formatMoney(gain, labels.currency) + ' more per month.';
    }

    function workingText(config) {
        var c = math.coefficients(config);
        var peak = math.bestCombination(config);
        var labels = config.labels || {};
        var p1 = (labels.product1 || 'product 1').toLowerCase();
        var p2 = (labels.product2 || 'product 2').toLowerCase();
        var lines = [];
        lines.push('Hold ' + p2 + ' still. The change from one more ' + p1 + ' is:');
        lines.push(c.A.toFixed(2) + ' − ' + (2 * c.B).toFixed(2) + ' × ' + p1 + ' − ' + c.E.toFixed(2) + ' × ' + p2 + ' = 0');
        lines.push('Hold ' + p1 + ' still. The change from one more ' + p2 + ' is:');
        lines.push(c.C.toFixed(2) + ' − ' + (2 * c.D).toFixed(2) + ' × ' + p2 + ' − ' + c.E.toFixed(2) + ' × ' + p1 + ' = 0');
        if (!peak.error) {
            lines.push('Best whole-number combination: ' + Math.round(peak.bestX) + ' ' + p1 +
                ' and ' + Math.round(peak.bestY) + ' ' + p2 + '.');
        }
        return lines;
    }

    function escapePdf(text) {
        return String(text)
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/₹/g, 'Rs ')
            .replace(/€/g, 'EUR ');
    }

    function buildPdf(lines) {
        var content = [];
        var i;
        var y = 800;
        content.push('BT /F1 16 Tf 48 ' + y + ' Td (' + escapePdf('Tella workshop report') + ') Tj ET');
        y -= 28;
        for (i = 0; i < lines.length; i++) {
            content.push('BT /F1 11 Tf 48 ' + y + ' Td (' + escapePdf(lines[i]) + ') Tj ET');
            y -= 16;
        }
        var stream = content.join('\n');
        var objects = [];
        objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
        objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
        objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj');
        objects.push('4 0 obj << /Length ' + stream.length + ' >> stream\n' + stream + '\nendstream endobj');
        objects.push('5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
        var pdf = '%PDF-1.4\n';
        var offsets = [0];
        objects.forEach(function (obj) {
            offsets.push(pdf.length);
            pdf += obj + '\n';
        });
        var xrefPos = pdf.length;
        pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
        pdf += '0000000000 65535 f \n';
        offsets.slice(1).forEach(function (off) {
            pdf += ('0000000000' + off).slice(-10) + ' 00000 n \n';
        });
        pdf += 'trailer << /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF';
        return pdf;
    }

    function downloadPdf(config, actuals) {
        var labels = config.labels || {};
        var peak = math.bestCombination(config);
        var from = fromPoint(config, actuals);
        var sx = math.slopeX(from.x, from.y, config);
        var sy = math.slopeY(from.x, from.y, config);
        var lines = [
            config.name || 'Saved business',
            recommendation(config, actuals),
            'Best combination: ' + Math.round(peak.bestX || 0) + ' / ' + Math.round(peak.bestY || 0),
            'Value of one more unit at current position: ' + math.formatSlope(sx, labels.currency) +
                ' ' + (labels.product1 || '') + ' · ' + math.formatSlope(sy, labels.currency) + ' ' + (labels.product2 || ''),
            'Cost of being off by 10 units: ' + math.formatMoney(math.costOfBeingOff(10, config), labels.currency) + ' per day',
            'Cost of being off by 50 units: ' + math.formatMoney(math.costOfBeingOff(50, config), labels.currency) + ' per day'
        ].concat(workingText(config));
        var pdf = buildPdf(lines);
        var blob = new Blob([pdf], {type: 'application/pdf'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'tella-workshop-report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return {
        recommendation: recommendation,
        workingText: workingText,
        downloadPdf: downloadPdf
    };
});
