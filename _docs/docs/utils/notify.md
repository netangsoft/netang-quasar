# notify 通知

::: tip
`@netang/quasar/utils/notify.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/notify.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/notify.js)

继承 `Notify.create()` 所有特性
[中文文档](http://www.quasarchs.com/quasar-plugins/notify) [英文文档](https://quasar.dev/quasar-plugins/notify)
:::

- 示例

```javascript
notify({
    color: 'green-4',
    textColor: 'white',
    icon: 'cloud_done',
    message: '修改成功'
})
```

- 类型

```javascript
notify(options: Object): void
```

| 参数名     | 说明  | 类型       |
|---------|-----|----------|
| options | 参数  | `Object` |
