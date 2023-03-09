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
import $n_router from '@netang/utils/vue/router'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_isFunction from 'lodash/isFunction'

import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_slash from '@netang/utils/slash'

import components from '../private/components'

import $n_$render from '../../utils/$render'
import { NRenderKey } from '../../utils/symbols'
import { configs } from '../../utils/config'

const {
    // 自定义路由
    routers,
} = configs

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
        // 组件
        component: Object,
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
                comp = $n_get(routers, `${$n_slash(props.path, 'start', false)}.component`)

            // 如果有组件标识
            } else if (props.name && $n_has(components, props.name)) {
                // 设置自定义组件
                comp = components[props.name]

            // 如果有声明组件
            } else if (props.component) {
                // 设置声明组件
                comp = props.component
            }

            // 如果没有组件
            if (! comp) {
                return
            }

            // 如果是方法, 则说明是异步组件
            if ($n_isFunction(comp)) {
                return defineAsyncComponent(comp)
            }

            // 返回组件
            return comp
        })

        // ==========【注入】============================================================================================

        // 创建渲染
        $n_$render.create(props)

        // ==========【返回】=============================================================================================

        return {
            // 组件
            comp,
        }
    }
}
</script>
