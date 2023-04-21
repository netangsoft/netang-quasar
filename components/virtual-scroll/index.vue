<template>
    <div class="n-virtual-scroll">

    </div>
</template>

<script>
import { ref, computed, watch, nextTick, getCurrentInstance, onBeforeUpdate, onMounted, onUnmounted } from 'vue'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_isFunction from 'lodash/isFunction'
import $n_findIndex from 'lodash/findIndex'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_indexOf from '@netang/utils/indexOf'
import $n_on from '@netang/utils/on'
import $n_off from '@netang/utils/off'

export default {

    /**
     * 标识
     */
    name: 'NVirtualScroll',

    /**
     * 声明属性
     */
    props: {
        virtualScrollSliceSize: {
            type: [ Number, String ],
            default: null
        },

        virtualScrollSliceRatioBefore: {
            type: [ Number, String ],
            default: 1
        },

        virtualScrollSliceRatioAfter: {
            type: [ Number, String ],
            default: 1
        },

        virtualScrollItemSize: {
            type: [ Number, String ],
            default: 24
        },

        virtualScrollStickySizeStart: {
            type: [ Number, String ],
            default: 0
        },

        virtualScrollStickySizeEnd: {
            type: [ Number, String ],
            default: 0
        },

        tableColspan: [ Number, String ],
        virtualScrollHorizontal: Boolean,
        onVirtualScroll: Function,
        type: {
            type: String,
            default: 'list',
            validator: v => typeOptions.includes(v)
        },

        items: {
            type: Array,
            default: () => []
        },

        itemsFn: Function,
        itemsSize: Number,

        scrollTarget: {
            default: void 0
        }
    },

    /**
     * 组合式
     */
    setup (props, { slots, emit }) {

        const { proxy } = getCurrentInstance()
        const { $q } = proxy

        // ==========【数据】============================================================================================


        // ==========【方法】============================================================================================

        /**
         * 是否有默认插槽
         */
        const hasSlots = computed(function () {

        })

        // ==========【生命周期】=========================================================================================

        /**
         * 更新 DOM 之前调用
         */
        onBeforeUpdate(function () {

        })

        /**
         * 实例被挂载后调用
         */
        onMounted(function() {

        })

        /**
         * 实例被卸载后调用
         */
        onUnmounted(function () {

        })

        return {

        }
    }
}
</script>

<style lang="scss">
@import "@/assets/sass/variables.scss";

</style>
