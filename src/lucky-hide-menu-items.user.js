// ==UserScript==
// @name         Lucky - Hide Sidebar Menu Items
// @name:zh-CN   Lucky - 隐藏侧边栏菜单项
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Hide specified menu items in Lucky admin panel sidebar
// @description:zh-CN  隐藏 Lucky 管理面板左侧面板的指定菜单项
// @author       pdone
// @supportURL   https://github.com/pdone/jset
// @homepageURL  https://github.com/pdone/jset
// @icon         data:image/png;base64,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
// @match        https://my_lucky_domain/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // 跳过 iframe 中执行
    if (window.self !== window.top) {
        console.log('[Lucky隐藏菜单] 在 iframe 中运行，跳过执行');
        return;
    }

    console.log('[Lucky隐藏菜单] 脚本加载');

    // ============================================
    // 配置区域 - 在这里添加你想要隐藏的菜单项
    // ============================================
    const CONFIG = {
        // 要隐藏的菜单项列表（使用菜单项的文本内容匹配）
        // 例如: ['STUN内网穿透', 'FRP内网穿透', 'Docker管理']
        // 注意: 这里配置的菜单项，是要隐藏的菜单项，用不到哪个就把注释取消
        hiddenItems: [
            // "总览"
            // , "程序日志"
            // , "动态域名"
            // , "Web服务"
            // , "端口转发"
            // , "内网穿透"
            // , "STUN内网穿透"
            // , "Cloudflared"
            // , "FRP内网穿透"
            // , "Docker管理"
            // , "Web终端"
            // , "网络存储"
            // , "WebDAV"
            // , "FTP服务"
            // , "FileBrowser"
            // , "存储管理"
            // , "RCLONE"
            // , "DLNA服务"
            // , "网络唤醒"
            // , "计划任务"
            // , "SSL/TLS证书"
            // , "IP过滤"
            // , "IP地址库"
            // , "CorazaWAF"
            // , "第三方认证"
            // , "设置"
            // , "关于"
            // , "退出登录"
        ],

        // 是否启用日志输出（调试时使用）
        debug: false
    };

    // ============================================
    // 核心功能
    // ============================================

    // 添加隐藏样式
    GM_addStyle('.lucky-hidden-menu-item { display: none !important; }');

    // 将 hiddenItems 转为 Set 用于快速查找
    let hiddenItemsSet = new Set(CONFIG.hiddenItems);

    // 已隐藏的菜单项缓存（避免重复处理）
    const hiddenCache = new Set();

    /**
     * 日志输出
     * @param {...any} args - 输出内容
     */
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[Lucky隐藏菜单]', ...args);
        }
    }

    /**
     * 通过 span 中的菜单项名称匹配并隐藏对应的 li 元素
     */
    function hideMenuItems() {
        if (hiddenItemsSet.size === 0) {
            log('没有配置要隐藏的菜单项');
            return;
        }

        // 查找所有侧边栏菜单项的 li 元素
        const menuItems = document.querySelectorAll('.el-aside .el-menu-item, .el-aside .el-sub-menu');
        log(`找到 ${menuItems.length} 个菜单项`);

        let hiddenCount = 0;

        menuItems.forEach(li => {
            // 跳过已隐藏的项
            if (hiddenCache.has(li)) {
                return;
            }

            // 通过 li 内的 span 中的文本内容进行匹配
            const span = li.querySelector('span');
            if (!span) return;

            const text = span.textContent.trim();
            if (!text) return;

            // 使用 Set 进行快速查找
            for (const hideItem of hiddenItemsSet) {
                if (text === hideItem || text.includes(hideItem)) {
                    li.classList.add('lucky-hidden-menu-item');
                    hiddenCache.add(li);
                    hiddenCount++;
                    log(`✓ 已隐藏菜单项: ${text}`);
                    break;
                }
            }
        });

        log(`共隐藏 ${hiddenCount} 个菜单项`);
    }

    // ============================================
    // 初始化
    // ============================================

    // 防止重复执行
    if (window.__LuckyMenuHiderInitialized) {
        console.log('[Lucky隐藏菜单] 脚本已初始化，跳过重复执行');
        return;
    }
    window.__LuckyMenuHiderInitialized = true;

    function init() {
        log('脚本启动');

        // 加载保存的配置
        const savedConfig = GM_getValue('hiddenItems', null);
        if (savedConfig) {
            CONFIG.hiddenItems = savedConfig;
            hiddenItemsSet = new Set(savedConfig); // 更新 Set
            log('已加载保存的配置:', CONFIG.hiddenItems);
        }

        // 等待页面完全加载
        setTimeout(() => {
            log('开始执行隐藏...');
            hideMenuItems();
        }, 500);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * 显示配置菜单
     */
    function showConfigMenu() {
        const currentConfig = JSON.stringify(CONFIG.hiddenItems, null, 2);
        const newConfig = prompt(
            '请输入要隐藏的菜单项（JSON数组格式）：\n\n' +
            '例如: ["STUN内网穿透", "FRP内网穿透", "Docker管理"]\n\n' +
            '当前配置:\n' + currentConfig,
            currentConfig
        );

        if (newConfig !== null) {
            try {
                const parsed = JSON.parse(newConfig);
                if (Array.isArray(parsed)) {
                    CONFIG.hiddenItems = parsed;
                    hiddenItemsSet = new Set(parsed); // 更新 Set
                    GM_setValue('hiddenItems', parsed);
                    alert('配置已保存！刷新页面后生效。');
                } else {
                    alert('配置格式错误，必须是数组格式！');
                }
            } catch (e) {
                alert('JSON 解析错误: ' + e.message);
            }
        }
    }

    /**
     * 列出所有菜单项
     */
    function listAllMenuItems() {
        const menuItems = document.querySelectorAll('.el-aside .el-menu-item, .el-aside .el-sub-menu');
        const items = [];

        menuItems.forEach(li => {
            // 跳过已隐藏的项
            if (hiddenCache.has(li)) {
                return;
            }

            // 通过 span 获取菜单项名称
            const span = li.querySelector('span');
            if (!span) return;

            const text = span.textContent.trim();
            if (text && !items.includes(text)) {
                items.push(text);
            }
        });

        console.log('%c[Lucky隐藏菜单] 当前页面所有菜单项：', 'color: #409EFF; font-weight: bold; font-size: 14px;');
        console.log('%c' + JSON.stringify(items, null, 2), 'color: #67C23A;');

        // 复制到剪贴板
        const textToCopy = items.join('\n');
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('所有菜单项已复制到剪贴板！请在控制台(F12)查看详细列表。\n\n共找到 ' + items.length + ' 个菜单项');
            }).catch(() => {
                alert('菜单项列表（已输出到控制台）：\n' + items.join('\n'));
            });
        } else {
            alert('菜单项列表（已输出到控制台）：\n' + items.join('\n'));
        }
    }

    // 注册油猴菜单命令
    GM_registerMenuCommand('⚙️ 配置隐藏项', showConfigMenu);
    GM_registerMenuCommand('📋 列出所有菜单项', listAllMenuItems);

})();
