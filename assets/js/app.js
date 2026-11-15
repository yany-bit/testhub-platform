/* TestHub 一体化测试平台 —— 轻量图表与交互（无外部依赖） */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  /* 主题感知配色：走 CSS 变量，深色模式自动切换 */
  var C = {
    grid:      "var(--chart-grid, #eef2f7)",
    gridStrong:"var(--chart-grid-strong, #cbd5e1)",
    muted:     "var(--chart-muted, #94a3b8)",
    muted2:    "var(--chart-muted2, #64748b)",
    ink:       "var(--chart-ink, #0f172a)",
    ink2:      "var(--chart-ink2, #334155)",
    point:     "var(--chart-point, #ffffff)"
  };

  function n(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    var exp = Math.pow(10, Math.floor(Math.log10(v)));
    var f = v / exp;
    var m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return m * exp;
  }

  function legend(container, series) {
    var box = document.createElement("div");
    box.className = "legend";
    series.forEach(function (s) {
      var span = document.createElement("span");
      var i = document.createElement("i");
      i.style.background = s.color;
      span.appendChild(i);
      span.appendChild(document.createTextNode(s.name));
      box.appendChild(span);
    });
    if (container.parentNode) container.parentNode.insertBefore(box, container);
  }

  /* 折线图：labels + series[{name,color,data,dashed}] */
  window.lineChart = function (sel, cfg) {
    var host = document.querySelector(sel);
    if (!host) return;
    var labels = cfg.labels, series = cfg.series;
    var W = 680, H = cfg.height || 300;
    var P = { l: 52, r: 18, t: 16, b: 38 };
    var iw = W - P.l - P.r, ih = H - P.t - P.b;
    var maxV = 0;
    series.forEach(function (s) { s.data.forEach(function (v) { if (v > maxV) maxV = v; }); });
    var top = niceMax(maxV * 1.12);
    var svg = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    var ticks = 5;
    for (var i = 0; i <= ticks; i++) {
      var y = P.t + ih - (ih * i) / ticks;
      var gl = n("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, "stroke-width": 1 });
      gl.style.stroke = i === 0 ? C.gridStrong : C.grid;
      svg.appendChild(gl);
      var ty = n("text", { x: P.l - 10, y: y + 4, "text-anchor": "end", "font-size": 11 }, Math.round((top * i) / ticks));
      ty.style.fill = C.muted;
      svg.appendChild(ty);
    }
    var stepX = labels.length > 1 ? iw / (labels.length - 1) : 0;
    labels.forEach(function (lb, i) {
      var x = P.l + stepX * i;
      var tx = n("text", { x: x, y: H - 14, "text-anchor": "middle", "font-size": 11.5 }, lb);
      tx.style.fill = C.muted2;
      svg.appendChild(tx);
    });
    var unit = n("text", { x: 14, y: P.t + 2, "font-size": 11 }, cfg.unit || "");
    unit.style.fill = C.muted;
    svg.appendChild(unit);
    series.forEach(function (s) {
      var pts = s.data.map(function (v, i) {
        return [P.l + stepX * i, P.t + ih - (ih * v) / top];
      });
      var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
      svg.appendChild(n("path", {
        d: d, fill: "none", stroke: s.color, "stroke-width": 2.6,
        "stroke-linejoin": "round", "stroke-linecap": "round",
        "stroke-dasharray": s.dashed ? "6 5" : ""
      }));
      pts.forEach(function (p, i) {
        var c = n("circle", { cx: p[0], cy: p[1], r: 4, stroke: s.color, "stroke-width": 2.4 });
        c.style.fill = C.point;
        var t = n("title", null, s.name + " · " + labels[i] + "：" + s.data[i] + (cfg.unit || ""));
        c.appendChild(t);
        svg.appendChild(c);
        if (cfg.valueLabels !== false && series.length <= 2) {
          var vt = n("text", {
            x: p[0], y: p[1] - 11, "text-anchor": "middle",
            "font-size": 11, "font-weight": 700
          }, s.data[i]);
          vt.style.fill = s.color;
          svg.appendChild(vt);
        }
      });
    });
    host.appendChild(svg);
    if (cfg.legend !== false) legend(host, series);
  };

  /* 柱状图：labels + values */
  window.barChart = function (sel, cfg) {
    var host = document.querySelector(sel);
    if (!host) return;
    var labels = cfg.labels, values = cfg.values;
    var W = 680, H = cfg.height || 280;
    var P = { l: 46, r: 16, t: 22, b: 40 };
    var iw = W - P.l - P.r, ih = H - P.t - P.b;
    var top = niceMax(Math.max.apply(null, values) * 1.18);
    var svg = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    for (var i = 0; i <= 4; i++) {
      var y = P.t + ih - (ih * i) / 4;
      var gl = n("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, "stroke-width": 1 });
      gl.style.stroke = i === 0 ? C.gridStrong : C.grid;
      svg.appendChild(gl);
      var ty = n("text", { x: P.l - 10, y: y + 4, "text-anchor": "end", "font-size": 11 }, Math.round((top * i) / 4));
      ty.style.fill = C.muted;
      svg.appendChild(ty);
    }
    var band = iw / values.length;
    var bw = Math.min(58, band * 0.52);
    values.forEach(function (v, i) {
      var x = P.l + band * i + (band - bw) / 2;
      var h = (ih * v) / top;
      var r = n("rect", {
        x: x, y: P.t + ih - h, width: bw, height: Math.max(h, 1), rx: 5,
        fill: cfg.colors ? cfg.colors[i] : "#2f80ed", opacity: 0.92
      });
      r.appendChild(n("title", null, labels[i] + "：" + v + (cfg.unit || "")));
      svg.appendChild(r);
      var vt = n("text", {
        x: x + bw / 2, y: P.t + ih - h - 8, "text-anchor": "middle",
        "font-size": 11.5, "font-weight": 700
      }, v);
      vt.style.fill = C.ink2;
      svg.appendChild(vt);
      var xt = n("text", { x: x + bw / 2, y: H - 16, "text-anchor": "middle", "font-size": 11.5 }, labels[i]);
      xt.style.fill = C.muted2;
      svg.appendChild(xt);
    });
    host.appendChild(svg);
  };

  /* 环形图：segments[{label,value,color}] */
  window.donutChart = function (sel, cfg) {
    var host = document.querySelector(sel);
    if (!host) return;
    var segs = cfg.segments;
    var total = segs.reduce(function (a, s) { return a + s.value; }, 0);
    var W = 300, H = 240, cx = 150, cy = 118, r = 82, sw = 26;
    var Cc = 2 * Math.PI * r;
    var svg = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    var off = 0;
    segs.forEach(function (s) {
      var len = (s.value / total) * Cc;
      var c = n("circle", {
        cx: cx, cy: cy, r: r, fill: "none", stroke: s.color, "stroke-width": sw,
        "stroke-dasharray": len + " " + (Cc - len),
        "stroke-dashoffset": -off,
        transform: "rotate(-90 " + cx + " " + cy + ")", "stroke-linecap": "butt"
      });
      c.appendChild(n("title", null, s.label + "：" + s.value + " 条"));
      svg.appendChild(c);
      off += len;
    });
    var t1 = n("text", { x: cx, y: cy - 2, "text-anchor": "middle", "font-size": 30, "font-weight": 800 }, total);
    t1.style.fill = C.ink;
    svg.appendChild(t1);
    var t2 = n("text", { x: cx, y: cy + 20, "text-anchor": "middle", "font-size": 12 }, cfg.centerLabel || "用例总数");
    t2.style.fill = C.muted;
    svg.appendChild(t2);
    host.appendChild(svg);
    var box = document.createElement("div");
    box.className = "legend";
    box.style.justifyContent = "center";
    segs.forEach(function (s) {
      var sp = document.createElement("span");
      var i = document.createElement("i"); i.style.background = s.color;
      sp.appendChild(i);
      sp.appendChild(document.createTextNode(s.label + " " + s.value));
      box.appendChild(sp);
    });
    host.appendChild(box);
  };

  /* 雷达图：dims[{name,value(0-100)}]，可选 compare 同构第二组 */
  window.radarChart = function (sel, cfg) {
    var host = document.querySelector(sel);
    if (!host) return;
    var dims = cfg.dims, K = dims.length;
    var W = 420, H = 320, cx = W / 2, cy = H / 2 + 8, R = 108;
    var svg = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    function pt(k, ratio) {
      var ang = -Math.PI / 2 + (2 * Math.PI * k) / K;
      return [cx + R * ratio * Math.cos(ang), cy + R * ratio * Math.sin(ang)];
    }
    /* 网格层 */
    for (var lv = 1; lv <= 4; lv++) {
      var pts = [];
      for (var k = 0; k < K; k++) pts.push(pt(k, lv / 4).map(function (v) { return v.toFixed(1); }).join(" "));
      var poly = n("polygon", { points: pts.join(" "), fill: "none", "stroke-width": 1 });
      poly.style.stroke = lv === 4 ? C.gridStrong : C.grid;
      svg.appendChild(poly);
    }
    /* 轴线与标签 */
    for (var k2 = 0; k2 < K; k2++) {
      var p = pt(k2, 1);
      var ax = n("line", { x1: cx, y1: cy, x2: p[0].toFixed(1), y2: p[1].toFixed(1), "stroke-width": 1 });
      ax.style.stroke = C.grid;
      svg.appendChild(ax);
      var lp = pt(k2, 1.22);
      var t = n("text", { x: lp[0].toFixed(1), y: lp[1].toFixed(1), "text-anchor": "middle", "font-size": 11.5, "font-weight": 600 }, dims[k2].name);
      t.style.fill = C.muted2;
      svg.appendChild(t);
      var vp = pt(k2, 1.22);
      var vt = n("text", { x: vp[0].toFixed(1), y: (vp[1] + 13).toFixed(1), "text-anchor": "middle", "font-size": 10.5, "font-weight": 700 }, dims[k2].value);
      vt.style.fill = cfg.color || "#2f80ed";
      svg.appendChild(vt);
    }
    /* 数据多边形 */
    function dataPoly(series) {
      var pts = [];
      for (var k = 0; k < K; k++) pts.push(pt(k, series.data[k] / 100));
      var d = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
      var poly = n("polygon", { points: d, fill: series.color, "fill-opacity": 0.16, stroke: series.color, "stroke-width": 2.4, "stroke-linejoin": "round" });
      pts.forEach(function (p, i) {
        var c = n("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 3.6, stroke: series.color, "stroke-width": 2 });
        c.style.fill = C.point;
        c.appendChild(n("title", null, series.name + " · " + dims[i].name + "：" + series.data[i] + " 分"));
        svg.appendChild(c);
      });
      svg.appendChild(poly);
    }
    dataPoly({ name: cfg.name || "本组评估", color: cfg.color || "#2f80ed", data: dims.map(function (d2) { return d2.value; }) });
    host.appendChild(svg);
    if (cfg.note) {
      var note = document.createElement("div");
      note.className = "sub";
      note.style.textAlign = "center";
      note.textContent = cfg.note;
      host.appendChild(note);
    }
  };

  /* 导航：当前页高亮 + 移动端展开 */
  document.addEventListener("DOMContentLoaded", function () {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path) a.classList.add("active");
    });
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    }
  });
})();
