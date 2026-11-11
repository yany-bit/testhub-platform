/* TestHub 左侧菜单 + 内容收起（懒展开） */
(function () {
  if (window.__TH_SIDEBAR__) return;
  window.__TH_SIDEBAR__ = true;

  var NAV = [
    { t: "首页", href: "index.html", icon: "🏠", k: "index" },
    { t: "界面测试", href: "ui.html", icon: "🖥️", k: "ui" },
    { t: "接口测试", href: "api.html", icon: "🔌", k: "api" },
    { t: "性能测试", href: "performance.html", icon: "⚡", k: "performance" },
    { t: "智能用例", href: "ai.html", icon: "🤖", k: "ai" },
    { t: "工具中心", href: "tools.html", icon: "🧰", k: "tools" },
    { t: "联系我们", href: "about.html", icon: "📮", k: "about" }
  ];

  function curKey() {
    var p = location.pathname.split("/").pop() || "index.html";
    var m = { "index.html": "index", "": "index" };
    return m[p] || p.replace(".html", "");
  }

  function build() {
    /* --- 侧边栏 --- */
    var sb = document.createElement("aside");
    sb.className = "th-sidebar";
    var cur = curKey();
    var navHtml = NAV.map(function (n) {
      return '<a class="th-nav-item' + (n.k === cur ? " cur" : "") + '" href="' + n.href + '">' +
        '<span class="ni">' + n.icon + '</span>' + n.t + '</a>';
    }).join("");

    /* --- 本页目录（收起区块列表） --- */
    var secs = Array.prototype.slice.call(document.querySelectorAll("main section.section"));
    function secTitle(s) {
      var h = s.querySelector("h2");
      if (h && h.textContent.trim()) return h.textContent.trim();
      var h3 = s.querySelector("h3");
      if (h3 && h3.textContent.trim()) return h3.textContent.trim();
      var cb = s.querySelector(".callout b");
      if (cb && cb.textContent.trim()) return cb.textContent.trim();
      return s.getAttribute("data-title") || "更多内容";
    }
    /* 纯指标条(.stats)的区块保持常显，不收起、不进目录 */
    var collapsible = secs.filter(function (s) { return !s.querySelector(":scope > .stats"); });
    var toc = collapsible.map(function (s, i) {
      var t = secTitle(s);
      s.setAttribute("data-sec", "sec" + i);
      return '<a class="th-toc-item" data-target="sec' + i + '">' +
        '<span class="dot"></span>' + t + '</a>';
    }).join("");

    sb.innerHTML =
      '<div class="th-sb-head"><span class="logo-dot">T</span><b>TestHub 控制台</b></div>' +
      '<div class="th-sb-label">全站导航</div>' + navHtml +
      (toc ? '<div class="th-sb-label">本页目录</div><div class="th-toc">' + toc + '</div>' : '');

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
          /* 隐藏 body 里重复的 h3 标题（如各控制台的标题） */
          var dupH3 = s.querySelector(".sec-body-src h3, h3");
          /* h3 会在下方打包进 sec-body，先记下待隐藏 */
          head.setAttribute("data-dup", "1");
        }
      }
      var body = document.createElement("div");
      body.className = "sec-body";
      var node = head.nextSibling;
      while (node) { var nx = node.nextSibling; body.appendChild(node); node = nx; }
      s.appendChild(body);
      s.classList.add("collapsed");

      /* 合成标题时，隐藏正文内重复出现的第一个 h3 */
      if (head.getAttribute("data-dup")) {
        var dup = body.querySelector("h3");
        if (dup && dup.textContent.trim() === head.textContent.trim()) dup.classList.add("th-hidden");
        else if (dup) dup.classList.add("th-hidden");
        head.removeAttribute("data-dup");
      }

      head.classList.add("sec-toggle");
      head.addEventListener("click", function () { s.classList.toggle("collapsed"); });
    });

    /* --- 目录点击：展开并滚动 --- */
    Array.prototype.forEach.call(sb.querySelectorAll(".th-toc-item"), function (a) {
      a.addEventListener("click", function () {
        var s = document.querySelector('[data-sec="' + a.getAttribute("data-target") + '"]');
        if (!s) return;
        s.classList.remove("collapsed");
        Array.prototype.forEach.call(document.querySelectorAll("section.section"), function (o) {
          if (o !== s) o.classList.add("collapsed");
        });
        s.scrollIntoView({ behavior: "smooth", block: "start" });
        Array.prototype.forEach.call(sb.querySelectorAll(".th-toc-item"), function (x) { x.classList.remove("active"); });
        a.classList.add("active");
      });
    });

    /* --- 首次进入：默认展开第一个可收起区块，其余收起；桌面端默认展开菜单栏 --- */
    if (collapsible.length) { collapsible[0].classList.remove("collapsed"); }
    if (window.innerWidth >= 1100) { document.body.classList.add("sb-open"); }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else { build(); }
})();
