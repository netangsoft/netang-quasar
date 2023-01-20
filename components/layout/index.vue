<template>
    <q-layout
        v-bind="$attrs"
    >
        <!-- 错误提示 -->
        <q-page-container v-if="pageStatus === false">
            <q-page class="q-pa-lg flex flex-center">
                {{emptyDescription}}
            </q-page>
        </q-page-container>

        <!-- 插槽 -->
        <slot :data="data" v-else-if="pageStatus === true" />
    </q-layout>

    <!-- 加载 -->
    <q-inner-loading
        :showing="pageLoading"
    />
</template>

<script>
import { provide, ref } from 'vue'
import { NLayoutKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NLayout',

    /**
     * 声明属性
     */
    props: {
        // 页面加载
        pageLoading: Boolean,
        // 页面状态
        pageStatus: {
            type: Boolean,
            default: null,
        },
        // 空状态描述
        emptyDescription: {
            type: String,
            default: '发生未知错误',
        },
    },

    /**
     * 组合式
     */
    setup() {

        // ==========【注入】============================================================================================

        const leftModelValue = ref(null)
        const rightModelValue = ref(null)

        // 布局数据
        const data = {
            // 左边侧滑菜单数据
            left: {
                // 是否显示
                modelValue: leftModelValue,
                // 是否显示切换按钮
                showButton() {
                    return leftModelValue.value !== null
                },
                // 切换
                toggle() {
                    if (leftModelValue.value !== null) {
                        leftModelValue.value = ! leftModelValue.value
                    }
                },
            },
            // 右边侧滑菜单数据
            right: {
                // 是否显示
                modelValue: rightModelValue,
                // 是否显示切换按钮
                showButton() {
                    return rightModelValue.value !== null
                },
                // 切换
                toggle() {
                    if (rightModelValue.value !== null) {
                        rightModelValue.value = ! rightModelValue.value
                    }
                },
            },
            // 权限数据
            role: {},
            // 表格数据
            table: {},
            // 上传器
            uploader: [],
        }

        // 向后代注入数据
        provide(NLayoutKey, {
            // 注入数据
            data,
            // 更新注入数据
            update(cb) {
                cb(data)
            },
            // 检查是否上传中
            checkUploading() {
                for (const uploader of data.uploader) {
                    if (uploader.checkUploading()) {
                        return true
                    }
                }
                return false
            },
        })

        return {
            // 布局数据
            data,
        }
    },
}
</script>
