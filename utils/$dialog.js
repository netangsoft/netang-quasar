import { inject } from 'vue'
import { Dialog } from 'quasar'

import DialogComponent from '../components/dialog'
import { NDialogKey } from './symbols'

/**
 * 创建对话框
 */
function create(params) {
    if (
        // 如果是路由组件
        $n.has(params, 'route')
        // 或自定义组件
        || $n.has(params, 'name')
    ) {
        return Dialog.create({
            // 组件
            component: DialogComponent,
            // 组件声明
            componentProps: params,
        })
    }

    return Dialog.create(params)
}

/**
 * 获取对话框注入数据
 */
function onInject() {
    return inject(NDialogKey)
}

/**
 * 对话框业务
 */
$n.$dialog = {
    // 创建对话框
    create,
    // 获取对话框注入数据
    inject: onInject,
}
