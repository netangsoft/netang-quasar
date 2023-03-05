# dict 数据字典

::: tip
`@netang/quasar/utils/dict.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/dict.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/dict.js)
:::

- 字典设置

```javascript
import { settings } from '@netang/quasar/utils/config'

/**
 * 配置设置
 */
settings({
    // 用户数据字典
    userDict: {
        DICT_STATUS: [
            ['正常', 1],
            ['禁用', 0]
        ],
        DICT_YESNO: [
            ['是', 1],
            ['否', 0]
        ]
    },
})
```

- 示例

```javascript
dict('DICT_STATUS', 1) // 返回：正常

dict('DICT_YESNO', 100, '无') // 返回： 无
```

- 类型

```javascript
dict(key: String, value, defaultValue)
```

返回字典值对应的文字

| 参数名          | 说明   | 类型                  | 默认值 |
|--------------|------|---------------------|-----|
| key          | 字典键值 | `String`            | -   |
| value        | 字典值  | `String` / `Number` | -   |
| defaultValue | 默认值  | `Any`               | ""  |
