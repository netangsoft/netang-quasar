<template>
    <q-dialog
        class="n-dialog-proxy"
        ref="dialogRef"
        v-model="currentModelValue"
        v-bind="$attrs"
        @hide="onDialogHide"
    >
        <q-card class="flex column" :style="customStyle">

            <!-- 头部 -->
            <q-toolbar class="n-line--bottom">
                <!-- 标题 -->
                <q-toolbar-title>{{currentTitle}}</q-toolbar-title>
                <!-- 关闭按钮 -->
                <q-btn flat round dense icon="close" v-close-popup v-if="close" />
            </q-toolbar>

            <!-- 内容 -->
            <q-card-section class="n-flex-1 no-padding">
                <q-layout
                    class="absolute-full"
                    view="hHh lpr fFf"
                    container
                >
                    <q-page-container>
                        <slot
                            v-bind="props"
                            v-if="$slots.default"
                        />
                        <component
                            :is="comp"
                            :dialog-close="onDialogCancel"
                            v-bind="props"
                            v-else
                        />
                    </q-page-container>
                </q-layout>
            </q-card-section>

            <!-- 底部 -->
            <q-card-actions class="n-line--top" align="right" v-if="bottom">
                <!-- 取消按钮 -->
                <q-btn label="取消" color="primary" @click="onDialogCancel" flat v-close-popup v-if="cancel" />
                <!-- 确定按钮 -->
                <q-btn label="确定" color="primary" @click="onDialogConfirm" flat />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, computed, defineAsyncComponent, provide, watch } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_isFunction from 'lodash/isFunction'

import $n_indexOf from '@netang/utils/indexOf'
import $n_runAsync from '@netang/utils/runAsync'
import $n_slash from '@netang/utils/slash'
import $n_px from '@netang/utils/px'

import components from '../private/components'
import { NDialogKey } from '../../utils/symbols'

import $n_toast from '../../utils/toast'
import { configs } from '../../utils/config'

const {
    // 自定义路由
    routers,
} = configs

export default {

    /**
     * 标识
     */
    name: 'NDialog',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: {
            type: Boolean,
            default: true,
        },
        // 组件标识
        name: String,
        // 路由组件路径
        path: String,
        // 路由组件参数
        query: Object,
        // 组件传参
        props: Object,
        // 标题
        title: String,
        // 是否显示关闭按钮
        close: {
            type: Boolean,
            default: true,
        },
        // 是否显示取消按钮
        cancel: Boolean,
        // 是否显示底部
        bottom: {
            type: Boolean,
            default: true,
        },
        // 点击确定方法
        onConfirm: Function,
        // 宽度
        width: {
            type: [String, Number],
            default: '50%',
        },
        // 高度
        height: {
            type: [String, Number],
            default: '80%',
        },
        // 最小宽度
        minWidth: {
            type: [String, Number],
            default: '600px',
        },
        // 最小高度
        minHeight: [String, Number],
        // 最大宽度
        maxWidth: [String, Number],
        // 是否全屏
        fullscreen: Boolean,
        // 是否是页面容器
        pageContainer: {
            type: Boolean,
            default: true,
        },
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        ...useDialogPluginComponent.emits
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【数据】============================================================================================

        // quasar 对象
        const $q = useQuasar()

        const currentModelValue = ref(props.modelValue)

        watch(()=>props.modelValue, function (val) {
            currentModelValue.value = val
        })

        watch(currentModelValue, function (val) {
            emit('update:modelValue', val)
        })

        const {
            // 对话框节点
            dialogRef,
            // 对话框取消
            onDialogCancel,
            // 对话框隐藏
            onDialogHide,
        } = useDialogPluginComponent()

        // ==========【注入】============================================================================================

        // 对话框值
        const dialogValue = ref(null)

        // 组件提交方法
        let compSubmit

        // 向后代注入数据
        provide(NDialogKey, {
            // 值
            value: dialogValue,
            // 表格参数
            dialogProps: props,
            // 传参
            props: props.props,
            // 提交值
            submit(cb) {
                compSubmit = cb
            },
            // 提交
            confirm: onDialogConfirm,
            // 对话框取消
            close: onDialogCancel,
        })

        // ==========【计算属性】=========================================================================================

        /**
         * 获取当前组件
         */
        const comp = computed(function () {

            // 组件
            let comp

            // 如果是路由路径
            if (props.path) {
                // 获取路由组件
                comp = $n_get(routers, `${$n_slash(props.path, 'start', false)}.component`)

            // 如果有组件标识
            } else if (props.name && $n_has(components, props.name)) {
                // 获取自定义组件
                comp = components[props.name]
            }

            // 如果没有组件
            if (! comp) {
                return
            }

            // 如果是方法, 则说明是异步组件
            if ($n_isFunction(comp)) {
                return defineAsyncComponent(comp)
            }

            // 返回组件
            return comp
        })

        /**
         * 自定义样式
         */
        const customStyle = computed(function () {

            const style = {}

            if (
                props.fullscreen
                || $q.platform.is.mobile
                || (props.width === '100%' && props.height === '100%')
            ) {
                style.width = '100vw'
                style.height = '100vh'
                style.borderRadius = 0

            } else {
                // 宽度
                setWH(style, 'width', 'vw')
                // 高度
                setWH(style, 'height', 'vh')
                // 最小宽度
                setWH(style, 'minWidth', 'vw')
                // 最小高度度
                if (props.minHeight) {
                    setWH(style, 'minHeight', 'vh')
                }
                // 最大宽度
                if (props.maxWidth) {
                    setWH(style, 'maxWidth', 'vw')
                }
            }

            return style
        })

        /**
         * 当前标题
         */
        const currentTitle = computed(function () {

            // 如果有自定义标题
            if (props.title) {
                return props.title
            }

            return ''
        })

        // ==========【方法】=============================================================================================

        /**
         * 设置宽高
         */
        function setWH(style, field, sign) {
            if (props[field]) {
                if ($n_indexOf(props[field], '%') > -1) {
                    style[field] = props[field].replace('%', sign)
                } else {
                    style[field] = $n_px(props[field])
                }
            }
        }

        /**
         * 隐藏对话框
         */
        function hide() {
            // 隐藏对话框
            dialogRef.value.hide()
        }

        /**
         * 对话框确认
         */
        async function onDialogConfirm(...args) {

            // 如果有确定按钮
            if ($n_isFunction(props.onConfirm)) {

                if (! $n_isFunction(compSubmit)) {
                    // 轻提示
                    $n_toast({
                        message: '未调用 $dialog.submit 方法',
                    })
                    return
                }

                const res = await $n_runAsync(props.onConfirm)(await $n_runAsync(compSubmit)(...args), hide)
                if (res === false) {
                    return
                }
            }

            // 隐藏对话框
            hide()
        }

        // ==========【返回】=============================================================================================

        return {
            currentModelValue,
            // 自定义样式
            customStyle,
            // 组件
            comp,
            // 当前标题
            currentTitle,

            // 对话框节点
            dialogRef,
            // 对话框确定
            onDialogConfirm,
            // 对话框取消
            onDialogCancel,
            // 对话框隐藏
            onDialogHide,
        }
    }
}
</script>

<style lang="scss">
.n-dialog-proxy {

    &--fullscreen {
        .q-dialog__inner > div {
            border-radius: 0 !important;
            width: 100vw;
            height: 100vh;
        }
    }

    .q-dialog__inner > div {
        min-width: inherit;
    }

    .q-dialog__inner--minimized {
        padding: 0;
        > div {
            max-width: inherit !important;
            max-height: inherit !important;
        }
    }
}
</style>
