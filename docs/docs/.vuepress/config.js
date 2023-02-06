import path from 'path'
import { defineUserConfig } from '@vuepress/cli'

export default defineUserConfig({
    // 站点的标题
    title: 'netang-quasar',
    // 部署站点的基础路径
    base: '/netang-quasar/docs/dist/',
    // 打包目录
    dest: path.join(__dirname, '../../dist'),

    themeConfig: {
        nav:[
            {
                text: 'components 组件',
                link: '/components/',
                items: [
                    {text: 'FieldTable 下拉表格', link: '/field-table'},
                    {text: 'FieldTree 下拉树', link: '/field-tree'},
                ]
            },
            {
                text: 'utils 工具',
                link: '/utils/',
                items: [
                    {text: 'confirm 确认框', link: '/confirm'},
                    {text: 'alert 提示框', link: '/alert'},
                ]
            },
        ]
    }
})
