import { Dialog } from 'quasar'
import ImgViewer from '../components/dialog/img-viewer'

/**
 * 预览图片
 */
export default function previewImage(options) {
    return Dialog.create({
        // 组件
        component: ImgViewer,
        // 组件声明
        componentProps: options,
    })
}
