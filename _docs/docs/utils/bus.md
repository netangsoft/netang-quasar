# bus 通知

::: tip
`@netang/quasar/utils/bus.js` [Github](https://github.com/netangsoft/netang-quasar/blob/main/utils/bus.js) [Gitee](https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/bus.js)

继承 `new EventBus()` 所有特性
[中文文档](http://www.quasarchs.com/quasar-utils/event-bus-util) [英文文档](https://quasar.dev/quasar-utils/event-bus-util)
:::

- 示例

```javascript
bus.on('some-event', (arg1, arg2, arg3) => {
    // do some work
})

bus.emit('some-event', 'arg1 value', 'arg2 value', 'arg3 value')
```
