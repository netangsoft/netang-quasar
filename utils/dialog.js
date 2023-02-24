import $n_has from 'lodash/has'

import { Dialog } from 'quasar'

import DialogComponent from '../components/dialog'

/**
 * 创建对话框
 */
function create(options) {
    if (
        // 如果是路由组件
        $n_has(options, 'path')
        // 或自定义组件
        || $n_has(options, 'name')
    ) {
        return Dialog.create({
            // 组件
            component: DialogComponent,
            // 组件声明
            componentProps: options,
        })
    }

    return Dialog.create(options)
}

/**
 * 对话框
 */
const dialog = {
    // 创建对话框
    create,
}

export default dialog
