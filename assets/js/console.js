/* ===== TestHub 交互控制台逻辑 ===== */
(function () {
  "use strict";

  /* ---------- 全局搜索 ---------- */
  var SEARCH_INDEX = [];
  TOOLS.forEach(function (t) {
    SEARCH_INDEX.push({ title: "工具 · " + t.name, desc: t.cat + " · " + (t.desc || "").slice(0, 40), url: "tools.html#tool-" + t.name.replace(/\s+/g, "") });
  });
  Object.keys(API_CASES).forEach(function (set) {
    var label = set === "apifox" ? "Apifox" : "Bruno";
    API_CASES[set].forEach(function (c) {
      SEARCH_INDEX.push({ title: "接口用例 · " + c.id + " " + c.name, desc: label + " · " + c.method + " · 预期：" + c.expect.slice(0, 36), url: "api.html" });
    });
  });
  AI_CASES.forEach(function (c) {
    SEARCH_INDEX.push({ title: "AI 用例 · " + c.id + " " + c.name, desc: c.pri + " · " + c.note.slice(0, 40), url: "ai.html" });
  });
  UI_GROUPS.forEach(function (g) {
    SEARCH_INDEX.push({ title: "界面断言组 · " + g.name, desc: g.assert + " 条断言 · " + g.desc.slice(0, 36), url: "ui.html" });
  });
  PERF.locust.rows.concat(PERF.jmeter_qq.rows, PERF.jmeter_video.rows).forEach(function (r) {
    SEARCH_INDEX.push({ title: "性能数据 · " + r.case + " " + r.users + " 并发", desc: "平均 " + r.avg + "ms · P95 " + r.p95 + "ms · RPS " + r.rps, url: "performance.html" });
  });
  ["首页占位"].length; // noop
  SEARCH_INDEX.push({ title: "页面 · 首页", desc: "平台概况与统计", url: "index.html" });
  SEARCH_INDEX.push({ title: "页面 · 性能测试", desc: "JMeter / Locust 数据查询与对比", url: "performance.html" });
  SEARCH_INDEX.push({ title: "页面 · 接口测试", desc: "在线接口测试台与用例回放", url: "api.html" });
  SEARCH_INDEX.push({ title: "页面 · 界面测试", desc: "Katalon 断言分组查询", url: "ui.html" });
  SEARCH_INDEX.push({ title: "页面 · 智能用例", desc: "AI 用例生成模拟与 AngusTester 入口", url: "ai.html" });
  SEARCH_INDEX.push({ title: "页面 · 工具中心", desc: "全部测试工具直达入口", url: "tools.html" });
  SEARCH_INDEX.push({ title: "页面 · 联系我们", desc: "分工与合规声明", url: "about.html" });

  function initSearch() {
    var input = document.getElementById("globalSearch");
    var pop = document.getElementById("searchPop");
    if (!input || !pop) return;
    function render(list) {
      if (!list.length) { pop.innerHTML = '<div class="sp-empty">未找到匹配结果，试试「JMeter」「断言」「TC-1」</div>'; pop.classList.add("show"); return; }
      pop.innerHTML = list.map(function (r, i) {
        return '<a class="sp-item" data-i="' + i + '"><b>' + r.title + '</b><span>' + r.desc + '</span></a>';
      }).join("");
      pop.classList.add("show");
      Array.prototype.forEach.call(pop.querySelectorAll(".sp-item"), function (el, i) {
        el.addEventListener("click", function () { location.href = SEARCH_INDEX_CACHE[i].url; });
      });
    }
    var SEARCH_INDEX_CACHE = [];
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { pop.classList.remove("show"); return; }
      var hits = SEARCH_INDEX.filter(function (r) {
        return (r.title + r.desc).toLowerCase().indexOf(q) >= 0;
      }).slice(0, 8);
      SEARCH_INDEX_CACHE = hits;
      render(hits);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && SEARCH_INDEX_CACHE.length) location.href = SEARCH_INDEX_CACHE[0].url;
      if (e.key === "Escape") pop.classList.remove("show");
    });
    document.addEventListener("click", function (e) {
      if (!pop.contains(e.target) && e.target !== input) pop.classList.remove("show");
    });
  }

  /* ---------- 在线接口测试台 ---------- */
  function initApiTester() {
    var box = document.getElementById("apiTester");
    if (!box) return;
    var mSel = document.getElementById("atMethod");
    var preset = document.getElementById("atPreset");
    var urlIn = document.getElementById("atUrl");
    var bodyTa = document.getElementById("atBody");
    var sendBtn = document.getElementById("atSend");
    var clearBtn = document.getElementById("atClear");
    var stStatus = document.getElementById("atStatus");
    var stTime = document.getElementById("atTime");
    var stSize = document.getElementById("atSize");
    var respPre = document.getElementById("atResp");
    var histList = document.getElementById("atHist");
    var replay = document.getElementById("atReplay");
    var caseInfo = document.getElementById("atCaseInfo");

    var HKEY = "testhub_api_history";
    function hist() { try { return JSON.parse(localStorage.getItem(HKEY) || "[]"); } catch (e) { return []; } }
    function saveHist(h) { try { localStorage.setItem(HKEY, JSON.stringify(h.slice(0, 12))); } catch (e) {} }
    function renderHist() {
      var h = hist();
      histList.innerHTML = h.length ? h.map(function (r, i) {
        return '<li><span class="hm ' + (r.ok ? "ok" : "bad") + '">' + r.method + '</span><span class="hu">' + r.url.replace(API_BASE, "") + '</span><span class="hs ' + (r.ok ? "ok" : "bad") + '">' + r.status + '</span><span class="ht">' + r.time + 'ms</span><button data-i="' + i + '" class="mini">重放</button></li>';
      }).join("") : '<li class="dim">暂无历史记录</li>';
      Array.prototype.forEach.call(histList.querySelectorAll(".mini"), function (btn) {
        btn.addEventListener("click", function () {
          var r = hist()[+btn.dataset.i];
          mSel.value = r.method; urlIn.value = r.url; bodyTa.value = r.body || "";
          send();
        });
      });
    }
    function toggleBody() {
      var m = mSel.value;
      bodyTa.parentElement.style.display = (m === "POST" || m === "PUT") ? "" : "none";
    }
    mSel.addEventListener("change", toggleBody);
    preset.addEventListener("change", function () {
      urlIn.value = preset.value === "custom" ? "" : preset.value;
    });
    replay.addEventListener("change", function () {
      var v = replay.value; if (!v) { caseInfo.style.display = "none"; return; }
      var set = v.split(":")[0], idx = +v.split(":")[1];
      var c = API_CASES[set][idx];
      caseInfo.style.display = "";
      caseInfo.innerHTML = '<b>' + c.id + " " + c.name + '</b><span>预期：' + c.expect + '</span>' + (c.assert ? '<span>断言：<code>' + c.assert + '</code></span>' : '');
      mSel.value = c.method; urlIn.value = c.url;
      bodyTa.value = c.body ? JSON.stringify(c.body, null, 2) : "";
      toggleBody();
      send();
    });
    function send() {
      var method = mSel.value, url = urlIn.value.trim();
      if (!url) { stStatus.textContent = "—"; stTime.textContent = "—"; stSize.textContent = "—"; respPre.textContent = "// 请先输入接口地址"; return; }
      sendBtn.disabled = true; sendBtn.textContent = "请求中…";
      stStatus.textContent = "…"; stTime.textContent = "…"; stSize.textContent = "…";
      respPre.textContent = "// 正在请求 " + url;
      var opts = { method: method, headers: {} };
      if ((method === "POST" || method === "PUT") && bodyTa.value.trim()) {
        opts.headers["Content-Type"] = "application/json";
        opts.body = bodyTa.value.trim();
      }
      var t0 = performance.now();
      fetch(url, opts).then(function (res) {
        return res.text().then(function (txt) {
          var ms = Math.round(performance.now() - t0);
          var ok = res.status >= 200 && res.status < 300;
          stStatus.textContent = res.status + " " + (res.statusText || (ok ? "OK" : ""));
          stStatus.className = "kv-v " + (ok ? "ok" : "bad");
          stTime.textContent = ms + " ms";
          stSize.textContent = (new Blob([txt]).size / 1024).toFixed(2) + " KB";
          var pretty = txt;
          try { pretty = JSON.stringify(JSON.parse(txt), null, 2); } catch (e) {}
          if (pretty.length > 2600) pretty = pretty.slice(0, 2600) + "\n…（已截断）";
          respPre.textContent = pretty;
          var h = hist();
          h.unshift({ method: method, url: url, status: res.status, time: ms, ok: ok, body: opts.body || "" });
          saveHist(h); renderHist();
        });
      }).catch(function (err) {
        stStatus.textContent = "ERR"; stStatus.className = "kv-v bad";
        stTime.textContent = "—"; stSize.textContent = "—";
        respPre.textContent = "// 请求失败：" + err.message + "\n// 提示：本测试台仅支持允许跨域(CORS)的接口，JSONPlaceholder 已开放跨域。";
      }).finally(function () {
        sendBtn.disabled = false; sendBtn.textContent = "发 送";
      });
    }
    sendBtn.addEventListener("click", send);
    clearBtn.addEventListener("click", function () { saveHist([]); renderHist(); });
    toggleBody(); renderHist();
  }

  /* ---------- 性能数据查询器 ---------- */
  function initPerfQuery() {
    var box = document.getElementById("perfQuery");
    if (!box) return;
    var tool = document.getElementById("pfTool");
    var users = document.getElementById("pfUsers");
    var out = document.getElementById("pfOut");
    function barChart(rows) {
      var W = 560, H = 240, pad = 46, bw = 30;
      var maxv = Math.max.apply(null, rows.map(function (r) { return Math.max(r.avg, r.p95); }));
      var n = rows.length, group = (W - pad * 2) / n;
      var svg = ['<svg viewBox="0 0 ' + W + " " + H + '" class="pf-svg">'];
      for (var g = 0; g <= 4; g++) {
        var y = pad + (H - pad * 2) * g / 4;
        var v = Math.round(maxv * (1 - g / 4));
        svg.push('<line x1="' + pad + '" y1="' + y + '" x2="' + (W - 10) + '" y2="' + y + '" stroke="#e8eef5"/>');
        svg.push('<text x="' + (pad - 6) + '" y="' + (y + 4) + '" font-size="10" fill="#8a97a8" text-anchor="end">' + v + '</text>');
      }
      rows.forEach(function (r, i) {
        var x0 = pad + group * i + (group - bw * 2 - 6) / 2;
        var hA = (H - pad * 2) * r.avg / maxv, hP = (H - pad * 2) * r.p95 / maxv;
        var yA = H - pad - hA, yP = H - pad - hP;
        svg.push('<rect x="' + x0 + '" y="' + yA + '" width="' + bw + '" height="' + hA + '" rx="3" fill="#2f80ed"><title>平均 ' + r.avg + 'ms</title></rect>');
        svg.push('<rect x="' + (x0 + bw + 6) + '" y="' + yP + '" width="' + bw + '" height="' + hP + '" rx="3" fill="#7c3aed"><title>P95 ' + r.p95 + 'ms</title></rect>');
        svg.push('<text x="' + (x0 + bw + 3) + '" y="' + (H - pad + 16) + '" font-size="11" fill="#3d4c5e" text-anchor="middle">' + r.case + (r.site2 ? "·" + r.site2 : "") + '</text>');
      });
      svg.push('<rect x="' + pad + '" y="8" width="10" height="10" rx="2" fill="#2f80ed"/><text x="' + (pad + 15) + '" y="17" font-size="11" fill="#3d4c5e">平均响应</text>');
      svg.push('<rect x="' + (pad + 80) + '" y="8" width="10" height="10" rx="2" fill="#7c3aed"/><text x="' + (pad + 95) + '" y="17" font-size="11" fill="#3d4c5e">95% 百分位</text>');
      svg.push('</svg>');
      return svg.join("");
    }
    function render() {
      var key = tool.value, u = +users.value;
      var ds = PERF[key];
      var rows = ds.rows.filter(function (r) { return r.users === u; });
      if (!rows.length) rows = ds.rows.slice(-1);
      out.innerHTML = rows.map(function (r) {
        return '<div class="stat"><div class="k">' + r.case + ' · ' + r.users + ' 并发</div><div class="v">' + r.avg + '<small>ms 均值</small></div><div class="d">P95 ' + r.p95 + 'ms · 最大 ' + r.max + 'ms · RPS ' + r.rps + ' · 失败率 ' + r.fail + '%</div></div>';
      }).join("") + '<div class="chart-box">' + barChart(rows) + '</div>';
    }
    tool.addEventListener("change", render);
    users.addEventListener("change", render);
    render();
  }

  /* ---------- 界面断言分组查询 ---------- */
  function initUiQuery() {
    var box = document.getElementById("uiQuery");
    if (!box) return;
    var sel = document.getElementById("uiGroup");
    var out = document.getElementById("uiOut");
    function render() {
      var v = sel.value;
      var groups = v === "all" ? UI_GROUPS : UI_GROUPS.filter(function (g) { return g.id === v; });
      out.innerHTML = groups.map(function (g) {
        var items = (g.items || []).map(function (it, i) {
          return '<tr><td>' + g.id + '-' + (i + 1) + '</td><td>' + it + '</td><td class="c"><span class="badge ok">PASS</span></td></tr>';
        }).join("");
        return '<div class="card card-pad" style="margin-bottom:14px"><h3 style="margin:0 0 8px;font-size:15px">' + g.name +
          ' <span class="badge info">' + g.assert + ' 断言</span> <span class="badge">' + g.info + ' 信息项</span></h3>' +
          '<p style="margin:0 0 10px;font-size:13px;color:var(--muted)">' + g.desc + '</p>' +
          (items ? '<div class="table-wrap" style="box-shadow:none"><table class="data"><thead><tr><th>编号</th><th>断言内容（示例）</th><th class="c">结果</th></tr></thead><tbody>' + items + '</tbody></table></div>' : '') +
          '</div>';
      }).join("");
    }
    sel.addEventListener("change", render);
    render();
  }

  /* ---------- AI 用例生成模拟器 ---------- */
  function initAiGen() {
    var box = document.getElementById("aiGen");
    if (!box) return;
    var ta = document.getElementById("aiPrompt");
    var cnt = document.getElementById("aiCount");
    var btn = document.getElementById("aiGenBtn");
    var again = document.getElementById("aiGenAgain");
    var prog = document.getElementById("aiProg");
    var bar = document.getElementById("aiBar");
    var out = document.getElementById("aiOut");
    var RB = { pass: ["ok", "通过"], partial: ["warn", "部分通过"], fail: ["bad", "失败"], block: ["info", "阻塞"] };
    function gen() {
      var n = +cnt.value;
      out.innerHTML = ""; btn.disabled = true; again.style.display = "none";
      prog.style.display = "";
      var p = 0;
      var timer = setInterval(function () {
        p += 8 + Math.random() * 10; if (p > 96) p = 96;
        bar.style.width = p + "%";
        bar.textContent = "AngusAI (DeepSeek V4 Flash) 生成中… " + Math.round(p) + "%";
      }, 120);
      setTimeout(function () {
        clearInterval(timer);
        bar.style.width = "100%"; bar.textContent = "生成完成 · 已按真实用例库回放";
        setTimeout(function () { prog.style.display = "none"; bar.style.width = "0%"; }, 900);
        AI_CASES.slice(0, n).forEach(function (c, i) {
          setTimeout(function () {
            var cls = RB[c.result][0], label = RB[c.result][1];
            var div = document.createElement("div");
            div.className = "ai-case";
            div.innerHTML = '<div class="ai-head"><b>' + c.id + " " + c.name + '</b><span class="badge ' + (c.pri === "P0" ? "bad" : c.pri === "P1" ? "warn" : "info") + '">' + c.pri + '</span><span class="badge ' + cls + '">' + label + '</span></div><p>' + c.note + '</p>';
            out.appendChild(div);
          }, 260 * i);
        });
        setTimeout(function () { btn.disabled = false; again.style.display = ""; }, 260 * n + 60);
      }, 1500);
    }
    btn.addEventListener("click", gen);
    again.addEventListener("click", gen);
    ta.value = AI_PROMPT;
  }

  /* ---------- 工具中心 ---------- */
  function initTools() {
    var grid = document.getElementById("toolGrid");
    if (!grid) return;
    grid.innerHTML = TOOLS.map(function (t, i) {
      var id = "tool-" + t.name.replace(/\s+/g, "");
      var acts = '';
      if (t.entries) {
        acts = t.entries.map(function (e) {
          return '<a class="btn btn-sm btn-primary" href="' + e.url + '" target="_blank" rel="noopener">' + e.label + ' ↗</a>';
        }).join("");
      }
      acts += '<a class="btn btn-sm btn-primary" href="' + t.site + '" target="_blank" rel="noopener">打开官网 ↗</a>' +
              '<a class="btn btn-sm btn-ghost" href="' + t.dl + '" target="_blank" rel="noopener">下载</a>' +
              '<a class="btn btn-sm btn-ghost" href="' + t.doc + '" target="_blank" rel="noopener">文档</a>';
      return '<div class="tool-card" id="' + id + '" style="--tc:' + t.color + '">' +
        '<div class="tc-head"><div class="tc-badge">' + t.cat + '</div><div class="tc-ver">' + t.ver + '</div></div>' +
        '<h3>' + t.name + '</h3><p>' + t.desc + '</p>' +
        '<div class="tc-actions">' + acts + '</div></div>';
    }).join("");
  }

  /* ---------- 启动 ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initSearch(); initApiTester(); initPerfQuery(); initUiQuery(); initAiGen(); initTools();

    /* 演示模式：?demo=1 自动执行一组真实请求（用于文档取证截图） */
    if (location.search.indexOf("demo=1") !== -1) {
      Array.prototype.forEach.call(document.querySelectorAll("section.section.collapsed"), function (s) {
        s.classList.remove("collapsed");
      });
      var demoSteps = [
        { m: "GET", u: "https://jsonplaceholder.typicode.com/posts/1" },
        { m: "GET", u: "https://jsonplaceholder.typicode.com/users/1" },
        { m: "POST", u: "https://jsonplaceholder.typicode.com/posts", b: { title: "TestHub 演示", body: "第五组一体化平台自动发帖测试", userId: 5 } }
      ];
      var di = 0;
      var demoNext = function () {
        if (di >= demoSteps.length) return;
        var s = demoSteps[di++];
        var mSel = document.getElementById("atMethod");
        mSel.value = s.m;
        mSel.dispatchEvent(new Event("change"));
        document.getElementById("atUrl").value = s.u;
        if (s.b) { document.getElementById("atBody").value = JSON.stringify(s.b, null, 2); }
        document.getElementById("atSend").click();
        setTimeout(demoNext, 2600);
      };
      setTimeout(demoNext, 1500);
    }
  });
})();
