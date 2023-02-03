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
                :multiple="$n.indexOf([dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN], modelValue[0].compare) > -1"
                v-else
            />
        </div>

        <!-- 比较2(类型为 > / >=) -->
        <div
            class="n-field-group row"
            v-if="data.compareOptions2.length && $n.indexOf([dicts.SEARCH_TYPE__GT, dicts.SEARCH_TYPE__GTE], modelValue[0].compare) > -1"
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
        watch(()=>props.modelValue[0].compare, function(val) {
            // 如果类型不为 in / not in, 为单选
            if ($n.indexOf([dicts.SEARCH_COMPARE_TYPE__IN, dicts.SEARCH_COMPARE_TYPE__NOT_IN], val) === -1) {
                const arr = $n.split(props.modelValue[0].value, ',')
                if (arr.length !== 1) {
                    // 克隆值
                    const _modelValue = $n.cloneDeep(props.modelValue)

                    // 更新值
                    _modelValue[0].value = arr.length > 1 ? arr[0] : ''
                    emit('update:modelValue', _modelValue)
                }
            }
        })
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
