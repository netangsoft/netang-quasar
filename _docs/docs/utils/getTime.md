# getTime 获取时间

::: tip
`@netang/quasar/utils/getTime.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/getTime.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/getTime.js)
:::

- 示例

```javascript
// 如果没有时间, 则显示默认值：无
getTime(0, '无')

// 显示秒
getTime(Date.now(), { showSecond: true, }, '-')

// 自定义格式
getTime(Date.now(), { format: 'MM-DD', })

// 显示日历格式
getTime(Date.now() - 86401000, { calendar: true, })

getTime(Date.now() - 172800000, { calendar: true, })

// 隐藏当前年份
// 如果是今年则隐藏当前年份, 否则显示年份
getTime(Date.now(), { hideCurrentYear: true, })
getTime(Date.now() - 31536000000, { hideCurrentYear: true, })
```

- 类型

```javascript
getTime(time, options, defaultValue)
```

| 参数名      | 说明 | 类型       | 默认值   |
|----------|--|----------|-------|
| time      | 秒时间戳 / 毫秒时间戳 | `Number` | -     |
| options | 参数 | `Object` | - |
| defaultValue | 默认值 | `Any` | - |

options 参数

| 参数名      | 说明 | 类型       | 默认值   |
|----------|--|----------|-------|
| format      | 默认格式化 | `String` | MM-DD HH:mm     |
| showSecond | 是否显示秒 | `Boolean` | false|
| hideCurrentYear | 是否隐藏当前年份 | `Boolean` | false|
| calendar | 是否显示日历格式 | `Boolean` | false|
| showCalendarToday | 是否显示日历今天 | `Boolean` | false|
| showCalendarTime | 是否显示日历时间 | `Boolean` | false|
