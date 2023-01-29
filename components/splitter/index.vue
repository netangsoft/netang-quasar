<template>
    <!-- 拆分器 -->
    <q-splitter
        v-model="currentValue"
        v-bind="$attrs"
        v-if="$slots.before && $slots.after"
    >
        <!-- 插槽 -->
        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]
        >
            <slot :name="slotName" />
        </template>
    </q-splitter>

    <!-- before 插槽 -->
    <slot
        name="before"
        v-else-if="$slots.before"
    />

    <!-- after 插槽 -->
    <slot
        name="after"
        v-else-if="$slots.after"
    />

</template>

<script>
import { computed, ref, watch } from 'vue'

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
        const currentValue = ref(props.modelValue)

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
        })

        // ==========【返回】=============================================================================================

        return {
            // 插槽标识
            slotNames,
            // 当前值
            currentValue,
        }
    }
}
</script>
