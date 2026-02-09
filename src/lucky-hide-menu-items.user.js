// ==UserScript==
// @name         Lucky 管理面板 - 隐藏侧边栏菜单项
// @name:en      Lucky Admin Panel - Hide Sidebar Menu Items
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  隐藏 Lucky 管理面板左侧面板的指定菜单项
// @description:en Hide specified menu items in Lucky admin panel sidebar
// @author       pdone
// @match        https://mylucky.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // ============================================
    // 配置区域 - 在这里添加你想要隐藏的菜单项
    // ============================================
    const CONFIG = {
        // 要隐藏的菜单项列表（使用菜单项的文本内容匹配）
        // 例如: ['STUN内网穿透', 'FRP内网穿透', 'Docker管理']
        // 注意: 这里配置的菜单项，是要隐藏的菜单项
        hiddenItems: [
            // 'STUN内网穿透',
            // 'FRP内网穿透',
            // 'Docker管理',
            // 'Web终端',
            // 'Cloudflared',
            // 'CorazaWAF',
            // '第三方认证',
            // 'IP地址库',
            // '网络唤醒',
            // 'DLNA服务',
            // 'RCLONE',
            // 'FileBrowser',
            // 'FTP服务',
            // '计划任务',
        ],

        // 是否启用日志输出（调试时使用）
        debug: false
    };

    // ============================================
    // 核心功能
    // ============================================

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
     * 获取菜单项的文本内容
     * @param {Element} menuItem - 菜单项元素
     * @returns {string} - 文本内容
     */
    function getMenuItemText(menuItem) {
        // 优先获取 span 的文本
        const span = menuItem.querySelector('span');
        if (span && span.textContent.trim()) {
            return span.textContent.trim();
        }

        // 获取菜单项自身的文本（排除图标）
        let text = '';
        menuItem.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent.trim();
            }
        });

        return text || menuItem.textContent.trim();
    }

    /**
     * 隐藏指定的菜单项
     */
    function hideMenuItems() {
        if (CONFIG.hiddenItems.length === 0) {
            log('没有配置要隐藏的菜单项');
            return;
        }

        // 查找所有侧边栏菜单项
        const menuItems = document.querySelectorAll('.el-aside .el-menu-item, .el-aside .el-sub-menu');
        log(`找到 ${menuItems.length} 个菜单项`);

        let hiddenCount = 0;

        menuItems.forEach(item => {
            const text = getMenuItemText(item);
            if (!text) return;

            log('检查菜单项:', text);

            // 检查是否需要隐藏
            for (const hideItem of CONFIG.hiddenItems) {
                if (text === hideItem || text.includes(hideItem)) {
                    item.style.display = 'none';
                    item.classList.add('lucky-hidden-menu-item');
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
            log('已加载保存的配置:', CONFIG.hiddenItems);
        }

        // 等待页面完全加载
        setTimeout(() => {
            log('开始执行隐藏...');
            hideMenuItems();
            observeMenuChanges();
        }, 500);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /**
     * 监听菜单变化并持续隐藏
     */
    function observeMenuChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.matches && (node.matches('.el-menu-item') || node.matches('.el-sub-menu'))) {
                                shouldCheck = true;
                            }
                            if (node.querySelectorAll) {
                                const items = node.querySelectorAll('.el-menu-item, .el-sub-menu');
                                if (items.length > 0) {
                                    shouldCheck = true;
                                }
                            }
                        }
                    });
                }
            });

            if (shouldCheck) {
                log('检测到菜单变化，重新检查...');
                hideMenuItems();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log('已启动菜单变化监听');
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

        menuItems.forEach(item => {
            const text = getMenuItemText(item);
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

    // ============================================
    // 初始化
    // ============================================

    function init() {
        log('脚本启动');

        // 加载保存的配置
        const savedConfig = GM_getValue('hiddenItems', null);
        if (savedConfig) {
            CONFIG.hiddenItems = savedConfig;
            log('已加载保存的配置:', CONFIG.hiddenItems);
        }

        // 等待页面完全加载
        setTimeout(() => {
            log('开始执行隐藏...');
            hideMenuItems();
            observeMenuChanges();
        }, 500);
    }

    // 页面加载完成后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 注册油猴菜单命令
    GM_registerMenuCommand('⚙️ 配置隐藏项', showConfigMenu);
    GM_registerMenuCommand('📋 列出所有菜单项', listAllMenuItems);

})();
