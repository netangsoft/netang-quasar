<template>
    <div class="col-xs-12 row q-col-gutter-lg">

        <!-- 栏目标题 -->
        <n-column-title label="数据配置" />

        <div class="col-xs-12 col-sm-6 col-md-3">
            <slot/>
        </div>

        <template v-if="dataType">

            <!-- 设置重定向 URL -->
            <div class="col-xs-12 col-sm-6 col-md-3" v-if="! url">

                <!-- 树 -->
                <n-field-tree
                    class="n-field-fieldset"
                    :label="dataType === dicts.POWER_DATA_TYPE__OPEN ? '跳转页面' : '重定向 URL'"
                    outlined
                    clearable
                    stack-label
                    dense

                    v-model="formData.toPage"
                    :nodes="treeNodes"
                    :expanded="treeExpanded"
                    strict
                    accordion
                />
            </div>

            <!-- 列表有效 -->
            <template v-if="dataType === dicts.POWER_DATA_TYPE__LIST">

                <!-- 列表选择类型 -->
                <div class="col-xs-12 col-sm-6 col-md-3">
                    <q-select
                        class="n-field-fieldset"
                        label="选择类型"
                        v-model="formData.selection"
                        :options="[
                            { label: '无', value: 'none' },
                            { label: '单选', value: 'single' },
                            { label: '多选', value: 'multiple' },
                        ]"
                        map-options
                        emit-value
                        outlined
                        stack-label
                        dense
                        options-dense
                    />
                </div>

            </template>

            <!-- 非列表有效 -->
            <template v-else>

                <!-- 新窗口有效 -->
                <template v-if="dataType === dicts.POWER_DATA_TYPE__OPEN">

                    <!-- 是否记录来源页面 -->
                    <div class="col-xs-12 col-sm-6 col-md-3">
                        <q-select
                            class="n-field-fieldset"
                            label="来源页面参数"
                            v-model="formData.noFromPageQuery"
                            :options="[
                                { label: '自动添加', value: false },
                                { label: '禁止添加', value: true },
                            ]"
                            map-options
                            emit-value
                            outlined
                            stack-label
                            dense
                            options-dense
                        />
                    </div>

                </template>

                <!-- 非表单显示 -->
                <template v-if="dataType !== dicts.POWER_DATA_TYPE__FORM">

                    <!-- 显示类型 -->
                    <div class="col-xs-12 col-sm-6 col-md-3">
                        <q-select
                            class="n-field-fieldset"
                            label="显示类型"
                            v-model="formData.show"
                            :options="[
                                { label: '始终显示', value: '' },
                                { label: '单选显示', value: 'single' },
                                { label: '多选显示', value: 'multiple' },
                            ]"
                            map-options
                            emit-value
                            outlined
                            stack-label
                            dense
                            options-dense
                        />
                    </div>

                    <!-- 是否固定列 -->
                    <div class="col-xs-12 col-sm-6 col-md-3">
                        <q-select
                            class="n-field-fieldset"
                            label="是否固定列"
                            v-model="formData.fixed"
                            :options="[
                                { label: '否', value: false },
                                { label: '是', value: true },
                            ]"
                            map-options
                            emit-value
                            outlined
                            stack-label
                            dense
                            options-dense
                        />
                    </div>

                    <!-- 是否双击 -->
                    <div class="col-xs-12 col-sm-6 col-md-3">
                        <q-select
                            class="n-field-fieldset"
                            label="是否双击"
                            v-model="formData.dbclick"
                            :options="[
                                { label: '否', value: false },
                                { label: '是', value: true },
                            ]"
                            map-options
                            emit-value
                            outlined
                            stack-label
                            dense
                            options-dense
                        />
                    </div>
                </template>

                <!-- 如果为非新窗口 -->
                <template v-if="dataType !== dicts.POWER_DATA_TYPE__OPEN">

                    <!-- 是否表单验证 -->
                    <div class="col-xs-12 col-sm-6 col-md-3">
                        <q-select
                            class="n-field-fieldset"
                            label="提交前验证表单"
                            v-model="formData.validate"
                            :options="[
                                { label: '关闭表单验证', value: false },
                                { label: '开启表单验证', value: true },
                            ]"
                            map-options
                            emit-value
                            outlined
                            stack-label
                            dense
                            options-dense
                        />
                    </div>

                    <!-- 是否确认 -->
                    <div class="col-xs-12 col-sm-6 col-md-3">
                        <q-select
                            class="n-field-fieldset"
                            label="提交前确认"
                            v-model="formData.confirm"
                            :options="[
                            { label: '否', value: 0 },
                            { label: '提交前确认', value: 1 },
                            { label: '提交前确认登录密码', value: 2 },
                        ]"
                            map-options
                            emit-value
                            outlined
                            stack-label
                            dense
                            options-dense
                        />
                    </div>

                    <!-- 确认提示内容 -->
                    <div class="col-xs-12 col-sm-6 col-md-3" v-if="formData.confirm > 0">
                        <q-input
                            class="n-field-fieldset"
                            label="确认提示内容"
                            v-model="formData.confirmContent"
                            :placeholder="formData.confirm === 1 ? '确认要执行该操作吗？' : '重要操作，请输入登录密码并确认后操作'"
                            outlined
                            clearable
                            stack-label
                            dense
                        />
                    </div>

                    <!-- 请求成功执行 -->
                    <div class="col-xs-12 col-sm-6 col-md-3">
                        <q-select
                            class="n-field-fieldset"
                            label="请求成功执行"
                            v-model="formData.requestSuccess.type"
                            :options="dataType === dicts.POWER_DATA_TYPE__FORM ?
                            [
                                { label: '无', value: '' },
                                { label: '关闭窗口', value: 'close' },
                                { label: '关闭窗口并跳转来源页面', value: 'closePush' },
                                { label: '关闭窗口、跳转并刷新来源页面', value: 'closePushRefresh' },
                                { label: '重置表单', value: 'resetForm' },
                            ] :
                            [
                                { label: '无', value: '' },
                                { label: '关闭窗口', value: 'close' },
                                { label: '关闭窗口并跳转来源页面', value: 'closePush' },
                                { label: '关闭窗口、跳转并刷新来源页面', value: 'closePushRefresh' },
                                { label: '刷新列表', value: 'refreshList' },
                            ]
                        "
                            map-options
                            emit-value
                            outlined
                            stack-label
                            dense
                            options-dense
                        />
                    </div>

                    <!-- 请求成功参数 -->
                    <!--<div class="col-xs-12 col-sm-6 col-md-3" v-if="$n_indexOf(['closePush', 'closePushRefresh'], formData.requestSuccess.type) > -1">-->

                    <!--    &lt;!&ndash; 树 &ndash;&gt;-->
                    <!--    <n-field-tree-->
                    <!--        class="n-field-fieldset"-->
                    <!--        label="跳转页面"-->
                    <!--        outlined-->
                    <!--        clearable-->
                    <!--        stack-label-->
                    <!--        dense-->

                    <!--        v-model="formData.requestSuccess.params"-->
                    <!--        :nodes="treeNodes"-->
                    <!--        :expanded="treeExpanded"-->
                    <!--        strict-->
                    <!--        accordion-->
                    <!--    />-->
                    <!--</div>-->

                </template>

                <!-- 如果为非表单 -->
                <template v-if="dataType !== dicts.POWER_DATA_TYPE__FORM">

                    <!-- 栏目标题 -->
                    <n-column-title label="请求列表参数" tooltip='示例：id / sku_id AS sku' />

                    <!-- 表格请求参数 -->
                    <div class="col-xs-12">
                        <q-list class="rounded-borders" style="max-width:800px" bordered>
                            <q-item
                                v-for="(item, itemIndex) in formData.requestQuery.list"
                            >
                                <q-item-section>
                                    <q-input
                                        class="n-field-fieldset"
                                        v-model="formData.requestQuery.list[itemIndex]"
                                        placeholder="请输入参数"
                                        outlined
                                        clearable
                                        stack-label
                                        dense
                                    />
                                </q-item-section>

                                <q-item-section side>
                                    <div class="text-grey-8 q-gutter-xs">
                                        <q-btn icon="add" size="12px" flat dense round @click="arr.add(formData.requestQuery.list, itemIndex, '')" />
                                        <q-btn icon="remove" size="12px" flat dense round @click="arr.delete(formData.requestQuery.list, itemIndex)" :disable="itemIndex === 0" />
                                        <q-btn icon="expand_less" size="12px" flat dense round @click="arr.up(formData.requestQuery.list, itemIndex)" :disable="itemIndex === 0" />
                                        <q-btn icon="expand_more" size="12px" flat dense round @click="arr.down(formData.requestQuery.list, itemIndex)" :disable="formData.requestQuery.list.length <= itemIndex + 1" />
                                    </div>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </div>
                </template>

                <!-- 栏目标题 -->
                <n-column-title label="请求传参参数" tooltip='示例：id / sku_id AS sku / { "type": 1, "name": "age" }' />

                <!-- 表格请求参数 -->
                <div class="col-xs-12">
                    <q-list class="rounded-borders" style="max-width:800px" bordered>
                        <q-item
                            v-for="(item, itemIndex) in formData.requestQuery.query"
                        >
                            <q-item-section>
                                <q-input
                                    class="n-field-fieldset"
                                    v-model="formData.requestQuery.query[itemIndex]"
                                    placeholder="请输入参数"
                                    outlined
                                    clearable
                                    stack-label
                                    dense
                                />
                            </q-item-section>

                            <q-item-section side>
                                <div class="text-grey-8 q-gutter-xs">
                                    <q-btn icon="add" size="12px" flat dense round @click="arr.add(formData.requestQuery.query, itemIndex, '')" />
                                    <q-btn icon="remove" size="12px" flat dense round @click="arr.delete(formData.requestQuery.query, itemIndex)" :disable="itemIndex === 0" />
                                    <q-btn icon="expand_less" size="12px" flat dense round @click="arr.up(formData.requestQuery.query, itemIndex)" :disable="itemIndex === 0" />
                                    <q-btn icon="expand_more" size="12px" flat dense round @click="arr.down(formData.requestQuery.query, itemIndex)" :disable="formData.requestQuery.query.length <= itemIndex + 1" />
                                </div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>
            </template>

            <!-- 栏目标题 -->
            <n-column-title label="自定义参数" tooltip='示例：123 / id / [1, 2, 3] / { "type": 1, "name": "age" }' />

            <!-- 自定义参数 -->
            <div class="col-xs-12">
                <q-input
                    style="max-width:800px"
                    class="n-field-fieldset"
                    v-model="formData.params"
                    placeholder="请输入参数"
                    outlined
                    clearable
                    stack-label
                    dense
                    autogrow
                />
            </div>
        </template>
    </div>
</template>

<script>
import { ref, watch } from 'vue'

import NColumnTitle from '../../column-title'
import NFieldTree from '../../field-tree'

import $n_has from 'lodash/has'
import $n_isPlainObject from 'lodash/isPlainObject'

import $n_forEach from '@netang/utils/forEach'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_indexOf from '@netang/utils/indexOf'

import $n_isRequired from '@netang/utils/isRequired'
import $n_forIn from '@netang/utils/forIn'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_trimString from '@netang/utils/trimString'
import $n_isJson from '@netang/utils/isJson'
import $n_json from '@netang/utils/json'
import $n_isValidString from '@netang/utils/isValidString'

import $n_arr from '../../../utils/arr'
import $n_toast from '../../../utils/toast'

import { configs } from '../../../utils/config'

const {
    // 字典常量
    dicts,
} = configs

export default {

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: String,
        // URL
        url: String,
        // 数据类型
        dataType: Number,
        // 路由类型
        routeType: Number,
        // 树节点数组
        treeNodes: Array,
        // 树展开节点
        treeExpanded: Array,
    },

    /**
     * 组件
     */
    components: {
        NColumnTitle,
        NFieldTree,
    },

    /**
     * 组合式
     */
    setup(props) {

        // ==========【数据】=============================================================================================

        // 表单数据
        const formData = ref(formatModelValue())

        // ==========【监听数据】=========================================================================================

        /**
         * 监听值
         */
        watch(()=>props.modelValue, function() {

            // 格式化传值
            formData.value = formatModelValue()
        })

        /**
         * 监听数据类型
         */
        watch(()=>props.dataType, function (val) {

            // 如果数据类型为新窗口
            if (val === dicts.POWER_DATA_TYPE__FORM) {
                if (formData.value.requestSuccess.type === 'refreshList') {
                    formData.value.requestSuccess.type = ''
                    formData.value.requestSuccess.params = ''
                }

            // 如果数据类型为数据
            } else if (val === dicts.POWER_DATA_TYPE__DATA) {
                if (formData.value.requestSuccess.type === 'resetForm') {
                    formData.value.requestSuccess.type = ''
                    formData.value.requestSuccess.params = ''
                }
            }
        })

        // ==========【方法】============================================================================================

        /**
         * 格式化传值
         */
        function formatModelValue() {

            let obj = {}

            if ($n_isJson(props.modelValue)) {
                const data = $n_json.parse(props.modelValue)
                if ($n_isValidObject(data)) {
                    obj = data
                }
            }

            // 原始数据默认值
            const rawObj = {
                // 列表选择类型, 可选值 none single(默认) multiple
                selection: '',
                // 显示类型, 可选 single / multiple / 空(默认显示)
                show: '',
                // 禁止添加来源页面参数
                noFromPageQuery: false,
                // 页面 ID (跳转页面 / 重定向 URL)
                toPage: '',
                // 是否固定列
                fixed: false,
                // 是否双击: 可选 true / false
                dbclick: false,
                // 是否表单验证: 可选 true / false
                validate: true,
                // 是否确认: 可选 true / false / 字符串(确认提示的内容)
                confirm: false,
                // 是否确认密码: 可选 true / false / 字符串(确认提示的内容)
                confirmPassword: false,
                // 请求参数
                requestQuery: {
                    // 列表: 字符串组成的数组, 如: [ "id", "sku_id AS sku" ]
                    list: [],
                    // 参数: 字符串 / 对象(自定义参数) 组成的数组, 如: [ "id", "sku_id AS sku", { "type": 1, "name": "age" } ]
                    query: null,
                },
                // 请求成功执行
                requestSuccess: {
                    // 类型, 可选 close / closePush / closePushRefresh / resetForm / refreshList / 空(不执行)
                    type: '',
                    // 参数
                    params: '',
                },
                // 自定义参数, 任意类型
                params: '',
            }

            // 【格式化数据】删除无效键值
            // --------------------------------------------------

            // 原始键值
            const rawKeys = Object.keys(rawObj)

            // 删除数据中的无效键值
            $n_forIn(obj, function (item, key) {
                // 如果键值不在原始键值中
                if (rawKeys.indexOf(key) === -1) {
                    // 则删除
                    delete obj[key]
                }
            })

            // 判断 requestSuccess 值是否合法
            if ($n_has(obj, 'requestSuccess') && ! $n_isValidObject(obj.requestSuccess)) {
                delete(obj.requestSuccess)
            }

            // 判断 requestQuery 值是否合法
            if ($n_has(obj, 'requestQuery') && ! $n_isValidObject(obj.requestQuery)) {
                delete(obj.requestQuery)
            }

            // --------------------------------------------------

            // 合并原始数据
            obj = Object.assign(rawObj, obj)

            // 列表选择类型默认值为 single
            if (! $n_isValidString(obj.selection)) {
                obj.selection = 'single'
            }

            // 【格式化是否确认参数】
            // ------------------------------------------------------------
            // 是否确认, 可选 0:无 / 1:提交前确认 / 2:提交前确认登录密码
            let confirm = 0
            // 确认提示内容
            obj.confirmContent = ''
            if (obj.confirmPassword) {
                confirm = 2
                if ($n_isValidString(obj.confirmPassword)) {
                    obj.confirmContent = obj.confirmPassword
                }
            } else if (obj.confirm) {
                confirm = 1
                if ($n_isValidString(obj.confirm)) {
                    obj.confirmContent = obj.confirm
                }
            }
            obj.confirm = confirm
            delete obj.confirmPassword

            // 【格式化请求参数中的 list】
            // ------------------------------------------------------------
            if ($n_isValidString(obj.requestQuery.list)) {
                obj.requestQuery.list = [obj.requestQuery.list]
            } else if (! $n_isValidArray(obj.requestQuery.list)) {
                obj.requestQuery.list = ['']
            }

            // 【格式化请求参数中的 query】
            // ------------------------------------------------------------
            if ($n_has(obj.requestQuery, 'query')) {

                // 如果是有效值
                if ($n_isValidValue(obj.requestQuery.query)) {
                    obj.requestQuery.query = [obj.requestQuery.query]

                // 如果是有效对象
                } else if ($n_isValidObject(obj.requestQuery.query)) {
                    obj.requestQuery.query = [$n_json.stringify(obj.requestQuery.query)]

                // 如果是有效数组
                } else if ($n_isValidArray(obj.requestQuery.query)) {
                    const query = []
                    $n_forEach(obj.requestQuery.query, function(item) {

                        // 如果是有效值
                        if ($n_isValidValue(item)) {
                            query.push(item)

                        // 如果是对象
                        } else if ($n_isValidObject(item)) {
                            query.push($n_json.stringify(item))
                        }
                    })
                    obj.requestQuery.query = query.length ? query : ['']

                // 否则没有数据
                } else {
                    obj.requestQuery.query = ['']
                }

            // 否则没有数据
            } else {
                obj.requestQuery.query = ['']
            }

            // 【格式化其他参数】
            // ------------------------------------------------------------
            if (! $n_has(obj, 'params')) {
                obj.params = ''

            // 如果不是字符串
            } else if (! $n_isValidString(obj.params)) {
                if ($n_isValidObject(obj.params)) {
                    obj.params = $n_json.stringify(obj.params)
                } else if ($n_isValidArray(obj.params)) {
                    obj.params = $n_json.stringify(obj.params)
                } else {
                    obj.params = ''
                }
            }
            // ------------------------------------------------------------

            return obj
        }

        /**
         * 获取格式化后的表单数据
         */
        function getValue() {

            const obj = {}

            // 获取表单数据
            const data = formData.value

            // 如果有选择数据类型
            if (props.dataType) {

                // 设置请求参数
                function setRequestQuery(field) {

                    // 请求表格参数
                    const lists = []

                    $n_forEach(data.requestQuery[field], function(value) {

                        value = formatParams(value)

                        // 如果有值
                        if ($n_isRequired(value)) {

                            // 如果为表格
                            if (field === 'list') {

                                if (Array.isArray(value) || $n_isPlainObject(value)) {

                                    // 轻提示
                                    $n_toast({
                                        message: '请求列表参数格式不能是数组或对象',
                                    })
                                    return false
                                }

                            // 否则为参数
                            } else if (Array.isArray(value)) {
                                // 轻提示
                                $n_toast({
                                    message: '请求传参参数格式不能是数组',
                                })
                                return false
                            }

                            // 如果是字符串
                            lists.push(value)
                        }
                    })

                    if (lists.length) {
                        if (! $n_has(obj, 'requestQuery')) {
                            obj.requestQuery = {}
                        }
                        obj.requestQuery[field] = lists.length === 1 ? lists[0] : lists
                    }

                    return true
                }

                // 格式化其他参数
                function formatParams(value) {
                    value = $n_trimString(value)
                    if (
                        (value.startsWith('[') || value.startsWith('{'))
                        && $n_isJson(value)
                    ) {
                        value = $n_json.parse(value)

                        if (! Array.isArray(value) && ! $n_isPlainObject(value)) {
                            return ''
                        }
                    }
                    return value
                }

                // 如果列表显示
                // --------------------------------------------------
                if (props.dataType === dicts.POWER_DATA_TYPE__LIST) {

                    // 列表选择类型
                    if ($n_indexOf(['none', 'multiple'], data.selection) > -1) {
                        obj.selection = data.selection
                    }

                } else {

                    // 如果表单显示
                    // --------------------------------------------------
                    if (props.dataType === dicts.POWER_DATA_TYPE__FORM) {

                        // 关闭表单验证(默认开启)
                        if (data.validate === false) {
                            obj.validate = false
                        }

                    // 如果非表单显示
                    } else {

                        // 显示类型
                        if (data.show) {
                            obj.show = data.show
                        }

                        // 是否固定列
                        if (data.fixed) {
                            obj.fixed = data.fixed
                        }

                        // 是否双击
                        if (data.dbclick) {
                            obj.dbclick = data.dbclick
                        }

                        // 请求表格参数
                        if (setRequestQuery('list') === false) {
                            return false
                        }
                    }

                    // 请求传参参数
                    if (setRequestQuery('query') === false) {
                        return false
                    }

                    // 如果数据类型为新窗口
                    if (props.dataType === dicts.POWER_DATA_TYPE__OPEN) {

                        // 如果是非路由
                        if (props.routeType === 0) {

                            // 如果没有选择跳转页面
                            if (! data.toPage) {
                                // 轻提示
                                $n_toast({
                                    message: '请选择跳转页面',
                                })
                                return false
                            }
                        }

                        // 如果禁止添加来源页面参数
                        if (data.noFromPageQuery) {
                            obj.noFromPageQuery = true
                        }

                    // 否则为其他
                    } else {

                        // 是否确认
                        if (data.confirm) {

                            // 如果是(1:提交前确认)
                            if (data.confirm === 1) {
                                obj.confirm = $n_isValidString(data.confirmContent) ? data.confirmContent : true

                                // 否则是(2:提交前确认登录密码)
                            } else {
                                obj.confirmPassword = $n_isValidString(data.confirmContent) ? data.confirmContent : true
                            }
                        }

                        // 请求成功执行
                        if (data.requestSuccess.type) {
                            obj.requestSuccess = {
                                type: data.requestSuccess.type
                            }
                            // if ($n_indexOf(['closePush', 'closePushRefresh'], data.requestSuccess.type) > -1) {
                            //     if (data.requestSuccess.params) {
                            //         obj.requestSuccess.params = data.requestSuccess.params
                            //     } else {
                            //         obj.requestSuccess.type = 'close'
                            //     }
                            // }
                        }
                    }
                }

                // 如果有 跳转页面 / 重定向 URL
                if ($n_isValidValue(data.toPage)) {

                    // 如果定义了 url
                    if ($n_isValidValue(props.url)) {
                        // 轻提示
                        $n_toast({
                            message: `如果定义了【${props.dataType === dicts.POWER_DATA_TYPE__OPEN ? '跳转页面' : '重定向 URL'}】，则 URL 必须为空`,
                        })
                        return false
                    }

                    // 设置跳转页面 id
                    obj.toPage = data.toPage
                }

                // 自定义参数
                const params = formatParams(data.params)
                if ($n_isRequired(params)) {
                    obj.params = params
                }
            }

            // 转为 json
            return $n_isValidObject(obj) ? $n_json.stringify(obj) : ''
        }

        // ==========【返回】=============================================================================================

        return {
            // 表单数据
            formData,

            // 获取格式化后的表单数据
            getValue,

            dicts,
            arr: $n_arr,
        }
    }
}
</script>
