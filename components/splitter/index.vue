<template>
    <!-- 拆分器 -->
    <q-splitter
        class="n-splitter"
        :class="currentClass"
        v-model="currentValue"
        v-bind="$attrs"
    >
        <!-- 插槽 -->
        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]
        >
            <slot :name="slotName" />
        </template>
    </q-splitter>
</template>

<script>
import { computed, ref, watch, inject } from 'vue'
import { NPowerKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NSplitter',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: {
            type: Number,
            required: true,
        },
        // 显示前置插槽
        showBefore: {
            type: Boolean,
            default: true,
        },
        // 显示后置插槽
        showAfter: {
            type: Boolean,
            default: true,
        },
        // 是否开启缓存
        cache: {
            type: [Boolean, String],
            default: true,
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

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {

            const keys = []

            if (utils.isValidObject(slots)) {
                for (const key in slots) {
                    if (key === 'before') {
                        if (props.showBefore) {
                            keys.push(key)
                        }

                    } else if (key === 'after') {
                        if (props.showAfter) {
                            keys.push(key)
                        }

                    } else {
                        keys.push(key)
                    }
                }
            }

            return keys
        })

        /**
         * 当前样式
         */
        const currentClass = computed(function () {

            if (props.showBefore) {
                if (! props.showAfter) {
                    return 'n-splitter--hide-before'
                }

            } else if (props.showAfter) {
                if (! props.showBefore) {
                    return 'n-splitter--hide-after'
                }

            } else {
                return 'n-splitter--hide'
            }
        })

        // ==========【数据】============================================================================================

        // 获取权限注入
        const $power = inject(NPowerKey)

        // 缓存名
        let cacheName = ''

        // 初始值
        let rawValue = props.modelValue

        // 如果开启缓存
        if (props.cache) {

            // 设置缓存名
            cacheName = `splitter:value:${props.cache === true ? ($power && $power.routePath ? $power.routePath : utils.router.getRoute('path')) : props.cache}`

            // 从缓存获取初始值
            const cache = utils.storage.get(cacheName)
            if (cache) {
                rawValue = cache
            }
        }

        // 当前值
        const currentValue = ref(rawValue)

        // 创建防抖睡眠方法
        const sleep = utils.debounceSleep()

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, function (val) {
            // 如果值有变化
            if (val !== currentValue.value) {
                // 更新当前值
                currentValue.value = val
            }
        })

        /**
         * 监听值
         */
        watch(currentValue, function (val) {

            // 更新值
            emit('update:modelValue', val)

            // 如果开启缓存
            if (props.cache) {

                // 延迟执行
                sleep(500)
                    .then(function () {
                        // 设置缓存(永久缓存)
                        utils.storage.set(cacheName, val, 0)
                    })
            }
        })

        // ==========【返回】=============================================================================================

        return {
            // 插槽标识
            slotNames,
            // 当前值
            currentValue,
            // 当前样式
            currentClass,
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/sass/var.scss";

.n-splitter {

    // 分离器激活背景色
    &.q-splitter--active .q-splitter__separator ,
    .q-splitter__separator:hover {
        background-color: var(--q-primary);
    }

    // 隐藏前置插槽
    &--hide-before {
        &.q-splitter--horizontal {
            .q-splitter__before {
                height: 100% !important;
            }
        }
        &.q-splitter--vertical {
            .q-splitter__before {
                width: 100% !important;
            }
        }
        .q-splitter__after,
        .q-splitter__separator {
            display: none !important;
        }
    }

    // 隐藏后置插槽
    &--hide-after {
        &.q-splitter--horizontal {
            .q-splitter__after {
                height: 100% !important;
            }
        }
        &.q-splitter--vertical {
            .q-splitter__after {
                width: 100% !important;
            }
        }
        .q-splitter__before,
        .q-splitter__separator {
            display: none !important;
        }
    }

    // 隐藏前后置插槽
    &--hide {
        .q-splitter__before,
        .q-splitter__after,
        .q-splitter__separator {
            display: none !important;
        }
    }
}
</style>

