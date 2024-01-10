<template>
    <!-- :style="currentStyle" -->
    <div
        ref="targetRef"
        :style="currentStyle"
    ></div>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue'

import script from '@netang/utils/script'
import $n_isNumeric from '@netang/utils/isNumeric'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_sleep from '@netang/utils/sleep'
import $n_px from '@netang/utils/px'

import $n_toast from '../../utils/toast'

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
            default: '',
        },
        // 原始值
        originalValue: [ String, Number ],
        // 宽度
        width: {
            type: [ String, Number ],
            default: '100%',
        },
        // 高度
        height: [ String, Number ],
        // 脚本语言
        language: String,
        // 是否只读
        readonly: Boolean,
        // 是否显示代码视图
        minimap: Boolean,
        // tab 长度
        tabSize: {
            type: Number,
            default: 4,
        },
        // 主题
        theme: {
            type: String,
            default: 'vs',
        },
        // 是否开启差异代码
        diff: Boolean,
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
    setup(props, { emit }) {

        // ==========【计算属性】=========================================================================================

        /**
         * 当前样式
         */
        const currentStyle = computed(function () {
            return {
                width: $n_isNumeric(props.width) ? $n_px(props.width) : props.width,
                height: $n_isNumeric(props.height) ? $n_px(props.height) : props.height,
            }
        })

        // ==========【数据】=============================================================================================

        // 根节点
        const targetRef = ref(null)

        // 编辑器实例
        let $editor = null

        // 停止值观察
        let stopValueWatcher = false

        // 创建睡眠实例
        const sleep = $n_sleep()

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        if (! props.diff) {
            watch(() => props.modelValue, function (val) {

                // 如果停止值观察
                if (stopValueWatcher) {

                    // 则无任何操作
                    return
                }

                // 取消停止值观察
                stopValueWatcher = false

                // 设置值
                setValue(val)
            })
        }

        // ==========【方法】============================================================================================

        function load() {

            // 如果已加载
            if (window.monaco) {
                // 创建编辑器
                create()
                return
            }

            // 版本
            const version = '0.43.0'

            // 协议
            const protocol = `${location.protocol}//`

            // 加载 script
            script([
                [
                    `${protocol}cdn.staticfile.org/monaco-editor/${version}/min/vs/loader.js`,
                    `${protocol}fastly.jsdelivr.net/npm/monaco-editor@${version}/min/vs/loader.js`,
                    `${protocol}unpkg.com/monaco-editor@${version}/min/vs/loader.js`,
                ]
            ])
                .then(function ([ url ]) {

                    // 按需加载
                    const _require = window.require

                    // 配置
                    _require.config({
                        // 路径
                        paths: {
                            vs: url.replace('/loader.js', ''),
                        },
                        // 语言
                        'vs/nls' : {
                            availableLanguages: {
                                '*': 'zh-cn',
                            }
                        }
                    })

                    // 加载
                    _require(['vs/editor/editor.main'], function () {
                        // 创建编辑器
                        create()
                    })
                })
        }

        /**
         * 创建编辑器
         */
        function create() {

            // 创建编辑器
            $editor = monaco.editor[props.diff ? 'createDiffEditor' : 'create'](targetRef.value, {
                // 主题
                theme: props.theme,
                // 脚本语言
                language: props.language,
                // 自动布局
                automaticLayout: true,
                // 自动换行
                wordWrap: 'on',
                // tab 长度
                tabSize: props.tabSize,
                // 代码略缩图
                minimap: {
                    enabled: props.minimap,
                },
                // 右键
                contextmenu: true,
                // 是否只读
                readOnly: props.readonly,
            })

            // 监听失去焦点事件
            if (! props.diff) {
                $editor.onDidBlurEditorText(function () {

                    // 获取编辑器内容
                    const value = getValue()
                    if (value === void 0) {
                        return
                    }

                    // 停止值观察
                    stopValueWatcher = true

                    // 触发更新值
                    emit('update:modelValue', value)
                })
            }

            // 等编辑器全部加载完成后, 设置内容值
            sleep(300)
                .then(function () {
                    // 设置值
                    setValue(props.modelValue)
                })
        }

        /**
         * 设置值
         */
        function setValue(value) {
            if ($editor) {

                // 如果是比较差异代码
                if (props.diff) {
                    $editor.setModel({
                        original: monaco.editor.createModel(formatValue(props.originalValue), props.language),
                        modified: monaco.editor.createModel(formatValue(value), props.language),
                    })

                // 否则是编辑代码
                } else {
                    // 编辑器设置内容
                    $editor.setValue(formatValue(value))
                }

                // 代码格式化
                // $editor.getAction('editor.action.formatDocument').run()
            }
        }

        /**
         * 获取值
         */
        function getValue() {

            if ($editor) {

                // 获取编辑器的值
                let value = $editor.getValue()

                // 如果语言为 json
                if (
                    props.language === 'json'
                    && $n_isValidValue(value)
                ) {
                    try {
                        value = JSON.stringify(JSON.parse(value))

                    } catch (e) {
                        // 轻提示
                        $n_toast({
                            message: 'JSON 语法错误'
                        })
                        return
                    }
                }

                return value
            }

            return ''
        }

        /**
         * 格式化值
         */
        function formatValue(value) {
            try {
                if (value) {
                    if (
                        props.language === 'json'
                        && $n_isValidValue(value)
                    ) {
                        return JSON.stringify(JSON.parse(value), null, 2)
                    }
                    return value
                }
            } catch (e) {}

            return ''
        }

        // ==========【生命周期】=========================================================================================

        /**
         * 实例被挂载后调用
         */
        onMounted(function() {

            // 加载
            load()
        })

        // ==========【返回】=========================================================================================

        return {
            // 根节点
            targetRef,
            // 当前样式
            currentStyle,
        }
    }
}
</script>
