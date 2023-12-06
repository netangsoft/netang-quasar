import { ref, isRef, } from 'vue'
import { useQuasar } from 'quasar'
import SparkMD5 from 'spark-md5'

import $n_has from 'lodash/has'
import $n_get from 'lodash/get'
import $n_toLower from 'lodash/toLower'
import $n_findIndex from 'lodash/findIndex'
import $n_uniq from 'lodash/uniq'
import $n_find from 'lodash/find'
import $n_isFunction from 'lodash/isFunction'

import $n_storage from '@netang/utils/storage'
import $n_isValidArray from '@netang/utils/isValidArray'
import $n_isValidObject from '@netang/utils/isValidObject'
import $n_isValidString from '@netang/utils/isValidString'
import $n_forEach from '@netang/utils/forEach'
import $n_indexOf from '@netang/utils/indexOf'
import $n_json from '@netang/utils/json'
import $n_join from '@netang/utils/join'
import $n_split from '@netang/utils/split'
import $n_trimString from '@netang/utils/trimString'
import $n_run from '@netang/utils/run'
import $n_isValidValue from '@netang/utils/isValidValue'
import $n_http from '@netang/utils/http'
import $n_getThrowMessage from '@netang/utils/getThrowMessage'
import $n_runAsync from '@netang/utils/runAsync'
import $n_numberDeep from '@netang/utils/numberDeep'

import $n_$ruleValid from './$ruleValid'
import $n_toast from './toast'
import $n_confirm from './confirm'
import $n_alert from './alert'
import $n_previewImage from './previewImage'
import $n_getImage from './getImage'
import $n_getFile from './getFile'
import $n_config from './config'
import $n_timestamp from './timestamp'
import $n_play from './play'

import copy from './copy'
import { configs } from './config'

/**
 * 文件类型映射
 */
export const FilE_TYPE = {
    file: 1,
    image: 2,
    video: 3,
    audio: 4,
}

/**
 * 文件名称映射
 */
export const FilE_NAME = {
    1: '文件',
    2: '图片',
    3: '视频',
    4: '音频',
}

/**
 * 上传状态
 */
export const UPLOAD_STATUS = {
    // 等待上传中
    waiting: 1,
    // 检查 hash 中
    hashChecking: 2,
    // 检查 hash 完成
    hashChecked: 3,
    // 检查是否存在服务器中
    existChecking: 4,
    // 检查是否存在服务器完成
    existChecked: 5,
    // 上传中
    uploading: 6,
    // 上传完成
    success: 7,
    // 上传失败
    fail: 8,
}

// 文件数量
let _fileNum = 0

/**
 * 将 base64 转换为 File
 */
function dataUrlToFile(dataUrl) {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = window.atob(arr[1])
    let n = bstr.length
    const arrayBuffer = new Uint8Array(n)
    while (n--) {
        arrayBuffer[n] = bstr.charCodeAt(n)
    }
    const blob = new Blob([arrayBuffer], { type: mime })

    return {
        arrayBuffer,
        file: new File([blob], String($n_timestamp()), { type: blob.type }),
    }
}

/**
 * 创建上传器
 */
function create(options) {

    // ==========【数据】=========================================================================================

    // quasar 对象
    const $q = useQuasar()

    const {
        // 上传器类型
        uploaderType,
        // 上传文件输入框节点
        fileRef,
        // 更新值方法(初始化上传列表时不更新值)
        onUpdateModelValue,
        // 更新方法
        onUpdate,

    } = Object.assign({
        // 上传器类型
        uploaderType: null,
        // 更新值方法
        onUpdateModelValue: null,
        // 更新方法
        onUpdate: null,
    }, options)

    const optionsProps = $n_get(options, 'props')

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
    }, optionsProps)

    // options 中是否存在 props.modelValue
    const hasPropsModelValue = $n_has(optionsProps, 'modelValue')

    // 上传文件列表
    const uploadFileLists = $n_has(options, 'uploadFileLists') && isRef(options.uploadFileLists) ? options.uploadFileLists : ref([])

    // 上传网络外链回调
    let uploadNetCallback

    /**
     * 上传配置
     */
    const configUpload = getUpload(null, uploaderType)

    const configLimit = Object.assign(
        {
            maxSize: 100,
            exts: [],
        },
        $n_config('uploader.limit.' + props.type, {})
    )

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
    // if (props.watchModelValue && hasPropsModelValue) {
    //     watch(()=>options.props.modelValue, function() {
    //         // 初始化上传列表
    //         initUploadFileLists()
    //             .finally()
    //     })
    // }

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
            query: uploadFileLists,
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

        // 上传网络外链回调
        $n_run(uploadNetCallback)()
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

        const modelValue = hasPropsModelValue ? options.props.modelValue : props.modelValue

        // 值数组
        const hashs = []

        // hash all
        const hashAll = {}

        // 获取值数组
        const lists = props.valueArray ? modelValue : $n_split(modelValue, ',')

        if (
            // 如果只能上传一个
            props.count === 1
            // 如果为空
            && ! $n_isValidArray(lists)
        ) {
            // 更新上传文件列表
            uploadFileLists.value = []
            return
        }

        // 新上传文件列表
        const newUploadFileLists = []

        // 新列表
        const newLists = []

        // 是否更新
        let isUpdate = false

        // 合并当前上传列表中未上传成功的文件
        for (const fileItem of uploadFileLists.value) {
            if (fileItem.status !== UPLOAD_STATUS.success) {
                newUploadFileLists.push(fileItem)
                hashAll[fileItem.hash] = fileItem
            }
        }

        $n_forEach(lists, function(hash) {
            if ($n_isValidString(hash)) {

                const hasItem = $n_find(uploadFileLists.value, { hash })

                // 如果在当前上传文件列表中已存在
                if (hasItem) {
                    hashAll[hash] = hasItem

                } else if (! $n_has(hashAll, 'hash')) {

                    // 如果是外链
                    if (/^http(s)?:\/\//i.test(hash)) {
                        hashs.push(hash)
                        hashAll[hash] = {
                            hash,
                            __img: hash,
                            isNet: true,
                            isNetUploaded: false,
                        }

                    // 否则为 hash 文件
                    } else {
                        hashs.push(hash)
                        hashAll[hash] = {
                            hash,
                            isNet: false,
                        }
                    }
                }

                // 新列表
                newLists.push(hash)
            }
        })

        // 如果类型不是图片 || 初始加载文件信息, 则请求文件信息
        if (
            (props.type !== 'image' || props.loadInfo)
            && hashs.length
        ) {
            // 请求 - 获取文件
            const { status, data: resExisted } = await $n_http({
                url: $n_config('apiFileUrl') + 'get_file',
                data: {
                    hashs: $n_uniq(hashs),
                },
                // 关闭错误
                warn: false,
                // 关闭防抖(可以重复请求)
                debounce: false,
            })
            if (status) {

                $n_forEach(resExisted, function (existedItem) {

                    // 创建原始单个文件
                    const fileItem = createRawFileItem()

                    // 设置已存在文件
                    setExistedFileItem(fileItem, existedItem)

                    // 添加至 hash all
                    hashAll[fileItem.hash] = Object.assign(fileItem, {
                        key: fileItem.hash,
                    })
                })

                // 需要更新
                isUpdate = true
            }
        }

        for (const hash of newLists) {

            let hasItem = hashAll[hash]

            // 如果该 hash 已存在
            if ($n_has(hasItem, 'id')) {

                // 如果新列表中存在 该 id
                if ($n_findIndex(newUploadFileLists, { id: hasItem.id }) > -1) {

                    // 更新 id
                    hasItem = Object.assign({}, hasItem, {
                        id: ++_fileNum
                    })
                }

            // 否则该 hash 不存在
            } else {
                hasItem = Object.assign(createRawFileItem(), hasItem, {
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
                })
                hashAll[hash] = hasItem
            }

            // 添加至新列表中
            newUploadFileLists.push(hasItem)
        }

        // 更新上传文件列表
        uploadFileLists.value = newUploadFileLists

        if (isUpdate) {
            // 更新
            update()
        }
    }

    /**
     * 初始化上传网络外链列表
     */
    function initUploadNetLists(callback) {

        // 如果提交时禁止上传网络外链文件
        if ($n_get(optionsProps, 'submitUploadNet') !== true) {
            return
        }

        uploadNetCallback = callback

        for (const fileItem of uploadFileLists.value) {
            if (
                fileItem.isNet
                && fileItem.status === UPLOAD_STATUS.success
            ) {
                // 将文件状态修改为: 等待上传中
                fileItem.status = UPLOAD_STATUS.waiting
            }
        }
    }

    /**
     * 上传网络外链文件
     */
    async function uploadNet(submitUploadNet = false) {

        // 如果提交时禁止上传网络外链文件
        if (submitUploadNet === true || $n_get(optionsProps, 'submitUploadNet') === true) {

            const promises = []

            for (const fileItem of uploadFileLists.value) {
                if (
                    fileItem.isNet
                    && fileItem.status === UPLOAD_STATUS.waiting
                ) {
                    // 设置网络图片 file
                    promises.push(setNetFile(fileItem))
                }
            }

            if (! promises.length) {
                return
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
    }

    /**
     * 获取上传网络外链进度
     */
    // function getUploadNetProgress() {
    //
    //     let total = 0
    //     let loaded = 0
    //
    //     // 如果提交时允许上传网络外链文件
    //     if ($n_get(optionsProps, 'submitUploadNet') === true) {
    //
    //         for (const fileItem of uploadFileLists.value) {
    //             if (fileItem.isNet && fileItem.status <= UPLOAD_STATUS.success) {
    //                 total++
    //                 if (fileItem.isNetUploaded) {
    //                     loaded++
    //                 }
    //             }
    //         }
    //
    //         // if (total && loaded < total) {
    //         //     return {
    //         //         loaded,
    //         //         total,
    //         //         // progress: Math.round(loaded * 100 / total),
    //         //     }
    //         // }
    //     }
    //
    //     return {
    //         loaded,
    //         total,
    //         // progress: 100,
    //     }
    // }

    /**
     * 设置网络图片 file
     */
    async function setNetFile(fileItem) {

        // 设置文件状态
        fileItem.status = UPLOAD_STATUS.hashChecking
        // 设置文件检查进度
        fileItem.progress = 0

        try {
            const r = await fetch(fileItem.__img, {
                method: 'GET',
            })
            const arrayBuffer = await r.arrayBuffer()
            const blob = new Blob([arrayBuffer], { type: r.headers.get('Content-Type') })

            // -------- axios
            // const r = await axios({
            //     method: 'GET',
            //     url: fileItem.__img,
            //     responseType: 'arraybuffer'
            // })
            // console.log(r)
            // const arrayBuffer = r.data
            // const blob = new Blob([arrayBuffer], { type: r.headers['content-type'] })
            // -------- axios

            // 如果有类型
            if (blob.type) {

                // 后缀名
                let ext = ''

                // 如果为图片
                if (
                    props.type === 'image'
                    || $n_indexOf(blob.type, 'image/') > -1
                ) {
                    switch (blob.type) {
                        case 'image/png':
                            ext = 'png'
                            break
                        case 'image/gif':
                            ext = 'gif'
                            break
                        default:
                            ext = 'jpg'
                            break
                    }

                // 如果为视频
                } else if (props.type === 'video') {
                    ext = 'mp4'

                // 如果为音频
                } else if (props.type === 'audio') {
                    ext = 'mp3'

                // 否则为文件
                } else {
                    const arr = $n_split(props.type, '/')
                    if (arr.length > 0) {
                        ext = arr[1]
                    }
                }

                // 如果有后缀名
                if (ext) {
                    // 设置文件
                    fileItem.file = new File([blob], String($n_timestamp()), { type: blob.type })
                    // 设置后缀名
                    fileItem.ext = ext

                    const {
                        title,
                        size,
                    } = fileItem.file

                    // 文件大小
                    fileItem.size = size

                    // 检查文件错误
                    const errMsg = checkFileError(fileItem)
                    if (errMsg) {
                        // 设置文件上传失败
                        setFileFail(fileItem, errMsg)
                        return
                    }

                    // 初始化 SparkMD5
                    const spark = new SparkMD5.ArrayBuffer()
                    spark.append(arrayBuffer)

                    // 获取文件 hash
                    const hash = spark.end(false)
                    if (hash) {
                        // 设置文件 hash
                        fileItem.hash = await formatFileItemHash(hash)
                        // 标题
                        fileItem.title = title
                        // 设置文件状态
                        fileItem.status = UPLOAD_STATUS.hashChecked
                        // 设置文件检查进度
                        fileItem.progress = 100

                        // 设置单个文件信息
                        await setFileItemInfo(fileItem, setFileFail)
                        return
                    }
                }
            }

        } catch (e) {}

        // 设置文件上传失败
        setFileFail(fileItem)
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
     * 选择网络外链上传
     */
    function chooseUploadNet() {
        $q.dialog({
            title: `添加网络${FilE_NAME[FilE_TYPE[props.type]]}`,
            style: 'min-width:600px;',
            // message: `添加网络${FilE_NAME[FilE_TYPE[props.type]]}`,
            prompt: {
                model: '',
                isValid: $n_$ruleValid('required'),
                type: 'textarea',
                placeholder: '多个链接，使用中英文逗号、空格、换行隔开',
                outlined: true,
            },
            cancel: true,
            persistent: true,
        })
            .onOk(async function(value) {

                let files = $n_isValidString(value)
                    ? $n_uniq($n_split(value.replace(/\n|,|，/g, ','), ','))
                        .map(e => $n_trimString(e))
                        .filter(
                            val => val && /^(http(s)?:\/\/)/i.test(val)
                        )
                    : []

                if (! files.length) {
                    // 轻提示
                    $n_toast({
                        message: '请输入正确的链接'
                    })
                    return
                }

                // 格式化上传网络链接
                // --------------------------------------------------
                const {
                    formatUploadNet,
                } = configs.uploader
                if ($n_isFunction(formatUploadNet)) {
                    files = formatUploadNet(files, props.type === 'image')
                }
                // --------------------------------------------------

                if (! $n_isValidArray(files)) {
                    // 轻提示
                    $n_toast({
                        message: '请输入正确的链接'
                    })
                    return
                }

                // 添加上传网络外链至文件列表
                function addFileNetItem(hash) {
                    uploadFileLists.value.push(Object.assign(createRawFileItem(), {
                        // id
                        id: ++_fileNum,
                        // 文件唯一 key
                        key: hash,
                        // hash
                        hash,
                        // 将文件状态修改为: 等待上传中
                        status: UPLOAD_STATUS.waiting,
                        // 进度
                        progress: 100,
                        // 信息
                        msg: '',

                        __img: hash,
                        isNet: true,
                        isNetUploaded: false,
                    }))
                }

                // 遍历选择的文件列表
                for (const file of files) {

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

                                        // 添加上传网络外链至文件列表
                                        addFileNetItem(file)

                                        // 上传网络外链文件
                                        uploadNet(true)
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

                    // 添加上传网络外链至文件列表
                    addFileNetItem(file)
                }

                // 上传网络外链文件
                uploadNet(true)
                    .finally()
            })
    }

    /**
     * 文件输入框更新
     */
    async function fileChange(e) {

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
                const fileItem = await createFileItem(file)
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

        if (promises.length) {
            await Promise.all(promises)
        }

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
    async function upload() {
        try {
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

            // 上传至服务器
            await uploadServer({
                fileType: FilE_TYPE[props.type],
                waitUploadFileLists,
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
        // 是否网络文件已上传
        if (fileItem.isNet) {
            fileItem.isNetUploaded = true
        }

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

        // 上传网络外链回调
        $n_run(uploadNetCallback)()
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
            fileReader.onload = async function(e) {

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
                    if (! hash) {
                        // 设置文件上传失败
                        setFileFail(fileItem)
                        // 完成回调
                        resolve()
                        return
                    }

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
                        fileItem.hash = await formatFileItemHash(hash)
                        // 设置文件状态
                        fileItem.status = UPLOAD_STATUS.hashChecked
                        // 设置文件检查进度
                        fileItem.progress = 100
                    }

                    // 设置单个文件信息
                    await setFileItemInfo(fileItem, setFileFail)

                    resolve()
                }
            }

            // 文件加载错误
            fileReader.onerror = function() {
                // 设置文件上传失败
                setFileFail(fileItem)
                // 完成回调
                resolve()
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
            // 关闭防抖(可以重复请求)
            debounce: false,
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

                        // 设置文件为非网络外链
                        fileItem.isNet = false

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
            // 是否为网络文件
            isNet: false,
            // 是否网络文件已上传
            isNetUploaded: false,
            // 中断上传
            abort() {},
        }
    }

    /**
     * 创建单个文件
     */
    async function createFileItem(file) {

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
            // 设置单个文件信息
            const res = await setFileItemInfo(fileItem, setFileFail)
            if (! res) {
                return false
            }
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
     * 复制地址
     */
    function copyUrl({ type, hash }) {

        const _url = type === FilE_TYPE.image ?
            // 如果是图片
            $n_getImage(hash)
            // 否则是文件
            : $n_getFile(hash)

        if ($n_isValidString(_url)) {
            copy(_url, '复制地址成功')
        }
    }

    /**
     * ==============================【私有函数】==============================
     */

    /**
     * 格式化单个文件 hash
     */
    async function formatFileItemHash(hash) {

        const {
            hasMinioSuffix,
            formatUploadFileHash,
        } = configs.uploader

        if (hasMinioSuffix && configUpload.type === 'minio') {
            hash += '_'
        }

        // 如果有格式化上传文件 hash
        if ($n_isFunction(formatUploadFileHash)) {
            hash = await $n_runAsync(formatUploadFileHash)(hash)
        }

        return hash
    }

    /**
     * 获取图片信息
     */
    function getImageInfo(fileItem) {
        return new Promise(function (resolve) {
            const img = new Image()
            img.src = window.URL.createObjectURL(fileItem.file)
            fileItem.__img = img.src
            img.onload = function() {
                fileItem.json = {
                    w: this.naturalWidth,
                    h: this.naturalHeight,
                }
                resolve(true)
            }
            img.onerror = function() {
                resolve(false)
            }
        })
    }

    /**
     * 获取媒体信息
     */
    function getMediaInfo(fileItem, type) {
        return new Promise(function (resolve) {
            const dom = document.createElement(type)
            dom.src = URL.createObjectURL(fileItem.file)
            dom.onerror = function() {
                resolve(false)
            }

            // 如果为视频
            if (type === 'video') {
                dom.currentTime = 3
                dom.oncanplay = async function() {

                    fileItem.json = {
                        w: this.videoWidth ? this.videoWidth : this.width,
                        h: this.videoHeight ? this.videoHeight : this.height,
                        d: this.duration,
                    }

                    // 获取视频缩略图 hash
                    const p = await getVideoThumbHash(dom, fileItem.json)
                    if (p) {
                        fileItem.json.p = p
                    }

                    resolve(true)
                }

            // 否则为音频
            } else {
                dom.onloadedmetadata = function() {
                    fileItem.json = {
                        d: this.duration,
                    }
                    resolve(true)
                }
            }
        })
    }

    /**
     * 获取视频缩略图 hash
     */
    function getVideoThumbHash(dom, { w, h }) {
        return new Promise(async function (resolve) {

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.setAttribute('width',  w)
            canvas.setAttribute('height', h)
            ctx.drawImage(dom, 0, 0, w, h)

            const {
                arrayBuffer,
                file,
            } = dataUrlToFile(canvas.toDataURL('image/jpeg', 0.8))

            // 获取缩略图 hash
            const spark = new SparkMD5.ArrayBuffer()
            spark.append(arrayBuffer)
            const hash = spark.end(false)
            if (! hash) {
                resolve(false)
                return
            }

            // 创建原始单个文件
            const fileItem = Object.assign(createRawFileItem(), {
                // 设置文件 file
                file,
                // 设置文件类型
                type: FilE_TYPE.image,
                // 设置文件后缀
                ext: 'jpg',
                // 设置文件大小
                size: file.size,
                // 设置文件 hash
                hash: await formatFileItemHash(hash),
                // 设置文件 json
                json: {
                    w,
                    h,
                },
            })

            // 上传至服务器
            await uploadServer({
                fileType: FilE_TYPE.image,
                waitUploadFileLists: [ fileItem ],
                setFileSuccess(fileItem) {
                    resolve(fileItem.hash)
                },
                setFileFail() {
                    resolve(false)
                },
            })
        })
    }

    /**
     * 设置单个文件信息
     */
    function setFileItemInfo(fileItem, setFileFail) {
        return new Promise(async function (resolve) {

            // 如果已经设置过了
            if (
                $n_has(fileItem.json, 'w')
                || $n_has(fileItem.json, 'd')
            ) {
                resolve(true)
                return
            }

            let res

            // 如果为图片
            // --------------------------------------------------
            if (fileItem.type === FilE_TYPE.image) {
                res = await getImageInfo(fileItem)

            // 如果为视频
            // --------------------------------------------------
            } else if (fileItem.type === FilE_TYPE.video) {
                res = await getMediaInfo(fileItem, 'video')

            // 如果为音频
            // --------------------------------------------------
            } else if (fileItem.type === FilE_TYPE.audio) {
                res = await getMediaInfo(fileItem, 'audio')

            // 否则为文件
            } else {
                // 先判断是否为图片
                res = await getImageInfo(fileItem)
                if (! res) {
                    // 再判断是否为视频
                    res = await getMediaInfo(fileItem, 'video')
                    if (! res) {
                        // 最后再判断是否为音频
                        res = await getMediaInfo(fileItem, 'video')
                    }
                }
            }
            // --------------------------------------------------

            if (res) {
                resolve(true)
            } else {
                // 设置文件上传失败
                setFileFail(fileItem)
                resolve(false)
            }
        })
    }

    /**
     * 获取上传参数
     */
    async function getUploadParams(type, bucket = 'public') {

        // 缓存名
        const cacheName = `upload_params_${type}_${bucket}`

        // 获取缓存
        const cache = $n_storage.get(cacheName)
        if (cache !== null) {
            return cache
        }

        // 请求数据
        const { status, data } = await $n_http({
            url: $n_config('apiFileUrl') + 'get_upload_params',
            data: {
                // 类型
                type,
                // 空间名称
                bucket,
            },
        })

        // 如果成功
        if (! status || ! $n_isValidObject(data)) {
            return false
        }

        // 【生产模式】
        // --------------------------------------------------
        // #ifdef IS_PRO
        // 保存缓存(6 小时)
        $n_storage.set(cacheName, data, 21600000)
        // #endif
        // --------------------------------------------------

        return data
    }

    /**
     * 删除上传参数缓存
     */
    function deleteUploadParams(type, bucket = 'public') {
        $n_storage.delete(`upload_params_${type}_${bucket}`)
    }

    /**
     * 上传至服务器
     */
    async function uploadServer(options) {

        const {
            fileType,
            waitUploadFileLists,
            setFileSuccess,
            setFileFail,
            warn,
        } = Object.assign({
            warn: true,
        }, options)

        // 获取上传参数
        const uploadParams = await getUploadParams(configUpload.type)
        if (uploadParams === false) {
            for (const fileItem of waitUploadFileLists) {
                setFileFail(fileItem, '上传失败')
            }
            if (warn) {
                $n_toast({
                    message: `获取[${configUpload.type}]上传参数失败`,
                })
            }
            return false
        }

        // 是否上传 minio 备份
        // --------------------------------------------------
        let backupParams = null
        let backupConfig = null
        if (configUpload.type !== 'minio') {
            backupConfig = getUpload(null, 'minio')
            // 如果同步
            if (backupConfig.sync === true) {
                backupParams = await getUploadParams(backupConfig.type)
                if (backupParams === false) {
                    for (const fileItem of waitUploadFileLists) {
                        setFileFail(fileItem, '上传失败')
                    }
                    if (warn) {
                        $n_toast({
                            message: `获取[${backupConfig.type}]上传参数失败`,
                        })
                    }
                    return false
                }
            }
        }
        // --------------------------------------------------

        // 批量上传
        for (const fileItem of waitUploadFileLists) {
            // 上传单个文件
            await uploadFileItem(fileItem)
        }

        /**
         * 上传单个文件
         */
        async function uploadFileItem(fileItem) {

            // 设置文件状态
            fileItem.status = UPLOAD_STATUS.uploading

            const {
                // 上传请求
                onUploadHttp,
            } = configs.uploader

            // 上传文件
            const upload = async function(configUpload, uploadParams, startPercent, halfPercent) {

                const {
                    // 上传地址
                    url,
                    // 文件名
                    fileName,
                    // 键值名
                    keyName,
                    // 上传数据
                    data,
                } = uploadParams

                // 请求数据
                const httpData = Object.assign({}, data)
                // 文件
                httpData[fileName] = fileItem.file
                // 自定义文件 key
                httpData[keyName] = fileItem.hash

                let opts = {
                    // 上传地址
                    url,
                    // 数据
                    data: httpData,
                    // 关闭错误提醒
                    warn: false,
                    // 关闭检查结果 code
                    checkCode: false,
                    // 不包含头部鉴权认证
                    token: false,
                    // 开启上传
                    upload: true,
                    // 取消请求
                    onCancel(cancel) {
                        // 设置中断上传
                        fileItem.abort = function(msg) {
                            cancel($n_isValidString(msg) ? msg : '已取消')
                        }
                    },
                    // 监听上传进度
                    onUploadProgress(percent) {
                        // 设置上传进度
                        fileItem.progress = Math.round(startPercent + (halfPercent ? percent / 2 : percent))
                    },
                }

                // 上传请求
                if ($n_isFunction(onUploadHttp)) {
                    const res = onUploadHttp(opts, fileItem)
                    if (res) {
                        opts = res
                    }
                }

                const { status, data: res } = await $n_http(opts)

                // 如果请求失败
                if (! status) {
                    // 设置文件上传失败
                    setFileFail(fileItem, res.msg)
                    // 删除上传参数缓存
                    deleteUploadParams(configUpload.type)
                    return false
                }

                return res
            }

            const resUpload = await upload(configUpload, uploadParams, 0, !! backupParams)
            if (resUpload === false) {
                return false
            }

            // 是否已备份
            let is_backup = 0

            // 上传至备份服务器
            // --------------------------------------------------
            if (backupParams) {
                const res = await upload(backupConfig, backupParams, 50, true)
                if (res === false) {
                    return false
                }
                is_backup = 1
            }
            // --------------------------------------------------

            const {
                title,
                type,
                hash,
                ext,
                size,
                json,
            } = fileItem

            // 请求数据
            const data = {
                // 类型
                type: configUpload.type,
                // 需上传的文件类型
                file_type: fileType,
                // 文件
                file: {
                    // 标题
                    title: title || '',
                    // 类型
                    type,
                    // hash
                    hash,
                    // 后缀
                    ext,
                    // 文件大小
                    size,
                    // 文件 json
                    json,
                    // 是否已备份
                    is_backup,
                },
                // 结果
                result: $n_isValidObject(resUpload) ? resUpload : {},
            }

            // 请求 - 上传文件至 cdn
            const { status: statusCallback, data: resCallback } = await $n_http({
                url: $n_config('apiFileUrl') + 'upload_callback',
                data,
                // 关闭错误提示
                warn: false,
            })

            // 请求失败
            if (! statusCallback || ! $n_isValidObject(resCallback)) {
                // 设置文件上传失败
                setFileFail(fileItem, resCallback.msg || '上传失败')
                return false
            }

            // 格式化 json
            const _json = $n_json.parse(resCallback.json)
            Object.assign(fileItem, resCallback, {
                json: $n_isValidObject(_json) ? $n_numberDeep(_json) : {},
            })

            // 设置文件上传成功
            setFileSuccess(fileItem)

            return true
        }

        return true
    }

    return {
        // 上传文件列表
        query: uploadFileLists,
        // 更新值
        updateValue,
        // 初始化上传列表
        initUploadFileLists,

        // 初始化上传网络外链列表
        initUploadNetLists,
        // 上传网络外链文件
        uploadNet,
        // 获取上传网络外链进度
        // getUploadNetProgress,

        // 检查是否正在上传文件
        checkUploading,
        // 选择文件上传
        chooseUpload,
        // 选择网络外链上传
        chooseUploadNet,
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
        play({ hash, __img }) {
            $n_play(__img ? __img : hash)
        },
        // 复制地址
        copyUrl,
    }
}

/**
 * 获取上传方式
 */
export function getUpload(userConfig = null, defaultUpload = '') {
    const uploadConfig = $n_get((userConfig ? userConfig : configs.userConfig), 'uploader.upload', {})
    const type = $n_isValidString(defaultUpload) ? defaultUpload : uploadConfig.default
    return Object.assign(
        {},
        $n_get(uploadConfig, type, {}),
        {
            type,
        }
    )
}

/**
 * 上传器
 */
const uploader = {
    // 创建对话框
    create,
    // 获取上传方式
    getUpload,
}

export default uploader
