# price 换算金额

::: tip
`@netang/quasar/utils/price.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/price.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/price.js)

继承 `@netang/utils/decimal.js` 所有特性 [Github](https://github.com/netangsoft/netang-utils/blob/main/decimal.js) [Gitee](https://gitee.com/jinmarcus/netang-utils/blob/main/decimal.js)
:::

- 换算金额设置

```javascript
import { settings } from '@netang/quasar/utils/config'

/**
 * 配置设置
 */
settings({
    // 用户配置
    userConfig: {
        // 是否设置金额由热门民币的[分]转为[元]
        // true: 默认金额单位为：分
        // false: 默认金额单位为：元
        priceCentToYuan: false,
    },
})
```

- 示例

```javascript
price(123.45678)
// 如果 priceCentToYuan 为 true 返回 123.45
// 如果 priceCentToYuan 为 false 返回 1.23
```

- 类型

```javascript
price(value, options)
```

| 参数名      | 说明 | 类型       | 默认值   |
|----------|--|----------|-------|
| value      | 金额值 | `Number` | -     |
| options | 参数 | `Object` | - |
