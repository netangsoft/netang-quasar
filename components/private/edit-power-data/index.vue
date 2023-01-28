<template>
    <div class="col-xs-12 row q-col-gutter-lg">

        <!-- 栏目标题 -->
        <n-column-title label="数据配置" />

        <div class="col-xs-12 col-sm-6 col-md-3">
            <slot/>
        </div>

        <template v-if="dataType">

            <!-- 新窗口有效 -->
            <template v-if="dataType === dicts.POWER_DATA_TYPE__OPEN">

                <!-- 设置跳转页面(没有路由类型) -->
                <div class="col-xs-12 col-sm-6 col-md-3" v-if="routeType === 0">

                    <!-- 树 -->
                    <n-field-tree
                        class="n-field-fieldset"
                        label="跳转页面"
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

                <!-- 是否记录来源页面 -->
                <div class="col-xs-12 col-sm-6 col-md-3">
                    <q-select
                        class="n-field-fieldset"
                        label="是否增加来源页面参数"
                        v-model="formData.addFromPageQuery"
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
                            { label: '多选显示', value: 'multi' },
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

            <template v-if="dataType !== dicts.POWER_DATA_TYPE__OPEN">

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
                            { label: '刷新列表', value: 'refreshTable' },
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
                <!--<div class="col-xs-12 col-sm-6 col-md-3" v-if="utils.indexOf(['closePush', 'closePushRefresh'], formData.requestSuccess.type) > -1">-->

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

            <template v-if="dataType !== dicts.POWER_DATA_TYPE__FORM">

                <!-- 栏目标题 -->
                <n-column-title label="请求列表参数" tooltip='示例：id / sku_id AS sku' />

                <!-- 表格请求参数 -->
                <div class="col-xs-12">
                    <q-list class="rounded-borders" style="max-width:800px" bordered>
                        <q-item
                            v-for="(item, itemIndex) in formData.requestQuery.table"
                        >
                            <q-item-section>
                                <q-input
                                    class="n-field-fieldset"
                                    v-model="formData.requestQuery.table[itemIndex]"
                                    placeholder="请输入参数"
                                    outlined
                                    clearable
                                    stack-label
                                    dense
                                />
                            </q-item-section>

                            <q-item-section side>
                                <div class="text-grey-8 q-gutter-xs">
                                    <q-btn icon="add" size="12px" flat dense round @click="utils.arr.add(formData.requestQuery.table, itemIndex, '')" />
                                    <q-btn icon="remove" size="12px" flat dense round @click="utils.arr.delete(formData.requestQuery.table, itemIndex)" :disable="itemIndex === 0" />
                                    <q-btn icon="expand_less" size="12px" flat dense round @click="utils.arr.up(formData.requestQuery.table, itemIndex)" :disable="itemIndex === 0" />
                                    <q-btn icon="expand_more" size="12px" flat dense round @click="utils.arr.down(formData.requestQuery.table, itemIndex)" :disable="formData.requestQuery.table.length <= itemIndex + 1" />
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
                                <q-btn icon="add" size="12px" flat dense round @click="utils.arr.add(formData.requestQuery.query, itemIndex, '')" />
                                <q-btn icon="remove" size="12px" flat dense round @click="utils.arr.delete(formData.requestQuery.query, itemIndex)" :disable="itemIndex === 0" />
                                <q-btn icon="expand_less" size="12px" flat dense round @click="utils.arr.up(formData.requestQuery.query, itemIndex)" :disable="itemIndex === 0" />
                                <q-btn icon="expand_more" size="12px" flat dense round @click="utils.arr.down(formData.requestQuery.query, itemIndex)" :disable="formData.requestQuery.query.length <= itemIndex + 1" />
                            </div>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>

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

export default {

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: String,
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
                if (formData.value.requestSuccess.type === 'refreshTable') {
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

            if (utils.isJson(props.modelValue)) {
                const data = utils.json.parse(props.modelValue)
                if (utils.isValidObject(data)) {
                    obj = data
                }
            }

            // 原始数据默认值
            const rawObj = {
                // 显示类型, 可选 single / multi / 空(默认显示)
                show: '',
                // 是否增加来源页面参数
                addFromPageQuery: false,
                // 跳转页面 id
                toPage: '',
                // 是否固定列
                fixed: false,
                // 是否双击: 可选 true / false
                dbclick: false,
                // 是否确认: 可选 true / false / 字符串(确认提示的内容)
                confirm: false,
                // 是否确认密码: 可选 true / false / 字符串(确认提示的内容)
                confirmPassword: false,
                // 请求参数
                requestQuery: {
                    // 表格: 字符串组成的数组, 如: [ "id", "sku_id AS sku" ]
                    table: [],
                    // 参数: 字符串 / 对象(自定义参数) 组成的数组, 如: [ "id", "sku_id AS sku", { "type": 1, "name": "age" } ]
                    query: null,
                },
                // 请求成功执行
                requestSuccess: {
                    // 类型, 可选 close / closePush / closePushRefresh / resetForm / refreshTable / 空(不执行)
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
            utils.forIn(obj, function (item, key) {
                // 如果键值不在原始键值中
                if (rawKeys.indexOf(key) === -1) {
                    // 则删除
                    delete obj[key]
                }
            })

            // 判断 requestSuccess 值是否合法
            if (_.has(obj, 'requestSuccess') && ! utils.isValidObject(obj.requestSuccess)) {
                delete(obj.requestSuccess)
            }

            // 判断 requestQuery 值是否合法
            if (_.has(obj, 'requestQuery') && ! utils.isValidObject(obj.requestQuery)) {
                delete(obj.requestQuery)
            }

            // --------------------------------------------------

            // 合并原始数据
            obj = Object.assign(rawObj, obj)

            // 【格式化是否确认参数】
            // ------------------------------------------------------------
            // 是否确认, 可选 0:无 / 1:提交前确认 / 2:提交前确认登录密码
            let confirm = 0
            // 确认提示内容
            obj.confirmContent = ''
            if (obj.confirmPassword) {
                confirm = 2
                if (utils.isValidString(obj.confirmPassword)) {
                    obj.confirmContent = obj.confirmPassword
                }
            } else if (obj.confirm) {
                confirm = 1
                if (utils.isValidString(obj.confirm)) {
                    obj.confirmContent = obj.confirm
                }
            }
            obj.confirm = confirm
            delete obj.confirmPassword

            // 【格式化请求参数中的 table】
            // ------------------------------------------------------------
            if (utils.isValidString(obj.requestQuery.table)) {
                obj.requestQuery.table = [obj.requestQuery.table]
            } else if (! utils.isValidArray(obj.requestQuery.table)) {
                obj.requestQuery.table = ['']
            }

            // 【格式化请求参数中的 query】
            // ------------------------------------------------------------
            if (_.has(obj.requestQuery, 'query')) {

                // 如果是有效值
                if (utils.isValidValue(obj.requestQuery.query)) {
                    obj.requestQuery.query = [obj.requestQuery.query]

                // 如果是有效对象
                } else if (utils.isValidObject(obj.requestQuery.query)) {
                    obj.requestQuery.query = [utils.json.stringify(obj.requestQuery.query)]

                // 如果是有效数组
                } else if (utils.isValidArray(obj.requestQuery.query)) {
                    const query = []
                    utils.forEach(obj.requestQuery.query, function(item, key) {

                        // 如果是有效值
                        if (utils.isValidValue(item)) {
                            query.push(item)

                        // 如果是对象
                        } else if (utils.isValidObject(item)) {
                            query.push(utils.json.stringify(item))
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
            if (! _.has(obj, 'params')) {
                obj.params = ''

            // 如果不是字符串
            } else if (! utils.isValidString(obj.params)) {
                if (utils.isValidObject(obj.params)) {
                    obj.params = utils.json.stringify(obj.params)
                } else if (utils.isValidArray(obj.params)) {
                    obj.params = utils.json.stringify(obj.params)
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

                    utils.forEach(data.requestQuery[field], function(value) {

                        value = formatParams(value)

                        // 如果有值
                        if (utils.isRequired(value)) {

                            // 如果为表格
                            if (field === 'table') {

                                if (Array.isArray(value) || _.isPlainObject(value)) {

                                    // 轻提示
                                    utils.toast({
                                        message: '请求列表参数格式不能是数组或对象',
                                    })
                                    return false
                                }

                            // 否则为参数
                            } else if (Array.isArray(value)) {
                                // 轻提示
                                utils.toast({
                                    message: '请求传参参数格式不能是数组',
                                })
                                return false
                            }

                            // 如果是字符串
                            lists.push(value)
                        }
                    })

                    if (lists.length) {
                        if (! _.has(obj, 'requestQuery')) {
                            obj.requestQuery = {}
                        }
                        obj.requestQuery[field] = lists.length === 1 ? lists[0] : lists
                    }

                    return true
                }

                // 格式化其他参数
                function formatParams(value) {
                    value = utils.trimString(value)
                    if (
                        (value.startsWith('[') || value.startsWith('{'))
                        && utils.isJson(value)
                    ) {
                        value = utils.json.parse(value)

                        if (! Array.isArray(value) && ! _.isPlainObject(value)) {
                            return ''
                        }
                    }
                    return value
                }

                // 如果非表单显示
                // --------------------------------------------------
                if (props.dataType !== dicts.POWER_DATA_TYPE__FORM) {

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
                    if (setRequestQuery('table') === false) {
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
                            utils.toast({
                                message: '请选择跳转页面',
                            })
                            return false
                        }

                        // 设置跳转页面 id
                        obj.toPage = data.toPage
                    }

                    // 如果增加来源页面参数
                    if (data.addFromPageQuery) {
                        obj.addFromPageQuery = true
                    }

                // 否则为其他
                } else {

                    // 是否确认
                    if (data.confirm) {

                        // 如果是(1:提交前确认)
                        if (data.confirm === 1) {
                            obj.confirm = utils.isValidString(data.confirmContent) ? data.confirmContent : true

                        // 否则是(2:提交前确认登录密码)
                        } else {
                            obj.confirmPassword = utils.isValidString(data.confirmContent) ? data.confirmContent : true
                        }
                    }

                    // 请求成功执行
                    if (data.requestSuccess.type) {
                        obj.requestSuccess = {
                            type: data.requestSuccess.type
                        }
                        // if (utils.indexOf(['closePush', 'closePushRefresh'], data.requestSuccess.type) > -1) {
                        //     if (data.requestSuccess.params) {
                        //         obj.requestSuccess.params = data.requestSuccess.params
                        //     } else {
                        //         obj.requestSuccess.type = 'close'
                        //     }
                        // }
                    }
                }

                // 自定义参数
                const params = formatParams(data.params)
                if (utils.isRequired(params)) {
                    obj.params = params
                }
            }

            // 转为 json
            return utils.isValidObject(obj) ? utils.json.stringify(obj) : ''
        }

        // ==========【返回】=============================================================================================

        return {
            // 表单数据
            formData,

            // 获取格式化后的表单数据
            getValue,
        }
    }
}
</script>
