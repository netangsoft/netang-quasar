# InputNumber 数字输入框

::: tip
继承 `<q-input>` 所有特性
[中文文档](http://www.quasarchs.com/vue-components/input) [英文文档](https://quasar.dev/vue-components/input)
:::

| 属性名             | 说明                                                            | 类型                  | 可选值 | 默认值                  |
|-----------------|---------------------------------------------------------------|---------------------|-----|----------------------|
| value / v-model | 绑定值（必填）                                                       | -                   | -   | -                    |
| min             | 最小值                                                           | `Number` / `String` | -   | 0                    |
| max             | 最大值                                                           | `Number` / `String` | -   | 0                    |
| step            | 步长, 每次点击时改变的值(默认为 1, centToYuan开启后默认为 100)                    | `Number` / `String` | -   | 1                    |
| decimal-length  | 小数位数(默认为 0, centToYuan开启后默认为 2)                               | `Boolean`           | -   | 0                    |
| disable-minus   | 是否禁用减少按钮                                                      | `Boolean`           | -   | false                |
| disable-plus    | 是否禁用增加按钮                                                      | `Boolean`           | -   | false                |
| controls        | 是否使用控制按钮                                                      | `Boolean`           | -   | false                |
| center          | 居中显示                                                          | `Boolean`           | -   | false                |
| no-empty        | 不允许输入的值为空                                                     | `Boolean`           | -   | false                |
| cent-to-yuan    | 是否为人民币的分转元                                                    | `Boolean`           | -   | false                |
| round-mode      | 精度舍入模式 [BigNumber文档](https://mikemcl.github.io/bignumber.js/#constructor-properties) | `Number`            | -   | BigNumber.ROUND_DOWN |
