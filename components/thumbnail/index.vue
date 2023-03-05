<template>
    <g-img
        :spinner-size="size / 2"
        :width="size"
        :height="size"
        v-bind="$attrs"
    >
        <!-- 插槽 -->
        <template
            v-for="slotName in slotNames"
            v-slot:[slotName]
        >
            <slot
                :name="slotName"
            />
        </template>
    </g-img>
</template>

<script>
import { computed } from 'vue'

import $n_isValidObject from '@netang/utils/isValidObject'

import GImg from '../img'

export default {

    /**
     * 标识
     */
    name: 'NThumbnail',

    /**
     * 组件
     */
    components: {
        GImg,
    },

    /**
     * 声明属性
     */
    props: {
        // 图片尺寸
        size: {
            type: Number,
            default: 40,
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

        return {
            // 插槽标识
            slotNames,
        }
    }
}
</script>
