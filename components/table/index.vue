<template>
    <q-table
        class="n-table"
        :columns="columns"
        :rows="currentRows"
        :virtual-scroll-slice-size="virtualScrollItemSize"
        v-bind="$attrs"
    >
        <!-- 展开子数据插槽 -->
        <template
            v-slot:[slotNames.expandName]="props"
            v-if="hasChildren"
        >
            <q-td
                :style="{ paddingLeft: (meta[props.key].level * 16) + 'px' }"
                :props="props"
            >
                <!-- 旋转器 -->
                <q-spinner
                    class="q-tree__spinner q-ml-sm"
                    :color="controlColor"
                    v-if="meta[props.key].lazy === 'loading'"
                />

                <!-- 箭头 -->
                <q-icon
                    class="q-tree__arrow q-ml-sm"
                    :name="computedIcon"
                    :color="iconColor"
                    :class="`${meta[props.key].expanded ? 'q-tree__arrow--rotate' : ''}`"
                    @click="onExpandClick(props, $event)"
                    v-if="meta[props.key].isParent"
                />
                <span class="q-icon n-table__arrow-noop q-ml-sm" style="" v-else></span>

                <!-- 如果有插槽 -->
                <slot
                    :name="slotNames.expandName"
                    v-bind="props"
                    v-if="slotNames.hasExpandSlot"
                />
                <!-- 否则显示值 -->
                <span v-else>{{getCellValue(props.col, props.row)}}</span>

                <q-icon
                    name="add"
                    @click="onExpandClick(props, $event)"
                />
            </q-td>
        </template>

        <!-- 单元格插槽 -->
        <template
            v-for="slotName in slotNames.bodyCell"
            v-slot:[slotName]="props"
        >
            <q-td :props="props">
                <slot
                    :name="slotName"
                    v-bind="props"
                />
            </q-td>
        </template>

        <!-- 其他插槽 -->
        <template
            v-for="slotName in slotNames.other"
            v-slot:[slotName]="props"
        >
            <slot
                :name="slotName"
                v-bind="props"
            />
        </template>

    </q-table>
</template>

<script>
import { computed, ref, getCurrentInstance, nextTick } from 'vue'
import { stopAndPrevent } from 'quasar/src/utils/event'

import $n_has from 'lodash/has'

import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_indexOf from '@netang/utils/indexOf'
import $n_forIn from '@netang/utils/forIn'

export default {

    /**
     * 标识
     */
    name: 'NTable',

    /**
     * 声明属性
     */
    props: {
        // 行数据
        rows: {
            type: Array,
            default: () => []
        },
        // 定义每一行的唯一键的每一行属性
        rowKey: {
            type: [ String, Function ],
            default: 'id'
        },
        // 头部列数据
        columns: Array,
        // 已展开数据数组
        expanded: Array, // v-model:expanded
        // 以像素为单位的默认行大小
        virtualScrollItemSize: {
            type: [ Number, String ],
            default: 50,
        },

        // 【覆盖声明】-------------------------------------------------------

        // 是否默认展开所有行, 当 Table 包含展开行存在或者为树形表格时有效
        defaultExpandAll: Boolean,
        // 子数据属性名称
        childrenKey: {
            type: String,
            default: 'children'
        },
        icon: String,
        iconColor: String,
        controlColor: String,
    },

    /**
     * 组合式
     */
    setup(props, { slots, emit }) {

        const { proxy } = getCurrentInstance()
        const { $q } = proxy

        // 懒加载
        const lazy = ref({})
        // 已展开节点数组
        const innerExpanded = ref(props.expanded || [])

        // ==========【计算属性】==========================================================================================

        /**
         * 获取每一行的唯一键的每一行属性
         */
        const getRowKey = computed(() => (
            typeof props.rowKey === 'function'
                ? props.rowKey
                : row => row[ props.rowKey ]
        ))

        /**
         * 图标
         */
        const computedIcon = computed(() => props.icon || $q.iconSet.tree.icon)

        /**
         * 是否有子数据
         */
        const hasChildren = computed(function() {
            if (
                $n_isValidArray(props.rows)
                && $n_isValidArray(props.columns)
                && props.columns[0].name
            ) {
                for (const item of props.rows) {
                    // 如果有子数据
                    if (
                        $n_has(item, props.childrenKey)
                        && $n_isValidArray(item[props.childrenKey])
                    ) {
                        return true
                    }
                }
            }
            return false
        })

        /**
         * meta
         */
        const meta = computed(function () {

            const meta = {}

            function travel(row, level, parent) {

                // 唯一键值
                const key = getRowKey.value(row)
                // 是否为父级
                const isParent = $n_has(row, props.childrenKey) && $n_isValidArray(row[props.childrenKey])
                // 是否可展开
                // const expandable = row.expandable !== false

                // 懒加载
                let localLazy = row.lazy
                if (
                    localLazy === true
                    && lazy.value[ key ] !== void 0
                    && Array.isArray(row[ props.childrenKey ]) === true
                ) {
                    localLazy = lazy.value[ key ]
                }

                const m = {
                    key,
                    level,
                    parent,
                    isParent,
                    lazy: localLazy,
                    // link: row.disabled !== true && (selectable === true || (expandable === true && (isParent === true || localLazy === true))),
                    children: [],
                    // matchesFilter: props.filter ? computedFilterMethod.value(row, props.filter) : true,

                    // 是否已展开
                    expanded: isParent ? innerExpanded.value.includes(key) : false,
                    // expandable,
                }

                meta[ key ] = m

                // 如果为父级
                if (isParent) {
                    // m.childrens = row[ props.childrenKey ]
                    m.children = row[ props.childrenKey ].map(n => travel(n, level + 1, m))
                }

                return m
            }

            props.rows.forEach(row => travel(row, 0, null))
            return meta
        })

        /**
         * 当前行数据
         */
        const currentRows = computed(function() {

            // 如果有子数据
            if (hasChildren.value) {
                return getRows(props.rows, 0, 0)
            }

            // 否则返回原始行数据
            return props.rows
        })

        /**
         * 插槽标识
         */
        const slotNames = computed(function() {

            // 展开插槽标识
            let expandName = hasChildren.value ? `body-cell-${props.columns[0].name}` : ''
            // 是否存在展开插槽
            let hasExpandSlot = expandName && $n_has(slots, expandName)
            // 单元格插槽标识
            const bodyCell = []
            // 其他插槽标识
            const other = []

            $n_forIn(slots, function (value, key) {
                if (key.startsWith('body-cell-')) {
                    if (hasExpandSlot && key !== expandName) {
                        bodyCell.push(key)
                    }
                } else {
                    other.push(key)
                }
            })

            return {
                // 展开插槽标识
                expandName,
                // 是否存在展开插槽
                hasExpandSlot,
                // 单元格插槽标识
                bodyCell,
                // 其他插槽标识
                other,
            }
        })

        // ==========【方法】=============================================================================================

        /**
         * 获取行数据
         */
        function getRows(rows, __level, __parentKey) {

            const lists = []

            for (const row of rows) {

                lists.push(row)

                const key = getRowKey.value(row)
                const m = meta.value[ key ]

                // 如果有子数据
                if (
                    m.isParent
                    && $n_indexOf(innerExpanded.value, key) > -1
                ) {
                    const childRows = getRows(row[ props.childrenKey ])
                    if (childRows.length) {
                        lists.push(...childRows)
                    }
                }
            }

            return lists
        }

        /**
         * 展开点击
         */
        function onExpandClick (props, e) {
            if (e !== void 0) {
                stopAndPrevent(e)
            }

            const m = meta.value[props.key]

            // keyboard !== true && meta.selectable !== false && blur(meta.key)
            setExpanded(props.key, ! m.expanded, props.row, m)
        }

        /**
         * 在给定键的节点处展开树
         */
        function setExpanded (key, state, row, m) {

            if (m.lazy && m.lazy !== 'loaded') {
                if (m.lazy === 'loading') {
                    return
                }

                lazy.value[ key ] = 'loading'
                if (Array.isArray(row[ props.childrenKey ]) !== true) {
                    row[ props.childrenKey ] = []
                }
                emit('lazyLoad', {
                    row,
                    key,
                    done: children => {
                        lazy.value[ key ] = 'loaded'
                        row[ props.childrenKey ] = Array.isArray(children) === true ? children : []
                        nextTick(() => {
                            const localMeta = meta.value[ key ]
                            if (localMeta && localMeta.isParent === true) {
                                localSetExpanded(key, true)
                            }
                        })
                    },
                    fail: () => {
                        delete lazy.value[ key ]
                        if (row[ props.childrenKey ].length === 0) {
                            delete row[ props.childrenKey ]
                        }
                    }
                })

            } else if (m.isParent === true) {
                localSetExpanded(key, state)
            }
        }

        function localSetExpanded (key, state) {
            let target = innerExpanded.value
            const shouldEmit = props.expanded !== void 0

            if (shouldEmit === true) {
                target = target.slice()
            }

            if (state) {
                // if (props.accordion) {
                //     if (meta.value[ key ]) {
                //         const collapse = []
                //         if (meta.value[ key ].parent) {
                //             meta.value[ key ].parent.children.forEach(m => {
                //                 if (m.key !== key && m.expandable === true) {
                //                     collapse.push(m.key)
                //                 }
                //             })
                //         }
                //         else {
                //             props.nodes.forEach(node => {
                //                 const k = node[ props.nodeKey ]
                //                 if (k !== key) {
                //                     collapse.push(k)
                //                 }
                //             })
                //         }
                //         if (collapse.length > 0) {
                //             target = target.filter(k => collapse.includes(k) === false)
                //         }
                //     }
                // }

                target = target.concat([ key ])
                    .filter((key, index, self) => self.indexOf(key) === index)
            }
            else {
                target = target.filter(k => k !== key)
            }

            if (shouldEmit === true) {
                emit('update:expanded', target)
            }
            else {
                innerExpanded.value = target
            }
        }

        function getCellValue (col, row) {
            const val = typeof col.field === 'function' ? col.field(row) : row[ col.field ]
            return col.format !== void 0 ? col.format(val, row) : val
        }

        /**
         * 用于折叠所有分支
         */
        function collapseAll () {
            if (props.expanded !== void 0) {
                emit('update:expanded', [])
            }
            else {
                innerExpanded.value = []
            }
        }

        /**
         * 用于展开所有分支
         */
        function expandAll () {

            if (! hasChildren.value) {
                return
            }

            const expanded = innerExpanded.value

            const travel = row => {
                if (
                    $n_has(row, props.childrenKey)
                    && $n_isValidArray(row[props.childrenKey])
                ) {
                    expanded.push(row[ props.rowKey ])
                    row[ props.childrenKey ].forEach(travel)
                }
            }

            props.rows.forEach(travel)

            if (props.expanded !== void 0) {
                emit('update:expanded', expanded)

            } else {
                innerExpanded.value = expanded
            }
        }

        // ==========【返回】=============================================================================================

        return {
            // 当前行数据
            currentRows,
            hasChildren,
            // 插槽标识
            slotNames,
            computedIcon,
            onExpandClick,
            expandAll,
            collapseAll,
            // meta
            meta,
            getCellValue,
            getTest(props) {
                console.log(props)
                return ''
            }
        }
    },
}
</script>
