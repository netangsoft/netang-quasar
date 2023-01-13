<template>
    <q-drawer
        v-model="isShow"
        :dark="dark"
        :side="side"
        :width="currentWidth"
        :mini="mini"
        :miniWidth="miniWidth"
        :miniToOverlay="miniToOverlay"
        :breakpoint="breakpoint"
        :showIfAbove="showIfAbove"
        :behavior="behavior"
        :bordered="bordered"
        :elevated="elevated"
        :overlay="overlay"
        :persistent="persistent"
        :noSwipeOpen="noSwipeOpen"
        :noSwipeClose="noSwipeClose"
        :noSwipeBackdrop="noSwipeBackdrop"
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
import { ref, inject, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

import { useDarkProps } from 'quasar/src/composables/private/use-dark.js'
import { layoutKey, emptyRenderFn } from 'quasar/src/utils/private/symbols.js'

import { NLayoutKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NDrawer',

    /**
     * 声明属性
     */
    props: {
        ...useDarkProps,

        side: {
            type: String,
            default: 'left',
            validator: v => [ 'left', 'right' ].includes(v)
        },
        width: {
            type: Number,
            default: 300
        },
        mini: Boolean,
        miniToOverlay: Boolean,
        miniWidth: {
            type: Number,
            default: 57
        },
        breakpoint: {
            type: Number,
            default: 1000
        },
        showIfAbove: Boolean,
        behavior: {
            type: String,
            validator: v => [ 'default', 'desktop', 'mobile' ].includes(v),
            default: 'default'
        },
        bordered: Boolean,
        elevated: Boolean,
        overlay: Boolean,
        persistent: Boolean,
        noSwipeOpen: Boolean,
        noSwipeClose: Boolean,
        noSwipeBackdrop: Boolean,

        // 【自定义事件】
        // --------------------------------------------------
        // 是否显示
        show: Boolean,
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
     * 组合式
     */
    setup(props) {

        // ==========【注入】============================================================================================

        // 获取 quasar 注入
        const $layout = inject(layoutKey, emptyRenderFn)
        if ($layout === emptyRenderFn) {
            console.error('NDrawer needs to be child of QLayout')
            return emptyRenderFn
        }

        // 获取布局注入数据
        const $nLayout = inject(NLayoutKey)

        // ==========【数据】============================================================================================

        // quasar 对象
        const $q = useQuasar()

        // 获取当前路由
        const $route = useRoute()

        // 是否显示
        const isShow = ref($q.screen.width < props.breakpoint ? false : props.show)

        // 更新布局数据
        $nLayout.update(function(data) {
            data[props.side].data = isShow
        })

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
            cacheName = `drawer_${props.side}_${props.cache === true ? $route.fullPath : props.cache}`

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
            if (isShow.value && $layout.totalWidth.value < props.breakpoint) {
                isShow.value = false
            }
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
            //     isShow.value
            //     // 如果开启折叠
            //     && props.dragCollapse
            //     // 如果有最小宽度
            //     && props.minWidth
            // ) {
            //     const collapseWidth = props.collapseWidth < props.minWidth ? props.collapseWidth : props.minWidth - 10
            //
            //     // 如果 拖拽宽度 < 折叠宽度
            //     if (dragWidth < collapseWidth) {
            //         isShow.value = false
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
            isShow,
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
