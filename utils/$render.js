import { provide } from 'vue'

import $n_router from '@netang/utils/vue/router'

import $n_isValidString from '@netang/utils/isValidString'
import $n_isValidObject from '@netang/utils/isValidObject'

import { NRenderKey } from './symbols'

/**
 * 创建渲染
 */
function create(options) {

    // ==========【数据】=================================================================================================

    // 获取参数
    const o = Object.assign({
        // 组件标识
        name: '',
        // 路由路径
        path: '',
        // 路由参数
        query: {},
        // 组件传参
        props: {},
    }, options)

    const data = {
        // 组件标识
        name: o.name,
        // 参数
        query: $n_isValidObject(o.query) ? o.query : {},
        // 组件传参
        props: o.props,
    }

    // 如果有路由路径
    if ($n_isValidString(o.path)) {

        // 获取页面路由
        const $route = $n_router.resolve({
            path: o.path,
            query: data.query,
        })

        Object.assign(data, {
            // 当前路由全路径
            routeFullPath: $route.fullPath,
            // 当前路由路径
            routePath: $route.path,
            // 当前路由参数
            routeQuery: $route.query,
            // 获取当前路由,
            getRoute() {
                return $route
            },
        })
    }

    // 提供可以被后代组件注入的值
    provide(NRenderKey, data)

    return data
}

/**
 * 业务渲染
 */
const $render = {
    // 创建表格
    create,
}

export default $render
