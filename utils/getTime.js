import { date as quasarDate } from 'quasar'

/**
 * 获取时间
 */
utils.getTime = function(time, params, defaultValue = '') {

    if (! time) {
        return utils.isValidString(params) ? params : defaultValue
    }

    let {
        hideCurrentYear,
        showSecond,
        format,
        calendar,
        showCalendarToday,
        showCalendarTime,

    } = Object.assign({
        // 默认格式化
        format: 'MM-DD HH:mm',
        // 显示秒
        showSecond: false,
        // 隐藏当前年份
        hideCurrentYear: false,
        // 日历时间
        calendar: false,
        // 显示日历今天
        showCalendarToday: false,
        // 显示日历时间
        showCalendarTime: false,
    }, params)

    // 传入时间
    const date = utils.toDate(time)

    // 当前时间
    const now = utils.toDate(utils.timestamp())

    // 如果是自然化时间
    // 如果是今天, 则显示时分秒
    // 如果是昨天, 则显示昨天
    // 如果是本周, 则显示星期几
    // 如果是本年, 则显示某月某日
    // 如果是非本年, 则显示某年某月某日
    if (calendar) {

        // 当前时间
        let time = ''

        // 如果是今年
        if (quasarDate.formatDate(date, 'YYYY') === quasarDate.formatDate(now, 'YYYY')) {

            // 如果是今天
            const resDay = quasarDate.formatDate(date, 'YYYY-MM-DD')
            if (resDay === quasarDate.formatDate(now, 'YYYY-MM-DD')) {
                return showCalendarToday ? '今天' : quasarDate.formatDate(date, 'HH:mm' + (showSecond ? ':ss' : ''))
            }

            // 判断是否是昨天
            if (resDay === quasarDate.formatDate(quasarDate.subtractFromDate(now, { days: 1 }), 'YYYY-MM-DD')) {
                time = '昨天'

            // 是否为本周(判断日期在本年是第几周 如果相同, 则是本周)
            } else if (quasarDate.formatDate(date, 'YYYY w') === quasarDate.formatDate(now, 'YYYY w')) {
                time = quasarDate.formatDate(date, 'dddd')

            // 否则显示某月某日
            } else {
                time = quasarDate.formatDate(date, 'MM月DD日')
            }

        // 否则显示某年某月某日
        } else {
            time = quasarDate.formatDate(date, 'YYYY年MM月DD日')
        }

        // 是否显示日历时间
        if (showCalendarTime) {
            return time + ' ' + quasarDate.formatDate(date, 'HH:mm' + (showSecond ? ':ss' : ''))
        }

        // 否则仅显示日期
        return time
    }

    // 如果是今年是否显示
    if (! hideCurrentYear || quasarDate.formatDate(date, 'YYYY') !== quasarDate.formatDate(now, 'YYYY')) {
        format = 'YYYY-' + format
    }

    return quasarDate.formatDate(date, format + (showSecond ? ':ss' : ''))
}
