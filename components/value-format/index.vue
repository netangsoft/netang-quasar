<template>
    <slot
        :scope="current"
        :emit="emitValue"
    />
</template>

<script>
import { ref, watch } from 'vue'
import $n_isFunction from 'lodash/isFunction'
import $n_uniq from 'lodash/uniq'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_split from '@netang/utils/split'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_trimString from '@netang/utils/trimString'

export default {

    /**
     * 关闭组件 attribute 透传行为
     */
    inheritAttrs: false,

    /**
     * 标识
     */
    name: 'NValueFormat',

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            required: true,
        },
        // 修改前值
        before: Function,
        // 修改后值
        after: Function,
        // 不自动触发更新
        noEmit: Boolean,
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

        // 当前值
        const current = ref({
            value: formatModelValue(props.modelValue),
        })

        // 如果是自动触发更新
        if (! props.noEmit) {
            // 触发更新值
            // 此处用于判断声明值是否有改变
            emitValue()
        }

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(() => props.modelValue, function (val) {

            // 格式化声明值
            current.value.value = formatModelValue(val)

        }, {
            // 深度监听
            deep: true,
        })

        /**
         * 监听当前值
         */
        watch(current, function (value) {

            // 如果是自动触发更新
            if (! props.noEmit) {

                // 立即执行触发更新值
                emitValue(value.value)
            }

        }, {
            // 深度监听
            deep: true,
        })

        // ==========【方法】=============================================================================================

        /**
         * 格式化声明值
         */
        function formatModelValue(value) {
            return $n_isFunction(props.before)
                // 如果有修改前值方法
                ? props.before({ value, formatArray, formatString })
                // 返回值
                : value
        }

        /**
         * 触发更新值
         */
        function emitValue() {

            // if (
            //     value !== void 0
            //     && typeof value === 'object'
            //     && value instanceof Event
            // ) {
            //     // 停止冒泡
            //     value.stopPropagation()
            //
            //     // 获取当前值
            //     value = current.value.value
            // }

            // 获取当前值
            const value = current.value.value

            // 获取新值
            const newValue = $n_isFunction(props.after) ?
                // 如果有修改提交值方法
                props.after({ value, formatArray, formatString })
                // 否则返回当前值
                : value

            // 如果值有改变
            if (newValue !== props.modelValue) {

                // 触发更新值
                emit('update:modelValue', newValue)
            }
        }

        /**
         * 格式化数组
         */
        function formatArray(val, params) {

            const o = Object.assign({
                // 是否去重
                unique: true,
                // 分隔符
                separator: ',',
                // 是否给每个值去除首位空格
                trim: true,
                // 验证每个值是否为有效字符串/数字
                isValidValue: true,
                // 是否转字符串
                toString: false,
            }, params)

            val = $n_isValidArray(val) ? val : []

            // 如果数组有值
            if (val.length) {

                // 是否给每个值去除首位空格
                if (o.trim) {
                    val = val.map(e => $n_trimString(e))
                }

                // 是否验证每个值是否为有效字符串/数字
                if (o.isValidValue) {
                    val = val.filter(val => $n_isValidValue(val))
                }

                // 去重
                if (o.unique) {
                    val = $n_uniq(val)
                }
            }

            // 如果转字符串
            if (o.toString) {
                // 合并为字符串
                return val.join(o.separator)
            }

            return []
        }

        /**
         * 格式化字符串
         */
        function formatString(val, params) {

            const o = Object.assign({
                // 是否给每个值去除首位空格
                trim: true,
                // 替换内容
                replace: /\n|,|，|\s+/g,
                // 是否去重
                unique: true,
                // 分隔符
                separator: ',',
                // 验证每个值是否为有效字符串/数字
                isValidValue: true,
                // 是否转数组
                toArray: false,
            }, params)

            // 是否去除首尾空格
            if (o.trim) {
                // 去除首尾空格
                val = $n_trimString(val)

            // 否则转字符串
            } else {
                val = $n_isValidValue(val) ? String(val) : ''
            }

            // 如果有分割符
            if ($n_isValidValue(o.separator, true)) {

                // 是否替换
                if (o.replace) {
                    val = val.replace(o.replace, o.separator)
                }

                // 分隔成数组
                val = $n_split(val, o.separator)

                // 如果去重
                if (o.unique) {
                    val = $n_uniq(val)
                }

                // 如果验证每个值是否为有效字符串/数字
                if (o.isValidValue) {
                    val = val.filter(val => $n_isValidValue(val))
                }

                // 如果转数组
                if (o.toArray) {
                    // 则直接返回
                    return val
                }

                // 返回分隔符隔开的字符串
                return val.join(o.separator)
            }

            return o.toArray ? [ val ] : ''
        }

        // ==========【返回】=============================================================================================

        return {
            // 当前值
            current,
            // 触发更新值
            emitValue,
        }
    }
}
</script>
