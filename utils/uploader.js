import { ref, isRef } from 'vue'
import SparkMD5 from 'spark-md5'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_toLower from 'lodash/toLower'
import $n_findIndex from 'lodash/findIndex'
import $n_uniq from 'lodash/uniq'
import $n_find from 'lodash/find'
import $n_isFunction from 'lodash/isFunction'

import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_isRequired from '@netang/utils/isRequired'
import $n_forEach from '@netang/utils/forEach'
import $n_json from '@netang/utils/json'
import $n_join from '@netang/utils/join'
import $n_split from '@netang/utils/split'
import $n_trimString from '@netang/utils/trimString'
import $n_run from '@netang/utils/run'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_copy from '@netang/utils/copy'
import $n_http from '@netang/utils/http'
import $n_getThrowMessage from '@netang/utils/getThrowMessage'
import $n_runAsync from '@netang/utils/runAsync'

import $n_toast from './toast'
import $n_confirm from './confirm'
import $n_alert from './alert'
import $n_previewImage from './previewImage'
import $n_getImage from './getImage'
import $n_getFile from './getFile'
import $n_config from './config'

import { configs } from './config'

import {
    // 文件类型映射
    FilE_TYPE,
    // 文件名称映射
    FilE_NAME,
    // 上传状态
    UPLOAD_STATUS,
    // 上传器
    UPLOADERS,
} from './useUploader'

// 文件数量
let _fileNum = 0

/**
 * 创建上传器
 */
function create(options) {

    // ==========【数据】=========================================================================================

    const {
        // 上传文件输入框节点
        fileRef,
        // 更新值方法(初始化上传列表时不更新值)
        onUpdateModelValue,
        // 更新方法
        onUpdate,

    } = Object.assign({
        // 更新值方法
        onUpdateModelValue: null,
        // 更新方法
        onUpdate: null,
    }, options)

    // 声明属性
    const props = Object.assign({
        // 值
        modelValue: '',
        // 上传文件类型, 可选值 file image video audio
        type: 'image',
        // 上传文件数量(0:不限)
        count: 0,
        // 单个文件的最大大小(单位: MB)
        maxSize: 0,
        // 单个文件的限制后缀
        exts: [],
        // true: 值格式为数组, 如 ['xxxxxx', 'xxxxxx', 'xxxxxx']
        // false: 值格式为字符串, 如 xxxxxx,xxxxxx,xxxxxx
        valueArray: false,
        // 是否去重
        unique: false,
        // 是否初始加载文件信息(仅图片有效, 其他类型自动会加载文件信息)
        loadInfo: false,
        // 单文件上传提示
        confirm: false,
    }, $n_get(options, 'props'))

    // 上传文件列表
    const uploadFileLists = $n_has(options, 'uploadFileLists') && isRef(options.uploadFileLists) ? options.uploadFileLists : ref([])

    /**
     * 上传配置
     */
    const configUpload = Object.assign(
        {
            type: 'local',
        },
        $n_config('uploader.upload')
    )
    const configLimit = Object.assign({
        maxSize: 100,
        exts: [],
    },  $n_config('uploader.limit.' + props.type))

    // 如果有单个文件的最大大小
    if (props.maxSize) {
        configLimit.maxSize = props.maxSize
    }

    // 如果有单个文件的限制后缀
    if ($n_isValidArray(props.exts)) {
        configLimit.exts = props.exts
    }

    // ==========【计算属性】=========================================================================================

    /**
     * 上传文件后缀名
     */
    // const accept = computed(function () {
    //
    // })

    // ==========【监听数据】==============================================================================================

    /**
     * 监听上传文件列表
     */

    // ==========【方法】=================================================================================================

    /**
     * 获取值
     */
    function getValue() {

        const hashs = []
        const files = []

        for (const fileItem of uploadFileLists.value) {
            if (fileItem.status === UPLOAD_STATUS.success) {
                hashs.push(fileItem.hash)
                files.push(fileItem)
            }
        }

        const hashsString = $n_join(hashs, ',')

        return {
            value: props.valueArray ? hashs : hashsString,
            hashsString,
            hashs,
            files,
        }
    }

    /**
     * 更新值
     */
    function updateValue() {

        // 获取值
        const result = getValue()

        // 更新值
        $n_run(onUpdateModelValue)(result)

        // 更新
        $n_run(onUpdate)(result)
    }

    /**
     * 更新
     */
    function update() {
        // 更新
        $n_run(onUpdate)(getValue())
    }

    /**
     * 初始化上传列表
     */
    async function initUploadFileLists() {
        if ($n_isRequired(props.modelValue)) {

            // 获取值数组
            const hashs = props.valueArray ? props.modelValue : $n_split(props.modelValue, ',')

            // 如果类型不是图片 || 初始加载文件信息, 则请求文件信息
            if (props.type !== 'image' || props.loadInfo) {

                // 请求 - 获取文件
                const { status, data: resExisted } = await $n_http({
                    url: $n_config('apiFileUrl') + 'get_file',
                    data: {
                        hashs,
                    },
                    // 关闭错误
                    warn: false,
                })
                if (status) {

                    $n_forEach(resExisted, function (existedItem) {

                        // 创建原始单个文件
                        const fileItem = createRawFileItem()

                        // 设置已存在文件
                        setExistedFileItem(fileItem, existedItem)

                        // 添加至上传文件列表
                        uploadFileLists.value.push(Object.assign(fileItem, {
                            key: fileItem.hash,
                        }))
                    })

                    // 更新
                    update()
                }
                return
            }

            $n_forEach(hashs, function(hash) {

                // 添加至上传文件列表
                uploadFileLists.value.push(Object.assign(createRawFileItem(), {
                    // 文件唯一 key
                    key: hash,
                    // hash
                    hash,
                    // 状态
                    status: UPLOAD_STATUS.success,
                    // 进度
                    progress: 100,
                    // 信息
                    msg: '',
                }))
            })
        }
    }

    /**
     * 检查是否正在上传文件
     */
    function checkUploading() {
        for (const fileItem of uploadFileLists.value) {
            if (fileItem.status < UPLOAD_STATUS.success) {
                return true
            }
        }
        return false
    }

    /**
     * 选择文件上传
     */
    function chooseUpload() {
        // 点击文件输入框
        fileRef.value.click()
    }

    /**
     * 文件输入框更新
     */
    function fileChange(e) {

        try {
            // 获取上传文件
            const files = Array.from(e.target.files)

            // 清空上传文件输入框内容
            fileRef.value.value = ''

            // 如果没有选择文件
            if (! files.length) {
                // 则无任何操作
                return
            }

            // 遍历选择的文件列表
            for (const file of files) {

                // 创建单个文件
                const fileItem = createFileItem(file)
                if (fileItem !== false) {

                    // 如果只能上传一个
                    if (props.count === 1) {

                        // 如果有上传文件列表
                        if (uploadFileLists.value.length) {

                            // 如果开启单文件上传提示
                            if (props.confirm) {

                                // 确认框
                                $n_confirm({
                                    message: '最多只能上传1个文件，确认上传并替换吗？',
                                })
                                    // 点击确认执行
                                    .onOk(function () {

                                        // 删除所有文件
                                        deleteAll()

                                        // 添加至上传文件列表
                                        uploadFileLists.value.push(fileItem)

                                        // 开始上传
                                        startUpload()
                                            .finally()
                                    })
                                return
                            }

                            // 删除所有文件
                            deleteAll()
                        }

                    } else if (
                        // 如果有上传数量限制
                        props.count > 1
                        // 上传文件列表数量 === 上传数量限制
                        && uploadFileLists.value.length >= props.count
                    ) {
                        // 轻提示
                        $n_toast({
                            message: `最多只能上传${props.count}个文件，请先删除后再上传`,
                        })
                        return
                    }

                    // 添加至上传文件列表
                    uploadFileLists.value.push(fileItem)
                }
            }

            // 开始上传
            startUpload()
                .finally()

        } catch (e) {

            // 错误提示
            $n_alert({
                message: $n_getThrowMessage(e),
            })
        }

    }

    /**
     * 开始上传
     */
    async function startUpload() {

        // 【设置待上传文件的 hash】
        // --------------------------------------------------
        const promises = []
        for (const fileItem of uploadFileLists.value) {
            // 如果是等待上传的文件
            if (fileItem.status === UPLOAD_STATUS.waiting) {

                // 检查文件错误
                const errMsg = checkFileError(fileItem)
                if (errMsg) {
                    // 设置文件上传失败
                    setFileFail(fileItem, errMsg)

                } else {
                    // 设置文件 hash
                    promises.push(setFileHash(fileItem))
                }
            }
        }
        await Promise.all(promises)

        // 检查待上传文件在服务器上是否存在
        // --------------------------------------------------
        if (! await checkWaitUploadFileExists()) {
            return
        }

        // 上传
        await upload()
    }

    /**
     * 上传
     */
    let _upload = null
    async function upload() {
        try {
            if (! _upload) {
                const run = $n_get(UPLOADERS, configUpload.type)
                if (run) {
                    _upload = (await run()).default
                }
                if (! _upload) {
                    // 错误提示
                    $n_alert({
                        message: '没有定义上传器',
                    })
                    return
                }
            }

            // 待上传文件列表
            const waitUploadFileLists = []
            for (const fileItem of uploadFileLists.value) {
                // 检查存在服务器完成
                if (fileItem.status === UPLOAD_STATUS.existChecked) {
                    waitUploadFileLists.push(fileItem)
                }
            }
            if (! waitUploadFileLists.length) {
                return
            }

            // 上传
            await _upload({
                config: configUpload,
                waitUploadFileLists,
                uploadFileLists,
                checkFileError,
                setFileSuccess,
                setFileFail,
            })

        } catch (e) {
            // 错误提示
            $n_alert({
                message: $n_getThrowMessage(e),
            })
        }
    }

    /**
     * 设置文件上传成功
     */
    const setFileSuccess = (fileItem) => {

        // 设置文件状态
        fileItem.status = UPLOAD_STATUS.success
        // 设置文件信息
        fileItem.msg = ''
        // 设置文件检查进度
        fileItem.progress = 0

        // // 单个文件上传结束回调
        // uploadQueryCallback(fileItem)
        //
        // // 上传更新回调
        // uploadChange(getResultData())

        // 更新值
        updateValue()
    }

    /**
     * 设置文件上传失败
     */
    function setFileFail(fileItem, errMsg) {

        // 设置文件状态
        fileItem.status = UPLOAD_STATUS.fail
        // 设置文件信息
        fileItem.msg = errMsg || `无效${FilE_NAME[fileItem.type]}`
        // 设置文件检查进度
        fileItem.progress = 0

        // // 单个文件上传结束回调
        // uploadQueryCallback(fileItem)
    }

    /**
     * 设置文件 hash
     */
    function setFileHash(fileItem) {
        return new Promise(function (resolve) {

            // 设置文件状态
            fileItem.status = UPLOAD_STATUS.hashChecking
            // 设置文件检查进度
            fileItem.progress = 0

            const {
                file,
            } = fileItem

            // blob 切片
            const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
            // 以 2MB 的分片读取
            const chunkSize = 2097152
            // 总分片数量
            const chunks = Math.ceil(file.size / chunkSize)
            // 初始化 SparkMD5
            const spark = new SparkMD5.ArrayBuffer()
            // 当前分片数
            let currentChunk = 0
            // 创建文件读取器
            const fileReader = new FileReader()

            // 文件加载
            fileReader.onload = function(e) {

                // 追加 array buffer
                spark.append(e.target.result)

                // 当前分片数++
                currentChunk++

                // 如果分块数量 < 总分片数量
                if (currentChunk < chunks) {

                    // 设置文件检查进度
                    fileItem.progress = Math.floor((currentChunk / chunks) * 100)

                    // 读取下一个分片
                    loadNext()

                } else {

                    // 获取文件 hash
                    const hash = spark.end(false)

                    // 下一步
                    function next(hash) {
                        if (
                            // 如果开启去重
                            props.unique
                            // 如果该文件 hash 在上传文件列表中
                            && $n_findIndex(uploadFileLists.value, { hash }) > -1
                        ) {
                            // 轻提示
                            $n_toast({
                                message: '该文件已存在，不可重复上传',
                            })

                            // 设置文件上传失败
                            setFileFail(fileItem, '已存在')

                            // 删除单个文件
                            deleteFileItem(fileItem)

                        } else {
                            // 设置文件 hash
                            fileItem.hash = hash
                            // 设置文件状态
                            fileItem.status = UPLOAD_STATUS.hashChecked
                            // 设置文件检查进度
                            fileItem.progress = 100
                        }

                        // 完成回调
                        resolve()
                    }

                    // 格式化上传文件 hash
                    // --------------------------------------------------
                    const {
                        formatUploadFileHash,
                    } = configs
                    if ($n_isFunction(formatUploadFileHash)) {
                        $n_runAsync(formatUploadFileHash)(hash, fileItem)
                            .then(function (newHash) {
                                // 下一步
                                next($n_isValidString(newHash) ? newHash : hash)
                            })
                        return
                    }
                    // --------------------------------------------------

                    // 下一步
                    next(hash)
                }
            }

            // 文件加载错误
            fileReader.onerror = function() {
                // 设置文件上传失败
                setFileFail(fileItem)
            }

            /**
             * 读取下一个分片
             */
            function loadNext() {
                const start = currentChunk * chunkSize
                const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
            }

            // 读取下一个分片
            loadNext()
        })
    }

    /**
     * 检查文件错误
     */
    function checkFileError({ type, size, ext }) {

        // 需要上传的文件类型
        const fileType = FilE_TYPE[props.type]

        // 如果 类型为文件, 则不受限制 || 当前上传的类型允许
        if (props.type === 'file' || type === fileType) {

            const {
                maxSize,
                exts,
            } = configLimit

            // 检查文件后缀名
            if (
                // 如果没有后缀名, 则无效
                ! ext
                // 如果后缀名不在允许范围内, 则无效
                || (
                    $n_isValidArray(exts)
                    && exts.indexOf(ext) === -1
                )
            ) {
                return '后缀名不允许'
            }

            // 检查文件大小
            if (size > 0) {
                if (
                    maxSize > 0
                    && size > (maxSize * 1048576)
                ) {
                    return `${FilE_NAME[fileType]}大于${maxSize}M`
                }
                return
            }
        }

        return `无效${FilE_NAME[fileType]}`
    }

    /**
     * 检查待上传文件在服务器上是否存在
     */
    async function checkWaitUploadFileExists() {

        // 需检查的 hashs
        const checkHashs = []
        // 需检查的文件列表
        const checkFileLists = []

        for (const fileItem of uploadFileLists.value) {
            if (fileItem.status === UPLOAD_STATUS.hashChecked) {
                // 设置文件状态
                fileItem.status = UPLOAD_STATUS.existChecking
                // 添加检查 hash 数组
                checkHashs.push(fileItem.hash)
                // 添加检查文件列表
                checkFileLists.push(fileItem)
            }
        }

        // 如果没有需要检查的 hash
        if (! checkHashs.length) {
            // 返回失败
            return false
        }

        // 请求 - 检查文件是否存在 hash
        const { status, data: resExisted } = await $n_http({
            url: $n_config('apiFileUrl') + 'check_exist',
            data: {
                hashs: $n_uniq(checkHashs),
            },
            // 关闭错误
            warn: false,
        })

        // 如果请求失败
        if (! status) {
            // 设置文件上传失败
            for (const fileItem of checkFileLists) {
                setFileFail(fileItem, resExisted.msg)
            }
            // 返回失败
            return false
        }

        // 设置文件状态
        for (const fileItem of checkFileLists) {
            fileItem.status = UPLOAD_STATUS.existChecked
        }

        // 如果有存在的文件列表
        if ($n_isValidArray(resExisted)) {

            // 已存在文件数量
            let existedNum = 0
            // 不存在文件数量
            let noExistNum = 0

            for (const fileItem of checkFileLists) {

                // 如果文件已存在(已经上传过了, 就是检查是否秒传文件)
                const existedItem = $n_find(resExisted, { hash: fileItem.hash })
                if (existedItem) {

                    // 如果 类型为文件, 则不受限制 || 文件类型正确
                    if (props.type === 'file' || fileItem.type === $n_get(existedItem, 'type')) {

                        // 设置已存在文件
                        setExistedFileItem(fileItem, existedItem)

                        // 单个文件上传结束回调
                        // uploadQueryCallback(fileItem)

                        // 已存在文件数量++
                        existedNum++

                    // 否则有不存在文件
                    } else {
                        // 不存在文件数量++
                        noExistNum++
                    }

                // 否则有不存在文件
                } else {
                    // 不存在文件数量++
                    noExistNum++
                }
            }

            // 如果有已存在的文件
            if (existedNum) {

                // 更新值
                updateValue()

                // 上传更新回调
                // uploadChange(getResultData())
            }

            return noExistNum > 0
        }

        return true
    }

    /**
     * 创建原始单个文件
     */
    function createRawFileItem() {
        return {
            // id
            id: ++_fileNum,
            // 文件唯一 key
            // key,
            // 文件名
            title: '',
            // 文件原始数据
            // file,
            // 类型(1:文件,2:图片,3:视频,4:音频)
            type: FilE_TYPE[props.type],
            // 后缀
            ext: '',
            // 大小
            size: 0,
            // hash
            hash: '',
            // 信息
            json: {},
            // 状态: waiting checking checked uploading success fail
            status: UPLOAD_STATUS.waiting,
            // 进度
            progress: 0,
            // 信息
            msg: '待上传',
            // 中断上传
            abort() {},
        }
    }

    /**
     * 创建单个文件
     */
    function createFileItem(file) {

        // 单个文件示例
        // name: "123.jpg"
        // size: 101206
        // type: "image/jpeg"
        // lastModified: 1629099994411
        // lastModifiedDate: Mon Aug 16 2021 15:46:34 GMT+0800 (中国标准时间) {}
        // webkitRelativePath: ""

        const {
            name,
            size,
            lastModified,
            webkitRelativePath,
        } = file

        // 文件唯一 key
        const key = webkitRelativePath + lastModified + name + size

        if (
            // 如果开启去重
            props.unique
            // 如果该文件 key 在上传文件列表中
            && $n_findIndex(uploadFileLists.value, { key }) > -1
        ) {
            // 轻提示
            $n_toast({
                message: '该文件已存在，不可重复上传',
            })

            // 则返回 false
            return false
        }

        // 文件名
        let title = name
        // 文件后缀名
        let ext = ''

        const index = name.lastIndexOf('.')
        if (index > -1) {
            title = name.substring(0, index)
            ext = $n_toLower(name.substring(index + 1))
        }

        // 创建单个文件
        const fileItem = Object.assign(createRawFileItem(), {
            // 文件唯一 key
            key,
            // 文件原始数据
            file,
            // 文件名
            title,
            // 后缀
            ext,
            // 大小
            size,
        })

        // 如果上传类型为图片
        if (
            props.type === 'image'
            && file.type.toLowerCase().startsWith('image')
        ) {
            // 获取图片预览地址
            const img = new Image()
            img.src = window.URL.createObjectURL(file)
            fileItem.__img = img.src
        }

        return fileItem
    }

    /**
     * 设置已存在文件
     */
    function setExistedFileItem(fileItem, existedItem) {

        // 返回数据示例
        // ------------------------------
        // title: 1
        // type: 2
        // hash: "799e6bb77f638e192b9079e6a55bc2de"
        // ext: "jpg"
        // size: 306037
        // json: "{\"w\":1920,\"h\":1200,\"o\":1}"
        // status: 1

        const {
            // 标题
            title,
            // 类型(1:文件,2:图片,3:视频,4:音频)
            type,
            // hash
            hash,
            // 后缀
            ext,
            // 大小
            size,
            // 信息
            json,
        } = existedItem

        const fileJson = $n_json.parse(json)

        // 设置文件
        Object.assign(fileItem, {
            // 标题
            title,
            // 类型(1:文件,2:图片,3:视频,4:音频)
            type,
            // hash
            hash,
            // 后缀
            ext,
            // 大小
            size,
            // 信息
            json: $n_isValidObject(fileJson) ? fileJson : {},
            // 状态
            status: UPLOAD_STATUS.success,
            // 进度
            progress: 100,
            // 信息
            msg: '',
        })
    }

    /**
     * 删除所有文件
     */
    function deleteAll() {

        // 如果有上传文件列表
        if (uploadFileLists.value.length) {

            for (const fileItem of uploadFileLists.value) {
                // 退出上传
                fileItem.abort()
            }

            // 清空上传文件列表
            uploadFileLists.value = []
        }
    }

    /**
     * 删除单个文件
     */
    function deleteFileItem(fileItem) {
        const index = $n_findIndex(uploadFileLists.value, { id: fileItem.id })
        if (index > -1) {

            const {
                status,
            } = fileItem

            // 退出上传
            fileItem.abort()

            // 从上传文件列表中删除
            uploadFileLists.value.splice(index, 1)

            // 如果该文件已上传成功
            if (status === UPLOAD_STATUS.success) {
                // 更新值
                updateValue()
            }
        }
    }

    /**
     * 预览图片
     */
    function previewImage(fileItem) {
        // 预览图片
        if (fileItem.type === FilE_TYPE.image) {
            $n_previewImage({
                images: [
                    $n_has(fileItem, '__img') ? fileItem.__img : fileItem.hash,
                ],
            })
        }
    }

    /**
     * 修改文件名
     */
    async function editFileTitle(newTitle, fileItem) {

        if ($n_isValidValue(newTitle)) {

            newTitle = $n_trimString(newTitle)

            const {
                hash,
                title,
            } = fileItem

            if (title === newTitle) {
                return
            }

            // 先设置新文件名
            fileItem.title = newTitle

            // 请求 - 修改文件名
            const { status } = await $n_http({
                url: $n_config('apiFileUrl') + 'edit_file_title',
                data: {
                    hash,
                    title: newTitle,
                },
            })

            // 如果修改失败
            if (! status) {
                // 还原文件名
                fileItem.title = title
                return
            }

            // 轻提示
            $n_toast({
                type: 'positive',
                message: '修改成功',
            })
        }
    }

    /**
     * 播放
     */
    function play(fileItem) {
        // 轻提示
        $n_toast({
            message: '播放还没做',
        })
    }

    /**
     * 复制地址
     */
    function copyUrl(fileItem) {

        const url = fileItem.type === FilE_TYPE.image ?
            // 如果是图片
            $n_getImage(fileItem.hash)
            // 否则是文件
            : $n_getFile(fileItem.hash)

        if ($n_isValidString(url)) {
            $n_copy(url, '复制地址成功')
        }
    }

    return {
        // 上传文件列表
        query: uploadFileLists,
        // 更新值
        updateValue,
        // 初始化上传列表
        initUploadFileLists,
        // 检查是否正在上传文件
        checkUploading,
        // 选择文件上传
        chooseUpload,
        // 文件输入框更新
        fileChange,
        // 删除所有文件
        deleteAll,
        // 删除单个文件
        deleteFileItem,
        // 预览图片
        previewImage,
        // 修改文件名
        editFileTitle,
        // 播放视频/音频
        play,
        // 复制地址
        copyUrl,
    }
}

/**
 * 上传器
 */
const uploader = {
    // 创建对话框
    create,
}

export default uploader
