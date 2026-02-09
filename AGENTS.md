# jset - Tampermonkey Userscripts

本项目包含用于 Tampermonkey 的浏览器用户脚本集合，用于定制和增强网页功能。

## 📁 项目结构

```
jset/
├── 📄 AGENTS.md          # 编码规范和项目指南
├── 📄 README.md          # 项目说明
└── 📂 src/               # 用户脚本源代码
    └── *.user.js         # 用户脚本文件
```

## 构建和测试

**本项目为纯 JavaScript 用户脚本，无需构建步骤。**

- **无 package.json** - 不使用 npm/yarn 依赖管理
- **无构建命令** - 脚本直接复制到 Tampermonkey 中使用
- **无测试框架** - 手动测试脚本功能
- **安装方式**: 复制 `.user.js` 文件内容到 Tampermonkey 编辑器，或使用 "Install from URL"

## 文件命名规范

- 脚本文件必须以 `.user.js` 结尾
- 使用 kebab-case 命名: `site-feature.user.js`
- 示例: `github-dark-mode.user.js`, `bilibili-auto-like.user.js`

## 代码风格指南

### 1. 元数据块 (Metadata Block) - 必需

每个脚本必须以标准元数据块开头：

```javascript
// ==UserScript==
// @name         脚本中文名称
// @name:en      Script English Name
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  脚本功能描述
// @description:en Script description
// @author       作者名
// @match        https://example.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// @license      MIT
// ==/UserScript==
```

**必需字段：**
- `@name` - 脚本名称（支持多语言 `:zh-CN`, `:en`）
- `@namespace` - 命名空间（通常用 URL 或唯一标识）
- `@version` - 版本号（语义化版本，如 1.0.0）
- `@match` - 匹配的 URL 模式（推荐用 `@match` 替代 `@include`）
- `@description` - 脚本描述（支持多语言）

**常用可选字段：**
- `@author` - 作者名称
- `@grant` - 声明使用的 GM API（见下方说明）
- `@run-at` - 执行时机：`document-start`, `document-end` (默认), `document-idle`
- `@require` - 引入外部库 URL
- `@resource` - 引入静态资源
- `@icon` - 脚本图标 URL
- `@license` - 许可证

### 2. GM API 使用规范

**必须显式声明 @grant：**

```javascript
// @grant GM_addStyle          // 添加 CSS 样式
// @grant GM_setValue          // 存储数据
// @grant GM_getValue          // 读取数据
// @grant GM_deleteValue       // 删除数据
// @grant GM_xmlhttpRequest    // 跨域请求
// @grant GM_openInTab         // 打开新标签页
// @grant GM_notification      // 显示通知
// @grant GM_registerMenuCommand // 注册菜单命令
// @grant unsafeWindow         // 访问页面 window 对象
// @grant none                 // 不使用沙箱（直接使用页面环境）
```

**新旧 API 选择：**
- 优先使用新版 `GM.*` API（如 `GM.setValue`）
- 旧版 `GM_*` 兼容性更好，可混合使用
- 若不使用任何 GM API，声明 `// @grant none`

### 3. JavaScript 编码规范

**基本规则：**
- 使用严格模式：`'use strict';`
- 使用 IIFE 包裹避免污染全局命名空间：
  ```javascript
  (function() {
      'use strict';
      // 你的代码
  })();
  ```
- 使用 `const` 和 `let`，避免 `var`
- 使用箭头函数替代传统函数表达式

**DOM 操作规范：**
- 优先使用 `addEventListener` 而非 `on*` 属性
- **禁止使用 `innerHTML`** - 使用 `textContent` 或 `createElement`
- **禁止使用 `eval()`** 和 `new Function()`
- 避免使用 `document.write()`
- 动态创建元素示例：
  ```javascript
  const btn = document.createElement('button');
  btn.textContent = '点击我';
  btn.addEventListener('click', handleClick);
  document.body.appendChild(btn);
  ```

**性能规范：**
- 避免在 `mousemove` 等高频事件上执行复杂操作
- 使用防抖/节流函数处理高频事件
- 缓存 DOM 查询结果，避免重复选择器查找
- 大量 DOM 操作使用 DocumentFragment

### 4. 注释规范

- **所有注释使用中文**
- 元数据块使用英文键名，值可以使用中文
- 复杂逻辑添加说明性注释
- 函数使用 JSDoc 风格注释：
  ```javascript
  /**
   * 等待元素出现
   * @param {string} selector - CSS 选择器
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<Element>}
   */
  async function waitForElement(selector, timeout = 5000) {
      // 实现代码
  }
  ```

### 5. 错误处理

- 使用 try-catch 包裹可能出错的代码
- 网络请求必须处理错误情况
- 使用 `console.error()` 输出错误信息（生产环境可关闭）

```javascript
try {
    const data = await fetchData();
    processData(data);
} catch (error) {
    console.error('数据获取失败:', error);
}
```

### 6. 安全规范

- 不信任任何用户输入
- 验证所有外部数据
- 使用 `textContent` 而非 `innerHTML` 防止 XSS
- 谨慎使用 `unsafeWindow` - 它提供对页面 JS 的完全访问
- 跨域请求验证响应数据

## 常用代码模式

### 等待元素加载
```javascript
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);

        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`元素 ${selector} 未找到`));
        }, timeout);
    });
}
```

### 添加样式
```javascript
GM_addStyle(`
    .my-custom-class {
        color: red;
        font-size: 14px;
    }
`);
```

### 存储用户配置
```javascript
const CONFIG = {
    enabled: GM_getValue('enabled', true),
    theme: GM_getValue('theme', 'dark')
};

function saveConfig(key, value) {
    GM_setValue(key, value);
    CONFIG[key] = value;
}
```

## 发布和更新

- 更新脚本时修改 `@version` 版本号
- Tampermonkey 会自动检查更新（基于 `@downloadURL` 或安装来源）
- 建议提供 `@updateURL` 指向脚本原始地址

## 篡改猴介绍

篡改猴 (Tampermonkey) 是拥有超过 1000 万用户的最流行的浏览器扩展之一。它适用于 Chrome、Microsoft Edge、Safari、Opera Next 和 Firefox。

它允许用户自定义并增强网页功能。用户脚本是小型 JavaScript 程序，可用于向网页添加新功能或修改现有功能。

## 参考资源

- [Tampermonkey 官方文档](https://www.tampermonkey.net/documentation.php)
- [Violentmonkey API 文档](https://violentmonkey.github.io/api/gm/)
- [Greasespot Wiki](https://wiki.greasespot.net/)
