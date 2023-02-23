# $rule 表单单个验证

::: tip
`@netang/quasar/utils/$rule.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/%24rule.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24rule.js)

单个验证规则(用于表单验证)
:::

- 示例

```html
<q-input
    class="n-field-fieldset"
    label="新密码 *"
    v-model="formData.password"
    type="password"
    outlined
    clearable
    stack-label
    dense
    lazy-rules
    :rules="[ $rule('required|min:6|max:20') ]"
/>
```

### options 参数

| 参数名                  | 说明          | 类型         |
|----------------------|-------------|------------|
| rule                 | 验证规则        | `String`   |
