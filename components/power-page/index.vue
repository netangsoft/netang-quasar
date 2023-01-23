<template>
    <q-page
        v-bind="$attrs"
    >
        <!-- 空数据 -->
        <n-empty
            :empty-description="emptyDescription"
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

export default {

    /**
     * 标识
     */
    name: 'NPowerPage',

    /**
     * 组合式
     */
    setup() {
        // ==========【数据】============================================================================================

        // 获取注入权限数据
        const $power = inject(NPowerKey)

        // ==========【返回】============================================================================================
        return {
            ...$power,
        }
    },
}
</script>
