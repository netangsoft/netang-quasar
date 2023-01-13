<template>
    <q-layout
        :view="view"
        :container="container"
        :onScroll="onScroll"
        :onScrollHeight="onScrollHeight"
        :onResize="onResize"
    >
        <q-page-container v-if="pageStatus === false">
            <q-page class="q-pa-lg flex flex-center">
                {{emptyDescription}}
            </q-page>
        </q-page-container>

        <slot :data="data" v-else-if="pageStatus === true" />
    </q-layout>
</template>

<script>
import { provide } from 'vue'
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
        view: String,
        container: Boolean,
        onScroll: Function,
        onScrollHeight: Function,
        onResize: Function,
        name: String,

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

        // 布局数据
        const data = {
            // 左边侧滑菜单数据
            left: {
                // 是否显示
                data: null,
            },
            // 右边侧滑菜单数据
            right: {
                // 是否显示
                data: null,
            },
            // 权限数据
            role: {},
            // 表格数据
            table: {},
            // 上传器
            uploader: [],
        }
        data.left.show = function() {
            return data.left.data !== null ? data.left.data.value : false
        }
        data.left.toggle = function () {
            if (data.left.data !== null) {
                data.left.data.value = ! data.left.data.value
            }
        }
        data.right.show = function() {
            return data.right.data !== null ? data.right.data.value : false
        }
        data.right.toggle = function () {
            if (data.right.data !== null) {
                data.right.data.value = ! data.right.data.value
            }
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
