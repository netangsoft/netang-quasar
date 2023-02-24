# dictOptions 数据字典选项

::: tip
`@netang/quasar/utils/dictOptions.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/dictOptions.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/dictOptions.js)
:::

- 示例

```javascript
dictOptions('DICT_STATUS') // 返回：[ { label: '正常', value: 1 }, { label: '禁用', value: 0 } ]

dictOptions('DICT_YESNO', 'title', 'id') // 返回：[ { title: '正常', id: 1 }, { title: '禁用', id: 0 } ]
```

- 类型

```javascript
dictOptions(key: String, textKey: String, valueKey: String): Array
```

返回数据字典选项数组

| 参数名      | 说明   | 类型       | 默认值   |
|----------|------|----------|-------|
| key      | 字典键值 | `String` | -     |
| labelKey | 标签键值 | `String` | label |
| valueKey | 值键值  | `String` | value |
