import $n_isFunction from 'lodash/isFunction'

/*
 * 操作数组
 */
const arr = {

    /**
     * 数组添加值
     */
    add(children, index, newItem) {
        if (Array.isArray(children)) {
            children.splice(index + 1, 0, $n_isFunction(newItem) ? newItem() : newItem)
        }
    },

    /**
     * 数组删除值
     */
    delete(children, index) {
        if (Array.isArray(children)) {
            children.splice(index, 1)
        }
    },

    /**
     * 数组值上移
     */
    up(children, index) {
        if (Array.isArray(children)) {
            // 在上一项插入该项
            children.splice(index - 1, 0, children[index])
            // 删除后一项
            children.splice(index + 1, 1)
        }
    },

    /**
     * 数组值下移
     */
    down(children, index) {
        if (Array.isArray(children)) {
            // 在下一项插入该项
            children.splice(index + 2, 0, children[index])
            // 删除前一项
            children.splice(index, 1)
        }
    },
}

export default arr
