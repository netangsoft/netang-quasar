import routers from '@/router/routers'

/**
 * 获取路由
 */
export default function getRouter(mainRouter, errorRouter) {

    const routes = [
        mainRouter
    ]

    utils.forIn(routers, function(item, key) {

        // 如果没有 meta
        if (! _.has(item, 'meta')) {
            item.meta = {}
        }

        // path
        item.path = utils.slash(key, 'start', true)

        // 如果是单独路由
        if (_.get(item.meta, 'parent') === false) {
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
