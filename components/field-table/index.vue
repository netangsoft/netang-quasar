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
                v-model:selected="selected"
                :row-key="tableRowKey"
                :rows="tableRows"
                :columns="columns"
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
        modelValue: [ String, Number, Array ],
        // 已选数据
        selected: Array,
        // 初始加载选择数据
        loadSelected: {
            type: Boolean,
            default: true,
        },

        // 值是否为数组
        valueArray: Boolean,
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
        'update:selected',
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
            // 已选数据
            selected: props.selected,
            // http 设置
            httpSettings: {
                // 头部请求
                headers: {
                    // 添加头部查看请求
                    Pview: 1,
                },
            },
            // 刷新后清空已选数据
            refreshResetSelected: false,
        })

        // 字段组件获取焦点
        const fieldFocused = ref(false)

        // 弹出层节点
        const popupRef = ref(null)

        // 是否显示对话框
        const showDialog = ref(false)

        // 当前已选数据
        const selected = ref([...$table.tableSelected.value])

        // 当前表格列数据
        const columns = getQuickTableColumns()

        // 如果有已选数据
        if (utils.isValidArray(selected.value)) {

            // 检查值更新
            checkModelValueChange()
        }

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            return utils.isValidObject(slots) ? Object.keys(slots) : []
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, async function() {

            // 格式化值
            let values = formatModelValue()

            // 如果值不是有效数组
            if (! utils.isValidArray(values)) {
                // 则清空已选数据
                selected.value = []
                return
            }
            values = _.uniq(values)

            // 已选数据值数组
            const selectedValues = utils.isValidArray(selected.value)
                // 如果有已选数据
                ? _.uniq(selected.value.map(e => e[props.rowKey]))
                // 否则为空
                : []

            // 需增删除的值
            const removeValues = selectedValues.filter(e => values.indexOf(e) === -1)
            if (removeValues.length) {
                utils.forEachRight(selected.value, function (item, index) {
                    if (removeValues.indexOf(item[props.rowKey]) > -1) {
                        selected.value.splice(index, 1)
                    }
                })
            }

            // 需增加的值
            const addValues = values.filter(e => selectedValues.indexOf(e) === -1)
            if (addValues.length) {
                // 请求选择数据
                selected.value.push(...await onRequestSelected(addValues))
            }
        })

        /**
         * 监听声明选择数据
         */
        watch(()=>props.selected, function(val) {
            if (val !== selected.value) {
                // 设置选择数据
                selected.value = val
            }
            // 检查值更新
            checkModelValueChange()
        }, {
            deep: true
        })

        /**
         * 监听当前已选数据
         */
        watch(selected, function(val) {
            if (val !== props.selected) {
                emit('update:selected', val)
            }
        }, {
            // 深度监听
            deep: true,
        })

        // ==========【方法】=============================================================================================

        /**
         * 格式化值
         */
        function formatModelValue() {

            // 如果值是数组
            if (props.valueArray) {
                return props.modelValue
            }

            // 否则值是字符串/数字
            return utils.split(props.modelValue, ',')
        }

        /**
         * 请求选择数据
         */
        async function onRequestSelected(value) {

            // 请求数据
            const { status, data } = await utils.http({
                url: $table.routeFullPath,
                data: {
                    // 查看字段
                    n_view: {
                        // 查看字段
                        field: props.rowKey,
                        // 查看值
                        value,
                    },
                },
            })

            return status && utils.isValidArray(_.get(data, 'rows')) ? data.rows : []
        }

        /**
         * 初始加载选择数据
         */
        async function onLoadSelected() {

            if (
                // 如果初始不加载选择数据
                ! props.loadSelected
                // 如果没有请求路由路径
                || ! routePath
                // 如果有选择数据
                || utils.isValidArray(selected.value)
            ) {
                // 则无任何操作
                return
            }

            // 格式化值
            const value = formatModelValue()

            // 如果值不是有效数组
            if (! utils.isValidArray(value)) {
                // 则无任何操作
                return
            }

            // 设置已选数据
            selected.value = await onRequestSelected(value)
        }

        /**
         * 检查值更新
         */
        function checkModelValueChange() {

            let newModelValue = utils.isValidArray(selected.value)
                // 如果有已选数据
                ? selected.value.map(e => e[props.rowKey])
                // 否则为空
                : []

            // 如果值为字符串或数字
            if (! props.valueArray) {
                newModelValue = utils.numberDeep(utils.join(newModelValue, ','))
            }

            // 如果值发生改变
            if (! _.isEqual(newModelValue, props.modelValue)) {

                // 提交更新值
                emit('update:modelValue', newModelValue)
            }
        }

        /**
         * 获取表格列数据
         */
        function getTableColumns() {

            // 如果有声明路由表格列数据
            if (utils.isValidArray(props.columns)) {
                return _.cloneDeep(props.columns)
            }

            if (routePath) {
                // 否则如果有路由表格列数据
                const rawTableColumns = utils.$table.config(routePath, 'columns')
                if (utils.isValidArray(rawTableColumns)) {
                    return _.cloneDeep(rawTableColumns)
                }
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
            $table.tableReload(true)
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

            // 设置当前已选数据
            $table.tableSelected.value = [...selected.value]

            popupRef.value.hide()
        }

        /**
         * 弹出层显示回调
         */
        function onDialogShow() {
            $table.tableReload(true)
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
                const itemIndex = _.findIndex(selected.value, opt)

                // 如果不存在
                if (itemIndex === -1) {
                    // 则添加
                    selected.value.push(row)

                // 否则
                } else {
                    // 删除
                    selected.value.splice(itemIndex, 1)
                }

            // 否则为单选
            } else {
                selected.value = [ row ]
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
            selected.value = [...data]
        }

        // ==========【生命周期】=========================================================================================

        /**
         * 实例被挂载后调用
         */
        onMounted(async function() {

            // 初始加载选择数据
            await onLoadSelected()
        })

        // ==========【返回】=============================================================================================

        return {
            // 解构表格实例
            ...$table,

            // 当前表格列数据
            columns,
            // 当前已选数据
            selected,

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
