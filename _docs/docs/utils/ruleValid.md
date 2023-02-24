# $ruleValid 表单单个验证

::: tip
`@netang/quasar/utils/$ruleValid.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/%24ruleValid.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24ruleValid.js)

单个验证真假规则(用于表单验证)
:::

- 示例

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

### options 参数

| 参数名                  | 说明          | 类型         |
|----------------------|-------------|------------|
| rule                 | 验证规则        | `String`   |
