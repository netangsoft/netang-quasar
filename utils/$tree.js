import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_isNil from 'lodash/isNil'
import $n_findIndex from 'lodash/findIndex'
import $n_cloneDeep from 'lodash/cloneDeep'

import $n_router from '@netang/utils/vue/router'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_hasId from '@netang/utils/hasId'
import $n_http from '@netang/utils/http'
import $n_run from '@netang/utils/run'
import $n_storage from '@netang/utils/storage'

import $n_toast from './toast'
import $n_confirm from './confirm'
import $n_dialog from './dialog'
import $n_alert from './alert'

import { isRef, watch, inject, ref } from 'vue'

import { NPowerKey } from './symbols'

/**
 * 获取节点
 */
function getTreeNode(data, nodeId) {
    for (const item of data) {

        if (item.id === nodeId) {
            return item
        }

        // 如果是父节点
        if (item.children.length) {
            const res = getTreeNode(item.children, nodeId)
            if (res) {
                return res
            }
        }
    }

    return false
}

/**
 * 获取子节点
 */
function getChildren(data, callback) {
    for (const item of data) {
        if ($n_run(callback)(item) === false) {
            return false
        }
        // 如果是父节点
        if (item.children.length) {
            const res = getChildren(item.children, callback)
            if (res === false) {
                return false
            }
        }
    }
    return true
}

/**
 * 创建树实例
 */
function create(params) {

    const {
        // 路由路径
        path,
        // 路由参数
        query,
        // 树节点列表
        nodes,
        // 树展开节点
        expanded,
        // 原始表单数据
        rawFormData,
        // 表单数据
        formData,
        // 重新加载
        reload,
        // 是否开启展开节点缓存
        cache,
    } = Object.assign({
        // 路由路径
        path: '',
        // 路由参数
        query: {},
        // 是否开启展开节点缓存
        cache: false,
    }, params)

    // 获取权限注入
    const $power = $n_has(params, '$power') ? params.$power : inject(NPowerKey)
    const hasPowr = !! $power

    // 获取权限路由
    const $route = $n_isValidString(path) ?
        // 如果为自定义路由
        $n_router.resolve({
            path,
            query,
        })
        // 否则获取当前路由
        : (hasPowr ? $power.getRoute() : $n_router.getRoute())

    // 权限按钮
    const powerBtns = hasPowr ? $power.powerBtns : ref([])

    // 是否有展开节点
    const hasExpanded = ! $n_isNil(expanded) && isRef(expanded)

    // 如果开启展开节点缓存
    if (hasExpanded && cache) {

        // 设置树展开节点初始缓存
        expanded.value = getExpandedCache(expanded.value)

        /**
         * 监听树展开节点
         */
        watch(expanded, function(val) {
            // 设置树展开节点缓存
            setExpandedCache(val)
        })
    }

    /**
     * 获取节点
     */
    function getNode(nodeId) {
        return getTreeNode(nodes.value, nodeId)
    }

    /**
     * 格式化节点
     */
    function formatNode(attr) {

        // 设置属性
        attr = Object.assign({}, attr)

        return {
            attr,
            id: attr.id,
            label: attr.title,
            children: [],
        }
    }

    /**
     * 更新节点
     */
    function updateNode(data) {

        // 获取 id
        const id = $n_get(formData.value, 'id')

        // 更新表单数据
        formData.value = Object.assign({}, formData.value, data)

        // 获取节点数据
        const nodeItem = getNode(data.id)

        // 如果为更新节点
        if (id) {
            if (nodeItem) {
                Object.assign(nodeItem, {
                    attr: Object.assign({}, formData.value),
                    label: formData.value.title,
                })
            }

        // 否则为新增节点
        } else if (
            // 如果为新增节点
            $n_get(data, 'id')
            // 没有节点存在
            && ! nodeItem
        ) {
            // 获取父级节点
            const parentNodeItem = getNode(formData.value.pid)
            if (! parentNodeItem) {
                return
            }

            // 新增节点
            parentNodeItem.children.push(formatNode(formData.value))
        }
    }

    /**
     * 删除节点
     */
    function deleteNode({ id, attr }) {

        // 获取父节点数据
        const parentNodeItem = getNode(attr.pid)
        if (! parentNodeItem) {
            return
        }

        // 获取节点索引
        const nodeIndex = $n_findIndex(parentNodeItem.children, { id })
        if (nodeIndex > -1) {
            parentNodeItem.children.splice(nodeIndex, 1)
        }
    }

    /**
     * 获取菜单状态
     */
    function getMenuStatus(params) {

        const o = Object.assign({
            updateName: 'update',
            moveName: 'move',
            copyName: 'copy',
            deleteName: 'realdel',
            statusName: 'status'
        }, params)

        const maps = {}
        maps[o.updateName] = 'update'
        maps[o.moveName] = 'move'
        maps[o.copyName] = 'copy'
        maps[o.deleteName] = 'delete'
        maps[o.statusName] = 'status'

        const allPowerBtn = {}
        for (const item of powerBtns.value) {
            if ($n_has(maps, $n_get(item, 'name'))) {
                allPowerBtn[maps[item.name]] = item
            }
        }

        return {
            all: $n_isValidObject(allPowerBtn),
            update: $n_has(allPowerBtn, 'update'),
            move: $n_has(allPowerBtn, 'move'),
            copy: $n_has(allPowerBtn, 'copy'),
            delete: $n_has(allPowerBtn, 'delete'),
            status: $n_has(allPowerBtn, 'status'),
            allPowerBtn,
        }
    }

    /**
     * 确认菜单
     */
    function confirmMenu(callback) {
        // 确认框
        $n_confirm({
            message: '确认要执行该操作吗？',
        })
            // 点击确认执行
            .onOk(callback)
    }

    /**
     * 菜单点击
     */
    function menuClick(params) {

        // 参数
        const o = Object.assign({
            // 菜单类型
            type: '',
            // 节点
            node: null,
        }, params)

        // 菜单类型
        switch (o.type) {

            // 添加下级
            case 'update':
                // 更新表单数据
                formData.value = Object.assign({}, rawFormData, {
                    pid: o.node.attr.id,
                })
                break

            // 移至节点上
            case 'moveUp':
            // 移至节点内
            case 'moveIn':
            // 移至节点下
            case 'moveDown':

                if (! $n_get(o.menuStatus, 'value.allPowerBtn.move.url')) {
                    console.error('没有找到复制地址')
                    return
                }

                // 创建对话框
                $n_dialog.create({
                    // 标题
                    title: `移动至节点的${o.type === 'moveUp' ? '上方' : (o.type === 'moveDown' ? '下方' : '内部')}`,
                    // 宽度
                    width: 500,
                    // 组件标识
                    name: 'moveToTree',
                    // 组件参数
                    props: {
                        // 树节点列表
                        nodes,
                        // 树展开节点
                        expanded,
                    },
                    // 显示取消按钮
                    cancel: true,
                    // 点击确认执行
                    async onConfirm({ value: moveNodeId }) {

                        // 是否为正确的 id
                        if (! $n_hasId(moveNodeId)) {
                            $n_toast({
                                message: '请选择节点',
                            })
                            return false
                        }

                        // 如果节点是自己
                        if (moveNodeId === o.node.id) {
                            $n_toast({
                                message: '不能选择当前节点',
                            })
                            return false
                        }

                        // 获取需移动至的节点
                        const moveNodeItem = getNode(moveNodeId)
                        if (! moveNodeItem) {
                            $n_alert({
                                message: '移动至的节点不存在',
                            })
                            return false
                        }

                        // 克隆当前树列表数据
                        const nodesClone = $n_cloneDeep(nodes.value)

                        // 获取当前节点
                        const nodeItem = getNode(o.node.id)

                        // 获取当前节点的父节点
                        const parentNodeItem = getNode(o.node.attr.pid)

                        // 移动列表数据
                        const moveLists = []

                        // 如果是移动至节点内部
                        // --------------------------------------------------
                        if (o.type === 'moveIn') {

                            // 修改当前节点数据
                            nodeItem.attr.pid = moveNodeItem.attr.id
                            // console.log('moveNodeItem.children', moveNodeItem.children)

                            nodeItem.attr.sort =
                                // 如果移动至的节点有子节点
                                moveNodeItem.children.length
                                    // 则获取移动至的节点中最后一个子节点的排序号 + 1
                                    ? moveNodeItem.children[moveNodeItem.children.length - 1].attr.sort + 1
                                    // 否则排序号设为 1
                                    : 1

                            // 添加移动列表数据
                            moveLists.push({
                                id: nodeItem.id,
                                pid: nodeItem.attr.pid,
                                sort: nodeItem.attr.sort,
                            })

                            // 将本节点从原父节点中删除
                            const nodeItemIndex = $n_findIndex(parentNodeItem.children, { id: nodeItem.id })
                            parentNodeItem.children.splice(nodeItemIndex, 1)

                            // 将本节点添加至移动至的节点的子节点中
                            moveNodeItem.children.push(nodeItem)

                        // 否则移动至节点的上方/下方
                        // --------------------------------------------------
                        } else {

                            // 获取移动至节点的父节点
                            let moveParentNodeItem = getNode(moveNodeItem.attr.pid)

                            // 修改当前节点数据
                            nodeItem.attr.pid = moveNodeItem.attr.pid
                            nodeItem.attr.sort = moveNodeItem.attr.sort + (o.type === 'moveUp' ? 0 : 1)

                            // 添加移动列表数据
                            moveLists.push({
                                id: nodeItem.id,
                                pid: nodeItem.attr.pid,
                                sort: nodeItem.attr.sort,
                            })

                            // 将本节点从原父节点中删除
                            const nodeItemIndex = $n_findIndex(parentNodeItem.children, { id: nodeItem.id })
                            parentNodeItem.children.splice(nodeItemIndex, 1)

                            // 获取移动至节点的索引
                            const moveNodeItemIndex = $n_findIndex(moveParentNodeItem.children, { id: moveNodeId })

                            for (let i = moveNodeItemIndex + (o.type === 'moveUp' ? 0 : 1); i < moveParentNodeItem.children.length; i++) {
                                const item = moveParentNodeItem.children[i]
                                item.attr.sort = item.attr.sort + 1
                                moveLists.push({
                                    id: item.id,
                                    pid: item.attr.pid,
                                    sort: item.attr.sort,
                                })
                            }

                            // 将本节点插入移动至位置
                            moveParentNodeItem.children.splice(moveNodeItemIndex + (o.type === 'moveUp' ? 0 : 1), 0, nodeItem)
                        }

                        // 请求 - 移动
                        const { status } = await $n_http({
                            url: o.menuStatus.value.allPowerBtn.move.url,
                            data: {
                                data: moveLists,
                            },
                        })
                        if (! status) {
                            // 移动失败, 还原数据
                            nodes.value = nodesClone
                            return false
                        }
                    },
                })
                break

            // 复制
            case 'copy':
                // 确认菜单
                confirmMenu(async function() {

                    if (! $n_get(o.menuStatus, 'value.allPowerBtn.copy.url')) {
                        console.error('没有找到复制地址')
                        return
                    }

                    // 复制的当前节点的属性
                    const newAttr = Object.assign({}, o.node.attr, {
                        title: '【复制】' + o.node.attr.title,
                    })

                    // 复制列表
                    const copyLists = [ newAttr ]

                    // 是否复制叶子节点
                    const isLeafNode = ! o.node.children.length

                    // 如果复制的是父级节点
                    if (! isLeafNode) {
                        getChildren(o.node.children, function(item) {
                            copyLists.push(item.attr)
                        })
                    }

                    // 请求 - 复制
                    const { status, data: res } = await $n_http({
                        url: o.menuStatus.value.allPowerBtn.copy.url,
                        data: {
                            data: copyLists,
                        },
                    })
                    if (! status) {
                        return
                    }

                    // 如果复制的是叶子节点
                    if (isLeafNode) {

                        // 如果返回了 id
                        if ($n_hasId(res)) {

                            // 更新数据
                            Object.assign(newAttr, res)

                            // 获取该叶子节点的父级节点
                            const parentNodeItem = getNode(newAttr.pid)
                            if (! parentNodeItem) {
                                return
                            }

                            // 新增节点
                            parentNodeItem.children.push(formatNode(newAttr))

                        // 否则重新加载列表
                        } else {
                            reload()
                        }

                    // 否则重新加载列表
                    } else {
                        reload()
                    }

                    // 轻提示
                    $n_toast({
                        type: 'positive',
                        message: '复制成功',
                    })
                })
                break

            // 删除
            case 'delete':

                // 如果有子节点
                if (o.node.children.length) {
                    // 提示框
                    $n_alert({
                        message: '请先删除该节点下的子节点',
                    })
                    return
                }

                if (! $n_get(o.menuStatus, 'value.allPowerBtn.delete.url')) {
                    console.error('没有找到删除地址')
                    return
                }

                // 确认菜单
                confirmMenu(async function() {

                    // 请求 - 删除
                    const { status } = await $n_http({
                        url: o.menuStatus.value.allPowerBtn.delete.url,
                        data: {
                            id: o.node.id,
                        },
                    })
                    if (! status) {
                        return
                    }

                    // 删除节点
                    deleteNode(o.node)

                    // 轻提示
                    $n_toast({
                        type: 'positive',
                        message: '删除成功',
                    })
                })
                break

            // 全部禁用
            case 'statusDisable':
            // 全部正常
            case 'statusNormal':

                if (! $n_get(o.menuStatus, 'value.allPowerBtn.status.url')) {
                    console.error('没有找到状态地址')
                    return
                }

                // 确认菜单
                confirmMenu(async function() {

                    // 设置状态 ids
                    const statusIds = [ o.node.id ]

                    // 新状态
                    const newStatus = o.type === 'statusNormal' ? 1 : 0

                    // 是否叶子节点
                    const isLeafNode = ! o.node.children.length

                    // 如果复制的是父级节点
                    if (! isLeafNode) {
                        getChildren(o.node.children, function(item) {
                            statusIds.push(item.id)
                        })
                    }

                    // 请求 - 全部禁用/正常
                    const { status } = await $n_http({
                        url: o.menuStatus.value.allPowerBtn.status.url,
                        data: {
                            // ids
                            ids: statusIds,
                            // 新状态值
                            status: newStatus,
                        },
                    })
                    if (! status) {
                        return
                    }

                    // 设置当前节点状态
                    o.node.attr.status = newStatus

                    // 如果是父级节点
                    if (! isLeafNode) {
                        getChildren(o.node.children, function(item) {
                            item.attr.status = newStatus
                        })
                    }

                    // 轻提示
                    $n_toast({
                        type: 'positive',
                        message: '恭喜您，操作成功',
                    })
                })
                break
        }
    }

    /**
     * 获取展开节点缓存
     */
    function getExpandedCache(defaultValue = []) {
        // 获取展开节点缓存
        const res = $n_storage.get('tree_expanded_' + $route.fullPath)
        return $n_isValidArray(res) ? res : defaultValue
    }

    /**
     * 设置展开节点缓存
     */
    function setExpandedCache(expanded) {
        // 设置展开节点缓存(永久缓存)
        $n_storage.set('tree_expanded_' + $route.fullPath, expanded, 0)
    }

    /**
     * 展开全部
     */
    function expandAll() {

        // 展开节点 ids
        const ids = []

        function getChildren(data) {
            for (const { id, children } of data) {
                ids.push(id)
                if ($n_isValidArray(children)) {
                    getChildren(children)
                }
            }
        }

        if ($n_isValidArray(nodes.value)) {
            getChildren(nodes.value)
        }

        // 设置展开节点数组
        expanded.value = ids
    }

    /**
     * 收起全部
     */
    function collapseAll() {
        // 设置展开节点数组
        expanded.value = [0]
    }

    return {
        // 当前地址
        fullPath: $route.fullPath,
        // 获取节点
        getNode,
        // 更新节点
        updateNode,
        // 删除节点
        deleteNode,
        // 获取菜单状态
        getMenuStatus,
        // 菜单点击
        menuClick,
        // 获取展开节点缓存
        getExpandedCache,
        // 设置展开节点缓存
        setExpandedCache,
        // 展开全部
        expandAll,
        // 收起全部
        collapseAll,
    }
}

/**
 * 树业务
 */
const $tree = {
    // 创建树实例
    create,
}

export default $tree
