define(['local_tella_workshop/math'], function (math) {
    var GRID = 80;
    var LEVELS = 7;

    function buildGrid(config) {
        var range = math.plotRange(config);
        var cells = [];
        var minP = Infinity;
        var maxP = -Infinity;
        var i;
        var j;
        var x;
        var y;
        var p;
        for (i = 0; i <= GRID; i++) {
            cells[i] = [];
            x = range.xMin + (range.xMax - range.xMin) * i / GRID;
            for (j = 0; j <= GRID; j++) {
                y = range.yMin + (range.yMax - range.yMin) * j / GRID;
                p = math.profit(x, y, config);
                cells[i][j] = p;
                if (p < minP) {
                    minP = p;
                }
                if (p > maxP) {
                    maxP = p;
                }
            }
        }
        return {cells: cells, minP: minP, maxP: maxP, range: range, config: config};
    }

    function colourFor(p, minP, maxP, alpha) {
        var t = (p - minP) / (maxP - minP || 1);
        var light = 92 - t * 48;
        return 'hsla(214, 72%, ' + light + '%, ' + (alpha == null ? 1 : alpha) + ')';
    }

    function project(x, y, z, w, h, range, zScale) {
        var nx = (x - range.xMin) / (range.xMax - range.xMin || 1);
        var ny = (y - range.yMin) / (range.yMax - range.yMin || 1);
        var isoX = (nx - ny) * 0.78;
        var isoY = (nx + ny) * 0.38 - z * zScale;
        var cx = w * 0.52;
        var cy = h * 0.18;
        var scale = Math.min(w, h) * 0.72;
        return {x: cx + isoX * scale, y: cy + isoY * scale + h * 0.22};
    }

    function drawSurface(ctx, grid, marker, extras) {
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        var range = grid.range;
        var zScale = 0.55 / (Math.max(Math.abs(grid.maxP), Math.abs(grid.minP), 1));
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);
        var i;
        var j;
        var x0;
        var x1;
        var y0;
        var y1;
        var pts;
        var pAvg;
        for (i = 0; i < GRID; i++) {
            for (j = 0; j < GRID; j++) {
                x0 = range.xMin + (range.xMax - range.xMin) * i / GRID;
                x1 = range.xMin + (range.xMax - range.xMin) * (i + 1) / GRID;
                y0 = range.yMin + (range.yMax - range.yMin) * j / GRID;
                y1 = range.yMin + (range.yMax - range.yMin) * (j + 1) / GRID;
                pts = [
                    project(x0, y0, grid.cells[i][j], w, h, range, zScale),
                    project(x1, y0, grid.cells[i + 1][j], w, h, range, zScale),
                    project(x1, y1, grid.cells[i + 1][j + 1], w, h, range, zScale),
                    project(x0, y1, grid.cells[i][j + 1], w, h, range, zScale)
                ];
                pAvg = (grid.cells[i][j] + grid.cells[i + 1][j] + grid.cells[i + 1][j + 1] + grid.cells[i][j + 1]) / 4;
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                ctx.lineTo(pts[1].x, pts[1].y);
                ctx.lineTo(pts[2].x, pts[2].y);
                ctx.lineTo(pts[3].x, pts[3].y);
                ctx.closePath();
                ctx.fillStyle = colourFor(pAvg, grid.minP, grid.maxP, 0.95);
                ctx.fill();
            }
        }
        drawAxes3d(ctx, range, w, h, zScale, extras && extras.labels);
        if (extras && extras.plane) {
            drawPlane(ctx, grid, extras.plane, zScale);
        }
        if (marker) {
            drawMarker3d(ctx, grid, marker.x, marker.y, zScale);
        }
        if (extras && extras.peak) {
            drawPeak3d(ctx, grid, extras.peak.x, extras.peak.y, zScale);
        }
    }

    function drawAxes3d(ctx, range, w, h, zScale, labels) {
        var a = project(range.xMin, range.yMin, 0, w, h, range, zScale);
        var b = project(range.xMax, range.yMin, 0, w, h, range, zScale);
        var c = project(range.xMin, range.yMax, 0, w, h, range, zScale);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        ctx.fillStyle = '#475569';
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        ctx.fillText((labels && labels.unit1) || 'product 1 per day', b.x - 40, b.y + 16);
        ctx.fillText((labels && labels.unit2) || 'product 2 per day', c.x - 20, c.y + 16);
    }

    function drawMarker3d(ctx, grid, x, y, zScale) {
        var p = math.profit(x, y, grid.config);
        var pt = project(x, y, p, ctx.canvas.width, ctx.canvas.height, grid.range, zScale);
        var base = project(x, y, grid.minP, ctx.canvas.width, ctx.canvas.height, grid.range, zScale);
        ctx.strokeStyle = '#0f172a';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();
    }

    function drawPeak3d(ctx, grid, x, y, zScale) {
        var p = math.profit(x, y, grid.config);
        var pt = project(x, y, p, ctx.canvas.width, ctx.canvas.height, grid.range, zScale);
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawPlane(ctx, grid, plane, zScale) {
        var range = grid.range;
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        var k;
        var t;
        var x;
        var y;
        var p;
        var pt;
        ctx.beginPath();
        for (k = 0; k <= GRID; k++) {
            t = k / GRID;
            if (plane.axis === 'y') {
                y = plane.value;
                x = range.xMin + (range.xMax - range.xMin) * t;
            } else {
                x = plane.value;
                y = range.yMin + (range.yMax - range.yMin) * t;
            }
            p = math.profit(x, y, grid.config);
            pt = project(x, y, p, w, h, range, zScale);
            if (k === 0) {
                ctx.moveTo(pt.x, pt.y);
            } else {
                ctx.lineTo(pt.x, pt.y);
            }
        }
        var start;
        var end;
        if (plane.axis === 'y') {
            start = project(range.xMin, plane.value, grid.minP, w, h, range, zScale);
            end = project(range.xMax, plane.value, grid.minP, w, h, range, zScale);
        } else {
            start = project(plane.value, range.yMin, grid.minP, w, h, range, zScale);
            end = project(plane.value, range.yMax, grid.minP, w, h, range, zScale);
        }
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(start.x, start.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(37, 99, 235, 0.18)';
        ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawContour(ctx, grid, marker, extras) {
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        var padL = 56;
        var padB = 40;
        var padT = 16;
        var padR = 16;
        var plotW = w - padL - padR;
        var plotH = h - padT - padB;
        var range = grid.range;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, w, h);
        var i;
        var j;
        var pAvg;
        var level;
        var cw = plotW / GRID;
        var ch = plotH / GRID;
        for (i = 0; i < GRID; i++) {
            for (j = 0; j < GRID; j++) {
                pAvg = (grid.cells[i][j] + grid.cells[i + 1][j] + grid.cells[i + 1][j + 1] + grid.cells[i][j + 1]) / 4;
                level = Math.floor(((pAvg - grid.minP) / (grid.maxP - grid.minP || 1)) * (LEVELS - 1));
                ctx.fillStyle = colourFor(grid.minP + level * (grid.maxP - grid.minP) / (LEVELS - 1), grid.minP, grid.maxP, 1);
                ctx.fillRect(padL + i * cw, padT + (GRID - 1 - j) * ch, cw + 0.5, ch + 0.5);
            }
        }
        drawZeroRing(ctx, grid, padL, padT, plotW, plotH);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(padL, padT, plotW, plotH);
        ctx.fillStyle = '#475569';
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        ctx.fillText((extras && extras.labels && extras.labels.unit1) || 'product 1 per day', padL, h - 12);
        ctx.save();
        ctx.translate(16, padT + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText((extras && extras.labels && extras.labels.unit2) || 'product 2 per day', 0, 0);
        ctx.restore();
        if (extras && extras.trail) {
            drawTrail(ctx, extras.trail, range, padL, padT, plotW, plotH);
        }
        if (extras && extras.peak) {
            mapDot(ctx, extras.peak.x, extras.peak.y, range, padL, padT, plotW, plotH, '#2563eb', 6);
        }
        if (marker) {
            mapDot(ctx, marker.x, marker.y, range, padL, padT, plotW, plotH, '#f59e0b', 7);
            if (extras && extras.arrow) {
                drawArrow(ctx, marker, extras.arrow, range, padL, padT, plotW, plotH);
            }
        }
        return {padL: padL, padT: padT, plotW: plotW, plotH: plotH, range: range};
    }

    function mapPoint(x, y, range, padL, padT, plotW, plotH) {
        return {
            x: padL + (x - range.xMin) / (range.xMax - range.xMin || 1) * plotW,
            y: padT + (1 - (y - range.yMin) / (range.yMax - range.yMin || 1)) * plotH
        };
    }

    function mapDot(ctx, x, y, range, padL, padT, plotW, plotH, colour, r) {
        var pt = mapPoint(x, y, range, padL, padT, plotW, plotH);
        ctx.fillStyle = colour;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();
    }

    function drawTrail(ctx, trail, range, padL, padT, plotW, plotH) {
        if (!trail.length) {
            return;
        }
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        trail.forEach(function (pt, idx) {
            var mapped = mapPoint(pt.x, pt.y, range, padL, padT, plotW, plotH);
            if (idx === 0) {
                ctx.moveTo(mapped.x, mapped.y);
            } else {
                ctx.lineTo(mapped.x, mapped.y);
            }
        });
        ctx.stroke();
    }

    function drawArrow(ctx, marker, arrow, range, padL, padT, plotW, plotH) {
        var mag = Math.sqrt(arrow.dx * arrow.dx + arrow.dy * arrow.dy);
        if (mag < 0.05) {
            return;
        }
        var start = mapPoint(marker.x, marker.y, range, padL, padT, plotW, plotH);
        var len = Math.min(70, 12 + mag * 4);
        var ux = arrow.dx / mag;
        var uy = arrow.dy / mag;
        var endX = start.x + ux * len;
        var endY = start.y - uy * len;
        ctx.strokeStyle = '#16a34a';
        ctx.fillStyle = '#16a34a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - ux * 8 - uy * 4, endY + uy * 8 - ux * 4);
        ctx.lineTo(endX - ux * 8 + uy * 4, endY + uy * 8 + ux * 4);
        ctx.closePath();
        ctx.fill();
    }

    function drawZeroRing(ctx, grid, padL, padT, plotW, plotH) {
        var range = grid.range;
        var i;
        var j;
        var a;
        var b;
        var c;
        var d;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.lineWidth = 1.5;
        for (i = 0; i < GRID; i++) {
            for (j = 0; j < GRID; j++) {
                a = grid.cells[i][j];
                b = grid.cells[i + 1][j];
                c = grid.cells[i + 1][j + 1];
                d = grid.cells[i][j + 1];
                if ((a < 0 && b < 0 && c < 0 && d < 0) || (a > 0 && b > 0 && c > 0 && d > 0)) {
                    continue;
                }
                ctx.strokeRect(
                    padL + i * plotW / GRID,
                    padT + (GRID - 1 - j) * plotH / GRID,
                    plotW / GRID,
                    plotH / GRID
                );
            }
        }
    }

    function drawSlice(ctx, config, frozenAxis, frozenValue, currentFree, labels) {
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
        var padL = 58;
        var padB = 42;
        var padT = 16;
        var padR = 16;
        var range = math.plotRange(config);
        var freeMin = frozenAxis === 'y' ? range.xMin : range.yMin;
        var freeMax = frozenAxis === 'y' ? range.xMax : range.yMax;
        var values = [];
        var k;
        var free;
        var x;
        var y;
        var p;
        var minP = Infinity;
        var maxP = -Infinity;
        for (k = 0; k <= 120; k++) {
            free = freeMin + (freeMax - freeMin) * k / 120;
            if (frozenAxis === 'y') {
                x = free;
                y = frozenValue;
            } else {
                x = frozenValue;
                y = free;
            }
            p = math.profit(x, y, config);
            values.push({free: free, p: p});
            if (p < minP) {
                minP = p;
            }
            if (p > maxP) {
                maxP = p;
            }
        }
        if (maxP === minP) {
            maxP = minP + 1;
        }
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(padL, padT, w - padL - padR, h - padT - padB);
        ctx.beginPath();
        values.forEach(function (pt, idx) {
            var px = padL + (pt.free - freeMin) / (freeMax - freeMin) * (w - padL - padR);
            var py = padT + (1 - (pt.p - minP) / (maxP - minP)) * (h - padT - padB);
            if (idx === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        });
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        var slope = frozenAxis === 'y'
            ? math.slopeX(currentFree, frozenValue, config)
            : math.slopeY(frozenValue, currentFree, config);
        var cx = padL + (currentFree - freeMin) / (freeMax - freeMin) * (w - padL - padR);
        var cy = padT + (1 - (math.profit(
            frozenAxis === 'y' ? currentFree : frozenValue,
            frozenAxis === 'y' ? frozenValue : currentFree,
            config
        ) - minP) / (maxP - minP)) * (h - padT - padB);
        var span = 50;
        var xScale = (w - padL - padR) / (freeMax - freeMin);
        var yScale = (h - padT - padB) / (maxP - minP);
        ctx.beginPath();
        ctx.moveTo(cx - span, cy + slope * (span / xScale) * yScale);
        ctx.lineTo(cx + span, cy - slope * (span / xScale) * yScale);
        ctx.strokeStyle = slope >= 0 ? '#16a34a' : '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();
        ctx.fillStyle = '#475569';
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(frozenAxis === 'y' ? (labels.unit1 || '') : (labels.unit2 || ''), padL, h - 14);
        ctx.fillText('daily profit', 8, 22);
    }

    return {
        buildGrid: buildGrid,
        drawSurface: drawSurface,
        drawContour: drawContour,
        drawSlice: drawSlice
    };
});
