# $auth 鉴权

::: tip
`@netang/quasar/utils/$auth.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/%24auth.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24auth.js)

用户登录鉴权工具
:::

## $auth.isLogin

判断用户是否已登录

- 类型

```javascript
$auth.isLogin(): boolean
```


## $auth.getUserInfo

获取用户信息

- 类型

```javascript
$auth.getUserInfo(): Object
```

- 返回

| 参数名     | 说明      | 类型        | 默认值 | 可选值 | 示例                         |
|---------|---------|-----------|-----|-----|----------------------------|
| id      | 用户 id   | `Number`  | -   | -   | -                          | 
| token   | 鉴权认证    | `String`  | -   | -   | -                          | 
| info    | 用户信息    | `Object`  | -   | -   | { mobile: 123456, sex: 1 } | 
| isLogin | 用户是否已登录 | `Boolean` | -   | -   | -                          | 


## $auth.getUserId

获取用户 ID

- 类型

```javascript

$auth.getUserId(): Number
```

- 说明

如果返回 0：说明用户未登录

否则返回已登录的用户 ID


## $auth.pushLogin

跳转登录页面

- 类型

```javascript
$auth.pushLogin(query: Object): void
```

- 说明

`query` 为跳转至登录页面的参数


## $auth.logout

退出登录

- 类型

```javascript
$auth.logout(): void
```


## $auth.updateLogin

登录后更新用户状态数据

- 类型

```javascript
$auth.updateLogin(options: Object): boolean
```

- options 参数

| 参数名       | 说明     | 类型       | 默认值 | 可选值 | 示例                         |
|-----------|--------|----------|-----|-----|----------------------------|
| i         | 用户 id  | `Number` | -   | -   | -                          | 
| t         | 鉴权认证   | `String` | -   | -   | -                          | 
| user_info | 用户基础信息 | `Object` | -   | -   | { mobile: 123456, sex: 1 } | 

