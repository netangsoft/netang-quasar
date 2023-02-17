<template>
    <div class="n-search__item n-field-group">

        <!-- 比较1 -->
        <div class="n-field-group row no-wrap">

            <!-- 比较类型1 -->
            <q-select
                class="n-field-group__select"
                v-model="modelValue[0].compare"
                :options="data.compareOptions1"
                :disable="data.compareOptions1.length === 1"
                map-options
                emit-value
                outlined
                stack-label
                dense
                options-dense
            />

            <q-input
                class="n-field-fieldset"
                :label="data.label"
                dense
                outlined
                disable
                v-if="data.type === 'date' && modelValue[0].compare >= 20"
            />

            <!-- 多选(类型为 in / not in)-->
            <slot
                :label="data.label"
                :index="0"
                :multiple="indexOf([dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN], modelValue[0].compare) > -1"
                v-else
            />
        </div>

        <!-- 比较2(类型为 > / >=) -->
        <div
            class="n-field-group row"
            v-if="data.compareOptions2.length && indexOf([dicts.SEARCH_TYPE__GT, dicts.SEARCH_TYPE__GTE], modelValue[0].compare) > -1"
        >
            <!-- 比较类型2 -->
            <q-select
                class="n-field-group__select"
                v-model="modelValue[1].compare"
                :options="data.compareOptions2"
                :disable="data.compareOptions2.length === 1"
                map-options
                emit-value
                outlined
                dense
                options-dense
            />

            <slot
                :label="undefined"
                :multiple="false"
                :index="1"
            />
        </div>
    </div>
</template>

<script>
import { watch } from 'vue'

import $n_isArray from 'lodash/isArray'
import $n_cloneDeep from 'lodash/cloneDeep'

import $n_split from '@netang/utils/split'
import $n_indexOf from '@netang/utils/indexOf'
import $n_numberDeep from '@netang/utils/numberDeep'

import { configs } from '../../utils/config'

const {
    // 字典常量
    dicts,
} = configs

export default {

    /**
     * 标识
     */
    name: 'NSearchItem',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: Array,
        // 数据
        data: Object,
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

        // ==========【监听数据】=========================================================================================

        /**
         * 监听值的比较类型
         */
        watch(()=>props.modelValue[0].compare, function(compare) {

            // 获取当前值
            const value = props.modelValue[0].value

            // 如果类型为 in / not in, 则为多选
            // --------------------------------------------------
            if ($n_indexOf([dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN], compare) > -1) {

                // 如果当前值不为数组
                if (! $n_isArray(value)) {

                    // 则将值转为数组
                    // 触发更新值
                    emitModelValue($n_split(value, ','))
                }

            // 否则为单选 && 如果值为: 数组
            // --------------------------------------------------
            } else if ($n_isArray(value)) {

                // 触发更新值
                emitModelValue(value.length ? $n_numberDeep(value[0]) : '')

            // 否则为单选 && 值为: 字符串 / 数字
            // --------------------------------------------------
            } else {

                // 将值转为数组
                const arr = $n_split(value, ',')

                // 如果数组长度不为 1, 则说明有多个值 || 无值
                if (arr.length !== 1) {

                    // 触发更新值
                    emitModelValue(arr.length > 1 ? arr[0] : '')
                }
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 触发更新值
         */
        function emitModelValue(value) {

            // 克隆值
            const _modelValue = $n_cloneDeep(props.modelValue)

            // 更新值
            _modelValue[0].value = value

            // 更新值
            emit('update:modelValue', _modelValue)
        }

        // ==========【返回】=============================================================================================

        return {
            dicts,
            indexOf: $n_indexOf,
        }
    },
}
</script>

<style lang="scss">
.n-search__item {
    .n-field-group {
        > .q-field--outlined {

            // 第一个子节点
            &:first-child,
            // 第三个子节点
            &:nth-child(3) {
                .q-field__control {
                    height: 100% !important;
                    background-color: rgba(var(--n-reverse-color-rgb), 0.04);

                    .q-field__marginal {
                        height: 100% !important;
                    }
                }
            }

            // 第二个子节点
            &:nth-child(2) {
                flex: 1;
            }
        }
    }
}
</style>
