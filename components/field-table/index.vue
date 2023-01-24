<template>
    <q-field
        :class="fieldFocused ? 'q-field--float q-field--focused q-field--highlighted' : ''"
        :model-value="modelValue"
        :readonly="readonly"
        @clear="onClear"
        v-bind="$attrs"
    >
        <template v-slot:control>

            <!--&lt;!&ndash; 显示值 &ndash;&gt;-->
            <!--<div v-if="showValue">{{showValue}}</div>-->

            <!--&lt;!&ndash; 显示占位符 &ndash;&gt;-->
            <!--<div class="n-placeholder" v-else-if="placeholder">{{placeholder}}</div>-->
        </template>

        <template v-slot:append>
            <q-icon
                class="cursor-pointer"
                name="search"
                @click.prevent.stop="onDialog"
            />
        </template>

        <q-popup-proxy
            ref="popupRef"
            @before-show="onPopupBeforeShow"
            @show="onPopupShow"
            @before-hide="onPopupBeforeHide"
            @hide="onPopupHide"
            v-if="! readonly"
        >
            <q-table
                ref="tableRef"
                class="n-table"
                style="min-width:500px;max-width:90vw;height: 300px;"
                v-model:pagination="tablePagination"
                v-model:selected="quickTableSelected"
                :row-key="tableRowKey"
                :rows="tableRows"
                :columns="quickTableColumns"
                :selection="multiple ? 'multiple' : 'none'"
                :loading="tableLoading"
                :rows-per-page-options="tableRowsPerPageOptions"
                @row-click="quickTableRowClick"
                @row-dblclick="quickTableRowDblclick"
                @request="tableRequest"
                flat
                virtual-scroll
                dense
            >
                <!-- 图片 -->
                <template
                    v-for="imgName in tableImgNames"
                    v-slot:[`body-cell-${imgName}`]="props"
                >
                    <q-td :props="props">
                        <!-- 缩略图 -->
                        <n-thumbnail
                            :src="props.row[imgName]"
                            preview
                        />
                    </q-td>
                </template>

                <!-- 插槽 -->
                <template
                    v-for="slotName in slotNames"
                    v-slot:[slotName]="props"
                >
                    <q-td :props="props">
                        <slot
                            :name="slotName"
                            v-bind="props"
                        />
                    </q-td>
                </template>

                <!-- 翻页 -->
                <template v-slot:pagination="props">
                    <n-table-pagination
                        :props="props"
                        no-power
                        dense
                    />
                </template>
            </q-table>
        </q-popup-proxy>
    </q-field>

    <n-dialog
        title="选择商品"
        v-model="showDialog"
        :on-confirm="onDialogConfirm"
        no-esc-dismiss
        no-backdrop-dismiss
        @before-show="onDialogBeforeShow"
        @show="onDialogShow"
        @before-hide="onDialogBeforeHide"
        @hide="onDialogHide"
        cancel
    >
        <q-page>
            <n-table />
        </q-page>
    </n-dialog>
</template>

<script>
import { ref, toRaw, computed, provide, watch, nextTick, onMounted } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NFieldTable',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: [String, Number],
        // 占位符
        placeholder: String,
        // 是否只读
        readonly: Boolean,

        // 表格请求路径
        path: String,
        // 表格请求参数
        query: Object,
        // 值属性名称
        valueKey: {
            type: String,
            required: true,
        },
        // 快捷表格显示的属性名称数组
        showKeys: {
            type: Array,
            required: true,
        },
        // 默认搜索属性名称
        searchKey: String,

        // 表格列数据
        columns: Array,
        // 表格行唯一键值
        rowKey: {
            type: String,
            default: 'id',
        },
        // 是否多选
        multiple: Boolean,
        // 行数据
        rows: Array,
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

        // ==========【数据】============================================================================================

        // 创建权限实例
        const $power = utils.$power.create({
            // 路由路径
            path: utils.isValidString(props.path) ? props.path : false,
            // 路由参数
            query: props.query,
            // 关闭权限页面
            power: false,
        })

        const {
            // 当前路由路径
            routePath,
        } = $power

        // 创建表格实例
        const $table = utils.$table.create({
            // 权限实例
            $power,
            // 获取表格列数据
            columns: getTableColumns(),
            // 表格行唯一键值
            rowKey: props.rowKey,
            // 行数据
            rows: props.rows,
            // 选择类型, 可选值 single multiple none
            selection: props.multiple ? 'multiple' : 'single',
            // http 设置
            httpSettings: {
                // 头部请求
                headers: {
                    // 添加头部查看请求
                    Rview: 1,
                },
            },
            search: false,
        })

        // 快捷表格选择数据
        const quickTableSelected = ref([...$table.tableSelected.value])

        // 字段组件获取焦点
        const fieldFocused = ref(false)

        // 弹出层节点
        const popupRef = ref(null)

        // 是否显示对话框
        const showDialog = ref(false)

        // 表格是否已加载
        let tableLoaded = false

        // 快捷表格列数据
        const quickTableColumns = getQuickTableColumns()

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            return utils.isValidObject(slots) ? Object.keys(slots) : []
        })

        /**
         * 获取表格列数据
         */
        // const tableColumns = computed(function () {
        //
        //     // 获取原始表格列数据
        //     const rawTableColumns = props.route
        //         // 如果有路由组件路径
        //         ? utils.$table.config(props.route, 'columns')
        //         // 否则为自定义表格列数据
        //         : props.columns
        //
        //     // 如果有原始表格列数据
        //     return utils.isValidArray(rawTableColumns)
        //         // 克隆原始表格列数据
        //         ? _.cloneDeep(rawTableColumns)
        //         : []
        // })

        // ==========【监听数据】=========================================================================================

        /**
         * 获取快捷表格列数据
         */
        // watch([()=>props.modelValue, ()=>props.end, ()=>props.type], function() {
        //
        // })

        // ==========【方法】=============================================================================================

        /**
         * 获取表格列数据
         */
        function getTableColumns() {

            // 如果有声明路由表格列数据
            if (utils.isValidArray(props.columns)) {
                return _.cloneDeep(props.columns)
            }

            // 否则如果有路由表格列数据
            const rawTableColumns = utils.$table.config(routePath, 'columns')
            if (utils.isValidArray(rawTableColumns)) {
                return _.cloneDeep(rawTableColumns)
            }

            return []
        }

        /**
         * 获取快捷表格列数据
         */
        function getQuickTableColumns() {

            const columns = []

            // 如果有原始表格列数据
            if (utils.isValidArray($table.tableColumns)) {

                // 克隆原始表格列数据
                const rawTableColumns = _.cloneDeep($table.tableColumns)

                // 快捷表格显示的属性名称数组
                utils.forEach(props.showKeys, function (key) {
                    for (const item of rawTableColumns) {
                        if (item.name === key) {
                            // 删除搜索字段
                            if (_.has(item, 'search')) {
                                delete item.search
                            }
                            // 删除可见字段
                            if (_.has(item, 'visible')) {
                                delete item.visible
                            }
                            columns.push(item)
                        }
                    }
                })
            }

            return columns
        }

        /**
         * 取消
         */
        function onCancel() {
            // 还原原始值
            // onEmit('update:modelValue', oldModelValue)
        }

        /**
         * 弹出层显示前回调
         */
        function onPopupBeforeShow() {

            // 字段组件获取焦点
            fieldFocused.value = true
        }

        /**
         * 弹出层显示回调
         */
        function onPopupShow() {

            // 表格重新加载
            if (! tableLoaded) {
                $table.tableReload()
                tableLoaded = true
            }
        }

        /**
         * 弹出层隐藏前回调
         */
        function onPopupBeforeHide() {

            // 字段组件失去焦点
            fieldFocused.value = false
        }

        /**
         * 弹出层隐藏后回调
         */
        function onPopupHide() {

        }

        /**
         * 清空
         */
        function onClear() {
            emit('update:modelValue', null)
            popupRef.value.hide()
        }

        /**
         * 显示对话框
         */
        function onDialog() {
            showDialog.value = true
        }

        /**
         * 弹出层显示前回调
         */
        function onDialogBeforeShow() {

            // 快捷表格选择数据
            $table.tableSelected.value = [...quickTableSelected.value]

            popupRef.value.hide()
        }

        /**
         * 弹出层显示回调
         */
        function onDialogShow() {

            // 表格重新加载
            if (! tableLoaded) {
                $table.tableReload()
                tableLoaded = true
            }
        }

        /**
         * 弹出层隐藏前回调
         */
        function onDialogBeforeHide() {

        }

        /**
         * 弹出层隐藏后回调
         */
        function onDialogHide() {

        }

        /**
         * 单击快捷表格行
         */
        function quickTableRowClick(e, row, index) {

            // 如果为多选
            if (props.multiple) {

                const opt = {}
                opt[props.rowKey] = row[props.rowKey]

                // 获取当前数据索引
                const itemIndex = _.findIndex(quickTableSelected.value, opt)

                // 如果不存在
                if (itemIndex === -1) {
                    // 则添加
                    quickTableSelected.value.push(row)

                // 否则
                } else {
                    // 删除
                    quickTableSelected.value.splice(itemIndex, 1)
                }

            // 否则为单选
            } else {
                quickTableSelected.value = [ row ]
            }
        }

        /**
         * 弹出层隐藏后回调
         */
        function quickTableRowDblclick() {

        }

        /**
         * 弹出层隐藏后回调
         */
        function onDialogConfirm(data) {
            quickTableSelected.value = [...data]
        }

        // ==========【返回】=============================================================================================

        return {
            // 解构表格实例
            ...$table,

            // 快捷表格列数据
            quickTableColumns,
            // 快捷表格选择数据
            quickTableSelected,

            // 字段组件获取焦点
            fieldFocused,
            // 弹出层节点
            popupRef,
            // 是否显示对话框
            showDialog,

            // 插槽 body 单元格标识
            slotNames,

            // 取消
            onCancel,

            // 弹出层显示前回调
            onPopupBeforeShow,
            // 弹出层显示回调
            onPopupShow,
            // 弹出层隐藏前回调
            onPopupBeforeHide,
            // 弹出层隐藏后回调
            onPopupHide,

            // 弹出层显示前回调
            onDialogBeforeShow,
            // 弹出层显示回调
            onDialogShow,
            // 弹出层隐藏前回调
            onDialogBeforeHide,
            // 弹出层隐藏后回调
            onDialogHide,

            // 清空
            onClear,

            // 显示对话框
            onDialog,

            onHide(props) {
                console.log('onHide', props)
            },

            quickTableRowClick,
            quickTableRowDblclick,
            onDialogConfirm,
        }
    },
}
</script>

<style lang="scss" scoped>
@import "@/assets/sass/var.scss";

.date {

    // 选择容器
    &__select {
        background-color: #ffffff;
    }

    // 时间容器
    &__time {
        + .date__settings {
            // 等同 q-pt-sm
            padding-top: map-get($space-sm, 'y');
        }
    }
}

/**
 * 暗色
 */
.body--dark {
    .date__select {
        background-color: $color-gray-86;
    }
}
</style>
