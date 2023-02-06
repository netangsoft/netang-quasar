<template>
    <q-field
        class="n-field-fieldset"
        :label="label"
        :stack-label="stackLabel"
        :outlined="outlined"
        :dense="dense"
        :readonly="readonly"
        v-bind="$attrs"
    >
        <template v-slot:control>

            <!-- 如果有默认插槽 -->
            <template v-if="$slots.default">

                <!-- 如果开启复制 -->
                <div
                    class="full-width"
                    :class="valueClass"
                    :style="valueStyle"
                    @click="onCopy"
                    v-if="! noCopy"
                >
                    <slot
                        :value="value"
                    />
                </div>

                <!-- 否则仅展示 -->
                <div
                    class="full-width"
                    :class="valueClass"
                    :style="valueStyle"
                    v-else
                >
                    <slot
                        :value="value"
                    />
                </div>
            </template>

            <!-- 否则如果开启复制 -->
            <div
                class="full-width"
                :class="valueClass"
                :style="valueStyle"
                @click="onCopy"
                v-else-if="! noCopy"
            >{{value}}</div>

            <!-- 否则仅展示 -->
            <div
                class="full-width"
                :class="valueClass"
                :style="valueStyle"
                v-else
            >{{value}}</div>

        </template>

        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]
        >
            <slot
                :name="slotName"
                :value="value"
            />
        </template>
    </q-field>
</template>

<script>
import { computed } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NFieldText',

    /**
     * 声明属性
     */
    props: {
        // 标签
        label: [Array, String, Number],
        // 值
        value: [String, Number],
        // 复制文字
        copyText: [String, Number],
        // 标签始终显示在字段上方
        stackLabel: {
            type: Boolean,
            default: true,
        },
        // 线条
        outlined: {
            type: Boolean,
            default: true,
        },
        // 紧凑模式
        dense: {
            type: Boolean,
            default: true,
        },
        // 只读模式
        readonly: {
            type: Boolean,
            default: true,
        },
        // 禁止复制
        noCopy: Boolean,
        // 值类名
        valueClass: String,
        // 值样式
        valueStyle: [String, Object, Array],
    },

    /**
     * 组合式
     */
    setup(props, { slots }) {

        // ==========【计算属性】==========================================================================================

        /**
         * 插槽标识数组
         */
        const slotNames = computed(function() {
            const lists = []

            $n_forIn(slots, function(val, key) {
                if (key !== 'default') {
                    lists.push(key)
                }
            })

            return lists
        })

        // ==========【方法】=============================================================================================

        /**
         * 复制
         */
        function onCopy() {
            const val = props.copyText || props.value
            if (val) {
                $n_copy(val, `复制【${props.label}】成功`)
            }
        }

        // ==========【返回】=============================================================================================

        return {
            // 字段组件传参
            // fieldProps,
            // 插槽标识数组
            slotNames,
            // 复制
            onCopy,
        }
    },
}
</script>
