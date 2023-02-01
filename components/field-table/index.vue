<template>

    <!-- 如果有默认插槽 -->
    <template v-if="$slots.default">
        <slot
            :showValue="showValue"
            :selected="selected"
            :onRemove="onRemoveSelected"
            :onShow="onShowDialog"
            :onClear="onFieldClear"
        />
    </template>

    <!--:class="fieldFocused ? 'q-field&#45;&#45;float q-field&#45;&#45;focused q-field&#45;&#45;highlighted' : ''"-->
    <q-field
        class="n-field-table"
        :model-value="showValue"
        :disable="disable"
        :readonly="readonly"
        :clearable="clearable && (! multiple || collapseTags)"
        @focus="onFieldFocus"
        @blur="onFieldBlur"
        @clear="onFieldClear"
        v-bind="$attrs"
        v-else
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
                            :removable="! readonly && ! disable"
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
                v-if="filter && ! readonly && ! disable"
            />

        </template>

        <!-- 弹出对话框图标 -->
        <template v-slot:append v-if="! noDialog && ! readonly && ! disable">
            <q-icon
                class="cursor-pointer"
                name="search"
                @click.prevent.stop="onShowDialog"
            />
        </template>

        <!-- 弹出层代理 -->
        <q-popup-proxy
            ref="popupRef"
            no-refocus
            no-focus
            fit
            @focus="onFieldBlur"
            @show="onPopupShow"
            @before-hide="showPopup = false"
            v-if="! readonly"
        >
            <!-- 快捷表格 -->
            <q-table
                class="n-table n-field-table__popup-table"
                v-model:pagination="tablePagination"
                :selected="selected"
                @update:selected="emitModelValue"
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
        @show="tableLoad"
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
import { ref, computed, watch, onUpdated } from 'vue'

export default {

    /**
     * 关闭组件 attribute 透传行为
     */
    inheritAttrs: false,

    /**
     * 标识
     */
    name: 'NFieldTable',

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            type: [ String, Number, Array ],
            required: true,
        },
        // 值字段(必填)
        valueKey: {
            type: String,
            required: true,
        },
        // 标签字段
        labelKey:  String,
        // 值类型
        // string: 分隔符隔开的字符串
        // array: 数组
        // arrayObject: 数组对象
        valueType: {
            type: String,
            default: 'arrayObject'
        },
        // 值分隔符(值类型为 string 有效)
        valueSeparator: {
            type: String,
            default: ',',
        },

        // 表格请求路径
        path: String,
        // 表格请求参数
        query: Object,
        // 附加请求数据
        data: Object,
        // 不加载已选数据
        noLoadSelected: Boolean,
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
        // 是否禁用
        disable: Boolean,
        // 是否只读
        readonly: Boolean,
        // 输入防抖(毫秒)
        inputDebounce: {
            type: [ Number, String ],
            default: 500
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
            selected: [],
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

        // 当前表格列数据
        const columns = getQuickTableColumns()

        // 停止观察值
        let stopValueWatcher = false

        // 临时已选数据
        let tempSelected = []

        // 初始化已选数据
        const selected = ref(valueToSelected(props.modelValue, true, true))

        // 加载已选数据
        loadSelected()
            .finally()

        // ==========【监听数据】=========================================================================================

        /**
         * 监听声明值
         */
        watch(() => props.modelValue, async function(val) {

            // 如果停止观察值
            if (stopValueWatcher === true) {
                // 取消停止观察值
                stopValueWatcher = false
                return
            }

            // 值转已选数据
            let newSelected = valueToSelected(val, false, false)

            // 如果值类型是数组对象
            if (props.valueType === 'arrayObject') {

                // 设置已选数据
                setSelected(newSelected)

            // 否则值类型是字符串或数组
            } else {

                // 初始已选数据
                let _selected = []

                // 如果值转已选数据是有效数组
                if (newSelected.length) {

                    // 当前已选数据
                    const currentSelected = tempSelected.length ? tempSelected : selected.value

                    // 如果有已选数据
                    if (currentSelected.length) {

                        // 新已选数据
                        _selected = currentSelected.filter(e => newSelected.indexOf(e[props.valueKey]) > -1)

                        // 需增加的值
                        newSelected = newSelected.filter(e => _selected.map(e => e[props.valueKey]).indexOf(e) === -1)
                    }

                    // 需增加的值
                    if (newSelected.length) {

                        // 如果不加载已选数据
                        if (props.noLoadSelected) {
                            // 请求选择数据
                            _selected.push(...newSelected.map(e => setSelectedItem(e)))
                        } else {
                            // 请求选择数据
                            _selected.push(...await onRequestSelected(newSelected))
                        }
                    }
                }

                // 设置已选数据
                setSelected(_selected)

                // 清空临时已选数据
                tempSelected = []
            }

            // 将已选数据转为值
            const _value = selectedToValue(selected.value)

            // 如果声明值发生变化
            if (_value !== props.modelValue) {
                // 停止观察值
                stopValueWatcher = true
                // 触发更新已选数据
                emit('update:modelValue', _value)
            }

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

            // 延迟执行
            await sleep(props.inputDebounce)

            // 是否有值
            const hasValue = utils.isValidValue(val)

            const n_search = {}
            n_search[currentFilterKey.value] = [
                {
                    // 比较类型
                    compare: dicts.SEARCH_COMPARE_TYPE__LIKE,
                    // 值
                    value: hasValue ? val : '',
                }
            ]

            // 设置表格传参
            $table.setQuery({
                n_search,
            })

            if (
                // 如果弹出层是隐藏的
                ! showPopup.value
                // 如果输入框有值
                && hasValue
            ) {
                // 显示弹出层节点
                showPopupRef()
            }

            // 表格重新加载
            await $table.tableReload()
        })

        // ==========【方法】=============================================================================================

        /**
         * 加载已选数据
         */
        async function loadSelected() {

            if (
                // 如果值类型不是数组对象
                props.valueType !== 'arrayObject'
                // 如果不加载已选数据
                && ! props.noLoadSelected
                // 如果有请求路由路径
                && routePath
            ) {
                // 获取值数组
                const values = valueToSelected(props.modelValue, false, false)
                if (values.length) {

                    // 初始的已选数据
                    const _selected = await onRequestSelected(values)
                    const _value = selectedToValue(_selected)

                    // 如果声明值未发生变化
                    if (_value === props.modelValue) {
                        // 设置已选数据
                        setSelected(_selected)

                    } else {
                        // 设置临时已选数据
                        tempSelected = _selected
                        // 触发更新值
                        emit('update:modelValue', _value)
                    }
                    return
                }
            }

            // 触发更新已选数据
            emit('update:selected', selected.value)
        }

        /**
         * 触发更新值
         */
        function emitModelValue(val) {

            // 设置临时已选数据
            tempSelected = val

            // 触发更新值
            emit('update:modelValue', selectedToValue(val))
        }

        /**
         * 设置已选数据
         */
        function setSelected(val) {

            // 设置已选数据
            selected.value = val

            // 触发更新已选数据
            emit('update:selected', val)
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
         * 设置已选数据的单个元素
         */
        function setSelectedItem(val) {
            const obj = {}
            obj[props.valueKey] = val
            obj[currentlabelKey.value] = val
            return obj
        }

        /**
         * 值转已选数据
         */
        function valueToSelected(val, isFirst, toSelected) {

            // 如果值类型是数组对象
            if (props.valueType === 'arrayObject') {

                // 如果是有效数组
                if (utils.isValidArray(val)) {
                    for (const item of val) {
                        if (
                            // 如果元素不是有效对象
                            ! utils.isValidObject(item)
                            // 如果元素没有值字段
                            || ! _.has(item, props.valueKey)
                        ) {
                            return []
                        }
                    }
                }

                // 否则直接返回
                return val
            }

            if (
                // 非初始化
                ! isFirst
                // 或非加载已选数据
                || props.noLoadSelected
                // 或没有路由路径
                || ! routePath
            ) {
                // 将值转为数组
                val = props.valueType === 'string' ? utils.split(val, props.valueSeparator) : val

                // 如果是有效数组
                if (utils.isValidArray(val)) {
                    val = val.filter(e => utils.isValidValue(e))
                    return toSelected ? val.map(e => setSelectedItem(e)) : val
                }
            }

            return []
        }

        /**
         * 已选数据转值
         */
        function selectedToValue(val) {

            // 如果值类型是数组对象
            if (props.valueType === 'arrayObject') {

                // 则直接返回
                return val
            }

            // 值数组
            const values = val.length
                // 如果有已选数据
                ? (
                    props.multiple
                        // 如果是多选
                        ? val.map(e => e[props.valueKey])
                        // 否则是单选
                        : [ val[0][props.valueKey] ]
                )
                // 否则为空
                : []

            // 如果值类型是数组
            if (props.valueType === 'array') {

                // 直接返回数组
                return values
            }

            // 返回转为分隔符隔开的字符串
            return utils.numberDeep(utils.join(values, props.valueSeparator))
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

            // 触发更新值
            // 清空快捷表格已选数据
            emitModelValue([])

            // 隐藏弹出层节点
            hidePopupRef()
        }

        /**
         * 显示弹出层节点
         */
        function showPopupRef() {

            // 如果有弹出层节点
            if (popupRef.value) {
                // 显示弹出层
                popupRef.value.show()
            }
        }

        /**
         * 隐藏弹出层节点
         */
        function hidePopupRef() {

            // 如果有弹出层节点
            if (popupRef.value) {
                // 隐藏弹出层
                popupRef.value.hide()
            }
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
         * 显示对话框
         */
        function onShowDialog() {
            // 显示对话框
            showDialog.value = true
        }

        /**
         * 对话框显示前回调
         */
        function onDialogBeforeShow() {

            // 设置当前已选数据
            $table.tableSelected.value = [...selected.value]

            // 隐藏弹出层节点
            hidePopupRef()
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

            // 触发更新值
            emitModelValue([...data])
        }

        /**
         * 单击快捷表格行
         */
        function quickTableRowClick(e, row) {

            // 如果为多选
            if (props.multiple) {

                // 克隆已选数据
                const _selected = [...selected.value]

                const opt = {}
                opt[props.valueKey] = row[props.valueKey]

                // 获取当前数据索引
                const itemIndex = _.findIndex(_selected, opt)

                // 如果不存在
                if (itemIndex === -1) {
                    // 则添加
                    _selected.push(row)

                // 否则
                } else {
                    // 删除
                    _selected.splice(itemIndex, 1)
                }

                // 触发更新值
                emitModelValue(_selected)

            // 否则为单选
            } else {

                // 触发更新值
                emitModelValue([ row ])

                // 隐藏弹出层节点
                hidePopupRef()
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
         * 在组件因为响应式状态变更而更新其 DOM 树之后调用
         */
        onUpdated(function () {
            if (
                popupRef.value
                && _.has(popupRef.value, 'currentComponent.ref.updatePosition')
            ) {
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

            // 弹出层显示回调
            onPopupShow,

            // 显示对话框
            onShowDialog,
            // 对话框显示前回调
            onDialogBeforeShow,
            // 对话框隐藏后回调
            onDialogHide,
            // 对话框点击确认回调
            onDialogConfirm,

            // 单击快捷表格行
            quickTableRowClick,

            // 触发更新值
            emitModelValue,
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

/**
 * 桌面
 */
body.desktop {
    .n-field-table {
        &__popup-table {
            height: 300px;
        }
    }
}
</style>
