# symbols 内置符号

::: tip
`@netang/quasar/utils/symbols.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/symbols.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/symbols.js)
:::

- 示例

```javascript
import { inject } from 'vue'
import { NRenderKey, NPowerKey, NTableKey, NFormKey, NDialogKey, NUploaderKey } from './symbols'

// 获取渲染组件注入
inject(NRenderKey)

// 获取权限注入
inject(NPowerKey)

// 获取表格注入
inject(NTableKey)

// 获取表单注入
inject(NFormKey)

// 获取对话框注入
inject(NDialogKey)

// 获取上传器注入
inject(NUploaderKey)
```
