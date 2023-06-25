<template>

    <!-- 如果有默认插槽 -->
    <template v-if="$slots.default">
        <slot
            :showValue="showValue"
            :selected="selected"
            :onRemove="onRemoveSelected"
            :onShowDialog="onShowDialog"
            :onClear="onFieldClear"
        />
    </template>

    <!--:class="fieldFocused ? 'q-field&#45;&#45;float q-field&#45;&#45;focused q-field&#45;&#45;highlighted' : ''"-->
    <!--:clearable="clearable && (! multiple || collapseTags)"-->
    <q-field
        class="n-field-table"
        :model-value="showValue"
        :disable="disable"
        :readonly="readonly"
        :clearable="clearable"
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
                        >
                            <q-tooltip>{{currentFormatLabel(item)}}</q-tooltip>
                        </q-chip>
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

        <!-- 默认插槽 -->
        <template
            v-for="slotName in slotNames.normal"
            v-slot:[slotName]
        >
            <slot :name="slotName" />
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
            v-if="! readonly && ! disable"
        >
            <!-- 快捷表格 -->
            <n-table
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
                    v-for="imgItem in tableImgs"
                    v-slot:[`body-cell-${imgItem.name}`]="props"
                >
                    <n-data
                        :data="formatImg(props.row[imgItem.name], imgItem)"
                        v-slot="{ data }"
                    >
                        <!-- 缩略图 -->
                        <n-thumbnail
                            v-for="(item, index) in data"
                            :key="`thumbnail-item-${item}`"
                            class="n-table__thumbnail"
                            :src="item"
                            preview
                            :preview-props="{
                                startPosition: index,
                                images: data,
                            }"
                        />
                    </n-data>
                </template>

                <!-- 表格插槽 -->
                <template
                    v-for="slotName in slotNames.table"
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
            </n-table>
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
            <n-mixed-table />
        </q-page>
    </n-dialog>
</template>

<script>
import { ref, computed, watch, onUpdated } from 'vue'

import $n_has from 'lodash/has'
import $n_uniq from 'lodash/uniq'
import $n_cloneDeep from 'lodash/cloneDeep'
import $n_isFunction from 'lodash/isFunction'
import $n_findIndex from 'lodash/findIndex'
import $n_get from 'lodash/get'

import $n_indexOf from '@netang/utils/indexOf'
import $n_forEach from '@netang/utils/forEach'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_join from '@netang/utils/join'
import $n_split from '@netang/utils/split'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_isValidString from '@netang/utils/isValidString'
import $n_numberDeep from '@netang/utils/numberDeep'
import $n_sleep from '@netang/utils/sleep'
import $n_http from '@netang/utils/http'
import $n_runAsync from '@netang/utils/runAsync'

import $n_$power from '../../utils/$power'
import $n_$table from '../../utils/$table'

import { configs } from '../../utils/config'

import $n_getImage from '../../utils/getImage'

const {
    // 字典常量
    dicts,
} = configs

export default {

    /**
     * 标识
     */
    name: 'NFieldTable',

    /**
     * 关闭组件 attribute 透传行为
     */
    inheritAttrs: false,

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
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
        // string: 字符串或数字
        // stringArray: 普通数组(包含字符串或数字的一维数组)
        // objectArray: 对象数组(包含对象的一维数组)
        valueType: {
            type: String,
            default: 'objectArray'
        },
        // 值分隔符(值类型为 string 有效)
        valueSeparator: {
            type: String,
            default: ',',
        },

        // 请求路由路径
        path: String,
        // 请求地址(默认为 path)
        url: String,
        // 请求参数
        query: Object,
        // 附加请求数据
        data: Object,
        // 加载已选数据数组
        // 如果有数组数据, 则初始化时从数组中选取已有的数据
        loadSelected: [Array, Function],
        // 初始是否不加载已选数据
        // true, 则初始时不加载数据(同时 loadSelected 无效)
        noDefaultLoadSelected: Boolean,
        // 更新值时不加载已选数据
        noUpdateLoadSelected: Boolean,
        // 格式化显示标签
        formatLabel: Function,
        // 下拉表格显示的字段数组(空为:[值字段, 标签字段])
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
        // 多选模式下是否折叠标签
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
        // 自定义请求方法
        request: Function,
        // 每次对话框显示都请求
        requestEveryDialogShow: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        'loaded',
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

            const table = []
            const normal = []

            // 如果有插槽
            if ($n_isValidObject(slots)) {
                for (const key in slots) {
                    if (key !== 'append' && key !== 'control') {
                        if (key.startsWith('table-')) {
                            table.push(key.replace('table-', ''))
                        } else {
                            normal.push(key)
                        }
                    }
                }
            }

            return {
                table,
                normal,
            }
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
            return $n_uniq($n_isValidArray(props.showKeys)
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
            return $n_isValidArray(selected.value)
                // 取已选数据第一条
                ? currentFormatLabel(selected.value[0])
                : ''
        })

        // ==========【数据】============================================================================================

        // 创建权限实例
        const $power = $n_$power.create({
            // 路由路径
            path: $n_isValidString(props.path) ? props.path : false,
            // 路由参数
            query: props.query,
            // 关闭权限页面
            power: false,
            // 禁止对话框注入
            $dialog: null,
        })

        const {
            // 当前路由路径
            routePath,
        } = $power

        // 创建表格实例
        const $table = $n_$table.create({
            // 权限实例
            $power,
            // 请求地址
            url: props.url,
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
            // 自定义请求方法
            async request({ httpOptions, props: httpProps }) {
                return $n_isFunction(props.request) ?
                    // 如果有自定义请求方法
                    await $n_runAsync(props.request)({
                        // http 请求参数
                        httpOptions,
                        // 对话框是否已显示
                        showDialog: $n_get(httpProps, 'showDialog') === 1 ? true : showDialog.value,
                    }) :
                    // 否则请求数据
                    await $n_http(httpOptions)
            },
        })

        // 创建睡眠实例
        const sleep = $n_sleep()

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
        if (
            ! props.noDefaultLoadSelected
            && props.loadSelected === void 0
        ) {
            loadSelected()
                .finally()
        } else {
            // 初始化加载成功
            emit('loaded', selected.value)
        }

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
            if (props.valueType === 'objectArray') {

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

                        // 如果更新值时不加载已选数据
                        if (props.noUpdateLoadSelected) {
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
            const hasValue = $n_isValidValue(val)

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

        /**
         * 监听其他值
         */
        // watch([
        //     ()=>props.path,
        //     ()=>props.url,
        //     ()=>props.query,
        //     ()=>props.data,
        //     ()=>props.showKeys,
        //     ()=>props.hideSearchKeys,
        // ], function () {
        //     _dialogShowed = false
        //     _popupShowed = false
        //
        // }, {
        //     deep: true
        // })

        // ==========【方法】=============================================================================================

        /**
         * 加载已选数据
         */
        async function loadSelected() {
            if (
                // 如果值类型不是数组对象
                props.valueType !== 'objectArray'
                // 如果初始加载已选数据
                && ! props.noDefaultLoadSelected
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
                    // 初始化加载成功
                    emit('loaded', _selected)
                    return
                }
            }

            // 触发更新已选数据
            emit('update:selected', selected.value)
            // 初始化加载成功
            emit('loaded', selected.value)
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
            if ($n_isFunction(props.formatLabel)) {
                // 执行格式化显示标签方法
                return props.formatLabel(item)
            }

            // 否则显示该值的标签字段
            const val = item[currentlabelKey.value]
            return $n_isValidValue(val) ? val : item[props.valueKey]
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
            if (props.valueType === 'objectArray') {

                // 如果是有效数组
                if ($n_isValidArray(val)) {
                    for (const item of val) {
                        if (
                            // 如果元素不是有效对象
                            ! $n_isValidObject(item)
                            // 如果元素没有值字段
                            || ! $n_has(item, props.valueKey)
                        ) {
                            return []
                        }
                    }
                }

                // 否则直接返回
                return val
            }

            if (
                // 如果初始化
                isFirst
                // 如果初始加载已选数据方法
                && ! props.noDefaultLoadSelected
                // 如果有初始加载已选数据
                && props.loadSelected !== void 0
            ) {
                // 将值转为数组
                val = props.valueType === 'string' ? $n_split(val, props.valueSeparator) : val

                // 如果是有效数组
                if ($n_isValidArray(val)) {
                    val = val.filter(e => $n_isValidValue(e))
                    if (val.length) {
                        return onLoadSelected(val, isFirst)
                    }
                }
                return []
            }

            if (
                // 非初始化
                ! isFirst
                // 或初始不加载已选数据
                || props.noDefaultLoadSelected
                // 或没有路由路径
                || ! routePath
            ) {
                // 将值转为数组
                val = props.valueType === 'string' ? $n_split(val, props.valueSeparator) : val

                // 如果是有效数组
                if ($n_isValidArray(val)) {
                    val = val.filter(e => $n_isValidValue(e))
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
            if (props.valueType === 'objectArray') {

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
            if (props.valueType === 'stringArray') {

                // 直接返回数组
                return values
            }

            // 返回转为分隔符隔开的字符串
            return $n_numberDeep($n_join(values, props.valueSeparator))
        }

        /**
         * 加载已选数据
         */
        function onLoadSelected(values, isFirst) {

            function next(lists) {
                const _selected = []
                $n_forEach(lists, function (item) {
                    if (
                        $n_has(item, props.valueKey)
                        && $n_indexOf(values, item[props.valueKey]) > -1
                        && $n_findIndex(_selected, e => e[props.valueKey] === item[props.valueKey]) === -1
                    ) {
                        _selected.push($n_cloneDeep(item))
                    }
                })
                return _selected
            }

            // 如果是加载已选数据方法
            if ($n_isFunction(props.loadSelected)) {
                const res = props.loadSelected(values, next, isFirst)
                if ($n_isValidArray(res)) {
                    return res
                }
                return []
            }

            return next(props.loadSelected)
        }

        /**
         * 请求选择数据
         */
        async function onRequestSelected(value) {

            let requestValues = value

            const all = {}
            let hasAll = false

            // 如果有初始加载已选数据数组
            if (props.loadSelected !== void 0) {
                const rows = onLoadSelected(value, false)
                if ($n.isValidArray(rows)) {

                    requestValues = []

                    for (const item of rows) {
                        all[item[props.valueKey]] = item
                    }
                    for (const val of value) {
                        if (! $n_has(all, val)) {
                            requestValues.push(val)
                        }
                    }
                    if (! requestValues.length) {
                        return rows
                    }

                    hasAll = true
                }
            }

            // 请求参数
            const httpOptions = {
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
                            value: requestValues,
                        },
                    }
                ),
                // 是否开启防抖(防止重复请求)
                debounce: false,
            }

            // 请求数据
            const { status, data } = $n_isFunction(props.request) ?
                // 如果有自定义请求方法
                await $n_runAsync(props.request)({
                    // http 请求参数
                    httpOptions,
                    // 对话框是否已显示
                    showDialog: showDialog.value,
                }) :
                // 否则请求数据
                await $n_http(httpOptions)

            if (status) {
                if ($n_isValidArray($n_get(data, 'rows'))) {
                    if (! hasAll) {
                        return data.rows
                    }
                    for (const item of data.rows) {
                        all[item[props.valueKey]] = item
                    }
                }
            }

            const newRows = []
            for (const val of value) {
                if ($n_has(all, val)) {
                    newRows.push(all[val])
                }
            }
            return newRows
        }

        /**
         * 获取表格列数据
         */
        function getTableColumns() {

            let columns

            // 如果有声明路由表格列数据
            if ($n_isValidArray(props.columns)) {
                columns = $n_cloneDeep(props.columns)

            // 如果有路由路径
            } else if (routePath) {
                // 否则如果有路由表格列数据
                const rawTableColumns = $n_$table.config(routePath, 'columns')
                if ($n_isValidArray(rawTableColumns)) {
                    columns = $n_cloneDeep(rawTableColumns)
                }
            }

            if ($n_isValidArray(columns)) {
                if ($n_isValidArray(props.hideSearchKeys)) {
                    for (const item of columns) {
                        if (
                            props.hideSearchKeys.indexOf(item.name) > -1
                            && $n_has(item, 'search')
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
            if ($n_isValidArray($table.tableColumns.value)) {

                // 克隆原始表格列数据
                const rawTableColumns = $n_cloneDeep($table.tableColumns.value)

                // 快捷表格显示的属性名称数组
                $n_forEach(currentShowKeys.value, function (key) {
                    for (const item of rawTableColumns) {
                        if (item.name === key) {
                            // 删除搜索字段
                            if ($n_has(item, 'search')) {
                                delete item.search
                            }
                            // 删除可见字段
                            if ($n_has(item, 'visible')) {
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

            const _selected = [...selected.value]
            _selected.splice(index, 1)

            // 触发更新值
            emitModelValue(_selected)
        }

        /**
         * 字段获取焦点触发
         */
        function onFieldFocus(e) {

            // 停止冒泡
            e.stopPropagation()

            // 设置输入框焦点
            setInputFocus()

            // window.scrollTo(window.pageXOffset || window.scrollX || document.body.scrollLeft || 0, 0)
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
        let _popupShowed = false
        function onPopupShow() {

            // 显示弹出层
            showPopup.value = true

            // 设置输入框焦点
            setInputFocus()

            // 如果每次对话框显示都请求
            if (props.requestEveryDialogShow) {
                // 表格重新加载
                $table.tableReload()
                    .finally()
                return
            }

            if (_popupShowed) {
                return
            }
            _popupShowed = true

            // 表格重新加载
            $table.tableReload()
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
         * 对话框显示回调
         */
        let _dialogShowed = false
        function onDialogShow() {

            // 如果每次对话框显示都请求
            if (props.requestEveryDialogShow) {
                // 表格重新加载
                $table.tableReload()
                    .finally()
                return
            }

            if (_dialogShowed) {
                return
            }
            _dialogShowed = true

            // 表格重新加载
            $table.tableReload()
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

            // 获取表格搜索值
            let searchValue = $table.getTableSearchValue()
            if (searchValue.length) {

                // 如果有隐藏搜索字段数组
                if ($n_isValidArray(props.hideSearchKeys)) {
                    // 从搜索值数组中去除隐藏搜索字段的数组
                    searchValue = searchValue.filter(e => $n_indexOf(e.field, props.hideSearchKeys) === -1)
                }

                // 表格搜索重置
                $table.tableSearchReset(isReload && searchValue.length, {
                    showDialog: 1,
                })
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
                const itemIndex = $n_findIndex(_selected, opt)

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

        /**
         * 格式化图片
         */
        function formatImg(img, { count }) {

            // 图片数组
            const imgs = []

            // 转为图片数组
            const arr = $n_split(img, ',')
            for (const item of arr) {
                const src = $n_getImage(item)
                if (src) {
                    imgs.push(item)
                    if (
                        count > 0
                        && imgs.length === count
                    ) {
                        break
                    }
                }
            }

            return imgs
        }

        // ==========【生命周期】=========================================================================================

        /**
         * 在组件因为响应式状态变更而更新其 DOM 树之后调用
         */
        onUpdated(function () {
            if (
                popupRef.value
                && $n_has(popupRef.value, 'currentComponent.ref.updatePosition')
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
            // 是否显示弹出层
            showPopup,
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
            // 对话框显示回调
            onDialogShow,
            // 对话框隐藏后回调
            onDialogHide,
            // 对话框点击确认回调
            onDialogConfirm,

            // 单击快捷表格行
            quickTableRowClick,

            // 触发更新值
            emitModelValue,
            // 格式化图片
            formatImg,
        }
    },
}
</script>

<style lang="scss">
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
