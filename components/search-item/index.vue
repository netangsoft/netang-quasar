<template>
    <div class="n-search__item n-field-group">

        <!-- 比较1 -->
        <div class="n-field-group row no-wrap">

            <!-- 比较类型1 -->
            <q-select
                class="n-field-group__select"
                v-model="modelValue[0].type"
                :options="compareOptions1"
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
                v-if="data.type === 'date' && modelValue[0].type >= 20"
            />

            <!-- 多选(类型为 in / not in)-->
            <slot
                :label="data.label"
                :index="0"
                :multiple="utils.indexOf([dicts.SEARCH_TYPE__IN, dicts.SEARCH_TYPE__NOT_IN], modelValue[0].type) > -1"
                v-else
            />
        </div>

        <!-- 比较2(类型为 > / >=) -->
        <div
            class="n-field-group row"
            v-if="utils.indexOf([dicts.SEARCH_TYPE__GT, dicts.SEARCH_TYPE__GTE], modelValue[0].type) > -1"
        >
            <!-- 比较类型2 -->
            <q-select
                class="n-field-group__select"
                v-model="modelValue[1].type"
                :options="[
                    { label: '<', value: dicts.SEARCH_TYPE__LT },
                    { label: '≤', value: dicts.SEARCH_TYPE__LTE },
                ]"
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
import { computed, watch } from 'vue'
import { quickRange } from '../field-date/methods'

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

        // ==========【计算属性】=========================================================================================

        /**
         * 比较下拉列表1
         * 1:  =
         * 2:  !=
         * 3:  >
         * 4:  >=
         * 5:  <
         * 6:  <=
         * 7:  LIKE
         * 8:  NOT LIKE
         * 9:  IN
         * 10: NOT IN
         */
        const compareOptions1 = computed(function () {

            // 如果类型为 文字
            // --------------------------------------------------
            if (props.data.type === 'text') {

                // 相同 不同 包含 不含
                return [
                    { label: '相同', value: dicts.SEARCH_TYPE__EQUAL },
                    { label: '不同', value: dicts.SEARCH_TYPE__NOT_EQUAL },
                    { label: '包含', value: dicts.SEARCH_TYPE__LIKE },
                    { label: '不含', value: dicts.SEARCH_TYPE__NOT_LIKE },
                    { label: 'IN', value: dicts.SEARCH_TYPE__IN },
                    { label: 'NOT IN', value: dicts.SEARCH_TYPE__NOT_IN },
                ]
            }

            // 否则为数字
            // --------------------------------------------------
            const opts = [
                { label: '=', value: dicts.SEARCH_TYPE__EQUAL },
                { label: '!=', value: dicts.SEARCH_TYPE__NOT_EQUAL },
                { label: '>', value: dicts.SEARCH_TYPE__GT },
                { label: '≥', value: dicts.SEARCH_TYPE__GTE },
            ]

            // 如果类型为日期
            if (props.data.type === 'date') {
                // 添加日期快捷选项
                utils.forEach(quickRange, function(label, key) {
                    opts.push({ label, value: key + 20 })
                })

            // 否则类型为 数字
            } else {
                opts.push(
                    { label: 'IN', value: dicts.SEARCH_TYPE__IN },
                    { label: 'NOT IN', value: dicts.SEARCH_TYPE__NOT_IN },
                )
            }

            return opts
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue[0].type, function(val) {
            // 如果类型不为 in / not in, 为单选
            if (utils.indexOf([dicts.SEARCH_TYPE__IN, dicts.SEARCH_TYPE__NOT_IN], val) === -1) {
                const arr = utils.split(props.modelValue[0].value, ',')
                if (arr.length !== 1) {
                    // 克隆值
                    const _modelValue = _.cloneDeep(props.modelValue)

                    // 更新值
                    _modelValue[0].value = arr.length > 1 ? arr[0] : ''
                    emit('update:modelValue', _modelValue)
                }
            }
        })

        // ==========【返回】=============================================================================================

        return {
            // 比较下拉列表1
            compareOptions1,
        }
    },
}
</script>


<style lang="scss">
@import "@/assets/sass/var.scss";

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
