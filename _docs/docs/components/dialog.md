# Dialog 对话框

::: tip
- 继承 `<q-dialog>` 所有特性
[中文文档](http://www.quasarchs.com/vue-components/dialog) [英文文档](https://quasar.dev/vue-components/dialog)

- 使用 [$n.dialog.create()](../utils/dialog.md) 创建对话框进行使用
:::

| 属性名             | 说明       | 类型                  | 可选值 | 默认值   |
|-----------------|----------|---------------------|-----|-------|
| value / v-model | 绑定值（必填）  | -                   | -   | -     |
| name            | 组件标识     | `String`            | -   | -     |
| path            | 路由组件路径   | `String`            | -   | -     |
| query           | 路由组件参数   | `Object`            | -   | -     |
| props           | 组件传参     | `Object`            | -   | -     |
| title           | 标题       | `String`            | -   | -     |
| close           | 是否显示关闭按钮 | `Boolean`           | -   | true  |
| cancel          | 是否显示取消按钮 | `Boolean`           | -   | false |
| bottom          | 是否显示底部   | `Boolean`           | -   | true  |
| on-confirm      | 点击确定方法   | `Function`          | -   | -     |
| width           | 宽度       | `String` / `Number` | -   | 50%   |
| height          | 高度       | `String` / `Number` | -   | 80%   |
| min-width       | 最小宽度     | `String` / `Number` | -   | 600px |
| fullscreen      | 是否全屏     | `Boolean`           | -   | false |
| page-container  | 是否是页面容器  | `Boolean`           | -   | true  |

- on-confirm

示例

```javascript
// 创建对话框
$n.dialog.create({
    // 组件标识
    name: 'packageAddSku',
    // 标题
    title: '添加商品',
    // 宽
    width: '80%',
    // 点击确认执行
    async onConfirm(data, hide) {
        if (! data) {
            // 轻提示
            $n.toast({
                message: '请选择数据',
            })
            
            setTimeout(()=>{
                // 手动关闭对话框
                hide()
            }, 2000)
            
            // 返回 false 则不自动关闭对话框
            return false
        }
    },
})
```
