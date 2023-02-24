# timestamp 当前时间戳

::: tip
`@netang/quasar/utils/timestamp.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/timestamp.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/timestamp.js)
:::

- 服务器时间同步设置

```javascript
import { stateTimeDiff } from '@netang/quasar/store'

// 获取服务器当前时间(秒)
const serverTime = ...

// 设置当前时间差值 = 当前时间(秒) - 服务器时间(秒)
stateTimeDiff.value = Math.floor(Date.now() / 1000) - serverTime
```

- 示例

```javascript
// 获取时间戳（秒）
timestamp()

// 获取时间戳（毫秒）
timestamp(true)
```
