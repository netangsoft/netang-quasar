<template>
    <n-splitter
        class="absolute-full"
        @update:after="setSelection"
        :hide-after-in-mobile="hideAfterInMobile"
        v-bind="$attrs"
    >
        <!-- 表格 -->
        <template v-slot:before="{ after, toggleAfter }">
            <n-table
                v-bind="tableProps"
            >
                <!-- 工具栏右边插槽(手机端不显示) -->
                <template #toolbar-right v-if="isWatcher">

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

            </n-table>
        </template>

        <!-- 渲染详情页面(手机端不显示) -->
        <template v-slot:after>

            <!-- 渲染 -->
            <n-render
                :path="renderPath"
                :query="currentQuery"
                v-if="currentQuery"
            />

            <!-- 空状态 -->
            <n-empty
                :description="description"
                v-else
            />

        </template>

    </n-splitter>
</template>

<script>
import { nextTick, ref, watch, computed, inject } from 'vue'
import { useQuasar } from 'quasar'

import { NTableKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NSplitterTable',

    /**
     * 声明属性
     */
    props: {
        // 表格声明参数
        tableProps: Object,
        // 手机模式隐藏后插槽
        hideAfterInMobile: {
            type: Boolean,
            default: true,
        },
        // 空状态描述
        description: {
            type: String,
            default: '没有找到任何数据',
        },
        // 渲染组件路径
        renderPath: {
            type: String,
            required: true,
        },
        // 格式化已选表格的数据并返回渲染组件参数
        format: Function,
        // 工具提示
        tooltip: {
            type: String,
            default: '是否显示详情',
        },
    },

    /**
     * 组合式
     */
    setup(props, { slots }) {

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            return utils.isValidObject(slots) ? Object.keys(slots) : []
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
                && _.isFunction(props.format)
            ) {
                const res = props.format(currentSelectedItem.value)
                if (utils.isValidObject(res)) {

                    // 格式化已选数据, 并返回参数
                    return Object.assign({
                        // 是否为渲染页面
                        n_render_page: 1,
                    }, res)
                }
            }

            return null
        })

        // ==========【数据】=============================================================================================

        // quasar 对象
        const $q = useQuasar()

        // 获取表格注入
        const $table = inject(NTableKey)

        // 当前已选单条数据
        const currentSelectedItem = ref(null)

        // ==========【监听数据】=========================================================================================

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

            const selection = showAfter ? 'single' : 'multiple'
            if ($table.tableSelection.value !== selection) {
                $table.tableSelection.value = selection

                // 如果显示后置插槽
                if (showAfter && $table.tableSelected.value.length > 1) {

                    // 如果有多条已选数据, 则只取第一条数据
                    $table.tableSelected.value = [ $table.tableSelected.value[0] ]
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

            // 设置表格选择类型
            setSelection,
        }
    }
}
</script>
