<template>
    <q-field
        :class="fieldFocused ? 'q-field--float q-field--focused q-field--highlighted' : ''"
        :model-value="modelValue"
        @clear="onClear"
        v-bind="$attrs"
    >
        <template v-slot:control>

            <!-- 如果有值 -->
            <template v-if="treeTickedNodes.length">

                <!-- 如果显示单个值 -->
                <div v-if="! multiple">{{treeTickedNodes[0].label}}</div>

                <!-- 显示折叠的值数量 -->
                <div v-else-if="collapseTags">
                    <q-chip dense>+{{treeTickedNodes.length}}</q-chip>
                </div>

                <!-- 否则显示多个值 -->
                <q-chip
                    v-for="(item, itemIndex) in treeTickedNodes"
                    :key="`item-${item.id}`"
                    @remove="onRemoveItem(itemIndex)"
                    removable
                    dense
                    v-else
                >{{item.label}}</q-chip>
            </template>

            <!-- 否则显示占位符 -->
            <div class="n-placeholder" v-else-if="placeholder">{{placeholder}}</div>
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
            @before-show="onPopupBeforeShow"
            @before-hide="onPopupBeforeHide"
            v-if="! readonly"
        >
            <q-card>
                <!-- 树 -->
                <q-tree
                    class="q-pa-sm q-pr-md"
                    style="min-width:260px;"
                    ref="treeRef"
                    :nodes="nodes"
                    :node-key="nodeKey"
                    :label-key="labelKey"
                    v-model:expanded="treeExpanded"
                    :tick-strategy="currentTickStrategy"
                    :ticked="treeTicked"
                    @update:ticked="onUpdateTicked"
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
import { ref, computed, watch } from 'vue'

export default {

    /**
     * 标识
     */
    name: 'NFieldTree',

    /**
     * 声明属性
     */
    props: {
        // 是否只读
        readonly: Boolean,
        // 值
        modelValue: [Array, String, Number],
        // 树展开节点
        expanded: Array, // v-model:expanded
        // 占位符
        placeholder: String,
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
        // 多选模式下是否折叠 Tag
        collapseTags: Boolean,
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

        // ==========【数据】============================================================================================

        // 字段组件获取焦点
        const fieldFocused = ref(false)
        // 弹出层节点
        const popupRef = ref(null)
        // 树节点
        const treeRef = ref(null)
        // 树选择数据
        const treeTicked = ref(formatModelValue())
        // tree all
        let treeAll = getTreeAll()
        // 树展开数据
        const treeExpanded = ref(getExpanded())

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
        watch(()=>props.nodes, function () {
            // 更新 tree all
            treeAll = getTreeAll()
        })

        /**
         * 监听声明值
         */
        watch(()=>props.modelValue, function() {
            treeTicked.value = formatModelValue()
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
                    if (utils.isFillArray(item.children)) {
                        getChildren(item.children, item.id, path)
                    }
                }
            }

            if (utils.isFillArray(props.nodes)) {
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
                    if (utils.isFillArray(children)) {
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
        function formatModelValue() {
            if (props.multiple) {
                if (utils.isFillArray(props.modelValue)) {
                    return props.modelValue
                }
                return []
            }

            if (utils.isRequired(props.modelValue)) {
                return [props.modelValue]
            }

            return []
        }

        /**
         * 更新选择树数据回调
         */
        function onUpdateTicked(val) {
            emit('update:modelValue', val)
        }

        /**
         * 点击节点
         */
        function onNode(e, { id, label, children }) {

            // 如果是多选
            if (props.multiple) {

                // 如果是父节点
                if (utils.isFillArray(children)) {
                    // 则无任何操作
                    return
                }

                const newTicked = [...treeTicked.value]

                // 如果在数据中
                const index = utils.indexOf(newTicked, id)
                if (index > -1) {
                    newTicked.splice(index, 1)
                } else {
                    newTicked.push(id)
                }

                // 设置树选择数据
                emit('update:modelValue', newTicked)

            } else {

                if (
                    // 如果是父节点
                    utils.isFillArray(children)
                    // 如果仅可选择叶子节点
                    && ! props.strict
                ) {
                    // 则无任何操作
                    return
                }

                // 设置树选择数据
                emit('update:modelValue', id)

                // 则停止冒泡
                e.preventDefault()
                e.stopPropagation()

                // 则关闭弹出层
                popupRef.value.hide()
            }
        }

        /**
         * 移除单个
         */
        function onRemoveItem(index) {
            const newValue = [...treeTicked.value]
            newValue.splice(index, 1)
            emit('update:modelValue', newValue)
        }

        /**
         * 弹出层显示前回调
         */
        function onPopupBeforeShow() {

            // 字段组件获取焦点
            fieldFocused.value = true
        }

        /**
         * 弹出层隐藏前回调
         */
        function onPopupBeforeHide() {

            // 字段组件失去焦点
            fieldFocused.value = false
        }

        /**
         * 清空
         */
        function onClear() {
            emit('update:modelValue', props.multiple ? [] : null)
            popupRef.value.hide()
        }

        // ==========【返回】=============================================================================================

        return {
            // 字段组件获取焦点
            fieldFocused,
            // 弹出层节点
            popupRef,
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

            // 更新选择树数据回调
            onUpdateTicked,
            // 点击节点
            onNode,
            // 清空
            onClear,
            // 移除单个
            onRemoveItem,

            // 弹出层显示前回调
            onPopupBeforeShow,
            // 弹出层隐藏前回调
            onPopupBeforeHide,
        }
    },
}
</script>
