<template>
    <q-table
        class="n-table"
        :virtual-scroll-slice-size="virtualScrollItemSize"
        v-bind="$attrs"
    >
        <!-- 插槽 -->
        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]="props"
        >
            <slot
                :name="slotName"
                v-bind="props"
            />
        </template>
    </q-table>
</template>

<script>
import { computed } from 'vue'

import $n_isValidObject from '@netang/utils/isValidObject'

export default {

    /**
     * 标识
     */
    name: 'NTable',

    /**
     * 声明属性
     */
    props: {
        // 以像素为单位的默认行大小
        virtualScrollItemSize: {
            type: [ Number, String ],
            default: 50,
        },
    },

    /**
     * 组合式
     */
    setup(props, { slots }) {

        // ==========【计算属性】==========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            return $n_isValidObject(slots) ? Object.keys(slots) : []
        })

        // ==========【返回】=============================================================================================

        return {
            // 插槽标识
            slotNames,
        }
    },
}
</script>
