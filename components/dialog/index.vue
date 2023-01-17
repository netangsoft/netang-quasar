<template>
    <q-dialog
        class="n-dialog-proxy"
        ref="dialogRef"
        v-bind="dialogProps"
        @hide="onDialogHide"
    >
        <q-card class="flex column" :style="customStyle">

            <!-- 头部 -->
            <q-toolbar>
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
                        <component
                            :is="comp"
                            v-bind="props"
                        />
                    </q-page-container>
                </q-layout>
            </q-card-section>

            <!-- 底部 -->
            <q-card-actions align="right" v-if="bottom">
                <!-- 取消按钮 -->
                <q-btn label="取消" color="primary" @click="onDialogCancel" flat v-close-popup v-if="cancel" />
                <!-- 确定按钮 -->
                <q-btn label="确定" color="primary" @click="onDialogConfirm" flat />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { ref, computed, defineAsyncComponent, provide } from 'vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'

import routers from '@/router/routers'

import components from './components'
import { NDialogKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NDialog',

    /**
     * 声明属性
     */
    props: {
        // 对话框传参
        dialogProps: Object,
        // 组件标识
        name: String,
        // 路由组件路径
        route: String,
        // 组件传参
        props: Object,
        // 标题
        title: String,
        // 显示关闭按钮
        close: {
            type: Boolean,
            default: true,
        },
        // 显示取消按钮
        cancel: Boolean,
        // 确定按钮
        onConfirm: Function,
        // 显示底部
        bottom: {
            type: Boolean,
            default: true,
        },
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
        // 是否全屏
        fullscreen: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        ...useDialogPluginComponent.emits
    ],

    /**
     * 组合式
     */
    setup(props) {

        // ==========【数据】============================================================================================

        // quasar 对象
        const $q = useQuasar()

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
            // 传参
            props: props.props,
            // 提交值
            submit(cb) {
                compSubmit = cb
            },
        })

        // ==========【计算属性】=========================================================================================

        function setWH(style, field, sign) {
            if (props[field]) {
                if (utils.indexOf(props[field], '%') > -1) {
                    style[field] = props[field].replace('%', sign)
                } else {
                    style[field] = utils.px(props[field])
                }
            }
        }

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
            }

            return style
        })

        /**
         * 获取当前组件
         */
        const comp = computed(function () {

            // 组件
            let comp

            // 如果是路由路径
            if (props.route) {
                // 获取路由组件
                comp = _.get(routers, `${utils.slash(props.route, 'start', false)}.component`)

            // 如果有组件标识
            } else if (props.name && _.has(components, props.name)) {
                // 获取自定义组件
                comp = components[props.name]
            }

            // 如果没有组件
            if (! comp) {
                return
            }

            // 如果是方法, 则说明是异步组件
            if (_.isFunction(comp)) {
                return defineAsyncComponent(comp)
            }

            // 返回组件
            return comp
        })

        /**
         * 当前标题
         */
        const currentTitle = computed(function () {

            // 如果有自定义标题
            if (props.title) {
                return props.title
            }

            return props.route ?
                // 如果是路由路径, 则获取路由标题
                _.get(routers, `${utils.slash(props.route, 'start', false)}.meta.title`, '')
                : ''
        })

        // ==========【方法】=============================================================================================

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
        async function onDialogConfirm() {

            // 如果有确定按钮
            if (_.isFunction(props.onConfirm)) {

                if (! _.isFunction(compSubmit)) {
                    // 轻提示
                    utils.toast({
                        message: '未调用 $dialog.submit 方法',
                    })
                    return
                }

                const res = await utils.runAsync(props.onConfirm)(await utils.runAsync(compSubmit)(), hide)
                if (res === false) {
                    return
                }
            }

            // 隐藏对话框
            hide()
        }

        // ==========【返回】=============================================================================================

        return {
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
