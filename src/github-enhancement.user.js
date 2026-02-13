// ==UserScript==
// @name         Github Enhancement
// @name:zh-CN   Github 增强
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  High-speed download of Git Clone/SSH, Release, Raw, Code(ZIP) and other files
// @description:zh-CN  高速下载 Git Clone/SSH、Release、Raw、Code(ZIP) 等文件 (公益加速)、项目列表单文件快捷下载 (☁)
// @author       pdone
// @supportURL   https://github.com/pdone/jset/issues
// @homepageURL  https://github.com/pdone/jset
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACEUExURUxpcRgWFhsYGBgWFhcWFh8WFhoYGBgWFiUlJRcVFRkWFhgVFRgWFhgVFRsWFhgWFigeHhkWFv////////////r6+h4eHv///xcVFfLx8SMhIUNCQpSTk/r6+jY0NCknJ97e3ru7u+fn51BOTsPCwqGgoISDg6empmpoaK2srNDQ0FhXV3eXcCcAAAAXdFJOUwCBIZXMGP70BuRH2Ze/LpIMUunHkpQR34sfygAAAVpJREFUOMt1U+magjAMDAVb5BDU3W25b9T1/d9vaYpQKDs/rF9nSNJkArDA9ezQZ8wPbc8FE6eAiQUsOO1o19JolFibKCdHGHC0IJezOMD5snx/yE+KOYYr42fPSufSZyazqDoseTPw4lGJNOu6LBXVUPBG3lqYAOv/5ZwnNUfUifzBt8gkgfgINmjxOpgqUA147QWNaocLniqq3QsSVbQHNp45N/BAwoYQz9oUJEiE4GMGfoBSMj5gjeWRIMMqleD/CAzUHFqTLyjOA5zjNnwa4UCEZ2YK3khEcBXHjVBtEFeIZ6+NxYbPqWp1DLKV42t6Ujn2ydyiPi9nX0TTNAkVVZ/gozsl6FbrktkwaVvL2TRK0C8Ca7Hck7f5OBT6FFbLATkL2ugV0tm0RLM9fedDvhWstl8Wp9AFDjFX7yOY/lJrv8AkYuz7fuP8dv9izCYH+x3/LBnj9fYPBTpJDNzX+7cAAAAASUVORK5CYII=
// @match        *://github.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        window.onurlchange
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // 跳过 iframe 中执行
    if (window.self !== window.top) {
        console.log('[Github Enhancement] 在 iframe 中运行，跳过执行');
        return;
    }

    console.log('[Github Enhancement] 脚本加载');

    // ============================================
    // 配置管理
    // ============================================
    const CONFIG = {
        storageKeys: {
            rawDownLink: 'menu_rawDownLink',
            gitClone: 'menu_gitClone'
        },
        defaults: {
            rawDownLink: true,
            gitClone: true
        },
        timeouts: {
            rawFile: 1000,
            rawDownLink: 2000,
            rawDownLinkEvent: 1000,
            debounce: 100
        },
        classes: {
            releaseSpeed: 'GE-RS',
            gitClone: 'GE-GC',
            gitCloneSsh: 'GE-GCS',
            gitClonePanel: 'GE-GCP',
            rawFile: 'GE-RF',
            fileDownLink: 'fileDownLink'
        },
        selectors: {
            boxFooter: '.Box-footer',
            fileRow: 'div.Box-row svg.octicon-file, .react-directory-filename-column>svg.color-fg-muted',
            rawButton: 'a[data-testid="raw-button"]'
        }
    };

    const URLS = {
        download: [
            ['https://gh-proxy.org/https://github.com', 'Global', '[Cloudflare] - 全球加速，由 [gh-proxy.com] 提供'],
            ['https://v6.gh-proxy.org/https://github.com', 'IPv6', '[Cloudflare+国内优选+IPv6] - 国内优化，支持 IPv6，由 [gh-proxy.com] 提供'],
            ['https://hk.gh-proxy.org/https://github.com', 'HK', '[中国香港] - 国内线路优化，secbit.ai & Sharon CDN 赞助（大文件下载不建议使用）'],
            ['https://cdn.gh-proxy.org/https://github.com', 'CDN', '[Fastly CDN] - 该公益加速源由 [gh-proxy.com] 提供'],
            ['https://edgeone.gh-proxy.org/https://github.com', 'Edge', '[EdgeOne] - 全球加速，该公益加速源由 [gh-proxy.com] 提供'],
        ],
        clone: [
            ['https://gh-proxy.org/https://github.com', 'Global', '[Cloudflare] - 全球加速，由 [gh-proxy.com] 提供'],
            ['https://v6.gh-proxy.org/https://github.com', 'IPv6', '[Cloudflare+国内优选+IPv6] - 国内优化，支持 IPv6，由 [gh-proxy.com] 提供'],
            ['https://hk.gh-proxy.org/https://github.com', 'HK', '[中国香港] - 国内线路优化，secbit.ai & Sharon CDN 赞助'],
            ['https://cdn.gh-proxy.org/https://github.com', 'CDN', '[Fastly CDN] - 该公益加速源由 [gh-proxy.com] 提供'],
            ['https://edgeone.gh-proxy.org/https://github.com', 'Edge', '[EdgeOne] - 全球加速，该公益加速源由 [gh-proxy.com] 提供'],
        ],
        cloneSsh: [
            ['ssh://git@ssh.github.com:443/', 'Github', '[Github] - Github 官方提供的 443 端口的 SSH（依然是 SSH 协议），适用于限制访问 22 端口的网络环境'],
        ],
        raw: [
            ['https://raw.githubusercontent.com', 'Github', '[Github] - 缓存：无（或很短）'],
            ['https://gh-proxy.org/https://raw.githubusercontent.com', 'Global', '[Cloudflare] - 全球加速，由 [gh-proxy.com] 提供 - 缓存：有'],
            ['https://v6.gh-proxy.org/https://raw.githubusercontent.com', 'IPv6', '[Cloudflare+国内优选+IPv6] - 国内优化，支持 IPv6，由 [gh-proxy.com] 提供 - 缓存：有'],
            ['https://hk.gh-proxy.org/https://raw.githubusercontent.com', 'HK', '[中国香港] - 国内线路优化，secbit.ai & Sharon CDN 赞助 - 缓存：有（官方注明 2 小时）'],
            ['https://cdn.gh-proxy.org/https://raw.githubusercontent.com', 'CDN', '[Fastly CDN] - 该公益加速源由 [gh-proxy.com] 提供 - 缓存：有'],
            ['https://edgeone.gh-proxy.org/https://raw.githubusercontent.com', 'Edge', '[EdgeOne] - 全球加速，该公益加速源由 [gh-proxy.com] 提供 - 缓存：有'],
        ]
    };

    const ICONS = [
        '<svg class="octicon octicon-cloud-download" aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M9 12h2l-3 3-3-3h2V7h2v5zm3-8c0-.44-.91-3-4.5-3C5.08 1 3 2.92 3 5 1.02 5 0 6.52 0 8c0 1.53 1 3 3 3h3V9.7H3C1.38 9.7 1.3 8.28 1.3 8c0-.17.05-1.7 1.7-1.7h1.3V5c0-1.39 1.56-2.7 3.2-2.7 2.55 0 3.13 1.55 3.2 1.8v1.2H12c.81 0 2.7.22 2.7 2.2 0 2.09-2.25 2.2-2.7 2.2h-2V11h2c2.08 0 4-1.16 4-3.5C16 5.06 14.08 4 12 4z"></path></svg>'
    ];

    // ============================================
    // 工具函数
    // ============================================
    const utils = {
        log(...args) {
            console.log('[Github Enhancement]', ...args);
        },

        error(...args) {
            console.error('[Github Enhancement]', ...args);
        },

        toggleVisibility(showSelector, hideSelector, container) {
            container.querySelectorAll(showSelector).forEach(el => el.style.display = 'inline');
            container.querySelectorAll(hideSelector).forEach(el => el.style.display = 'none');
        }
    };

    // ============================================
    // 状态管理
    // ============================================
    const state = {
        menuRawDownLinkId: null,
        menuGitCloneId: null,
        menuFeedBackId: null,
        observer: null,
        debounceTimer: null
    };

    // ============================================
    // 初始化配置
    // ============================================
    function initConfig() {
        try {
            [CONFIG.storageKeys.rawDownLink, CONFIG.storageKeys.gitClone].forEach(key => {
                if (GM_getValue(key) == null) {
                    GM_setValue(key, CONFIG.defaults[key.replace('menu_', '')]);
                }
            });
        } catch (error) {
            utils.error('初始化配置失败:', error);
        }
    }

    // ============================================
    // 菜单命令
    // ============================================
    function registerMenuCommand() {
        try {
            if (state.menuFeedBackId) {
                [state.menuRawDownLinkId, state.menuGitCloneId, state.menuFeedBackId]
                    .forEach(id => id && GM_unregisterMenuCommand(id));
            }

            state.menuRawDownLinkId = GM_registerMenuCommand(
                `${GM_getValue(CONFIG.storageKeys.rawDownLink) ? '✅' : '❌'} 项目列表单文件快捷下载 (☁)`,
                () => toggleFeature(CONFIG.storageKeys.rawDownLink, '项目列表单文件快捷下载 (☁)')
            );

            state.menuGitCloneId = GM_registerMenuCommand(
                `${GM_getValue(CONFIG.storageKeys.gitClone) ? '✅' : '❌'} 添加 git clone 命令`,
                () => toggleFeature(CONFIG.storageKeys.gitClone, '添加 git clone 命令')
            );

            state.menuFeedBackId = GM_registerMenuCommand('💬 反馈 & 建议', () => {
                window.GM_openInTab('https://github.com/pdone/jset/issues', { active: true, insert: true, setParent: true });
            });
        } catch (error) {
            utils.error('注册菜单命令失败:', error);
        }
    }

    function toggleFeature(key, name) {
        try {
            const current = GM_getValue(key) === true;
            const newValue = !current;
            GM_setValue(key, newValue);
            GM_notification({
                text: `已${newValue ? '开启' : '关闭'} [${name}] 功能\n（点击刷新网页后生效）`,
                timeout: 3500,
                onclick: () => location.reload()
            });
            registerMenuCommand();
        } catch (error) {
            utils.error(`切换功能 ${key} 失败:`, error);
        }
    }

    // ============================================
    // URL 构建
    // ============================================
    function getDownloadUrls() {
        return URLS.download;
    }

    // ============================================
    // 样式管理
    // ============================================
    function injectStyles() {
        try {
            const styleId = 'GE-styles';
            if (document.getElementById(styleId)) return;

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .GE-RS a {
                    padding: 0 6px;
                    margin-right: -1px;
                    border-radius: 2px;
                    background-color: var(--GE-background-color);
                    border-color: var(--borderColor-default);
                    font-size: 11px;
                    color: var(--GE-font-color);
                }
                .GE-GC, .GE-GCS { margin-top: 4px; }
            `;
            document.head.appendChild(style);
        } catch (error) {
            utils.error('注入样式失败:', error);
        }
    }

    function colorMode() {
        try {
            let backColor = '#ffffff', fontColor = '#888888';
            const root = document.lastElementChild;

            if (root?.dataset.colorMode === 'dark') {
                if (root.dataset.darkTheme === 'dark_dimmed') {
                    backColor = '#272e37';
                    fontColor = '#768390';
                } else {
                    backColor = '#161a21';
                    fontColor = '#97a0aa';
                }
            } else if (root?.dataset.colorMode === 'auto') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                    root.dataset.lightTheme?.indexOf('dark') > -1;
                if (isDark) {
                    if (root.dataset.darkTheme === 'dark_dimmed') {
                        backColor = '#272e37';
                        fontColor = '#768390';
                    } else if (root.dataset.darkTheme?.indexOf('light') === -1) {
                        backColor = '#161a21';
                        fontColor = '#97a0aa';
                    }
                }
            }

            let styleEl = document.getElementById('GE-Github');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'GE-Github';
                styleEl.type = 'text/css';
            }
            styleEl.textContent = `.GE-RS a {--GE-background-color: ${backColor}; --GE-font-color: ${fontColor};}`;
            document.lastElementChild.appendChild(styleEl);
        } catch (error) {
            utils.error('设置主题模式失败:', error);
        }
    }

    // ============================================
    // Release 下载加速
    // ============================================
    function addRelease() {
        try {
            const footers = document.querySelectorAll(CONFIG.selectors.boxFooter);
            if (footers.length === 0 || !location.pathname.includes('/releases')) return;

            const downloadUrls = getDownloadUrls();
            let divDisplay = document.documentElement.clientWidth > 755
                ? 'margin-top: -3px; margin-left: 8px; display: inherit;'
                : 'margin-left: -90px;';

            if (!document.getElementById('GE-RS-style')) {
                const style = document.createElement('style');
                style.id = 'GE-RS-style';
                style.textContent = '@media (min-width: 768px) {.Box-footer li.Box-row>div>span.color-fg-muted {min-width: 27px !important;}}';
                footers[0].appendChild(style);
            }

            footers.forEach(footer => {
                if (footer.querySelector(`.${CONFIG.classes.releaseSpeed}`)) return;

                footer.querySelectorAll('li.Box-row a').forEach(link => {
                    const hrefParts = link.href.split(location.host);
                    if (hrefParts.length < 2) return;

                    let html = `<div class="${CONFIG.classes.releaseSpeed}" style="${divDisplay}">`;

                    downloadUrls.forEach(mirror => {
                        const url = mirror[3] !== undefined && hrefParts[1].includes('/archive/')
                            ? mirror[3] + hrefParts[1]
                            : mirror[0] + hrefParts[1];

                        html += `<a style="padding:0 6px; margin-right:-1px; border-radius:2px; background-color:var(--GE-background-color); border-color:var(--borderColor-default); font-size:11px; color:var(--GE-font-color);" class="btn" href="${url}" target="_blank" title="${mirror[2]}" rel="noreferrer noopener nofollow">${mirror[1]}</a>`;
                    });

                    html += '</div>';
                    link.parentElement?.nextElementSibling?.insertAdjacentHTML('beforeend', html);
                });
            });
        } catch (error) {
            utils.error('添加 Release 加速按钮失败:', error);
        }
    }

    // ============================================
    // ZIP 下载加速
    // ============================================
    function addDownloadZip(target) {
        try {
            const html = target.querySelector('ul[class^=prc-ActionList-ActionList-]>li:last-child');
            if (!html) return;

            const scriptEl = document.querySelector('react-partial[partial-name=repos-overview]>script[data-target="react-partial.embeddedData"]');
            if (!scriptEl?.textContent) return;

            const zipIndex = scriptEl.textContent.indexOf('"zipballUrl":"');
            if (zipIndex === -1) return;

            const hrefSlice = scriptEl.textContent.slice(zipIndex + 14);
            const zipUrl = hrefSlice.slice(0, hrefSlice.indexOf('"'));

            const downloadUrls = getDownloadUrls();
            let resultHtml = '';

            downloadUrls.forEach(mirror => {
                if (mirror[3] === '') return;

                const clone = html.cloneNode(true);
                const link = clone.querySelector('a[href$=".zip"]');
                const span = clone.querySelector('span[id]');

                if (!link) return;

                const url = mirror[3] !== undefined ? mirror[3] + zipUrl : mirror[0] + zipUrl;
                link.href = url;
                link.setAttribute('title', mirror[2].replaceAll('&#10;', '\n'));
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noreferrer noopener nofollow');
                if (span) span.textContent = 'Download ZIP ' + mirror[1];

                resultHtml += clone.outerHTML;
            });

            html.insertAdjacentHTML('afterend', resultHtml);
        } catch (error) {
            utils.error('添加 ZIP 下载加速失败:', error);
        }
    }

    // ============================================
    // Git Clone 加速
    // ============================================
    function clearGitClone(css) {
        try {
            document.querySelectorAll(css).forEach(el => el.remove());
        } catch (error) {
            utils.error('清理 Git Clone 元素失败:', error);
        }
    }

    function addGitClone(target) {
        try {
            const input = target.querySelector('input[value^="https:"]:not([title])');
            if (!input) return;

            const hrefSplit = input.value.split(location.host)[1];
            if (!hrefSplit) return;

            if (input.nextElementSibling) input.nextElementSibling.hidden = true;

            const nextSpan = input.parentElement?.nextElementSibling;
            if (nextSpan?.tagName === 'SPAN') {
                nextSpan.textContent += ' (↑点击上面文字可复制)';
            }

            let gitClonePrefix = '';
            if (GM_getValue(CONFIG.storageKeys.gitClone)) {
                gitClonePrefix = 'git clone ';
                input.value = gitClonePrefix + input.value;
                input.setAttribute('value', input.value);
            }

            let html = '';
            URLS.clone.forEach(mirror => {
                const clone = input.cloneNode(true);
                const url = mirror[0] + hrefSplit;

                clone.title = `${url}\n\n${mirror[2].replaceAll('&#10;', '\n')}\n\n提示：点击文字可直接复制`;
                clone.setAttribute('value', gitClonePrefix + url);
                html += `<div style="margin-top:4px;" class="${CONFIG.classes.gitClone} ${input.parentElement?.className || ''}">${clone.outerHTML}</div>`;
            });

            input.parentElement?.insertAdjacentHTML('afterend', html);

            const parent = input.parentElement?.parentElement;
            if (parent && !parent.classList.contains(CONFIG.classes.gitClonePanel)) {
                parent.classList.add(CONFIG.classes.gitClonePanel);
                parent.addEventListener('click', (e) => {
                    if (e.target.tagName === 'INPUT') {
                        GM_setClipboard(e.target.value);
                    }
                });
            }
        } catch (error) {
            utils.error('添加 Git Clone 加速失败:', error);
        }
    }

    function addGitCloneSsh(target) {
        try {
            const input = target.querySelector('input[value^="git@"]:not([title])');
            if (!input) return;

            const hrefSplit = input.value.split(':')[1];
            if (!hrefSplit) return;

            input.nextElementSibling && (input.nextElementSibling.hidden = true);

            const nextSpan = input.parentElement?.nextElementSibling;
            if (nextSpan?.tagName === 'SPAN') {
                nextSpan.textContent += ' (↑点击上面文字可复制)';
            }

            let gitClonePrefix = '';
            if (GM_getValue(CONFIG.storageKeys.gitClone)) {
                gitClonePrefix = 'git clone ';
                input.value = gitClonePrefix + input.value;
                input.setAttribute('value', input.value);
            }

            let html = '';
            URLS.cloneSsh.forEach(mirror => {
                const clone = input.cloneNode(true);
                const url = mirror[0] + hrefSplit;
                clone.title = `${url}\n\n${mirror[2].replaceAll('&#10;', '\n')}\n\n提示：点击文字可直接复制`;
                clone.setAttribute('value', gitClonePrefix + url);
                html += `<div style="margin-top:4px;" class="${CONFIG.classes.gitCloneSsh} ${input.parentElement?.className || ''}">${clone.outerHTML}</div>`;
            });

            input.parentElement?.insertAdjacentHTML('afterend', html);

            const parent = input.parentElement?.parentElement;
            if (parent && !parent.classList.contains(CONFIG.classes.gitClonePanel)) {
                parent.classList.add(CONFIG.classes.gitClonePanel);
                parent.addEventListener('click', (e) => {
                    if (e.target.tagName === 'INPUT') {
                        GM_setClipboard(e.target.value);
                    }
                });
            }
        } catch (error) {
            utils.error('添加 Git Clone SSH 加速失败:', error);
        }
    }

    // ============================================
    // Raw 文件加速
    // ============================================
    function addRawFile() {
        try {
            const button = document.querySelector(CONFIG.selectors.rawButton);
            if (!button) return;

            const href = location.href.replace(`https://${location.host}`, '');
            const href2 = href.replace('/blob/', '/');
            let html = '';

            for (let i = 1; i < URLS.raw.length; i++) {
                const mirror = URLS.raw[i];
                const isGhMirror = mirror[0].includes('/gh') && mirror[0].indexOf('/gh') + 3 === mirror[0].length && !mirror[0].includes('cdn.staticaly.com');
                const url = isGhMirror ? mirror[0] + href.replace('/blob/', '@') : mirror[0] + href2;

                html += `<a href="${url}" title="${mirror[2]}\n\n提示：如果想要直接下载，可使用 [Alt + 左键] 点击加速按钮或 [右键 - 另存为...]" target="_blank" role="button" rel="noreferrer noopener nofollow" data-size="small" data-variant="default" class="${button.className} ${CONFIG.classes.rawFile}" style="border-radius:0;margin-left:-1px;">${mirror[1].replace(/ \d/, '')}</a>`;
            }

            document.querySelectorAll(`.${CONFIG.classes.rawFile}`).forEach(el => el.remove());
            button.insertAdjacentHTML('afterend', html);
        } catch (error) {
            utils.error('添加 Raw 文件加速按钮失败:', error);
        }
    }

    // ============================================
    // Raw 单文件快捷下载
    // ============================================
    const mouseHandlers = {
        over(evt) {
            const elem = evt.currentTarget;
            utils.toggleVisibility('.fileDownLink', 'svg.octicon.octicon-file, svg.color-fg-muted', elem);
        },
        out(evt) {
            const elem = evt.currentTarget;
            utils.toggleVisibility('svg.octicon.octicon-file, svg.color-fg-muted', '.fileDownLink', elem);
        }
    };

    function addRawDownLink() {
        try {
            if (!GM_getValue(CONFIG.storageKeys.rawDownLink)) return;

            const files = document.querySelectorAll(CONFIG.selectors.fileRow);
            if (files.length === 0 || location.pathname.includes('/tags')) return;
            if (document.querySelectorAll(`.${CONFIG.classes.fileDownLink}`).length > 0) return;

            files.forEach(fileEl => {
                const tr = fileEl.parentNode?.parentNode;
                const link = tr?.querySelector('[role="rowheader"] > .css-truncate.css-truncate-target.d-block.width-fit > a, .react-directory-truncate>a');
                if (!link) return;

                const name = link.innerText;
                const href = link.getAttribute('href');
                if (!href) return;

                // 使用第一个加速源（Global）
                const mirror = URLS.raw[1];

                const isGhMirror = mirror[0].includes('/gh') && mirror[0].indexOf('/gh') + 3 === mirror[0].length && !mirror[0].includes('cdn.staticaly.com');
                const url = isGhMirror ? mirror[0] + href.replace('/blob/', '@') : mirror[0] + href.replace('/blob/', '/');

                fileEl.insertAdjacentHTML('afterend', `<a href="${url}" download="${name}" target="_blank" rel="noreferrer noopener nofollow" class="${CONFIG.classes.fileDownLink}" style="display:none;" title="「${mirror[1]}」\n\n[Alt + 左键点击] 或 [右键 - 另存为...] 下载文件。注意：鼠标点击 [☁] 图标，而不是左侧的文件名！\n\n${mirror[2]}">${ICONS[0]}</a>`);

                tr.onmouseover = mouseHandlers.over;
                tr.onmouseout = mouseHandlers.out;
            });
        } catch (error) {
            utils.error('添加 Raw 单文件快捷下载失败:', error);
        }
    }

    function delRawDownLink() {
        try {
            if (!GM_getValue(CONFIG.storageKeys.rawDownLink)) return;
            document.querySelectorAll(`.${CONFIG.classes.fileDownLink}`).forEach(el => el.remove());
        } catch (error) {
            utils.error('移除 Raw 单文件快捷下载失败:', error);
        }
    }

    function addRawDownLinkEvent() {
        try {
            if (!GM_getValue(CONFIG.storageKeys.rawDownLink)) return;

            const files = document.querySelectorAll(CONFIG.selectors.fileRow);
            if (files.length === 0) return;
            if (document.querySelectorAll(`.${CONFIG.classes.fileDownLink}`).length === 0) return;

            files.forEach(fileEl => {
                const tr = fileEl.parentNode?.parentNode;
                if (tr) {
                    tr.onmouseover = mouseHandlers.over;
                    tr.onmouseout = mouseHandlers.out;
                }
            });
        } catch (error) {
            utils.error('添加 Raw 下载事件失败:', error);
        }
    }

    // ============================================
    // DOM 观察器
    // ============================================
    function handleMutations(mutations) {
        try {
            clearTimeout(state.debounceTimer);
            state.debounceTimer = setTimeout(() => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType !== 1) return;

                        if (location.pathname.includes('/releases') && node.tagName === 'DIV' && node.dataset.viewComponent === 'true' && node.classList?.[0] === 'Box') {
                            addRelease();
                        } else if (document.querySelector('#repository-container-header:not([hidden])')) {
                            if (node.tagName === 'DIV' && node.parentElement?.id === '__primerPortalRoot__') {
                                addDownloadZip(node);
                                addGitClone(node);
                                addGitCloneSsh(node);
                            } else if (node.tagName === 'DIV' && node.className?.includes('Box-sc-')) {
                                if (node.querySelector('input[value^="https:"]')) {
                                    clearGitClone(`.${CONFIG.classes.gitCloneSsh}`);
                                    addGitClone(node);
                                } else if (node.querySelector('input[value^="git@"]')) {
                                    clearGitClone(`.${CONFIG.classes.gitClone}`);
                                    addGitCloneSsh(node);
                                } else if (node.querySelector('input[value^="gh "]')) {
                                    clearGitClone(`.${CONFIG.classes.gitClone}, .${CONFIG.classes.gitCloneSsh}`);
                                }
                            }
                        }
                    });
                });
            }, CONFIG.timeouts.debounce);
        } catch (error) {
            utils.error('处理 DOM 变化失败:', error);
        }
    }

    function initObserver() {
        try {
            state.observer = new MutationObserver(handleMutations);
            state.observer.observe(document.body, { childList: true, subtree: true });
        } catch (error) {
            utils.error('初始化 DOM 观察器失败:', error);
        }
    }

    // ============================================
    // URL 变化监听
    // ============================================
    function addUrlChangeEvent() {
        window.addEventListener('urlchange', () => {
            colorMode();
            if (location.pathname.includes('/releases')) addRelease();
            addRawFile();
            addRawDownLink();
            addRawDownLinkEvent();
        });
    }

    // ============================================
    // 初始化
    // ============================================
    function init() {
        try {
            utils.log('脚本启动');

            initConfig();
            injectStyles();
            colorMode();
            registerMenuCommand();
            initObserver();

            // 直接执行
            addRawFile();
            addRawDownLink();

            // GitHub 支持 urlchange 事件
            if (window.onurlchange === null) {
                addUrlChangeEvent();
            }

            utils.log('脚本初始化完成');
        } catch (error) {
            utils.error('脚本初始化失败:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
