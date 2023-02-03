<template>
    <div ref="targetRef" style="width: 1000px;height: 500px;"></div>
</template>

<script>
import { nextTick, ref, watch, computed, onMounted } from 'vue'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import 'monaco-editor/min/vs/loader'

console.log('loader', window)

export default {

    /**
     * 标识
     */
    name: 'NEditorCode',

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            type: [ String, Number ],
        },
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
    ],

    /**
     * 组合式
     */
    setup(props, { emit, slots }) {

        // ==========【计算属性】=========================================================================================

        // ==========【数据】=============================================================================================

        // 根节点
        const targetRef = ref(null)

        // 编辑器实例
        let $editor = null

        // ==========【监听数据】=========================================================================================

        /**
         * 监听表格已选数据(非手机端有效)
         */
        // watch($table.tableSelected,  async function (selected) {
        //
        //     // 先清空当前已选单条数据
        //     currentSelectedItem.value = null
        //
        //     // 如果不监听
        //     if (! isWatcher.value) {
        //
        //         // 则无需任何操作
        //         return
        //     }
        //
        //     // 下次 DOM 更新
        //     await nextTick()
        //
        //     // 如果有已选单条数据
        //     if (selected.length === 1) {
        //
        //         // 设置当前已选数据
        //         currentSelectedItem.value = selected[0]
        //     }
        //
        // }, {
        //     // 深度监听
        //     deep: true,
        // })

        // ==========【方法】============================================================================================

        /**
         * 创建编辑器
         */
        function create() {

            // window.require.config({
            //     'vs/nls': {
            //         availableLanguages: {
            //             '*': 'zh-cn'
            //         }
            //     }
            // });

            // 创建编辑器
            $editor = monaco.editor.create(targetRef.value, {
                // 初始值
                value: props.modelValue,
                // 主题
                // theme: 'vs-dark',
                // 脚本语言
                language: 'javascript',
                // 自动布局
                automaticLayout: true,
                // 自动换行
                wordWrap: 'on',
                tabSize: 4,
                // 代码略缩图
                // minimap: {
                //     enabled: false,
                // },
                // 右键
                contextmenu: true,
                // 是否只读
                // readOnly: true,
            });

            // monaco.editor.create(targetRef.value, {
            //     // theme: 'vs-dark',
            //     value: props.modelValue,
            //
            //     // 自适应调整
            //     automaticLayout: true,
            //
            //     // 自动换行
            //     wordWrap: 'on',
            //     language: 'json',
            //     colorDecorators: true,
            //     tabSize: 4,
            //     // readOnly: true,
            // });

        }

        // ==========【生命周期】=========================================================================================

        /**
         * 实例被挂载后调用
         */
        onMounted(function() {

            // 创佳编辑器
            create()
        })

        // ==========【返回】=========================================================================================

        return {
            // 根节点
            targetRef,
        }
    }
}
</script>
