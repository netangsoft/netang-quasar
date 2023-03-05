# dialog 对话框

::: tip
`@netang/quasar/utils/dialog.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/dialog.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/dialog.js)

继承 `Dialog.create()` 所有特性
[中文文档](http://www.quasarchs.com/quasar-plugins/dialog) [英文文档](https://quasar.dev/quasar-plugins/dialog)
:::

- 普通示例

```javascript
dialog.create({
    title: '请输入',
    prompt: {
        model: '',
        type: 'text',
        isValid: $ruleValid('required|min:6|max:20'),
    },
    cancel: true,
    persistent: true,
})
    .onOk(function(data) {

    })
```

- 调用 vue 路由页面

通过 `path` 参数定义 vue 路由路径来调用路由页面

并且对话框使用的组件是 `<n-dialog>`，可通过 `props` 参数定义该组件的声明属性

```javascript
dialog.create({
    // 标题
    title: '订单明细',
    // 宽
    width: '80%',
    // 关闭底部
    bottom: false,
    // 路由路径
    path: 'order/order/view',
    // 路由参数
    query: {
        // 订单 id
        id: 123,
    },
})
```

- 调用自定义组件

通过 `name` 参数获取自定义组件

并且对话框使用的组件是 `<n-dialog>`，可通过 `props` 参数定义该组件的声明属性

```javascript
// 创建对话框
dialog.create({
    // 组件标识
    name: 'packageAddSku',
    // 标题
    title: '添加商品',
    // 宽
    width: '80%',
    // 不能通过按 ESC 键关闭对话框
    noEscDismiss: true,
    // 不能通过在对话框外单击来关闭对话框
    noBackdropDismiss: true,
    // 显示取消按钮
    cancel: true,
    // 组件声明参数
    props: {
        test: 123,
    },
    // 点击确认执行
    async onConfirm(data) {

        // 验证回调数据
        const res = $n.validator(data, {
            // 仓库 id
            warehouse_id: 'natural',
            // sku 列表
            sku_lists: 'array',
        })
        if (res) {
            // 轻提示
            $n.toast({
                message: res.msg,
            })
            return false
        }
        
        console.log(data)
    },
})
```
