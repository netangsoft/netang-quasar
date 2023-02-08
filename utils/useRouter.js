import $n_isNil from 'lodash/isNil'
import $n_has from 'lodash/has'
import $n_get from 'lodash/get'

import $n_forIn from '@netang/utils/forIn'
import $n_slash from '@netang/utils/slash'

import { configs } from './config'

/**
 * 获取路由
 */
export function getRouters(mainRouter, errorRouter, routers = null) {

    const routes = [
        mainRouter,
    ]

    if ($n_isNil(routers)) {
        routers = $n_get(configs, 'routers')
    }

    $n_forIn(routers, function(item, key) {

        // 如果没有 meta
        if (! $n_has(item, 'meta')) {
            item.meta = {}
        }

        // path
        item.path = $n_slash(key, 'start', true)

        // 如果是单独路由
        if ($n_get(item.meta, 'parent') === false) {
            routes.push(item)

        // 否则为框架页面
        } else {
            mainRouter.children.push(item)
        }
    })

    // 添加错误路由
    routes.push(errorRouter)

    return routes
}
