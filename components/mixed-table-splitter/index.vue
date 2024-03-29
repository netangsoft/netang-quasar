<template>
    <n-splitter
        class="absolute-full"
        v-model="currentValue"
        :reverse="reverse"
        :unit="unit"
        :limits="limits"
        :horizontal="horizontal"

        v-model:after="currentAfter"
        @update:after="setSelection"
        :hide-after-in-mobile="hideAfterInMobile"
        :cache="cache"
    >
        <!-- 表格 -->
        <template v-slot:before="{ after, toggleAfter }">
            <n-mixed-table
                v-bind="$attrs"
            >
                <!-- 工具栏右边插槽(手机端不显示) -->
                <template #toolbar-right v-if="isWatcher">

                    <!-- 工具栏右边插槽 -->
                    <slot name="toolbar-right" />

                    <!-- 是否显示详情 -->
                    <q-toggle
                        icon="apps"
                        :model-value="after"
                        @click="toggleAfter"
                    >
                        <q-tooltip anchor="center left" self="center right" :offset="[10, 0]">{{tooltip}}</q-tooltip>
                    </q-toggle>

                </template>

                <!-- 插槽 -->
                <template
                    v-for="slotName in slotNames"
                    v-slot:[slotName]="props"
                >
                    <!-- 有传参的插槽 -->
                    <slot
                        :name="slotName"
                        v-bind="props"
                        v-if="props"
                    />

                    <!-- 无传参的插槽 -->
                    <slot
                        :name="slotName"
                        v-else
                    />
                </template>

            </n-mixed-table>
        </template>

        <!-- 渲染详情页面(手机端不显示) -->
        <template v-slot:after>

            <slot
                name="after"
                :selected="currentSelectedItem"
            >
                <!-- 渲染 -->
                <n-render
                    :name="renderName"
                    :path="renderPath"
                    :component="renderComponent"
                    :query="currentQuery"
                    :props="renderProps"
                    v-if="currentQuery"
                />

                <!-- 空状态 -->
                <n-empty
                    :description="renderDescription"
                    fit
                    v-else
                />

            </slot>

        </template>

    </n-splitter>
</template>

<script>
import { nextTick, ref, watch, computed, inject } from 'vue'
import { useQuasar } from 'quasar'

import $n_isFunction from 'lodash/isFunction'

import $n_isValidObject from '@netang/utils/isValidObject'

import NSplitter from '../splitter'
import NTable from '../table'
import NRender from '../render'
import NEmpty from '../empty'

import { NTableKey } from '../../utils/symbols'

export default {

    /**
     * 关闭组件 attribute 透传行为
     */
    inheritAttrs: false,

    /**
     * 标识
     */
    name: 'NMixedTableSplitter',

    /**
     * 组件
     */
    components: {
        NSplitter,
        NTable,
        NRender,
        NEmpty,
    },

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            type: Number,
            default: 50,
        },
        // 反转插槽
        reverse: Boolean,
        // 模型的 CSS 单位
        unit: String,
        // 两个值的数组，表示两个面板的最小和最大分割大小
        limits: Array,
        // 是否水平拆分
        horizontal: Boolean,

        // 显示后置插槽 v-model:after
        // 注意: 如果非双向绑定, 如 :after 并不会影响内部值变化, 仅做初始值使用
        after: {
            type: Boolean,
            default: true,
        },
        // 手机模式隐藏后插槽
        hideAfterInMobile: {
            type: Boolean,
            default: true,
        },
        // 是否开启缓存
        cache: {
            type: [ Boolean, String ],
            default: true,
        },

        // 工具提示
        tooltip: {
            type: String,
            default: '是否显示详情',
        },
        // 渲染组件标识
        renderName: String,
        // 渲染组件路径
        renderPath: String,
        // 渲染组件的组件
        renderComponent: Object,
        // 格式化已选表格的数据并返回渲染组件参数
        renderQuery: Function,
        // 渲染组件的传参
        renderProps: Object,
        // 渲染空状态描述
        renderDescription: {
            type: String,
            default: '没有找到任何数据',
        },
        // 不需要加载渲染页面标识参数
        // 额外加载参数 { n_render_page: 1 }
        noRendPageName: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'update:after',
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
            return $n_isValidObject(slots) ? Object.keys(slots).filter(e => e !== 'toolbar-right') : []
        })

        /**
         * 是否监听
         */
        const isWatcher = computed(function () {
            return ! props.hideAfterInMobile || ! $q.platform.is.mobile
        })

        /**
         * 当前传参
         */
        const currentQuery = computed(function() {

            // 如果有已选数据
            if (
                currentSelectedItem.value
                && $n_isFunction(props.renderQuery)
            ) {
                const resQuery = props.renderQuery(currentSelectedItem.value)
                if ($n_isValidObject(resQuery)) {

                    // 如果需要加载渲染页面标识参数
                    if (! props.noRendPageName) {
                        // 格式化已选数据, 并返回参数
                        return Object.assign({}, resQuery, {
                            // 是否为渲染页面
                            n_render_page: 1,
                        })
                    }

                    return resQuery
                }
            }

            return null
        })

        // ==========【数据】=============================================================================================

        // quasar 对象
        const $q = useQuasar()

        // 获取表格注入
        const $table = inject(NTableKey)

        // 原始表格选择状态
        const rawTableSelection = $table.tableSelection.value

        // 当前已选单条数据
        const currentSelectedItem = ref(null)

        // 当前值
        const currentValue = ref(props.modelValue)

        // 当前显示前置插槽
        const currentAfter = ref(props.after)

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(() => props.modelValue, function (val) {
            currentValue.value = val
        })

        /**
         * 监听声明显示前置插槽
         */
        watch(() => props.after, function (val) {
            currentAfter.value = val
        })

        /**
         * 监听当前值
         */
        watch(currentValue, function (val) {
            emit('update:modelValue', val)
        })

        /**
         * 监听当前显示前置插槽
         */
        watch(currentAfter, function (val) {
            emit('update:after', val)
        })

        /**
         * 监听表格已选数据(非手机端有效)
         */
        watch($table.tableSelected,  async function (selected) {

            // 先清空当前已选单条数据
            currentSelectedItem.value = null

            // 如果不监听
            if (! isWatcher.value) {

                // 则无需任何操作
                return
            }

            // 下次 DOM 更新
            await nextTick()

            // 如果有已选单条数据
            if (selected.length === 1) {

                // 设置当前已选数据
                currentSelectedItem.value = selected[0]
            }

        }, {
            // 深度监听
            deep: true,
        })

        // ==========【方法】============================================================================================

        /**
         * 设置表格选择类型
         */
        function setSelection(showAfter) {

            // 如果不监听
            if (! isWatcher.value) {

                // 则无需任何操作
                return
            }

            const selection = showAfter ? 'single' : rawTableSelection
            if ($table.tableSelection.value !== selection) {
                $table.tableSelection.value = selection

                // 如果显示后置插槽
                if (showAfter && $table.tableSelected.value.length > 1) {

                    // 如果有多条已选数据, 则只取第一条数据
                    $table.tableSelected.value = [ $table.tableSelected.value[$table.tableSelected.value.length - 1] ]
                }
            }
        }

        // ==========【返回】=========================================================================================

        return {
            // 插槽标识
            slotNames,
            // 是否监听
            isWatcher,
            // 当前传参
            currentQuery,

            // 当前值
            currentValue,
            // 当前显示前置插槽
            currentAfter,

            // 设置表格选择类型
            setSelection,

            // 表格已选数据
            tableSelected: $table.tableSelected,
            // 当前已选数据的第一条数据
            currentSelectedItem,
        }
    }
}
</script>
