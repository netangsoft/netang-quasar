<template>
    <!-- 默认插槽 -->
    <slot
        :name="currentSlot.defaultName"
        v-if="!! currentSlot.defaultName"
    />

    <!-- 拆分器 -->
    <q-splitter
        v-model="currentValue"
        v-bind="$attrs"
        v-else
    >
        <!-- 插槽 -->
        <template
            v-for="slotName in currentSlot.keys"
            v-slot:[slotName]
        >
            <slot :name="slotName" />
        </template>
    </q-splitter>
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
         * 当前插槽
         */
        const currentSlot = computed(function() {

            let keys = []
            let defaultName = ''

            if (utils.isValidObject(slots)) {

                keys = Object.keys(slots)

                const hasBefore = _.has(slots, 'before')
                const hasAfter = _.has(slots, 'after')

                if (hasBefore) {
                    if (! hasAfter) {
                        defaultName = 'before'
                    }
                } else if (hasAfter && ! hasBefore) {
                    defaultName = 'after'
                }
            }

            return {
                keys,
                defaultName,
            }
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
            // 当前插槽
            currentSlot,
            // 当前值
            currentValue,
        }
    }
}
</script>
