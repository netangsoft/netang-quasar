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
        // 值
        modelValue: {
            required: false,
        },
        // 格式化值
        format: [Function, String],
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'blur',
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
        const currentValue = ref(props.modelValue)

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, function (val) {
            currentValue.value = val
        })

        // ==========【方法】=============================================================================================

        /**
         * 失去焦点触发
         */
        function onBlur() {

            let val = currentValue.value

            if (
                props.format
                && _.isFunction(props.format)
            ) {
                val = props.format(val)
            }

            // 更新值
            emit('update:modelValue', val)

            // 失去焦点触发
            emit('blur', val)
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
