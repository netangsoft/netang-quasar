<template>
    <div class="n-uploader" v-if="pageStatus === true">

        <!-- 隐藏上传文件输入框 -->
        <!--capture="camera"-->
        <input
            ref="fileRef"
            class="hidden"
            type="file"
            :multiple="count !== 1"
            @change="uploader.fileChange"
            v-bind="$attrs"
        >

        <!-- 插槽 -->
        <slot
            :count="count"
            :uploader="uploader"
            :query="uploadFileLists"
        />
    </div>
</template>

<script>
import { onMounted, ref, watch, provide, inject } from 'vue'

import $n_uploader from '../../utils/uploader'

import { NPowerKey, NUploaderKey } from '../../utils/symbols'

export default {

    /**
     * 标识
     */
    name: 'NUploader',

    /**
     * 声明属性
     */
    props: {
        // 值
        modelValue: [String, Array],
        // 上传器类型
        uploaderType: String,
        // 上传文件类型, 可选值 file image video audio
        type: {
            type: String,
            validator: v => [ 'file', 'image', 'video', 'audio'].includes(v),
            default: 'image',
        },
        // 上传文件数量(0:不限)
        count: {
            type: Number,
            default: 0,
        },
        // 单个文件的最大大小(单位: MB)
        maxSize: Number,
        // 单个文件的限制后缀
        exts: Array,
        // true: 值格式为数组, 如 ['xxxxxx', 'xxxxxx', 'xxxxxx']
        // false: 值格式为字符串, 如 xxxxxx,xxxxxx,xxxxxx
        valueArray: Boolean,
        // 是否去重
        unique: Boolean,
        // 是否初始加载文件信息(仅图片有效, 其他类型自动会加载文件信息)
        loadInfo: Boolean,
        // 单文件上传提示(true: 提示上传替换, false: 不提示直接替换)
        confirm: Boolean,
        // 提交时上传网络外链文件
        submitUploadNet: Boolean,
    },

    /**
     * 声明事件
     */
    emits: [
        'update:modelValue',
        'update',
    ],

    /**
     * 组合式
     */
    setup(props, { emit }) {

        // ==========【数据】============================================================================================

        // 获取权限注入数据
        const $power = inject(NPowerKey)

        // 页面状态
        const pageStatus = ref(false)

        // 上传文件输入框节点
        const fileRef = ref(null)

        // 上传文件列表
        const uploadFileLists = ref([])

        // 停止观察值
        let stopValueWatcher = false

        // 创建上传器
        const uploader = $n_uploader.create({
            // 上传器类型
            uploaderType: props.uploaderType,
            // 上传文件类型, 可选值 file image video audio
            type: props.type,
            // 声明属性
            props,
            // 上传文件输入框节点
            fileRef,
            // 上传文件列表
            uploadFileLists,
            // 更新值方法
            onUpdateModelValue({ value }) {
                // 停止观察值
                stopValueWatcher = true
                // 触发更新已选数据
                emit('update:modelValue', value)
            },
            // 更新方法
            onUpdate(res) {
                emit('update', res)
            },
        })

        // 更新布局数据
        if ($power) {
            $power?.update(function(data) {
                data.uploader.push(uploader)
            })
        }

        // ==========【监听数据】==============================================================================================

        /**
         * 监听上传文件列表
         */
        watch(()=>props.modelValue, function() {

            // 如果停止观察值
            if (stopValueWatcher === true) {
                // 取消停止观察值
                stopValueWatcher = false
                return
            }

            // 初始化上传列表
            uploader.initUploadFileLists()
                .finally()
        }, {
            // 深度监听
            deep: true,
        })

        // ==========【注入】=============================================================================================

        provide(NUploaderKey, {
            // 声明属性
            props,
            // 上传器
            uploader,
            // 文件队列
            query: uploadFileLists,
        })

        // ==========【生命周期】=========================================================================================

        /**
         * 实例被挂载后调用
         */
        onMounted( async function() {

            // 初始化上传列表
            await uploader.initUploadFileLists()

            // 页面状态
            pageStatus.value = true
        })

        // ==========【返回】=============================================================================================

        return {
            // 页面状态
            pageStatus,
            // 上传文件输入框节点
            fileRef,
            // 上传文件列表
            uploadFileLists,
            // 上传器
            uploader,
        }
    },
}
</script>
