import { configs } from '../../../utils/config'

const {
    // 对话框组件
    dialogComponents,
} = configs

export default {
    moveToTree: () => import('./move-to-tree'),
    ...dialogComponents,
}
