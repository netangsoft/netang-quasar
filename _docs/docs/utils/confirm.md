# confirm 确认框

::: tip
`@netang/quasar/utils/confirm.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/confirm.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/confirm.js)

继承 `Dialog.create()` 所有特性
[中文文档](http://www.quasarchs.com/quasar-plugins/dialog) [英文文档](https://quasar.dev/quasar-plugins/dialog)
:::

- 示例

```javascript
// 确认框
confirm({
    message: '确认删除吗？',
})
    // 点击确认执行
    .onOk(function () {
        
    })
```

- 类型

```javascript
confirm(options: Object): void
```

| 参数名     | 说明  | 类型       |
|---------|-----|----------|
| options | 参数  | `Object` |
