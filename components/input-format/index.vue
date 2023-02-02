<template>
    <q-input
        v-model="currentValue"
        @blur="onBlur"
        v-bind="$attrs"
    >
        <!-- 插槽 -->
        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]
        >
            <slot :name="slotName" />
        </template>
    </q-input>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NInputFormat',

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            required: true,
        },
        // 值是否为数组
        valueArray: Boolean,
        // 修改前值
        formatBefore: [ Function, Object, Boolean ],
        // 修改后值
        formatAfter: [ Function, Object, Boolean ],
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
            return utils.isValidObject(slots) ? Object.keys(slots) : []
        })

        // ==========【数据】============================================================================================

        // 当前值
        const currentValue = ref(formatModelValue(props.modelValue))

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(() => props.modelValue, function (val) {

            // 格式化声明值
            currentValue.value = formatModelValue(val)

        }, {
            // 深度监听
            deep: true,
        })

        // ==========【方法】=============================================================================================

        /**
         * 触发更新值
         */
        function emitModelValue(val) {
            // 触发更新值
            emit('update:modelValue', val)
        }

        /**
         * 格式化声明值
         */
        function formatModelValue(val) {

            if (props.formatBefore) {

                // 如果是方法
                if (_.isFunction(props.formatBefore)) {
                    return props.formatBefore(val)
                }

                // 如果是参数
                if (props.formatBefore === true || utils.isValidObject(props.formatBefore)) {

                    // 如果值是数组
                    if (Array.isArray(val)) {

                        // 格式化数组值
                        return formatArrayValue(val, props.formatBefore === true ? {} : props.formatBefore)
                    }

                    // 如果是有效值
                    if (utils.isValidValue(val)) {

                        // 格式化字符串值
                        return formatStringValue(val, props.formatBefore === true ? {} : props.formatBefore, false)
                    }

                    return ''
                }
            }

            return Array.isArray(val) ? val.join(',') : val
        }

        /**
         * 格式化数组值
         */
        function formatArrayValue(val, params) {

            // 如果数组有值
            if (val.length) {

                const o = Object.assign({
                    // 是否去重
                    unique: true,
                    // 分隔符
                    separator: ',',
                    // 是否给每个值去除首位空格
                    trim: true,
                    // 验证每个值是否为有效字符串/数字
                    isValidValue: true,
                }, params)

                // 是否给每个值去除首位空格
                if (o.trim) {
                    val = val.map(e => utils.trimString(e))
                }

                // 是否验证每个值是否为有效字符串/数字
                if (o.isValidValue) {
                    val = val.filter(val => utils.isValidValue(val))
                }

                // 去重
                if (o.unique) {
                    val = _.uniq(val)
                }

                // 合并为字符串
                return val.join(o.separator)
            }

            return ''
        }

        /**
         * 格式化字符串值
         */
        function formatStringValue(val, params, valueArray) {

            const o = Object.assign({
                // 替换内容
                replace: /\n|\，|\s+/g,
                // 是否去重
                unique: true,
                // 分隔符
                separator: ',',
                // 验证每个值是否为有效字符串/数字
                isValidValue: true,
            }, params)

            // 去除首位空格
            val = utils.trimString(val)

            // 如果有分割符
            if (utils.isValidValue(o.separator, true)) {

                o.separator = String(o.separator)

                // 是否替换
                if (o.replace) {
                    val = val.replace(o.replace, o.separator)
                }

                // 分隔成数组
                val = utils.split(val, o.separator)

                // 去重
                if (o.unique) {
                    val = _.uniq(val)
                }

                // 如果验证每个值是否为有效字符串/数字
                if (o.isValidValue) {
                    val = val.filter(val => utils.isValidValue(val))
                }

                // 如果值不是数组
                if (! valueArray) {
                    val = val.join(o.separator)
                }

                return val
            }

            return valueArray ? [ val ] : ''
        }

        /**
         * 失去焦点触发
         */
        function onBlur() {

            const val = currentValue.value

            // 如果修改值
            if (props.formatAfter) {

                // 如果是方法
                if (_.isFunction(props.formatAfter)) {

                    // 触发更新值
                    emitModelValue(props.formatAfter(val))
                    return
                }

                // 如果是参数
                if (props.formatAfter === true || utils.isValidObject(props.formatAfter)) {

                    // 触发更新值
                    emitModelValue(formatStringValue(val, props.formatAfter === true ? {} : props.formatAfter, props.valueArray))
                    return
                }
            }

            // 触发更新值
            emitModelValue(props.valueArray ? utils.split(val, ',') : val)
        }

        // ==========【返回】=============================================================================================

        return {
            // 插槽标识
            slotNames,
            // 当前值
            currentValue,

            // 失去焦点触发
            onBlur,
        }
    }
}
</script>
