<template>
    <!--:class="fieldFocused ? 'q-field&#45;&#45;float q-field&#45;&#45;focused q-field&#45;&#45;highlighted' : ''"-->
    <q-field
        class="n-field-table"
        :model-value="showValue"
        :readonly="readonly"
        :clearable="clearable && (! multiple || collapseTags)"
        @focus="onFieldFocus"
        @blur="onFieldBlur"
        @clear="onFieldClear"
        v-bind="$attrs"
    >
        <template v-slot:control>

            <template v-if="multiple">
                <template v-if="selected.length">

                    <!-- 多选插槽 -->
                    <slot
                        name="selected"
                        :selected="selected"
                        :remove="onRemoveSelected"
                        v-if="$slots.selected"
                    />

                    <!-- 显示折叠的值数量 -->
                    <q-chip
                        dense
                        :label="`+${selected.length}`"
                        v-else-if="collapseTags"
                    />

                    <!-- 多选标签 -->
                    <template v-else>
                        <q-chip
                            v-for="(item, index) in selected"
                            :key="`options-${index}`"
                            :label="currentFormatLabel(item)"
                            dense
                            removable
                            @remove="onRemoveSelected(index)"
                        />
                    </template>
                </template>

                <!-- 占位符-->
                <span class="n-placeholder" v-else-if="placeholder">{{placeholder}}</span>
            </template>

            <!-- 显示文字 -->
            <span v-else-if="showValue">{{showValue}}</span>

            <!-- 占位符-->
            <span class="n-placeholder" v-else-if="placeholder">{{placeholder}}</span>

            <!-- 筛选输入框 -->
            <input
                ref="inputRef"
                class="q-field__input q-placeholder col q-field__input--padding"
                v-model="inputValue"
                v-if="filter"
            />

        </template>

        <!-- 弹出对话框图标 -->
        <template v-slot:append v-if="! noDialog">
            <q-icon
                class="cursor-pointer"
                name="search"
                @click.prevent.stop="showDialog = true"
            />
        </template>

        <!-- 弹出层代理 -->
        <q-popup-proxy
            ref="popupRef"
            no-refocus
            no-focus
            fit
            @focus="onPopupFocus"
            @show="onPopupShow"
            @before-hide="onPopupBeforeHide"
            v-if="! readonly"
        >
            <!-- 快捷表格 -->
            <q-table
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
                @request="tableRequest"
                flat
                virtual-scroll
                dense
                v-bind="tableProps"
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

    <!-- 弹出对话框 -->
    <n-dialog
        v-model="showDialog"
        width="80%"
        :on-confirm="onDialogConfirm"
        @before-show="onDialogBeforeShow"
        @show="onDialogShow"
        @hide="onDialogHide"
        cancel
        v-bind="dialogProps"
    >
        <q-page>
            <n-table />
        </q-page>
    </n-dialog>
</template>

<script>
import { ref, computed, watch, onMounted, onUpdated } from 'vue'
import { NRenderKey } from '../../utils/symbols'

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
        // 表格请求路径
        path: String,
        // 表格请求参数
        query: Object,
        // 附加请求数据
        data: Object,
        // 已选数据
        selected: Array,
        // 初始时不加载选择数据
        noLoadSelected: Boolean,
        // 值字段(必填)
        valueKey: {
            type: String,
            required: true,
        },
        // 标签字段
        labelKey:  String,
        // 格式化显示标签
        formatLabel: Function,
        // 快捷表格显示的字段数组(空为:[值字段, 标签字段])
        showKeys: Array,
        // 隐藏搜索字段数组
        hideSearchKeys: Array,
        // 默认筛选字段(空为:标签字段)
        filterKey: String,
        // 是否开启筛选
        filter: Boolean,
        // 表格声明属性
        tableProps: Object,
        // 对话框声明属性
        dialogProps: Object,

        // 值是否为数组
        valueArray: Boolean,
        // 关闭对话框
        noDialog: Boolean,

        // 表格列数据
        columns: Array,
        // 行数据
        rows: Array,
        // 是否多选
        multiple: Boolean,
        // 多选模式下是否折叠 Tag
        collapseTags: Boolean,
        // 占位符
        placeholder: String,
        // 是否可清除
        clearable: Boolean,
        // 是否只读
        readonly: Boolean,
        // 输入防抖(毫秒)
        inputDebounce: {
            type: [ Number, String ],
            default: 500
        },
        // 值分隔符(值为非数组有效)
        valueSeparator: {
            type: String,
            default: ',',
        },
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

        // ==========【计算属性】=========================================================================================

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {
            return utils.isValidObject(slots) ? Object.keys(slots) : []
        })

        /**
         * 当前标签字段
         */
        const currentlabelKey = computed(function() {
            return props.labelKey || props.valueKey
        })

        /**
         * 当前显示字段
         */
        const currentShowKeys = computed(function() {
            return _.uniq(utils.isValidArray(props.showKeys)
                ? props.showKeys
                : [ props.valueKey, currentlabelKey.value ])
        })

        /**
         * 当前搜索字段
         */
        const currentFilterKey = computed(function() {
            return props.filterKey || currentlabelKey.value
        })

        /**
         * 显示值
         */
        const showValue = computed(function () {

            // 如果有已选数据
            return utils.isValidArray(selected.value)
                // 取已选数据第一条
                ? currentFormatLabel(selected.value[0])
                : ''
        })

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
            // 附加请求数据
            data: props.data,
            // 获取表格列数据
            columns: getTableColumns(),
            // 表格行唯一键值
            rowKey: props.valueKey,
            // 行数据
            rows: props.rows,
            // 选择类型, 可选值 single multiple none
            selection: props.multiple ? 'multiple' : 'single',
            // 已选数据
            selected: initSelected(),
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

        // 创建防抖睡眠方法
        const sleep = utils.debounceSleep()

        // 停止观察值
        let stopValueWatcher = false

        // 停止观察已选数据
        let stopSelectedWatcher = false

        // 输入框节点
        const inputRef = ref(null)

        // 输入框值
        const inputValue = ref('')

        // 弹出层节点
        const popupRef = ref(null)

        // 是否显示对话框
        const showDialog = ref(false)

        // 是否显示弹出层
        const showPopup = ref(false)

        // 当前已选数据
        const selected = ref([...$table.tableSelected.value])

        // 当前表格列数据
        const columns = getQuickTableColumns()

        // 如果有已选数据
        if (utils.isValidArray(selected.value)) {
            // 检查值更新
            checkModelValueChange()
        }

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, async function() {

            // 如果停止观察值
            if (stopValueWatcher === true) {
                // 取消停止观察值
                stopValueWatcher = false
                return
            }

            // 格式化值
            let values = formatModelValue()

            // 如果值是有效数组
            if (utils.isValidArray(values)) {

                // 去重
                values = _.uniq(values)

                // 已选数据值数组
                const selectedValues = utils.isValidArray(selected.value)
                    // 如果有已选数据
                    ? _.uniq(selected.value.map(e => e[props.valueKey]))
                    // 否则为空
                    : []

                // 需增删除的值
                const removeValues = selectedValues.filter(e => values.indexOf(e) === -1)
                if (removeValues.length) {
                    utils.forEachRight(selected.value, function (item, index) {
                        if (removeValues.indexOf(item[props.valueKey]) > -1) {
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

            // 否则
            } else {
                // 清空已选数据
                selected.value = []
            }

            // 检查值更新
            checkModelValueChange()
        })

        /**
         * 监听声明选择数据
         */
        watch(()=>props.selected, function(val) {

            // 如果停止观察已选数据
            if (stopSelectedWatcher === true) {
                // 取消停止观察已选数据
                stopSelectedWatcher = false
                return
            }

            if (val !== selected.value) {
                // 设置选择数据
                selected.value = val
            }

            // 检查值更新
            checkModelValueChange()

            // 设置输入框焦点
            setInputFocus()

            // 设置输入框文字选中
            setInputSelection()

        }, {
            // 深度监听
            deep: true
        })

        /**
         * 监听当前已选数据
         */
        watch(selected, function(val) {

            if (val !== props.selected) {

                // 停止观察已选数据
                stopSelectedWatcher = true

                // 更新选择数据
                emit('update:selected', val)
            }

            // 检查值更新
            checkModelValueChange()

            // 设置输入框焦点
            setInputFocus()

            // 设置输入框文字选中
            setInputSelection()
        }, {
            // 深度监听
            deep: true,
        })

        /**
         * 监听输入框值
         */
        watch(inputValue, async function (val) {

            // 取消延迟执行
            sleep.cancel()

            const hasValue = utils.isValidValue(val)
            if (hasValue) {

                const n_search = {}
                n_search[currentFilterKey.value] = [
                    {
                        // 比较类型
                        type: dicts.SEARCH_TYPE__LIKE,
                        // 值
                        value: val || '',
                    }
                ]

                $table.tableQuery.value = {
                    n_search,
                }

            } else {
                $table.tableQuery.value = {}
            }

            // 延迟执行
            await sleep(props.inputDebounce)

            if (
                // 如果弹出层是隐藏的
                ! showPopup.value
                // 如果输入框有值
                && hasValue
            ) {
                // 显示弹出层
                popupRef.value.show()
            }

            // 表格重新加载
            await $table.tableReload()
        })

        // ==========【方法】=============================================================================================

        /**
         * 初始化已选数据
         */
        function initSelected() {

            // 如果有已选数据
            if (utils.isValidArray(props.selected)) {

                // 则返回已选数据
                return props.selected
            }

            // 如果初始时不加载选择数据
            if (props.noLoadSelected) {

                // 将值格式化为已选数据数组
                const vals = formatModelValue()
                if (utils.isValidArray(vals)) {
                    return vals.map(function (val) {
                        const obj = {}
                        obj[props.valueKey] = val
                        obj[currentlabelKey.value] = val
                        return obj
                    })
                }
            }

            return []
        }

        /**
         * 当前格式化显示标签
         */
        function currentFormatLabel(item) {
            // 如果有格式化显示标签方法
            return _.isFunction(props.formatLabel)
                // 执行格式化显示标签方法
                ? props.formatLabel(item)
                // 否则显示该值的标签字段
                : item[currentlabelKey.value]
        }

        /**
         * 格式化值
         */
        function formatModelValue() {

            // 如果值是数组
            if (props.valueArray) {
                return props.modelValue
            }

            // 否则值是字符串/数字
            return _.uniq(utils.split(props.modelValue, props.valueSeparator))
                .filter(e => utils.isValidValue(e))
        }

        /**
         * 请求选择数据
         */
        async function onRequestSelected(value) {

            // 请求数据
            const { status, data } = await utils.http({
                url: $table.routePath,
                data: Object.assign(
                    // 获取表格请求数据
                    $table.getTableRequestData({
                        // filter,
                        pagination: {
                            // 页码
                            page: 1,
                            // 每页的数据条数
                            rowsPerPage: value.length,
                            // 排序字段
                            sortBy: null,
                            // 是否降序排列
                            descending: true,
                        }
                    }, false),
                    {
                        // 查看字段
                        n_view: {
                            // 查看字段
                            field: props.valueKey,
                            // 查看值
                            value,
                        },
                    }
                ),
            })

            return status && utils.isValidArray(_.get(data, 'rows')) ? data.rows : []
        }

        /**
         * 初始加载选择数据
         */
        async function onLoadSelected() {

            if (
                // 如果初始不加载选择数据
                props.noLoadSelected
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
                ? (
                    props.multiple
                        // 如果是多选
                        ? selected.value.map(e => e[props.valueKey])
                        // 否则是单选
                        : [ selected.value[0][props.valueKey] ]
                )
                // 否则为空
                : []

            // 如果值为字符串或数字
            if (! props.valueArray) {
                newModelValue = utils.numberDeep(utils.join(newModelValue, props.valueSeparator))
            }

            // 如果值发生改变
            if (newModelValue !== props.modelValue) {

                // 停止观察值
                stopValueWatcher = true

                // 提交更新值
                emit('update:modelValue', newModelValue)
            }
        }

        /**
         * 获取表格列数据
         */
        function getTableColumns() {

            let columns

            // 如果有声明路由表格列数据
            if (utils.isValidArray(props.columns)) {
                columns = _.cloneDeep(props.columns)

            // 如果有路由路径
            } else if (routePath) {
                // 否则如果有路由表格列数据
                const rawTableColumns = utils.$table.config(routePath, 'columns')
                if (utils.isValidArray(rawTableColumns)) {
                    columns = _.cloneDeep(rawTableColumns)
                }
            }

            if (utils.isValidArray(columns)) {
                if (utils.isValidArray(props.hideSearchKeys)) {
                    for (const item of columns) {
                        if (
                            props.hideSearchKeys.indexOf(item.name) > -1
                            && _.has(item, 'search')
                        ) {
                            item.search.hide = true
                        }
                    }
                }
                return columns
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
                utils.forEach(currentShowKeys.value, function (key) {
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
         * 移除已选数据
         */
        function onRemoveSelected(index) {
            selected.value.splice(index, 1)
        }

        /**
         * 字段获取焦点触发
         */
        function onFieldFocus(e) {

            // 停止冒泡
            e.stopPropagation()

            // 设置输入框焦点
            setInputFocus()

            window.scrollTo(window.pageXOffset || window.scrollX || document.body.scrollLeft || 0, 0)
        }

        /**
         * 字段失去焦点触发
         */
        function onFieldBlur(e) {

            // 停止冒泡
            e.stopPropagation()

            if (
                // 如果开启筛选
                props.filter
                // 如果没有显示弹出层
                && ! showPopup.value
            ) {
                // 清空输入框值
                inputValue.value = ''
            }
        }

        /**
         * 字段清空触发
         */
        function onFieldClear() {

            // 清空快捷表格已选数据
            selected.value = []

            // 隐藏弹出层
            popupRef.value.hide()
        }

        /**
         * 弹出层获取焦点触发
         */
        function onPopupFocus(e) {

            // 停止冒泡
            e.stopPropagation()

            // 设置输入框焦点
            setInputFocus()

            window.scrollTo(window.pageXOffset || window.scrollX || document.body.scrollLeft || 0, 0)
        }

        /**
         * 弹出层显示回调
         */
        function onPopupShow() {

            // 显示弹出层
            showPopup.value = true

            // 设置输入框焦点
            setInputFocus()

            // 表格加载(只加载一次)
            $table.tableLoad()
                .finally()
        }

        /**
         * 弹出层隐藏前显示回调
         */
        function onPopupBeforeHide() {

            // 隐藏弹出层
            showPopup.value = false
        }

        /**
         * 对话框显示前回调
         */
        function onDialogBeforeShow() {

            // 设置当前已选数据
            $table.tableSelected.value = [...selected.value]

            // 隐藏弹出层
            popupRef.value.hide()
        }

        /**
         * 对话框显示回调
         */
        function onDialogShow() {

            // 表格加载(只加载一次)
            $table.tableLoad()
                .finally()
        }

        /**
         * 对话框隐藏后回调
         */
        function onDialogHide() {

            let isReload = true

            // 清空输入框值
            if (
                // 如果开启筛选
                props.filter
                // 如果有输入框值
                && inputValue.value
            ) {
                // 此时清空输入框后, 会自动刷新表格
                inputValue.value = ''

                // 所以只需要重置搜索值即可, 不需要再重置后刷新表格
                isReload = false
            }

            // 如果有表格搜索值
            if ($table.hasTableSearchValue()) {
                // 表格搜索重置
                $table.tableSearchReset(isReload)
            }
        }

        /**
         * 对话框点击确认回调
         */
        function onDialogConfirm(data) {
            selected.value = [...data]
        }

        /**
         * 单击快捷表格行
         */
        function quickTableRowClick(e, row, index) {

            // 如果为多选
            if (props.multiple) {

                const opt = {}
                opt[props.valueKey] = row[props.valueKey]

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

                // 隐藏弹出层
                popupRef.value.hide()
            }
        }

        /**
         * 设置输入框文字选中
         */
        function setInputSelection() {
            if (
                // 如果开启筛选
                props.filter
                // 如果有输入框节点
                && inputRef.value
                // 如果输入框有值
                && inputValue.value.length
            ) {
                // 全选文字
                inputRef.value.select()
                // inputRef.value.setSelectionRange(0, inputValue.value.length)
            }
        }

        /**
         * 设置输入框焦点
         */
        function setInputFocus() {
            if (
                // 如果开启筛选
                props.filter
                // 如果有输入框节点
                && inputRef.value
            ) {
                inputRef.value.focus()
            }
        }

        // ==========【生命周期】=========================================================================================

        /**
         * 实例被挂载后调用
         */
        onMounted(async function() {

            // 初始加载选择数据
            await onLoadSelected()
        })

        /**
         * 在组件因为响应式状态变更而更新其 DOM 树之后调用
         */
        onUpdated(function () {
            if (_.has(popupRef.value, 'currentComponent.ref.updatePosition')) {
                popupRef.value.currentComponent.ref.updatePosition()
            }
        })

        // ==========【返回】=============================================================================================

        return {
            // 解构表格实例
            ...$table,

            // 插槽标识
            slotNames,
            // 当前标签字段
            currentlabelKey,
            // 显示值
            showValue,

            // 输入框节点
            inputRef,
            // 输入框值
            inputValue,
            // 弹出层节点
            popupRef,
            // 是否显示对话框
            showDialog,
            // 当前已选数据
            selected,
            // 当前表格列数据
            columns,

            // 当前格式化显示标签
            currentFormatLabel,
            // 移除已选数据
            onRemoveSelected,

            // 字段获取焦点触发
            onFieldFocus,
            // 字段失去焦点触发
            onFieldBlur,
            // 字段清空触发
            onFieldClear,

            // 弹出层获取焦点触发
            onPopupFocus,
            // 弹出层显示回调
            onPopupShow,
            // 弹出层隐藏前显示回调
            onPopupBeforeHide,

            // 对话框显示前回调
            onDialogBeforeShow,
            // 对话框显示回调
            onDialogShow,
            // 对话框隐藏后回调
            onDialogHide,
            // 对话框点击确认回调
            onDialogConfirm,

            // 单击快捷表格行
            quickTableRowClick,
        }
    },
}
</script>

<style lang="scss">
@import "@/assets/sass/var.scss";

.n-field-table {
    .q-field__input--padding {
        padding-left: 4px;
        min-width: 50px !important;
        cursor: text;
    }
}
</style>
