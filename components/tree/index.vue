<template>
    <q-virtual-scroll
        :class="classes"
        :items="currentChildren"
        :virtual-scroll-slice-ratio-before="virtualScrollSliceRatioBefore"
        :virtual-scroll-slice-ratio-after="virtualScrollSliceRatioAfter"
        :virtual-scroll-item-size="virtualScrollItemSize"
        separator
        v-bind="virtualScrollProps"
        v-slot="{ item, index }"
    >
        <div
            :class="item.classes"
            :key="item.key"
            :style="{ paddingLeft: (item.level * 16) + 'px' }"
            @mousedown.self="onMouseDown($event, item)"
            @mouseup="onDragEnd"
            @dragstart.stop="onDragStart($event, item)"
            @dragenter.stop="onDragEnter($event, item, false)"
            @dragover.stop="onDragEnter($event, item, true)"
            @dragleave.stop="onDragLeave($event, item)"
            @dragend.stop="onDragEnd"
            :draggable="draggable"
        >
            <div class="q-focus-helper" @click="onClick(item.node, item.m, $event)"></div>

            <!-- 旋转器 -->
            <q-spinner
                class="q-tree__spinner q-ml-sm"
                :color="computedControlColor"
                v-if="item.m.lazy === 'loading'"
            />

            <!-- 箭头 -->
            <q-icon
                class="q-tree__arrow q-ml-sm"
                :name="computedIcon"
                :class="`${item.m.expanded ? 'q-tree__arrow--rotate' : ''}`"
                @click="onExpandClick(item.node, item.m, $event)"
                v-if="item.isParent === true"
            />
            <div class="n-tree__arrow--noop q-ml-sm" v-else></div>

            <!-- 复选框-->
            <q-checkbox
                class="q-tree__tickbox"
                :model-value="item.m.indeterminate === true ? null : item.m.ticked"
                :color="computedControlColor"
                :dark="isDark"
                :disable="item.m.tickable !== true"
                dense
                keep-color
                @keydown="stopAndPrevent"
                @update:model-value="v => { onTickedClick(item.m, v) }"
                v-show="! multiple"
                v-if="item.m.hasTicking === true && item.m.noTick !== true"
            />

            <!-- 节点内容 -->
            <div
                class="n-tree__node-content"
                @click="onClick(item.node, item.m, $event)"
            >
                <!-- 默认头部插槽 -->
                <slot
                    name="default-header"
                    :node="item.node"
                    :expanded="item.m.expanded"
                    :ticked="item.m.indeterminate === true ? null : item.m.ticked"
                    :key="item.key"
                    :dark="isDark"
                    v-if="hasSlotDefault"
                />
                <!-- 否则为文字 -->
                <span v-else>{{ item.label }}</span>
            </div>
        </div>
    </q-virtual-scroll>
</template>

<script>
import {
    ref, computed, watch,
    nextTick, getCurrentInstance, onBeforeUpdate, onMounted, onUnmounted
} from 'vue'

import { stopAndPrevent } from 'quasar/src/utils/event.js'

const tickStrategyOptions = [ 'none', 'strict', 'leaf', 'leaf-filtered' ]

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_isFunction from 'lodash/isFunction'
import $n_findIndex from 'lodash/findIndex'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_indexOf from '@netang/utils/indexOf'
import $n_on from '@netang/utils/on'
import $n_off from '@netang/utils/off'

export default {

    /**
     * 标识
     */
    name: 'NTree',

    /**
     * 声明属性
     */
    props: {
        dark: {
            type: Boolean,
            default: null
        },
        nodes: {
            type: [ Array, Object ],
            required: true
        },
        nodeKey: {
            type: String,
            required: true
        },
        labelKey: {
            type: String,
            default: 'label'
        },
        childrenKey: {
            type: String,
            default: 'children'
        },

        dense: Boolean,

        color: String,
        controlColor: String,
        textColor: String,
        selectedColor: String,

        icon: String,

        tickStrategy: {
            type: String,
            default: 'none',
            validator: v => tickStrategyOptions.includes(v)
        },
        ticked: Array, // v-model:ticked
        expanded: Array, // v-model:expanded
        selected: {}, // v-model:selected

        noSelectionUnset: Boolean,

        defaultExpandAll: Boolean,
        accordion: Boolean,

        filter: String,
        filterMethod: Function,

        duration: Number,
        noConnectors: Boolean,
        noTransition: Boolean,

        noNodesLabel: String,
        noResultsLabel: String,

        // 【覆盖声明】-------------------------------------------------------

        // 是否开启拖拽
        draggable: Boolean,
        // 是否禁止上下推拽
        noDragUpDown: Boolean,
        // 判断节点能否被拖拽
        allowDrag: Function,
        // 拖拽时判定目标节点能否被放置, type 参数: top / inner / bottom / none ( 目标节点上方 / 目标节点内部 / 目标节点下方 / 无任何操作 )
        allowDrop: Function,
        // 是否多选
        multiple: Boolean,
        // 可见区域中要在其之前渲染的行数的比率
        virtualScrollSliceRatioBefore: {
            type: [ Number, String ],
            default: 1,
        },
        // 可见区域中要在其之后渲染的行数的比率
        virtualScrollSliceRatioAfter: {
            type: [ Number, String ],
            default: 1,
        },
        // 以像素为单位的默认行大小
        virtualScrollItemSize: {
            type: [ Number, String ],
            default: 29,
        },
        // 虚拟滚动声明
        virtualScrollProps: Object,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:expanded',
        'update:ticked',
        'update:selected',
        'lazyLoad',
        'afterShow',
        'afterHide',

        'nodeDragStart',
        'nodeDragEnter',
        'nodeDragOver',
        'nodeDragLeave',
        'nodeDragEnd',
    ],

    /**
     * 组合式
     */
    setup (props, { slots, emit }) {

        const { proxy } = getCurrentInstance()
        const { $q } = proxy

        // ==========【数据】=========================================================================================

        // 懒加载
        const lazy = ref({})
        // 已选节点数组
        const innerTicked = ref(props.ticked || [])
        // 已展开节点数组
        const innerExpanded = ref(props.expanded || [])

        let blurTargets = {}

        // 是否拖拽中
        const dragging = ref(false)
        // 拖拽中节点
        const draggingNode = ref(null)
        // 放置节点
        const dropNode = ref(null)

        const dragClasses = ref({})
        const ctrlDown = ref(false)
        const shiftDown = ref(false)
        const shiftDownNodeKey = ref(null)

        // ==========【计算属性】=========================================================================================

        /**
         * 是否暗黑模式
         */
        const isDark = computed(() => (
            props.dark === null
                ? $q.dark.isActive
                : props.dark
        ))

        /**
         * 类名
         */
        const classes = computed(() =>
            `n-tree n-tree--${ props.dense === true ? 'dense' : 'standard' }`
            // + (props.noConnectors === true ? ' q-tree--no-connectors' : '')
            + (isDark.value === true ? ' n-tree--dark' : '')
            + (props.color !== void 0 ? ` text-${ props.color }` : '')
        )

        /**
         * 是否有已选数据
         */
        const hasSelection = computed(() => props.selected !== void 0)

        /**
         * 图标
         */
        const computedIcon = computed(() => props.icon || $q.iconSet.tree.icon)

        /**
         * 控件颜色(复选框 / 旋转器)
         */
        const computedControlColor = computed(() => props.controlColor || props.color)

        /**
         * 文本颜色类名
         */
        // const textColorClass = computed(() => (
        //     props.textColor !== void 0
        //         ? ` text-${ props.textColor }`
        //         : ''
        // ))

        /**
         * 已选颜色类名
         */
        // const selectedColorClass = computed(() => {
        //     const color = props.selectedColor || props.color
        //     return color ? ` text-${ color }` : ''
        // })

        /**
         * 过滤节点方法
         */
        const computedFilterMethod = computed(() => (
            props.filterMethod !== void 0
                ? props.filterMethod
                : function (node, filter) {
                    return node[ props.labelKey ]
                        && node[ props.labelKey ].toLowerCase().indexOf(filter.toLowerCase()) > -1
                }
        ))

        /**
         * meta
         */
        const meta = computed(() => {
            const meta = {}

            const travel = (node, parent) => {
                const tickStrategy = node.tickStrategy || (parent ? parent.tickStrategy : props.tickStrategy)
                const
                    key = node[ props.nodeKey ],
                    isParent = node[ props.childrenKey ] && node[ props.childrenKey ].length > 0,
                    selectable = node.disabled !== true && hasSelection.value === true && node.selectable !== false,
                    expandable = node.disabled !== true && node.expandable !== false,
                    hasTicking = tickStrategy !== 'none',
                    strictTicking = tickStrategy === 'strict',
                    leafFilteredTicking = tickStrategy === 'leaf-filtered',
                    leafTicking = tickStrategy === 'leaf' || tickStrategy === 'leaf-filtered'

                let tickable = node.disabled !== true && node.tickable !== false
                if (leafTicking === true && tickable === true && parent && parent.tickable !== true) {
                    tickable = false
                }

                let localLazy = node.lazy
                if (
                    localLazy === true
                    && lazy.value[ key ] !== void 0
                    && Array.isArray(node[ props.childrenKey ]) === true
                ) {
                    localLazy = lazy.value[ key ]
                }

                const m = {
                    key,
                    parent,
                    isParent,
                    lazy: localLazy,
                    disabled: node.disabled,
                    // link: node.disabled !== true && (selectable === true || (expandable === true && (isParent === true || localLazy === true))),
                    children: [],
                    matchesFilter: props.filter ? computedFilterMethod.value(node, props.filter) : true,

                    selected: key === props.selected && selectable === true,
                    selectable,
                    expanded: isParent === true ? innerExpanded.value.includes(key) : false,
                    expandable,
                    noTick: node.noTick === true || (strictTicking !== true && localLazy && localLazy !== 'loaded'),
                    tickable,
                    tickStrategy,
                    hasTicking,
                    strictTicking,
                    leafFilteredTicking,
                    leafTicking,
                    ticked: strictTicking === true
                        ? innerTicked.value.includes(key)
                        : (isParent === true ? false : innerTicked.value.includes(key)),

                    childrens: [],
                }

                meta[ key ] = m

                if (isParent === true) {
                    m.childrens = node[ props.childrenKey ]
                    m.children = node[ props.childrenKey ].map(n => travel(n, m))

                    if (props.filter) {
                        if (m.matchesFilter !== true) {
                            m.matchesFilter = m.children.some(n => n.matchesFilter)
                        }
                        else if (
                            m.noTick !== true
                            && m.disabled !== true
                            && m.tickable === true
                            && leafFilteredTicking === true
                            && m.children.every(n => n.matchesFilter !== true || n.noTick === true || n.tickable !== true) === true
                        ) {
                            m.tickable = false
                        }
                    }

                    if (m.matchesFilter === true) {
                        if (m.noTick !== true && strictTicking !== true && m.children.every(n => n.noTick) === true) {
                            m.noTick = true
                        }

                        if (leafTicking) {
                            m.ticked = false
                            m.indeterminate = m.children.some(node => node.indeterminate === true)
                            m.tickable = m.tickable === true && m.children.some(node => node.tickable)

                            if (m.indeterminate !== true) {
                                const sel = m.children
                                    .reduce((acc, meta) => (meta.ticked === true ? acc + 1 : acc), 0)

                                if (sel === m.children.length) {
                                    m.ticked = true
                                }
                                else if (sel > 0) {
                                    m.indeterminate = true
                                }
                            }

                            if (m.indeterminate === true) {
                                m.indeterminateNextState = m.children
                                    .every(meta => meta.tickable !== true || meta.ticked !== true)
                            }
                        }
                    }
                }

                return m
            }

            props.nodes.forEach(node => travel(node, null))
            return meta
        })

        // ==========【监听数据】=========================================================================================

        /**
         * 监听已选节点数据
         */
        watch(() => props.ticked, val => {
            innerTicked.value = val
        })

        /**
         * 监听已展开节点数据
         */
        watch(() => props.expanded, val => {
            innerExpanded.value = val
        })

        /**
         * 通过指定 key 获取树节点
         */
        function getNodeByKey (key) {
            const reduce = [].reduce

            const find = (result, node) => {
                if (result || !node) {
                    return result
                }
                if (Array.isArray(node) === true) {
                    return reduce.call(Object(node), find, result)
                }
                if (node[ props.nodeKey ] === key) {
                    return node
                }
                if (node[ props.childrenKey ]) {
                    return find(null, node[ props.childrenKey ])
                }
            }

            return find(null, props.nodes)
        }

        /**
         * 获取已选树节点数组
         */
        function getTickedNodes () {
            return innerTicked.value.map(key => getNodeByKey(key))
        }

        /**
         * 获取已展开树节点数组
         */
        function getExpandedNodes () {
            return innerExpanded.value.map(key => getNodeByKey(key))
        }

        /**
         * 确定节点是否展开
         */
        function isExpanded (key) {
            return key && meta.value[ key ]
                ? meta.value[ key ].expanded
                : false
        }

        /**
         * 用于折叠树的所有分支
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
         * 用于展开树的所有分支
         */
        function expandAll () {
            const
                expanded = innerExpanded.value,
                travel = node => {
                    if (node[ props.childrenKey ] && node[ props.childrenKey ].length > 0) {
                        if (node.expandable !== false && node.disabled !== true) {
                            expanded.push(node[ props.nodeKey ])
                            node[ props.childrenKey ].forEach(travel)
                        }
                    }
                }

            props.nodes.forEach(travel)

            if (props.expanded !== void 0) {
                emit('update:expanded', expanded)
            }
            else {
                innerExpanded.value = expanded
            }
        }

        /**
         * 在给定键的节点处展开树
         */
        function setExpanded (key, state, node = getNodeByKey(key), m = meta.value[ key ]) {
            if (m.lazy && m.lazy !== 'loaded') {
                if (m.lazy === 'loading') {
                    return
                }

                lazy.value[ key ] = 'loading'
                if (Array.isArray(node[ props.childrenKey ]) !== true) {
                    node[ props.childrenKey ] = []
                }
                emit('lazyLoad', {
                    node,
                    key,
                    done: children => {
                        lazy.value[ key ] = 'loaded'
                        node[ props.childrenKey ] = Array.isArray(children) === true ? children : []
                        nextTick(() => {
                            const localMeta = meta.value[ key ]
                            if (localMeta && localMeta.isParent === true) {
                                localSetExpanded(key, true)
                            }
                        })
                    },
                    fail: () => {
                        delete lazy.value[ key ]
                        if (node[ props.childrenKey ].length === 0) {
                            delete node[ props.childrenKey ]
                        }
                    }
                })
            }
            else if (m.isParent === true && m.expandable === true) {
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
                if (props.accordion) {
                    if (meta.value[ key ]) {
                        const collapse = []
                        if (meta.value[ key ].parent) {
                            meta.value[ key ].parent.children.forEach(m => {
                                if (m.key !== key && m.expandable === true) {
                                    collapse.push(m.key)
                                }
                            })
                        }
                        else {
                            props.nodes.forEach(node => {
                                const k = node[ props.nodeKey ]
                                if (k !== key) {
                                    collapse.push(k)
                                }
                            })
                        }
                        if (collapse.length > 0) {
                            target = target.filter(k => collapse.includes(k) === false)
                        }
                    }
                }

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

        /**
         * 用于检查是否选中节点的复选框
         */
        function isTicked (key) {
            return key && meta.value[ key ]
                ? meta.value[ key ].ticked
                : false
        }

        /**
         * 添加节点复选框
         */
        function setTicked (keys, state) {
            let target = innerTicked.value
            const shouldEmit = props.ticked !== void 0

            if (shouldEmit === true) {
                target = target.slice()
            }

            if (state) {
                target = target.concat(keys)
                    .filter((key, index, self) => self.indexOf(key) === index)
            }
            else {
                target = target.filter(k => keys.includes(k) === false)
            }

            if (shouldEmit === true) {
                emit('update:ticked', target)
            }
        }

        // function getSlotScope (node, meta, key) {
        //     const scope = { tree: proxy, node, key, color: props.color, dark: isDark.value }
        //
        //     injectProp(
        //         scope,
        //         'expanded',
        //         () => { return meta.expanded },
        //         val => { val !== meta.expanded && setExpanded(key, val) }
        //     )
        //
        //     injectProp(
        //         scope,
        //         'ticked',
        //         () => { return meta.ticked },
        //         val => { val !== meta.ticked && setTicked([ key ], val) }
        //     )
        //
        //     return scope
        // }

        // function getChildren (nodes) {
        //     return (
        //         props.filter
        //             ? nodes.filter(n => meta.value[ n[ props.nodeKey ] ].matchesFilter)
        //             : nodes
        //     ).map(child => getNode(child))
        // }

        // function getNodeMedia (node) {
        //     if (node.icon !== void 0) {
        //         return h(QIcon, {
        //             class: 'q-tree__icon q-mr-sm',
        //             name: node.icon,
        //             color: node.iconColor
        //         })
        //     }
        //     const src = node.img || node.avatar
        //     if (src) {
        //         return h('img', {
        //             class: `q-tree__${ node.img ? 'img' : 'avatar' } q-mr-sm`,
        //             src
        //         })
        //     }
        // }

        function onShow () {
            emit('afterShow')
        }

        function onHide () {
            emit('afterHide')
        }

        // function getNode (node) {
        //     const
        //         key = node[ props.nodeKey ],
        //         m = meta.value[ key ],
        //         header = node.header
        //             ? slots[ `header-${ node.header }` ] || slots[ 'default-header' ]
        //             : slots[ 'default-header' ]
        //
        //     const children = m.isParent === true
        //         ? getChildren(node[ props.childrenKey ])
        //         : []
        //
        //     const isParent = children.length > 0 || (m.lazy && m.lazy !== 'loaded')
        //
        //     let body = node.body
        //         ? slots[ `body-${ node.body }` ] || slots[ 'default-body' ]
        //         : slots[ 'default-body' ]
        //     const slotScope = header !== void 0 || body !== void 0
        //         ? getSlotScope(node, m, key)
        //         : null
        //
        //     if (body !== void 0) {
        //         body = h('div', { class: 'q-tree__node-body relative-position' }, [
        //             h('div', { class: textColorClass.value }, [
        //                 body(slotScope)
        //             ])
        //         ])
        //     }
        //
        //     return h('div', {
        //         key,
        //         class: 'q-tree__node relative-position'
        //             + ` q-tree__node--${ isParent === true ? 'parent' : 'child' }`
        //     }, [
        //         h('div', {
        //             class: 'q-tree__node-header relative-position row no-wrap items-center'
        //                 // + (m.link === true ? ' q-tree__node--link q-hoverable q-focusable' : '')
        //                 + (m.selected === true ? ' n-tree__node--selected' : '')
        //                 + (m.disabled === true ? ' q-tree__node--disabled' : ''),
        //             tabindex: m.link === true ? 0 : -1,
        //             onClick: (e) => {
        //                 onClick(node, m, e)
        //             },
        //             onKeypress (e) {
        //                 if (shouldIgnoreKey(e) !== true) {
        //                     if (e.keyCode === 13) { onClick(node, m, e, true) }
        //                     else if (e.keyCode === 32) { onExpandClick(node, m, e, true) }
        //                 }
        //             }
        //         }, [
        //             h('div', {
        //                 class: 'q-focus-helper',
        //                 tabindex: -1,
        //                 ref: el => { blurTargets[ m.key ] = el }
        //             }),
        //
        //             m.lazy === 'loading'
        //                 ? h(QSpinner, {
        //                     class: 'q-tree__spinner',
        //                     color: computedControlColor.value
        //                 })
        //                 : (
        //                     isParent === true
        //                         ? h(QIcon, {
        //                             class: 'q-tree__arrow'
        //                                 + (m.expanded === true ? ' q-tree__arrow--rotate' : ''),
        //                             name: computedIcon.value,
        //                             onClick (e) { onExpandClick(node, m, e) }
        //                         })
        //                         : null
        //                 ),
        //
        //             m.hasTicking === true && m.noTick !== true
        //                 ? h(QCheckbox, {
        //                     class: 'q-tree__tickbox',
        //                     modelValue: m.indeterminate === true ? null : m.ticked,
        //                     color: computedControlColor.value,
        //                     dark: isDark.value,
        //                     dense: true,
        //                     keepColor: true,
        //                     disable: m.tickable !== true,
        //                     onKeydown: stopAndPrevent,
        //                     'onUpdate:modelValue': v => {
        //                         onTickedClick(m, v)
        //                     }
        //                 })
        //                 : null,
        //
        //             h('div', {
        //                 class: 'q-tree__node-header-content col row no-wrap items-center'
        //                     + (m.selected === true ? selectedColorClass.value : textColorClass.value)
        //             }, [
        //                 header
        //                     ? header(slotScope)
        //                     : [
        //                         getNodeMedia(node),
        //                         h('div', node[ props.labelKey ])
        //                     ]
        //             ])
        //         ]),
        //
        //         isParent === true
        //             ? (
        //                 props.noTransition === true
        //                     ? h('div', {
        //                         class: 'q-tree__node-collapsible' + textColorClass.value,
        //                         key: `${ key }__q`
        //                     }, [
        //                         body,
        //                         h('div', {
        //                             class: 'q-tree__children'
        //                                 + (m.disabled === true ? ' q-tree__node--disabled' : '')
        //                         }, m.expanded ? children : null)
        //                     ])
        //
        //                     : h(QSlideTransition, {
        //                         duration: props.duration,
        //                         onShow,
        //                         onHide
        //                     }, () => withDirectives(
        //                         h('div', {
        //                             class: 'q-tree__node-collapsible' + textColorClass.value,
        //                             key: `${ key }__q`
        //                         }, [
        //                             body,
        //                             h('div', {
        //                                 class: 'q-tree__children'
        //                                     + (m.disabled === true ? ' q-tree__node--disabled' : '')
        //                             }, children)
        //                         ]),
        //                         [ [ vShow, m.expanded ] ]
        //                     ))
        //             )
        //             : body
        //     ])
        // }

        /**
         * 失去焦点
         */
        function blur (key) {
            const blurTarget = blurTargets[ key ]
            blurTarget && blurTarget.focus()
        }

        /**
         * 点击节点
         */
        function onClick (node, meta, e, keyboard) {

            keyboard !== true && meta.selectable !== false && blur(meta.key)

            // 如果有 v-model:selected
            if (hasSelection.value && meta.selectable) {

                if (props.noSelectionUnset === false) {
                    emit('update:selected', meta.key !== props.selected ? meta.key : null)

                } else if (meta.key !== props.selected) {
                    emit('update:selected', meta.key === void 0 ? null : meta.key)
                }

            } else {

                // 如果是父节点
                if (meta.isParent && ! props.multiple) {
                    // 则展开点击
                    onExpandClick(node, meta, e, keyboard)

                // 如果有复选框
                } else if (meta.hasTicking === true && meta.noTick !== true) {

                    // 如果有复选框
                    if (props.multiple) {

                        // 如果按下 shfit
                        if (shiftDown.value) {

                            // 如果没有选中节点
                            if (! innerTicked.value.length) {
                                updateTicked([meta.key])
                                return
                            }

                            const {
                                length,
                            } = innerTicked.value

                            // 如果只选中一个节点 && 该节点为当前点击的节点
                            if (length === 1 && innerTicked.value[0] === meta.key) {
                                return
                            }

                            // 如果没有 shift 按下节点
                            if (shiftDownNodeKey.value === null) {
                                // 则设置最后一个选中节点为 shift 按下节点
                                shiftDownNodeKey.value = innerTicked.value[length - 1]
                            }

                            // 获取最后一个选中节点
                            const lastTickedKey = shiftDownNodeKey.value

                            let lastIndex
                            let selectedIndex

                            for (let i = currentChildren.value.length - 1; i >= 0 ; i--) {
                                const item = currentChildren.value[i]
                                if (item.key === lastTickedKey) {
                                    lastIndex = i
                                } else if (item.key === meta.key) {
                                    selectedIndex = i
                                }
                            }

                            let startIndex
                            let endIndex

                            // 如果选择数据在最后一条数据前
                            if (selectedIndex < lastIndex) {
                                startIndex = selectedIndex
                                endIndex = lastIndex

                            // 如果选择数据在最后一条数据后
                            } else if (selectedIndex > lastIndex) {
                                startIndex = lastIndex
                                endIndex = selectedIndex
                            }

                            const newTicked = []
                            for (let i = startIndex; i <= endIndex; i++) {
                                const item = currentChildren.value[i]
                                if (item.m.tickable === true) {
                                    newTicked.push(item.key)
                                }
                            }
                            updateTicked(newTicked)

                        // 如果按下 ctrl
                        } else if (ctrlDown.value) {
                            setTicked([meta.key], true)

                        // 否则只是点击
                        } else {
                            updateTicked([meta.key])
                        }
                        return
                    }

                    // 否则复选框点击
                    const isTicked = meta.indeterminate === true ? null : meta.ticked
                    onTickedClick(meta, ! isTicked)
                }
            }

            if (typeof node.handler === 'function') {
                node.handler(node)
            }
        }

        /**
         * 展开点击
         */
        function onExpandClick (node, meta, e, keyboard) {
            if (e !== void 0) {
                stopAndPrevent(e)
            }
            keyboard !== true && meta.selectable !== false && blur(meta.key)
            setExpanded(meta.key, !meta.expanded, node, meta)
        }

        /**
         * 复选框点击
         */
        function onTickedClick (meta, state) {
            if (meta.indeterminate === true) {
                state = meta.indeterminateNextState
            }
            if (meta.strictTicking) {
                setTicked([ meta.key ], state)
            }
            else if (meta.leafTicking) {
                const keys = []
                const travel = meta => {
                    if (meta.isParent) {
                        if (state !== true && meta.noTick !== true && meta.tickable === true) {
                            keys.push(meta.key)
                        }
                        if (meta.leafTicking === true) {
                            meta.children.forEach(travel)
                        }
                    }
                    else if (
                        meta.noTick !== true
                        && meta.tickable === true
                        && (meta.leafFilteredTicking !== true || meta.matchesFilter === true)
                    ) {
                        keys.push(meta.key)
                    }
                }
                travel(meta)
                setTicked(keys, state)
            }
        }

        /**
         * 默认展开全部
         */
        props.defaultExpandAll === true && expandAll()

        // expose public methods
        // Object.assign(proxy, {
        //     getNodeByKey,
        //     getTickedNodes,
        //     getExpandedNodes,
        //     isExpanded,
        //     collapseAll,
        //     expandAll,
        //     setExpanded,
        //     isTicked,
        //     setTicked
        // })

        // return () => {
        //     const children = getChildren(props.nodes)
        //
        //     return h(
        //         'div', {
        //             class: classes.value
        //         },
        //         children.length === 0
        //             ? (
        //                 props.filter
        //                     ? props.noResultsLabel || $q.lang.tree.noResults
        //                     : props.noNodesLabel || $q.lang.tree.noNodes
        //             )
        //             : children
        //     )
        // }

        // ==========【覆盖部分】=========================================================================================

        /**
         * 是否有默认头部插槽
         */
        const hasSlotDefault = computed(function () {
            return $n_has(slots, 'default-header')
        })

        /**
         * 获取节点
         */
        function getNode(nodes, level, parents) {

            const lists = []

            // 如果有过滤方法
            if (props.filter) {
                nodes = nodes.filter(n => meta.value[ n[ props.nodeKey ] ].matchesFilter)
            }

            for (const node of nodes) {

                const key = node[ props.nodeKey ]
                const m = meta.value[ key ]

                // 孩子节点
                const children = m.isParent === true
                    ? node[ props.childrenKey ]
                    : []

                // 是否为父节点
                const isParent = children.length > 0 || (m.lazy && m.lazy !== 'loaded')

                // 拖拽类名
                const dragCss = $n_get(dragClasses.value, key)

                // 当前节点类名
                const classes = 'n-tree__node relative-position row no-wrap items-center  q-tree__node--link q-hoverable'
                        // + (m.link === true ? ' q-tree__node--link q-hoverable q-focusable' : '')
                        + (m.selected === true || props.multiple && m.ticked === true ? ' n-tree__node--selected' : '')
                        + (m.disabled === true ? ' q-tree__node--disabled' : '')
                        + (dragCss ? ' ' + dragCss : '')

                lists.push({
                    classes,
                    key,
                    label: node[ props.labelKey ],
                    m,
                    isParent,
                    level,
                    parents,
                    node,
                })

                // 如果当前节点在展开节点中
                if (
                    isParent
                    && $n_indexOf(innerExpanded.value, key) > -1
                ) {
                    const childNodes = getNode(node[ props.childrenKey ], level + 1, [...parents, key])
                    if (childNodes.length) {
                        lists.push(...childNodes)
                    }
                }
            }

            return lists
        }

        /**
         * 当前节点
         */
        const currentChildren = computed(function () {
            if ($n_isValidArray(props.nodes)) {
                return getNode(props.nodes, 0, [])
            }
            return []
        })

        // -------------------------------------------------------------------------------------------------

        /**
         * 更新节点复选框
         */
        function updateTicked (keys) {
            if (props.ticked !== void 0) {
                emit('update:ticked', keys)
            } else {
                innerTicked.value = keys
            }
        }

        /**
         * 按键按下
         */
        function onKeydown({ keyCode, shiftKey }) {

            // 如果是 shift
            if (keyCode === 16 || shiftKey) {
                ctrlDown.value = false
                shiftDown.value = true

            // 如果是 ctrl
            } else if (keyCode === 17) {
                ctrlDown.value = true
                shiftDown.value = false
                shiftDownNodeKey.value = null

            // 否则其他
            } else {
                onKeyup()
            }
        }

        /**
         * 按键弹起
         */
        function onKeyup() {
            ctrlDown.value = false
            shiftDown.value = false
            shiftDownNodeKey.value = null
        }

        /**
         * 鼠标点击
         */
        function onMouseDown() {
            // 如果开启拖拽
            if (props.draggable) {
                // 设置拖拽中
                dragging.value = true
            }
        }

        /**
         * 拖拽开始
         */
        function onDragStart(e, item) {

            // 如果开启拖拽
            if (props.draggable) {

                // 判断节点能否被拖拽
                if (
                    $n_isFunction(props.allowDrag)
                    && ! props.allowDrag(item.node)
                ) {
                    e.preventDefault()
                    return false
                }

                e.dataTransfer.effectAllowed = 'move'

                // wrap in try catch to address IE's error when first param is 'text/plain'
                try {
                    // setData is required for draggable to work in FireFox
                    // the content has to be '' so dragging a node out of the tree won't open a new tab in FireFox
                    e.dataTransfer.setData('text/plain', '')
                } catch {}

                // 设置拖拽中
                dragging.value = true

                // 设置拖拽中节点
                draggingNode.value = item

                // 设置节点类名
                dragClasses.value[item.key] = 'dragging--before'

                emit('nodeDragStart', item.node, e)
            }
        }

        /**
         * 拖拽进入
         */
        function onDragEnter(e, item, isOver) {

            // 如果开启拖拽
            if (props.draggable) {

                dropNode.value = null

                // 如果拖拽中
                if (dragging.value) {

                    const {
                        key: fromKey,
                    } = draggingNode.value

                    // 设置节点类名
                    if (! isOver) {
                        dragClasses.value[draggingNode.value.key] = 'dragging'
                    }

                    let type

                    if (
                        // 如果被拖动节点 === 拖动只节点
                        fromKey === item.key
                        // 如果拖动的节点 在 被拖动节点的父级节点中
                        || $n_indexOf(item.parents, fromKey) > -1
                    ) {
                        type = 'none'

                    } else {

                        // 如果禁止上下拖拽
                        if (props.noDragUpDown) {
                            type = 'inner'

                        } else {

                            const {
                                top,
                                height,
                            } = e.target.getBoundingClientRect()

                            const dY = e.clientY - top

                            // 目标节点上方
                            if (dY <= height * 0.3) {

                                type = 'top'

                            // 目标节点内部
                            } else if (dY <= height * (0.7)) {

                                type = 'inner'

                            // 目标节点下方
                            } else {
                                type = 'bottom'
                            }
                        }

                        // 拖拽时判定目标节点能否被放置, type 参数有三种情况: top / inner / bottom ( 目标节点上方 / 目标节点内部 / 目标节点下方 )
                        if ($n_isFunction(props.allowDrop)) {
                            const res = props.allowDrop(draggingNode.value.node, item.node, type)
                            if (res !== true) {
                                type = 'none'
                            }
                        }

                        if (type !== 'none') {
                            dragClasses.value[item.key] = `drag-over--${type}`
                        }
                    }

                    // 为需要移动的元素设置 dragstart 事件
                    // e.dataTransfer.effectAllowed = 'move'

                    // 设置放置节点
                    dropNode.value = {
                        item,
                        type,
                    }

                    emit(isOver ? 'nodeDragOver' : 'nodeDragEnter', draggingNode.value.node, item.node, e)
                }
            }
        }

        /**
         * 拖拽结束
         */
        function onDragEnd(e) {

            // 如果开启拖拽
            if (props.draggable) {

                if (draggingNode.value) {

                    const draggingNodeKey = draggingNode.value.key

                    dragClasses.value[draggingNodeKey] = ''

                    if (dropNode.value) {

                        const dropType = dropNode.value.type

                        // 执行放置节点
                        function doDrop() {

                            // 放置类型 !== 'none'
                            if (dropType !== 'none') {

                                const dropNodeKey = dropNode.value.item.key

                                // 删除拖拽中的节点
                                function remove() {
                                    const {
                                        parent
                                    } = draggingNode.value.m
                                    const children = parent ? parent.childrens : props.nodes
                                    const index = $n_findIndex(children, e => e[props.nodeKey] === draggingNodeKey)
                                    if (index > -1) {
                                        children.splice(index, 1)
                                    }
                                }

                                // 如果放置目标节点内部
                                if (dropType === 'inner') {
                                    if (dropNode.value.item.m.childrens.length) {

                                        // 判断该节点是否在内部
                                        if ($n_findIndex(dropNode.value.item.m.childrens, e => e[props.nodeKey] === draggingNodeKey) > -1) {
                                            // console.log('不用拖拽，在节点内部')
                                            return false
                                        }

                                        remove()
                                        dropNode.value.item.m.childrens.push(draggingNode.value.node)
                                        return dropNode.value.item.m.childrens
                                    }

                                    remove()
                                    dropNode.value.item.node[props.childrenKey] = [ draggingNode.value.node ]
                                    return dropNode.value.item.node[props.childrenKey]

                                // 否则放置目标节点上下
                                } else {
                                    const dropParent = dropNode.value.item.m.parent
                                    const dropChildren = dropParent ? dropParent.childrens : props.nodes
                                    let dropIndex = $n_findIndex(dropChildren, e => e[props.nodeKey] === dropNodeKey)
                                    if (dropIndex > -1) {

                                        // 如果移动至上方
                                        if (dropType === 'top') {
                                            if (dropIndex > 0) {
                                                const dropTopItem = dropChildren[dropIndex - 1]
                                                if (dropTopItem[props.nodeKey] === draggingNodeKey) {
                                                    // console.log('不用拖拽，拖到上方的就是被拖拽节点自己')
                                                    return false
                                                }
                                            }

                                        // 否则移动到下方
                                        } else if (dropIndex + 1 < dropChildren.length) {
                                            const dropTopItem = dropChildren[dropIndex + 1]
                                            if (dropTopItem[props.nodeKey] === draggingNodeKey) {
                                                // console.log('不用拖拽，拖到下方的就是被拖拽节点自己')
                                                return false
                                            }
                                        }

                                        remove()
                                        dropIndex = $n_findIndex(dropChildren, e => e[props.nodeKey] === dropNodeKey)
                                        if (dropIndex > -1) {
                                            dropChildren.splice(dropType === 'top' ? dropIndex : dropIndex + 1, 0, draggingNode.value.node)
                                            return dropChildren
                                        }
                                    }
                                }
                            }
                            return false
                        }

                        emit('nodeDragEnd', draggingNode.value.node, dropNode.value.item.node, dropType, doDrop, e)

                    } else {
                        emit('nodeDragEnd', draggingNode.value.node, null, 'none', () => props.nodes, e)
                    }
                }

                draggingNode.value = null
                dropNode.value = null
                dragging.value = false
            }
        }

        /**
         * 拖拽离开
         */
        function onDragLeave(e, item) {

            // 如果开启拖拽
            if (props.draggable) {
                if (draggingNode.value) {
                    if (item.key === draggingNode.value.key) {
                        return
                    }
                    dragClasses.value[item.key] = ''

                    emit('nodeDragLeave', draggingNode.value.node, item.node, e)
                }
            }
        }

        // ==========【生命周期】=========================================================================================

        /**
         * 更新 DOM 之前调用
         */
        onBeforeUpdate(function () {
            blurTargets = {}
        })

        /**
         * 实例被挂载后调用
         */
        onMounted(function() {
            $n_on(document, 'keydown', onKeydown)
            $n_on(document, 'keyup', onKeyup)
        })

        /**
         * 实例被卸载后调用
         */
        onUnmounted(function () {
            $n_off(document, 'keydown', onKeydown)
            $n_off(document, 'keyup', onKeyup)
        })

        return {
            classes,
            computedIcon,
            computedControlColor,
            isDark,
            onClick,
            onExpandClick,
            onTickedClick,
            getNodeByKey,
            getExpandedNodes,
            getTickedNodes,
            isExpanded,
            setExpanded,
            isTicked,
            setTicked,
            expandAll,
            collapseAll,
            stopAndPrevent,

            hasSlotDefault,
            currentChildren,

            onMouseDown,
            onDragStart,
            onDragEnter,
            onDragLeave,
            onDragEnd,
        }
    }
}
</script>

<style lang="scss">
@import "@/assets/sass/variables.scss";

.n-tree {
    color: $grey;

    &__arrow--noop {
        width: 16px;
        height: 16px;
        margin-right: 4px;
    }

    &__node {
        margin: 4px;
        border-radius: 4px;
        //transition: all .3s;

        // 已选
        &--selected:not(.drag-over--inner) {
            .q-focus-helper {
                background: currentColor;
                opacity: 0.15 !important;
            }
        }

        // 拖拽前
        &.dragging--before {
            .q-focus-helper {
                display: none;
            }
        }

        // 拖拽中
        &.dragging {
            .q-focus-helper {
                background: transparent !important;
                opacity: 1 !important;
                border: 1px solid var(--q-primary);
                &:before {
                    background-color: var(--q-primary);
                    opacity: 0.1 !important;
                    box-sizing: border-box;
                }
                &:after {
                    opacity: 0 !important;
                }
            }
        }

        // 拖拽至上方
        &.drag-over--top {
            .n-tree__node-content {
                &:before {
                    top: 0;
                    margin-top: -5px;
                }
                border-top-color: var(--q-primary);
            }
        }

        // 拖拽至内部
        &.drag-over--inner {
            color: rgba(255, 255, 255, 0.6);
            .q-focus-helper {
                background-color: var(--q-primary) !important;
                opacity: 1;
            }
            .n-tree__node-content {
                color: #ffffff;
            }
        }

        // 拖拽至底部
        &.drag-over--bottom {
            .n-tree__node-content {
                &:before {
                    bottom: 0;
                    margin-bottom: -5px;
                }
                border-bottom-color: var(--q-primary);
            }
        }

        &.drag-over--top,
        &.drag-over--bottom {
            .n-tree__node-content {
                &:before {
                    content: "";
                    position: absolute;
                    left: 0;
                    margin-left: -8px;
                    border-radius: 50%;
                    width: 8px;
                    height: 8px;
                    border: 2px solid var(--q-primary);
                }
            }

            .q-focus-helper {
                background-color: var(--q-primary);
                opacity: 0.15;
            }
        }

        // 拖拽内容
        &-content {
            position: relative;
            flex: 1;
            padding: 2px 5px;
            margin-left: -5px;
            border-top: 2px transparent solid;
            border-bottom: 2px transparent solid;
            color: #000000;
        }
    }

    &--dark {
        .n-tree__node-content {
            color: #ffffff;
        }

        .n-tree__node {

            // 已选
            &--selected:not(.drag-over--inner) {
                .q-focus-helper {
                    opacity: 0.3 !important;
                }
            }

            // 拖拽中
            &.dragging {
                .q-focus-helper {
                    &:before {
                        opacity: 0.3 !important;
                    }
                }
            }

            &.drag-over--top,
            &.drag-over--bottom {
                .q-focus-helper {
                    opacity: 0.3 !important;
                }
            }
        }
    }
}
</style>
