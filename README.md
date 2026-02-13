# 🐵 jset - Tampermonkey Userscripts

🎯 定制你的网页浏览体验

## ✨ 简介

**jset** 是一个 Tampermonkey 用户脚本集合，用于增强和定制网页功能。

> 📝 **什么是 Tampermonkey？**
> Tampermonkey（篡改猴/油猴）是拥有超过 1000 万用户的浏览器扩展，支持 Chrome、Edge、Firefox、Safari 等主流浏览器。它允许你运行自定义 JavaScript 脚本，修改任意网页的行为和样式。

## 📦 脚本列表

| 脚本 | 功能 | 匹配站点 |
|------|------|----------|
| 🚀 [github-enhancement.user.js](./src/github-enhancement.user.js) | GitHub 增强：高速下载、快捷操作 | `github.com` |
| 🎛️ [lucky-hide-menu-items.user.js](./src/lucky-hide-menu-items.user.js) | 隐藏 Lucky 管理面板侧边栏指定菜单项 | `mylucky.com` |

> 注意：如果是自托管服务、使用的自己的域名，需要自行修改脚本中 `@match` 字段匹配的网址。

## 🚀 安装方法

### 1️⃣ 安装 Tampermonkey 扩展

- [Chrome 商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox 商店](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- [Edge 商店](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### 2️⃣ 安装脚本

**方式一：Install from URL**
1. 点击 Tampermonkey 扩展图标 → "添加新脚本"
2. 切换到"已安装脚本" → 点击右上角的"实用工具"
3. 在"从 URL 安装"处粘贴脚本原始链接

**方式二：复制粘贴**
1. 打开 [src/](./src/) 目录下的脚本文件
2. 复制全部内容
3. Tampermonkey → 添加新脚本 → 粘贴 → 保存 (Ctrl+S)

## ⚙️ 使用说明

以 **Lucky 菜单隐藏** 脚本为例：

1. 安装脚本后访问 Lucky 管理面板
2. 点击 Tampermonkey 扩展图标
3. 选择菜单命令：
   - ⚙️ **配置隐藏项** - 设置要隐藏的菜单
   - 📋 **列出所有菜单项** - 查看可用菜单列表

## 🛠️ 开发规范

📖 详细的编码规范请参考 [**AGENTS.md**](./AGENTS.md)

### 快速预览

- 🎨 使用 `.user.js` 扩展名
- 📌 必须包含标准元数据块 (`// ==UserScript==`)
- 🌐 注释使用中文
- 🚫 禁止使用 `innerHTML` 和 `eval()`

## 🔗 相关链接

- 📖 [Tampermonkey 官方文档](https://www.tampermonkey.net/documentation.php)
- 🐙 [Violentmonkey API](https://violentmonkey.github.io/api/gm/)
- 📚 [Greasespot Wiki](https://wiki.greasespot.net/)
