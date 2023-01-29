<template>
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
</template>

<script>
import { computed, defineAsyncComponent, provide } from 'vue'

import routers from '@/router/routers'
import components from './components'

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

        // 向后代注入数据
        provide(NRenderKey, {
            // 组件标识
            name: props.name,
            // 路由路径
            path: utils.isValidString(props.path) ? utils.slash(props.path, 'start', true) : '',
            // 参数
            query: utils.isValidObject(props.query) ? props.query : {},
            // 组件传参
            props: props.props,
        })

        // ==========【返回】=============================================================================================

        return {
            // 组件
            comp,
        }
    }
}
</script>
