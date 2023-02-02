<template>
    <q-field
        class="n-field-tree"
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

                <template v-if="treeTickedNodes.length">

                    <!-- 多选插槽 -->
                    <slot
                        name="selected"
                        :ticked="treeTickedNodes"
                        :remove="onRemoveItem"
                        v-if="$slots.ticked"
                    />

                    <!-- 显示折叠的值数量 -->
                    <q-chip
                        dense
                        :label="`+${treeTickedNodes.length}`"
                        v-else-if="collapseTags"
                    />

                    <!-- 多选标签 -->
                    <template v-else>
                        <q-chip
                            v-for="(item, index) in treeTickedNodes"
                            :key="`item-${index}`"
                            :label="item.label"
                            dense
                            removable
                            @remove="onRemoveItem(index)"
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

        <template v-slot:before v-if="$slots.before">
            <slot name="before" />
        </template>
        <template v-slot:prepend v-if="$slots.prepend">
            <slot name="prepend" />
        </template>
        <template v-slot:append v-if="$slots.append">
            <slot name="append" />
        </template>
        <template v-slot:after v-if="$slots.after">
            <slot name="after" />
        </template>

        <!-- 弹出层代理 -->
        <q-popup-proxy
            ref="popupRef"
            no-refocus
            no-focus
            fit
            @focus="onFieldFocus"
            @show="onPopupShow"
            @before-hide="showPopup = false"
            v-if="! readonly"
        >
            <q-card>
                <!-- 树 -->
                <q-tree
                    class="q-pa-sm q-pr-md"
                    style="min-width:260px;"
                    ref="treeRef"
                    :filter="inputValue"
                    :nodes="nodes"
                    :node-key="nodeKey"
                    :label-key="labelKey"
                    :ticked="treeTicked"
                    @update:ticked="emitModelValue"
                    v-model:expanded="treeExpanded"
                    :tick-strategy="currentTickStrategy"
                    :accordion="accordion"
                >
                    <template v-slot:default-header="{ node }">
                        <div
                            class="cursor-pointer full-width"
                            :class="{
                                'text-primary': utils.indexOf(treeTicked, node.id) > -1,
                            }"
                            @click="onNode($event, node)"
                        >{{node.label}}</div>
                    </template>
                </q-tree>
            </q-card>
        </q-popup-proxy>
    </q-field>
</template>

<script>
import { ref, computed, watch, onMounted, onUpdated } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NFieldTree',

    /**
     * 声明属性
     */
    props: {
        // 值 v-model
        modelValue: {
            required: true,
        },
        // 树展开节点
        expanded: Array, // v-model:expanded
        // 节点数组
        nodes: Array,
        // 唯一的节点 id
        nodeKey: {
            type: String,
            default: 'id',
        },
        // label 字段
        labelKey: {
            type: String,
            default: 'label',
        },
        // 是否可选任意一级(true:可选任意一级, false: 仅能选叶子节点)
        strict: Boolean,
        // 是否多选
        multiple: Boolean,
        // 手风琴模式
        accordion: Boolean,
        // 输入框中是否显示选中值的完整路径
        showAllLevels: {
            type: Boolean,
            default: true,
        },

        // 是否开启筛选
        filter: Boolean,
        // 多选模式下是否折叠 Tag
        collapseTags: Boolean,
        // 占位符
        placeholder: String,
        // 是否可清除
        clearable: Boolean,
        // 是否只读
        readonly: Boolean,
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

        // ==========【计算属性】=========================================================================================

        /**
         * 显示值
         */
        const showValue = computed(function () {

            // 如果有已选数据
            return utils.isValidArray(treeTickedNodes.value)
                // 取已选数据第一条的标签
                ? treeTickedNodes.value[0].label
                : ''
        })

        // ==========【数据】============================================================================================

        // 输入框节点
        const inputRef = ref(null)

        // 输入框值
        const inputValue = ref('')

        // 弹出层节点
        const popupRef = ref(null)

        // 是否显示弹出层
        const showPopup = ref(false)

        // 树节点
        const treeRef = ref(null)

        // tree all
        let treeAll = getTreeAll()

        // 树展开数据
        const treeExpanded = ref(getExpanded())

        // 树选择数据
        const treeTicked = ref(formatModelValue(props.modelValue))

        // ==========【计算属性】=========================================================================================

        /**
         * 当前节点选择策略
         */
        const currentTickStrategy = computed(function () {
            return props.multiple ? (
                props.strict ? 'strict' : 'leaf'
            ) : 'none'
        })

        /**
         * 树选择节点数据
         */
        const treeTickedNodes = computed(function () {

            const lists = []

            utils.forEach(treeTicked.value, function (treeKey) {

                // 获取树选择的节点
                if (_.has(treeAll, treeKey)) {
                    lists.push({
                        id: treeKey,
                        label: treeAll[treeKey][props.showAllLevels ? 'path' : 'label'],
                    })
                }
            })

            return lists
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听节点数组
         */
        watch(() => props.nodes, function () {
            // 更新 tree all
            treeAll = getTreeAll()
        })

        /**
         * 监听声明值
         */
        watch(() => props.modelValue, function(val) {

            // 设置选中数据
            treeTicked.value = formatModelValue(val)

            // 设置输入框焦点
            setInputFocus()

            // 设置输入框文字选中
            setInputSelection()
        })

        /**
         * 监听输入框值
         */
        watch(inputValue, function (val) {
            if (
                // 如果弹出层是隐藏的
                ! showPopup.value
                // 如果输入框有值
                && utils.isValidValue(val)
            ) {
                // 显示弹出层
                popupRef.value.show()
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 获取 tree all
         */
        function getTreeAll() {

            const all = {}

            // 获取子节点
            function getChildren(data, pid, pPath) {
                for (const item of data) {

                    const label = item[props.labelKey]

                    const path = pPath ? (pPath + ' / ' + label) : label

                    all[item[props.nodeKey]] = {
                        id: item[props.nodeKey],
                        pid,
                        label,
                        children: item.children,
                        path,
                    }

                    // 如果是父节点
                    if (utils.isValidArray(item.children)) {
                        getChildren(item.children, item.id, path)
                    }
                }
            }

            if (utils.isValidArray(props.nodes)) {
                getChildren(props.nodes, 0, '')
            }

            return all
        }

        /**
         * 获取展开节点数组
         */
        function getExpanded() {

            let expanded = []

            if (
                // 如果是单选
                ! props.multiple
                // 如果有值
                && utils.isRequired(props.modelValue)
                // 存在节点
                && _.has(treeAll, props.modelValue)
            ) {
                // 获取父节点
                function getParent({ id, pid, children }) {

                    // 如果是父级节点
                    if (utils.isValidArray(children)) {
                        // 设为展开
                        expanded.push(id)
                    }

                    // 如果有父节点, 则继续向上寻找
                    if (pid && _.has(treeAll, pid)) {
                        getParent(treeAll[pid])
                    }
                }

                getParent(treeAll[props.modelValue])
            }

            if (props.expanded) {
                expanded = _.uniq(_.concat(expanded, props.expanded))
            }

            return expanded
        }

        /**
         * 格式化传值
         */
        function formatModelValue(val) {

            // 如果是多选
            if (props.multiple) {
                return utils.isValidArray(val) ? val : []
            }

            // 如果为有效值
            if (utils.isRequired(val)) {
                return [ val ]
            }

            return []
        }

        /**
         * 触发更新值
         */
        function emitModelValue(val) {

            // 触发更新值
            emit('update:modelValue', val)
        }

        /**
         * 点击节点
         */
        function onNode(e, { id, label, children }) {

            // 如果是多选
            if (props.multiple) {

                // 如果是父节点
                if (utils.isValidArray(children)) {

                    // 则无任何操作
                    return
                }

                // 克隆已选树数据
                const _ticked = [...treeTicked.value]

                // 获取值在树数据中的索引
                const index = utils.indexOf(_ticked, id)

                // 如果在数据中
                if (index > -1) {
                    // 则删除
                    _ticked.splice(index, 1)
                // 否则
                } else {
                    // 添加
                    _ticked.push(id)
                }

                // 触发更新值
                // 设置树选择数据
                emitModelValue(_ticked)

            // 否则是单选
            } else {

                if (
                    // 如果是父节点
                    utils.isValidArray(children)
                    // 如果仅可选择叶子节点
                    && ! props.strict
                ) {
                    // 则无任何操作
                    return
                }

                // 触发更新值
                // 设置树选择数据
                emitModelValue(id)

                // 则停止冒泡
                e.preventDefault()
                e.stopPropagation()

                // 则关闭弹出层
                popupRef.value.hide()
            }
        }

        /**
         * 移除单个节点
         */
        function onRemoveItem(index) {

            // 克隆已选树数据
            const _ticked = [...treeTicked.value]

            // 删除该节点
            _ticked.splice(index, 1)

            // 触发更新值
            // 设置树选择数据
            emitModelValue(_ticked)
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
            // 清空树数据
            emitModelValue(props.multiple ? [] : null)

            // 隐藏弹出层
            popupRef.value.hide()
        }

        /**
         * 弹出层显示回调
         */
        function onPopupShow() {

            // 显示弹出层
            showPopup.value = true

            // 设置输入框焦点
            setInputFocus()
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
            if (_.has(popupRef.value, 'currentComponent.ref.updatePosition')) {
                popupRef.value.currentComponent.ref.updatePosition()
            }
        })

        // ==========【返回】=============================================================================================

        return {
            // 显示值
            showValue,
            // 输入框节点
            inputRef,
            // 输入框值
            inputValue,
            // 弹出层节点
            popupRef,
            // 是否显示弹出层
            showPopup,
            // 树节点
            treeRef,
            // 树选择数据
            treeTicked,
            // 树选择节点数据
            treeTickedNodes,
            // 树展开数据
            treeExpanded,
            // 当前节点选择策略
            currentTickStrategy,

            // 触发更新值
            emitModelValue,
            // 点击节点
            onNode,
            // 移除单个
            onRemoveItem,

            // 字段获取焦点触发
            onFieldFocus,
            // 字段失去焦点触发
            onFieldBlur,
            // 字段清空触发
            onFieldClear,

            // 弹出层显示回调
            onPopupShow,
        }
    },
}
</script>

<style lang="scss">
@import "@/assets/sass/var.scss";

.n-field-tree {
    .q-field__input--padding {
        padding-left: 4px;
        min-width: 50px !important;
        cursor: text;
    }
}
</style>
