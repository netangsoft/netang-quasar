<template>
    <div v-if="container">
        <!-- 空数据 -->
        <n-empty
            :description="emptyDescription"
            v-if="pageStatus === false"
        />
        <!-- 插槽 -->
        <slot v-else-if="pageStatus === true" />
        <!-- 加载 -->
        <q-inner-loading
            :showing="pageLoading"
        />
    </div>
    <q-page
        v-bind="$attrs"
        v-else
    >
        <!-- 空数据 -->
        <n-empty
            :description="emptyDescription"
            v-if="pageStatus === false"
        />
        <!-- 插槽 -->
        <slot v-else-if="pageStatus === true" />
        <!-- 加载 -->
        <q-inner-loading
            :showing="pageLoading"
        />
    </q-page>
</template>

<script>
import { inject } from 'vue'

import { NPowerKey } from '../../utils/symbols'

import NEmpty from '../empty'

export default {

    /**
     * 标识
     */
    name: 'NPowerPage',

    /**
     * 声明属性
     */
    props: {
        // 是否容器化
        container: Boolean,
    },

    /**
     * 组件
     */
    components: {
        NEmpty,
    },

    /**
     * 组合式
     */
    setup() {

        // ==========【数据】============================================================================================

        // 获取注入权限数据
        const {
            // 页面状态
            pageStatus,
            // 空状态描述
            emptyDescription,
            // 页面加载
            pageLoading,
        } = inject(NPowerKey)

        // ==========【返回】============================================================================================
        return {
            // 页面状态
            pageStatus,
            // 空状态描述
            emptyDescription,
            // 页面加载
            pageLoading,
        }
    },
}
</script>
