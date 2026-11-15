/* TestHub 主题切换：深色 / 浅色，记忆到 localStorage */
(function () {
  var KEY = "th-theme";
  try {
    if (localStorage.getItem(KEY) === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) { /* 隐私模式忽略 */ }

  window.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    function sync() {
      var dark = document.documentElement.classList.contains("dark");
      btn.textContent = dark ? "☀️" : "🌙";
      btn.title = dark ? "切换到浅色模式" : "切换到深色模式";
    }
    sync();
    btn.addEventListener("click", function () {
      var dark = document.documentElement.classList.toggle("dark");
      try { localStorage.setItem(KEY, dark ? "dark" : "light"); } catch (e) {}
      sync();
    });
  });
})();
