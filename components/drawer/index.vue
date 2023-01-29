<template>
    <q-drawer
        v-model="currentModelValue"
        :side="side"
        :breakpoint="breakpoint"
        :width="currentWidth"
        v-bind="$attrs"
    >
        <!-- 插槽 -->
        <slot />

        <!-- 拖拽手柄 -->
        <div
            class="n-drawer__drag-handle"
            :class="`n-drawer__drag-handle--${side}`"
            v-touch-pan.horizontal.prevent.mouse.preserveCursor="onTouchPan"
            v-if="! $q.platform.is.mobile && drag"
        ></div>
    </q-drawer>
</template>

<script>
import { ref, inject, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

import { layoutKey, emptyRenderFn } from 'quasar/src/utils/private/symbols.js'

import { NPowerKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NDrawer',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: Boolean,
        // 位置
        side: {
            type: String,
            default: 'left',
            validator: v => [ 'left', 'right' ].includes(v)
        },
        // 宽度
        width: {
            type: Number,
            default: 300
        },
        breakpoint: {
            type: Number,
            default: 1000,
        },

        // 【自定义属性】
        // --------------------------------------------------
        // 手机端宽度(px / %)
        mobileWidth: {
            type: [String, Number],
            default: '80%',
        },
        // 最小宽度
        minWidth: {
            type: Number,
            default: 100,
        },
        // 最大宽度
        maxWidth: Number,
        // 是否可拖拽
        drag: Boolean,
        // 是否拖拽折叠
        // dragCollapse: Boolean,
        // 折叠宽度
        // collapseWidth: {
        //     type: Number,
        //     default: 80,
        // },
        // 缓存名
        cache: [Boolean, String],
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

        // ==========【数据】============================================================================================

        // 获取 quasar 注入
        const $quasarLayout = inject(layoutKey, emptyRenderFn)
        if ($quasarLayout === emptyRenderFn) {
            console.error('NDrawer needs to be child of QLayout')
            return emptyRenderFn
        }

        // quasar 对象
        const $q = useQuasar()

        // 获取当前路由
        let fullPath = ''

        // 获取权限注入数据
        const $power = inject(NPowerKey)

        // 是否显示
        let currentModelValue
        if ($power) {
            currentModelValue = $power[`${props.side}Drawer`].modelValue
            if ($q.screen.width < props.breakpoint) {
                currentModelValue.value = false
                emit('update:modelValue', false)
            } else {
                currentModelValue.value = props.modelValue
            }
            // 权限路由路径
            fullPath = $power.routeFullPath

        } else {
            currentModelValue = ref(props.modelValue)
            // 当前路由路径
            fullPath = useRoute().fullPath
        }

        // 缓存名
        let cacheName = ''

        // 获取原始宽度
        let originalWidth = props.width

        // 如果是手机端
        if ($q.platform.is.mobile) {

            // 获取手机端百分比值
            let res = utils.percentValue(props.mobileWidth, true)

            // 如果是百分比值
            if (! _.isNil(res)) {
                // 原始尺寸 = 屏幕宽度 * 百分比
                if (res) {
                    originalWidth = $q.screen.width * res
                }

            } else {
                // 原始尺寸 = 屏幕宽度像素
                res = utils.pxValue(props.mobileWidth)
                if (res) {
                    originalWidth = res
                }
            }

        // 否则如果开启拖拽 && 开启缓存
        } else if (props.drag && props.cache) {

            // 设置缓存名
            cacheName = `drawer_${props.side}_${props.cache === true ? fullPath : props.cache}`

            // 从缓存获取宽度
            const cache = utils.storage.get(cacheName)
            if (cache) {
                originalWidth = cache
            }
        }

        // 当前宽度
        const currentWidth = ref(originalWidth)

        // 下次 DOM 更新
        nextTick(function() {
            if (currentModelValue.value && $quasarLayout.totalWidth.value < props.breakpoint) {
                currentModelValue.value = false
            }
        })

        // ==========【监听数据】==========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, function (val) {
            currentModelValue.value = val
        })

        /**
         * 监听当前值
         */
        watch(currentModelValue, function (val) {
            emit('update:modelValue', val)
        })

        // ==========【方法】=============================================================================================

        /**
         * 拖动事件
         */
        let initialWidth
        function onTouchPan({ isFirst, offset: { x } }) {

            // 设置初始宽度
            if (isFirst === true) {
                initialWidth = currentWidth.value
            }

            // 获取拖拽宽度
            let dragWidth = initialWidth + (props.side === 'left' ? + x : - x)
            let newWidth = dragWidth

            // 如果宽度 < 最小宽度
            if (props.minWidth && newWidth < props.minWidth) {
                newWidth = props.minWidth
            }

            // 如果宽度 > 最大宽度
            if (props.maxWidth && newWidth > props.maxWidth) {
                newWidth = props.maxWidth
            }

            // if (
            //     // 如果显示
            //     currentModelValue.value
            //     // 如果开启折叠
            //     && props.dragCollapse
            //     // 如果有最小宽度
            //     && props.minWidth
            // ) {
            //     const collapseWidth = props.collapseWidth < props.minWidth ? props.collapseWidth : props.minWidth - 10
            //
            //     // 如果 拖拽宽度 < 折叠宽度
            //     if (dragWidth < collapseWidth) {
            //         currentModelValue.value = false
            //     }
            // }

            // 如果开启缓存
            if (props.cache) {
                // 设置缓存(永久缓存)
                utils.storage.set(cacheName, newWidth, 0)
            }

            // 设置当前宽度
            currentWidth.value = newWidth
        }

        // ==========【返回】=============================================================================================

        return {
            // 是否显示
            currentModelValue,
            // 当前宽度
            currentWidth,

            // 拖动事件
            onTouchPan,
        }
    },
}
</script>

<style lang="scss" scoped>
@import "@/assets/sass/var.scss";

.n-drawer {
    // 拖拽手柄
    &__drag-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 10px;
        cursor: e-resize;
        user-select: none;
        z-index: 10;
        right: 0;

        // 左边侧滑菜单
        &--left {
            right: -5px;
        }

        // 右边侧滑菜单
        &--right {
            left: -5px;
        }
    }
}
</style>
