/* ===== TestHub 数据集（全部来自本组六份真实测试报告） ===== */

/* 界面测试：Katalon 京东 6 组 75 断言 */
const UI_GROUPS = [
  { id:"A", name:"A 环境", assert:7, info:0, desc:"Edge 启动、指纹伪装、版本、会话、Cookie、视口",
    items:["浏览器成功启动且为 Edge 内核","自动化特征开关已关闭（navigator.webdriver=false）","浏览器版本 = 157","会话窗口尺寸符合预设视口","Cookie 策略允许会话保持","启动参数含指纹伪装配置","页面语言与区域设置正确"] },
  { id:"B", name:"B 首页", assert:31, info:11, desc:"URL / 标题 / 完整渲染 / 风控层、导航、搜索框、Logo、图片链接、控制台、性能、响应式",
    items:["URL 等于 https://www.jd.com（含跳转后域）","页面标题包含京东关键字","首屏核心元素完整渲染","无常驻可视区风控降级文案（B06）","顶部导航 11 个频道入口齐全","搜索框可聚焦可输入","Logo 图片正常加载","首屏图片链接无死链","控制台无 JS 致命错误","首屏加载性能达标","935px 视口下响应式布局无横向溢出"] },
  { id:"C", name:"C 登录页", assert:17, info:2, desc:"表单、扫码 / 密码 / 短信三种方式、第三方入口、页脚",
    items:["登录表单元素齐全","扫码登录入口可切换","密码登录输入框可输入","短信登录入口可切换","第三方登录图标正常展示","页脚协议链接可点击","记住勾选框可交互","登录按钮存在且可点击"] },
  { id:"D", name:"D 帮助中心", assert:11, info:2, desc:"导航、帮助搜索框可输入、链接与图片统计",
    items:["帮助中心导航栏渲染完整","帮助搜索框可输入文字","统计页面链接总数并记录","统计图片总数并记录","链接抽验无 404"] },
  { id:"E", name:"E 受限页面", assert:9, info:4, desc:"登录跳转落地页 5 项 + 商品频控落地页 4 项",
    items:["未登录访问受限页跳转正确","落地页文案完整","落地页无报错弹层","返回入口可点击","商品频控页提示可见","频控页布局无塌陷"] },
  { id:"F", name:"F 证据", assert:0, info:4, desc:"3 张截图与原始日志的留痕记录",
    items:["首页截图留痕","登录页截图留痕","帮助中心截图留痕","原始日志文件留存"] },
];
const UI_SUMMARY = { total:75, info:23, pass:75, fail:0, rate:"100.0%", runs:4 };

/* 性能测试：真实测量数据 */
const PERF = {
  locust: {
    label:"Locust", site:"腾讯网 www.qq.com",
    rows:[
      { case:"用例 1", users:10, spawn:1,  count:55,   avg:514.84, med:500,  p95:780,  max:821,  fail:0, rps:3.63 },
      { case:"用例 2", users:50, spawn:2,  count:642,  avg:649.64, med:650,  p95:820,  max:1023, fail:0, rps:35 },
      { case:"用例 3", users:100,spawn:2,  count:2271, avg:774.99, med:640,  p95:1500, max:2284, fail:0, rps:55 },
      { case:"用例 4", users:200,spawn:2,  count:5781, avg:1566.98,med:1400, p95:3000, max:4610, fail:0, rps:51.4 },
      { case:"用例 5", users:200,spawn:20, count:807,  avg:1369.86,med:1000, p95:2700, max:2878, fail:0, rps:61.7 },
    ]
  },
  jmeter_qq: {
    label:"JMeter", site:"腾讯网 www.qq.com",
    rows:[
      { case:"用例 1", users:10,  spawn:10,  count:10,  avg:299, med:null, p95:393, max:411, fail:0, rps:1.1 },
      { case:"用例 2", users:50,  spawn:25,  count:50,  avg:258, med:null, p95:343, max:402, fail:0, rps:2.0 },
      { case:"用例 3", users:100, spawn:50,  count:100, avg:273, med:null, p95:387, max:418, fail:0, rps:2.0 },
      { case:"用例 4", users:200, spawn:100, count:200, avg:259, med:null, p95:362, max:400, fail:0, rps:2.0 },
      { case:"补充",   users:200, spawn:10,  count:200, avg:262, med:null, p95:366, max:413, fail:0, rps:19.8 },
    ]
  },
  jmeter_video: {
    label:"JMeter", site:"腾讯视频 vs 芒果TV",
    rows:[
      { case:"腾讯视频", users:10,  avg:197, p95:213, min:178, max:234, fail:0, rps:1.1 },
      { case:"腾讯视频", users:50,  avg:225, p95:262, min:186, max:282, fail:0, rps:2.0 },
      { case:"腾讯视频", users:100, avg:212, p95:245, min:167, max:285, fail:0, rps:2.0 },
      { case:"腾讯视频", users:200, avg:229, p95:263, min:186, max:413, fail:0, rps:2.0 },
      { case:"芒果TV",   users:10,  avg:246, p95:299, min:200, max:310, fail:0, rps:1.1 },
      { case:"芒果TV",   users:50,  avg:251, p95:283, min:228, max:306, fail:0, rps:2.0 },
      { case:"芒果TV",   users:100, avg:252, p95:305, min:220, max:364, fail:0, rps:2.0 },
      { case:"芒果TV",   users:200, avg:251, p95:295, min:221, max:400, fail:0, rps:2.0 },
    ]
  }
};

/* 接口测试：Apifox 8 条 + Bruno 5 条（JSONPlaceholder 真实可执行） */
const API_BASE = "https://jsonplaceholder.typicode.com";
const API_CASES = {
  apifox: [
    { id:"AF-1", name:"查询全部帖子", method:"GET", url:API_BASE+"/posts", expect:"200 OK，返回 100 条帖子的 JSON 数组", real:"真实请求可执行", body:null },
    { id:"AF-2", name:"查询单条帖子 id=1", method:"GET", url:API_BASE+"/posts/1", expect:"200 OK，返回 userId/id/title/body 四字段", real:"真实请求可执行", body:null },
    { id:"AF-3", name:"新增帖子", method:"POST", url:API_BASE+"/posts", expect:"201 Created，返回自动生成 id", real:"真实请求可执行（模拟接口不落库）", body:{ title:"接口测试实验帖子", body:"Apifox 实验测试内容", userId:1 } },
    { id:"AF-4", name:"修改帖子 id=1", method:"PUT", url:API_BASE+"/posts/1", expect:"200 OK，返回替换后的完整 JSON", real:"真实请求可执行（模拟接口不落库）", body:{ id:1, title:"更新后的标题", body:"更新后的内容", userId:1 } },
    { id:"AF-5", name:"删除帖子 id=1", method:"DELETE", url:API_BASE+"/posts/1", expect:"200 OK，返回空对象 {}", real:"真实请求可执行", body:null },
    { id:"AF-6", name:"断言校验状态码与字段", method:"GET", url:API_BASE+"/posts/1", expect:"200 OK，两条断言全部通过", real:"真实请求可执行", body:null, assert:"res.status == 200 && body.id == 1" },
    { id:"AF-7", name:"JSON 格式化与报文查看", method:"GET", url:API_BASE+"/posts/1", expect:"Pretty/Raw 切换正常，控制台可见完整请求头响应头", real:"工具功能体验，平台内以响应面板演示", body:null },
    { id:"AF-8", name:"自动化场景批量执行", method:"GET", url:API_BASE+"/posts/1", expect:"一键执行接口并自动断言，适合批量回归", real:"工具功能，原报告已验证通过", body:null },
  ],
  bruno: [
    { id:"BR-01", name:"基本查询与响应读取", method:"GET", url:API_BASE+"/users/1", expect:"200，响应体含 id/name/username/email", real:"真实请求可执行", body:null },
    { id:"BR-02", name:"Assert 声明式断言", method:"GET", url:API_BASE+"/users/1", expect:"res.status equals 200 断言通过", real:"真实请求可执行", body:null, assert:"res.status equals 200" },
    { id:"BR-03", name:"Tests 脚本断言", method:"GET", url:API_BASE+"/users/1", expect:"「状态码应为 200」脚本断言通过", real:"真实请求可执行", body:null, assert:"expect(res.getStatus()).to.equal(200)" },
    { id:"BR-04", name:"异常用例 /users/9999", method:"GET", url:API_BASE+"/users/9999", expect:"404，断言转为失败并给出期望/实际值", real:"真实请求可执行", body:null },
    { id:"BR-05", name:"Params 参数联动", method:"GET", url:API_BASE+"/posts?userId=2&_limit=3", expect:"返回 3 条数据且 userId 全为 2", real:"真实请求可执行", body:null },
  ]
};

/* 智能用例：AngusTester 8 条真实用例 */
const AI_CASES = [
  { id:"TC-1", name:"首页可访问性与首屏渲染", pri:"P0", result:"pass",  note:"HTTP 200，首屏 87ms，核心元素齐全" },
  { id:"TC-2", name:"关键词搜索主流程（点击提交）", pri:"P0", result:"block", note:"提交触发跳转，被百度风控验证页拦截" },
  { id:"TC-3", name:"回车键提交搜索", pri:"P1", result:"block", note:"提交成功携带查询参数，被风控拦截" },
  { id:"TC-4", name:"空输入与特殊字符边界处理", pri:"P2", result:"partial", note:"空提交无无效跳转；结果页校验受风控限制" },
  { id:"TC-5", name:"首页顶部导航链接可用性", pri:"P1", result:"pass",  note:"抽验 3 个链接全部可达，无 404" },
  { id:"TC-6", name:"搜索框联想下拉可用性", pri:"P2", result:"pass",  note:"联想 10 条、Esc 关闭正常、无脚本错误" },
  { id:"TC-7", name:"跨浏览器兼容性", pri:"P2", result:"block", note:"环境仅 Chromium，无法三内核对比" },
  { id:"TC-8", name:"移动端设备模拟下的首页可用性", pri:"P2", result:"fail",  note:"375px 视口横向溢出，顶部导航截断（缺陷 DEF-01）" },
];
const AI_PROMPT = "请为百度首页（https://www.baidu.com）生成 8 条可用性测试用例，覆盖首屏渲染、搜索主流程、边界输入、导航链接、联想下拉、兼容性与移动端模拟，按 编号/名称/优先级/前置条件/测试步骤/预期结果 的表格格式输出。";

/* 工具中心：点击直达 */
const TOOLS = [
  { name:"Katalon Studio", cat:"界面测试", ver:"11.7.0", color:"#0d9488",
    site:"https://katalon.com/download", doc:"https://docs.katalon.com/", dl:"https://katalon.com/download",
    desc:"本组用于京东 Web 全量界面测试：6 组 75 条断言全部通过。" },
  { name:"Apache JMeter", cat:"性能测试", ver:"5.6.3", color:"#2f80ed",
    site:"https://jmeter.apache.org/", doc:"https://jmeter.apache.org/usermanual/index.html", dl:"https://jmeter.apache.org/download_jmeter.cgi",
    desc:"本组用于腾讯网压测及腾讯视频 vs 芒果TV 对比，共 9 组场景。" },
  { name:"Locust", cat:"性能测试", ver:"2.x", color:"#e4572e",
    site:"https://locust.io/", doc:"https://docs.locust.io/", dl:"https://pypi.org/project/locust/",
    desc:"Python 编写的开源压测工具，本组用于腾讯网 5 组负载场景。" },
  { name:"Apifox", cat:"接口测试", ver:"桌面版", color:"#7c3aed",
    site:"https://apifox.com/", doc:"https://apifox.com/help/", dl:"https://apifox.com/",
    desc:"一体化 API 协作平台，本组完成 posts 接口 8 条用例。" },
  { name:"Bruno", cat:"接口测试", ver:"4.3.0", color:"#f59e0b",
    site:"https://www.usebruno.com/", doc:"https://docs.usebruno.com/", dl:"https://www.usebruno.com/downloads",
    desc:"开源离线优先接口客户端，集合以纯文本 YAML 保存，本组完成 5 条用例。" },
  { name:"AngusTester", cat:"智能用例", ver:"SaaS", color:"#d97706",
    site:"https://www.angustester.com/",
    entries:[
      { label:"测试控制台（用例/计划/执行）", url:"https://tester.anguskit.com/" },
      { label:"AngusAI 智能对话（生成用例）", url:"https://ai.anguskit.com/" },
      { label:"GM 工作台（统一登录门户）", url:"https://gm.anguskit.com/" },
    ],
    doc:"https://www.angustester.com/",
    desc:"AI 原生测试 SaaS，本组项目「百度首页可用性测试（BAI）」共 8 条 AI 用例。" },
];
