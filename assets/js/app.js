/* TestHub 一体化测试平台 —— 轻量图表与交互（无外部依赖） */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

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
      svg.appendChild(n("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: i === 0 ? "#cbd5e1" : "#eef2f7", "stroke-width": 1 }));
      svg.appendChild(n("text", { x: P.l - 10, y: y + 4, "text-anchor": "end", "font-size": 11, fill: "#94a3b8" }, Math.round((top * i) / ticks)));
    }
    var stepX = labels.length > 1 ? iw / (labels.length - 1) : 0;
    labels.forEach(function (lb, i) {
      var x = P.l + stepX * i;
      svg.appendChild(n("text", { x: x, y: H - 14, "text-anchor": "middle", "font-size": 11.5, fill: "#64748b" }, lb));
    });
    svg.appendChild(n("text", { x: 14, y: P.t + 2, "font-size": 11, fill: "#94a3b8" }, cfg.unit || ""));
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
        var c = n("circle", { cx: p[0], cy: p[1], r: 4, fill: "#fff", stroke: s.color, "stroke-width": 2.4 });
        var t = n("title", null, s.name + " · " + labels[i] + "：" + s.data[i] + (cfg.unit || ""));
        c.appendChild(t);
        svg.appendChild(c);
        if (cfg.valueLabels !== false && series.length <= 2) {
          svg.appendChild(n("text", {
            x: p[0], y: p[1] - 11, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: s.color
          }, s.data[i]));
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
      svg.appendChild(n("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: i === 0 ? "#cbd5e1" : "#eef2f7", "stroke-width": 1 }));
      svg.appendChild(n("text", { x: P.l - 10, y: y + 4, "text-anchor": "end", "font-size": 11, fill: "#94a3b8" }, Math.round((top * i) / 4)));
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
      svg.appendChild(n("text", {
        x: x + bw / 2, y: P.t + ih - h - 8, "text-anchor": "middle",
        "font-size": 11.5, "font-weight": 700, fill: "#334155"
      }, v));
      svg.appendChild(n("text", { x: x + bw / 2, y: H - 16, "text-anchor": "middle", "font-size": 11.5, fill: "#64748b" }, labels[i]));
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
    var C = 2 * Math.PI * r;
    var svg = n("svg", { viewBox: "0 0 " + W + " " + H, role: "img" });
    var off = 0;
    segs.forEach(function (s) {
      var len = (s.value / total) * C;
      var c = n("circle", {
        cx: cx, cy: cy, r: r, fill: "none", stroke: s.color, "stroke-width": sw,
        "stroke-dasharray": len + " " + (C - len),
        "stroke-dashoffset": -off,
        transform: "rotate(-90 " + cx + " " + cy + ")", "stroke-linecap": "butt"
      });
      c.appendChild(n("title", null, s.label + "：" + s.value + " 条"));
      svg.appendChild(c);
      off += len;
    });
    svg.appendChild(n("text", { x: cx, y: cy - 2, "text-anchor": "middle", "font-size": 30, "font-weight": 800, fill: "#0f172a" }, total));
    svg.appendChild(n("text", { x: cx, y: cy + 20, "text-anchor": "middle", "font-size": 12, fill: "#94a3b8" }, cfg.centerLabel || "用例总数"));
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
