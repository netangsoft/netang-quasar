import path from 'path'
import { defineUserConfig } from '@vuepress/cli'
import { defaultTheme } from '@vuepress/theme-default'
import { searchPlugin } from '@vuepress/plugin-search'

import {
    navbarZh,
    sidebarZh,
} from './configs'

export default defineUserConfig({
    // 站点的标题
    title: 'netang-quasar',
    // 部署站点的基础路径
    base: '/netang-quasar/',
    // 打包目录
    dest: path.join(__dirname, '../../../docs'),
    // 主题
    theme: defaultTheme({
        locales: {
            '/': {
                // navbar
                navbar: navbarZh,
                // sidebar
                sidebar: sidebarZh,
            },
        },
    }),
    // 插件
    plugins: [
        // 搜索
        searchPlugin({
            locales: {
                '/': {
                    placeholder: '搜索',
                },
            },
        }),
    ],
})
