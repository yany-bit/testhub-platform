/* TestHub 左侧菜单（大分类 + 直达子项）+ 内容收起（懒展开） */
(function () {
  if (window.__TH_SIDEBAR__) return;
  window.__TH_SIDEBAR__ = true;

  /* ch: 每页区块子菜单 —— [标题, 区块id]；区块 id = 页面key + "-" + DOM序号，与下方 build() 中的赋值规则一致 */
  var NAV = [
    { t: "首页", href: "index.html", icon: "🏠", k: "index", ch: [
      ["测试能力", "index-1"], ["软件测试项目", "index-2"], ["一体化测试流程", "index-3"], ["平台能力", "index-4"]
    ]},
    { t: "界面测试", href: "ui.html", icon: "🖥️", k: "ui", ch: [
      ["断言分组查询器", "ui-0"], ["测试设计", "ui-2"], ["执行时间线", "ui-3"], ["执行取证", "ui-4"], ["测试结论", "ui-5"]
    ]},
    { t: "接口测试", href: "api.html", icon: "🔌", k: "api", ch: [
      ["在线接口测试台", "api-0"], ["Apifox · 8 条用例", "api-2"], ["Bruno · 5 条用例", "api-3"], ["Apifox 与 Bruno 对比", "api-4"]
    ]},
    { t: "性能测试", href: "performance.html", icon: "⚡", k: "performance", ch: [
      ["性能数据查询器", "performance-0"], ["JMeter 与 Locust 同站对比", "performance-2"], ["腾讯视频 与 芒果TV 对比", "performance-3"], ["执行取证", "performance-4"], ["测试结论", "performance-5"]
    ]},
    { t: "智能用例", href: "ai.html", icon: "🤖", k: "ai", ch: [
      ["AI 用例生成模拟器", "ai-0"], ["AngusTester 三步定位", "ai-1"], ["用例执行结果", "ai-3"], ["AI 用例生成过程", "ai-4"], ["测试结论", "ai-5"]
    ]},
    { t: "LLM 单测生成", href: "llm.html", icon: "🧪", k: "llm", ch: [
      ["在线生成器", "llm-0"], ["代码案例：折扣函数", "llm-1"]
    ]},
    { t: "工具中心", href: "tools.html", icon: "🧰", k: "tools", ch: [
      ["测试工具矩阵", "tools-0"], ["工具入口说明", "tools-1"]
    ]},
    { t: "联系我们", href: "about.html", icon: "📮", k: "about", ch: [
      ["平台结构与联系", "about-0"], ["工具矩阵", "about-1"], ["小组分工", "about-2"], ["测试合规声明", "about-3"]
    ]}
  ];

  function curKey() {
    var p = location.pathname.split("/").pop() || "index.html";
    var m = { "index.html": "index", "": "index" };
    return m[p] || p.replace(".html", "");
  }

  function build() {
    var sb = document.createElement("aside");
    sb.className = "th-sidebar";
    var cur = curKey();

    /* --- 分组导航：大分类（点击进页面）+ 子项（点击直达区块） --- */
    function navHtml() {
      var h = "";
      NAV.forEach(function (n) {
        var isCur = n.k === cur;
        h += '<div class="th-group' + (isCur ? " cur-group" : "") + '" data-k="' + n.k + '">' +
               '<a class="th-nav-item' + (isCur ? " cur" : "") + '" href="' + n.href + '" data-goto="' + n.k + '">' +
                 '<span class="ni">' + n.icon + '</span><span class="nt">' + n.t + '</span>' +
                 '<span class="chev" data-toggle="' + n.k + '">▾</span>' +
               '</a>' +
               '<div class="th-sub">' +
                 n.ch.map(function (c) {
                   return '<a class="th-sub-item" href="' + n.href + '#' + c[1] + '" data-sec="' + c[1] + '" data-page="' + n.k + '">' + c[0] + '</a>';
                 }).join("") +
               '</div>' +
             '</div>';
      });
      return h;
    }

    /* --- 给每个区块分配稳定 id（页面key-序号），供子菜单直达 --- */
    var secs = Array.prototype.slice.call(document.querySelectorAll("main section.section"));
    secs.forEach(function (s, i) { s.id = cur + "-" + i; });

    function secTitle(s) {
      var h = s.querySelector("h2");
      if (h && h.textContent.trim()) return h.textContent.trim();
      var h3 = s.querySelector("h3");
      if (h3 && h3.textContent.trim()) return h3.textContent.trim();
      var cb = s.querySelector(".callout b");
      if (cb && cb.textContent.trim()) return cb.textContent.trim();
      return s.getAttribute("data-title") || "更多内容";
    }
    var collapsible = secs.filter(function (s) { return !s.querySelector(":scope > .stats"); });

    sb.innerHTML =
      '<div class="th-sb-head"><span class="logo-dot">T</span><b>TestHub 控制台</b></div>' +
      '<div class="th-sb-label">全站导航</div>' + navHtml();

    document.body.appendChild(sb);

    /* --- 遮罩 + 汉堡按钮 --- */
    var mask = document.createElement("div");
    mask.className = "th-mask";
    document.body.appendChild(mask);
    var bar = document.createElement("button");
    bar.className = "th-hamb";
    bar.setAttribute("aria-label", "打开菜单");
    bar.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(bar);

    function toggle(open) {
      var willOpen = open === undefined ? !document.body.classList.contains("sb-open") : open;
      document.body.classList.toggle("sb-open", willOpen);
    }
    bar.addEventListener("click", function () { toggle(); });
    mask.addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });

    /* --- 把页面内容包进统一容器，侧边栏打开时整体让位 --- */
    var page = document.createElement("div");
    page.className = "th-page";
    Array.prototype.slice.call(document.body.children).forEach(function (c) {
      if (c === sb || c === mask || c === bar) return;
      page.appendChild(c);
    });
    document.body.appendChild(page);

    /* --- 区块收起：把 section-head 之后的内容包进 .sec-body --- */
    collapsible.forEach(function (s) {
      var head = s.querySelector(":scope > .section-head");
      if (!head) {
        var h2 = s.querySelector("h2");
        if (h2 && h2.parentElement === s) { head = h2.parentElement; }
        else {
          head = document.createElement("div");
          head.className = "section-head";
          head.innerHTML = "<h2>" + secTitle(s) + "</h2>";
          s.insertBefore(head, s.firstChild);
          head.setAttribute("data-dup", "1");
        }
      }
      var body = document.createElement("div");
      body.className = "sec-body";
      var node = head.nextSibling;
      while (node) { var nx = node.nextSibling; body.appendChild(node); node = nx; }
      s.appendChild(body);
      s.classList.add("collapsed");

      if (head.getAttribute("data-dup")) {
        var dup = body.querySelector("h3");
        if (dup) dup.classList.add("th-hidden");
        head.removeAttribute("data-dup");
      }

      head.classList.add("sec-toggle");
      head.addEventListener("click", function () { s.classList.toggle("collapsed"); });
    });

    function expandSection(id) {
      var s = document.getElementById(id);
      if (!s) return false;
      s.classList.remove("collapsed");
      Array.prototype.forEach.call(document.querySelectorAll("section.section"), function (o) {
        if (o !== s) o.classList.add("collapsed");
      });
      s.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }

    /* --- 子项点击：同页 → 平滑滚动到区块；异页 → 正常跳转（落地后再定位） --- */
    Array.prototype.forEach.call(sb.querySelectorAll(".th-sub-item"), function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("data-page") === cur) {
          e.preventDefault();
          expandSection(a.getAttribute("data-sec"));
          history.replaceState(null, "", "#" + a.getAttribute("data-sec"));
          Array.prototype.forEach.call(sb.querySelectorAll(".th-sub-item"), function (x) { x.classList.remove("active"); });
          a.classList.add("active");
        }
      });
    });

    /* --- 大分类点击：跳转页面；若已是当前页 → 回到顶部并展开全部区块 --- */
    Array.prototype.forEach.call(sb.querySelectorAll(".th-nav-item"), function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("data-goto") === cur) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          history.replaceState(null, "", location.pathname);
        }
        /* 展开目标分组（折叠其它分组） */
        var k = a.getAttribute("data-goto");
        Array.prototype.forEach.call(sb.querySelectorAll(".th-group"), function (g) {
          g.classList.toggle("open", g.getAttribute("data-k") === k);
        });
        try { sessionStorage.setItem("th_open_group", k); } catch (err) {}
      });
    });

    /* --- 分组折叠按钮（▾）：仅展开/收起子菜单，不跳转 --- */
    Array.prototype.forEach.call(sb.querySelectorAll(".chev"), function (cv) {
      cv.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var g = cv.closest(".th-group");
        g.classList.toggle("open");
      });
    });

    /* --- 初始状态：默认展开当前页分组 --- */
    var curGroup = sb.querySelector('.th-group[data-k="' + cur + '"]');
    if (curGroup) curGroup.classList.add("open");

    /* --- 落地定位：URL 带 #区块id 时展开对应区块 --- */
    function locateHash() {
      if (!location.hash) return false;
      return expandSection(location.hash.slice(1));
    }

    /* --- 首次进入：无锚点时默认展开第一个可收起区块；桌面端默认展开菜单栏 --- */
    if (!locateHash() && collapsible.length) { collapsible[0].classList.remove("collapsed"); }
    if (window.innerWidth >= 1100) { document.body.classList.add("sb-open"); }
    window.addEventListener("hashchange", locateHash);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else { build(); }
})();
