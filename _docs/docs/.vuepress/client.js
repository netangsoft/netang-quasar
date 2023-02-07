import { defineClientConfig } from '@vuepress/client'

// quasar
import { Quasar, Dialog, Notify, Loading } from 'quasar'
import lang from 'quasar/lang/zh-CN.js'
import '@quasar/extras/material-icons/material-icons.css'
import "quasar/src/css/variables.sass";
import "quasar/dist/quasar.sass";
lang.date.firstDayOfWeek = 1
lang.table.recordsPerPage = ''

import MyComponent from './components/test.vue'

export default defineClientConfig({
    enhance({ app }) {

        // quasar
        app.use(Quasar, {
            // 配置
            config: {

            },
            // 插件
            plugins: {
                // 对话框
                Dialog,
                // 通知
                Notify,
                // 加载
                Loading,
            },
            // 语言
            lang,
        })


        app.component('test', MyComponent)
    },
})
