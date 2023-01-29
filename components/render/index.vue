<template>
    <q-layout
        class="absolute-full"
        view="hHh lpr fFf"
        container
    >
        <q-page-container>
            <slot
                :query="query"
                v-bind="props"
                v-if="$slots.default"
            />
            <component
                :is="comp"
                :query="query"
                v-bind="props"
                v-else
            />
        </q-page-container>
    </q-layout>
</template>

<script>
import { computed, defineAsyncComponent, provide } from 'vue'

import routers from '@/router/routers'
import components from '../private/components'

import { NRenderKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NRender',

    /**
     * 声明属性
     */
    props: {
        // 组件标识
        name: String,
        // 组件路径
        path: String,
        // 参数
        query: Object,
        // 组件传参
        props: Object,
    },

    /**
     * 组合式
     */
    setup(props) {

        // ==========【计算属性】=========================================================================================

        /**
         * 获取当前组件
         */
        const comp = computed(function () {

            // 组件
            let comp

            // 如果是路由路径
            if (props.path) {
                // 获取路由组件
                comp = _.get(routers, `${utils.slash(props.path, 'start', false)}.component`)

            // 如果有组件标识
            } else if (props.name && _.has(components, props.name)) {
                // 获取自定义组件
                comp = components[props.name]
            }

            // 如果没有组件
            if (! comp) {
                return
            }

            // 如果是方法, 则说明是异步组件
            if (_.isFunction(comp)) {
                return defineAsyncComponent(comp)
            }

            // 返回组件
            return comp
        })

        // ==========【注入】============================================================================================

        // 注入数据
        const data = {
            // 组件标识
            name: props.name,
            // 参数
            query: utils.isValidObject(props.query) ? props.query : {},
            // 组件传参
            props: props.props,
        }

        // 如果有路由路径
        if (utils.isValidString(props.path)) {

            // 获取页面路由
            const $route = utils.router.resolve({
                path: props.path,
                query: data.query,
            })

            Object.assign(data, {
                // 当前路由全路径
                routeFullPath: $route.fullPath,
                // 当前路由路径
                routePath: $route.path,
                // 当前路由参数
                routeQuery: $route.query,
                // 当前路由,
                $route,
            })
        }

        // 向后代注入数据
        provide(NRenderKey, data)

        // ==========【返回】=============================================================================================

        return {
            // 组件
            comp,
        }
    }
}
</script>
