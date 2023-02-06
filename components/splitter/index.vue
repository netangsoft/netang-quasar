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
            <slot
                :name="slotName"
                :before="currentBefore"
                :after="currentAfter"
                :toggleBefore="toggleBefore"
                :toggleAfter="toggleAfter"
            />
        </template>
    </q-splitter>
</template>

<script>
import { computed, ref, watch, inject } from 'vue'
import { useQuasar } from 'quasar'

import $n_router from '@netang/vue-utils/router'

import $n_storage from '@netang/utils/storage'
import $n_sleep from '@netang/utils/sleep'
import $n_isValidObject from '@netang/utils/isValidObject'

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
        // 值 v-model
        modelValue: {
            type: Number,
            required: true,
        },
        // 显示前置插槽 v-model:before
        // 注意: 如果非双向绑定, 如 :before 并不会影响内部值变化, 仅做初始值使用
        before: {
            type: Boolean,
            default: true,
        },
        // 显示后置插槽 v-model:after
        // 注意: 如果非双向绑定, 如 :after 并不会影响内部值变化, 仅做初始值使用
        after: {
            type: Boolean,
            default: true,
        },
        // 手机模式隐藏前置插槽
        hideBeforeInMobile: Boolean,
        // 手机模式隐藏后插槽
        hideAfterInMobile: Boolean,
        // 是否开启缓存
        cache: [ Boolean, String ],
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'update:before',
        'update:after',
    ],

    /**
     * 组合式
     */
    setup(props, { emit, slots }) {

        // ==========【数据】============================================================================================

        // quasar 对象
        const $q = useQuasar()

        // 获取权限注入
        const $power = inject(NPowerKey)

        // 缓存名
        let cacheName = ''

        // 初始值
        let rawValue = props.modelValue

        // 初始显示前置插槽
        let rawBefore = props.before
        let initEmitBefore = true

        // 初始显示后置插槽
        let rawAfter = props.after
        let initEmitAfter = true

        // 如果开启缓存
        if (props.cache) {

            // 设置缓存名
            cacheName = `splitter:${props.cache === true ? ($power && $power.routePath ? $power.routePath : $n_router.getRoute('path')) : props.cache}:`

            // 从缓存获取初始值
            let cache = $n_storage.get(cacheName + 'modelValue')
            if (cache !== null) {
                rawValue = cache
            }

            // 如果手机模式隐藏前置插槽
            if (props.hideBeforeInMobile && $q.platform.is.mobile) {
                rawBefore = false
                initEmitBefore = false

            } else {
                // 从缓存获取初始值
                cache = $n_storage.get(cacheName + 'before')
                if (cache !== null) {
                    rawBefore = cache
                }
            }

            // 如果手机模式隐藏后置插槽
            if (props.hideAfterInMobile && $q.platform.is.mobile) {
                rawAfter = false
                initEmitAfter = false

            } else {
                // 从缓存获取初始值
                cache = $n_storage.get(cacheName + 'after')
                if (cache !== null) {
                    rawAfter = cache
                }
            }

        // 如果在手机模式
        } else if ($q.platform.is.mobile) {

            // 手机模式隐藏前置插槽
            if (props.hideBeforeInMobile) {
                rawBefore = false
                initEmitBefore = false
            }

            // 手机模式隐藏后置插槽
            if (props.hideAfterInMobile) {
                rawAfter = false
                initEmitAfter = false
            }
        }

        // 创建睡眠实例
        const sleep = $n_sleep()

        // 当前值
        const currentValue = ref(rawValue)
        if (rawValue !== props.modelValue) {
            emit('update:modelValue', rawValue)
        }

        // 当前是否显示前置插槽
        const currentBefore = ref(rawBefore)
        if (initEmitBefore) {
            emit('update:before', rawBefore)
        }

        // 当前是否显示后置插槽
        const currentAfter = ref(rawAfter)
        if (initEmitAfter) {
            emit('update:after', rawAfter)
        }

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {

            const keys = []

            if ($n_isValidObject(slots)) {

                for (const key in slots) {
                    if (key === 'before') {
                        if (currentBefore.value) {
                            keys.push(key)
                        }

                    } else if (key === 'after') {
                        if (currentAfter.value) {
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

            if (currentBefore.value) {
                if (! currentAfter.value) {
                    return 'n-splitter--hide-before'
                }

            } else if (currentAfter.value) {
                if (! currentBefore.value) {
                    return 'n-splitter--hide-after'
                }

            } else {
                return 'n-splitter--hide'
            }
        })

        // ==========【方法】============================================================================================

        /**
         * 触发更新值
         */
        async function emitValue(key, val) {

            // 更新值
            emit(`update:${key}`, val)

            // 如果开启缓存
            if (props.cache) {

                // 延迟执行
                await sleep(500, key)

                // 设置缓存(永久缓存)
                $n_storage.set(cacheName + key, val, 0)
            }
        }

        /**
         * 切换显示前置插槽
         */
        function toggleBefore() {
            currentBefore.value = ! currentBefore.value
        }

        /**
         * 切换显示后置插槽
         */
        function toggleAfter() {
            currentAfter.value = ! currentAfter.value
        }

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(() => props.modelValue, function (val) {

            // 如果值有变化
            if (val !== currentValue.value) {

                // 更新当前值
                currentValue.value = val
            }
        })

        /**
         * 监听声明是否显示前置插槽
         */
        watch(() => props.before, function (val) {

            // 如果值有变化
            if (val !== currentBefore.value) {

                // 设置是否显示前置插槽
                currentBefore.value = val
            }
        })

        /**
         * 监听声明是否显示后置插槽
         */
        watch(() => props.after, function (val) {

            // 如果值有变化
            if (val !== currentAfter.value) {

                // 设置是否显示后置插槽
                currentAfter.value = val
            }
        })

        /**
         * 监听值
         */
        watch(currentValue, async function (val) {
            // 触发更新值
            await emitValue('modelValue', val)
        })

        /**
         * 监听是否显示前置插槽
         */
        watch(currentBefore, async function (val) {

            // 触发更新值
            await emitValue('before', val)
        })

        /**
         * 监听是否显示后置插槽
         */
        watch(currentAfter, async function (val) {

            // 触发更新值
            await emitValue('after', val)
        })

        // ==========【返回】=============================================================================================

        return {
            // 插槽标识
            slotNames,
            // 当前值
            currentValue,
            // 当前是否显示前置插槽
            currentBefore,
            // 当前是否显示后置插槽
            currentAfter,
            // 当前样式
            currentClass,

            // 切换显示前置插槽
            toggleBefore,
            // 切换显示后置插槽
            toggleAfter,
        }
    }
}
</script>

<style lang="scss">
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

