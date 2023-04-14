import $n_get from 'lodash/get'

import $n_isValidString from '@netang/utils/isValidString'
import $n_toDate from '@netang/utils/toDate'
import $n_indexOf from '@netang/utils/indexOf'

import $n_timestamp from './timestamp'

import { date as quasarDate } from 'quasar'

/**
 * 获取时间
 */
export default function getTime(time, options, defaultValue = '') {

    if (! time) {
        return $n_isValidString(options) ? options : defaultValue
    }

    // 分隔符
    const separator = $n_get(options, 'separator', '-')

    let {
        hideCurrentYear,
        showSecond,
        format,
        calendar,
        showCalendarToday,
        showCalendarTime,

    } = Object.assign({
        // 默认格式化
        format: `MM${separator}DD HH:mm`,
        // 是否显示秒
        showSecond: false,
        // 是否隐藏当前年份
        hideCurrentYear: false,
        // 是否显示日历格式
        calendar: false,
        // 是否显示日历今天
        showCalendarToday: false,
        // 是否显示日历时间
        showCalendarTime: false,
    }, options)

    // 传入时间
    const date = $n_toDate(time)

    // 当前时间
    const now = $n_toDate($n_timestamp())

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

            const formatYmd = `YYYY${separator}MM${separator}DD`

            // 如果是今天
            const resDay = quasarDate.formatDate(date, formatYmd)
            if (resDay === quasarDate.formatDate(now, formatYmd)) {
                return showCalendarToday ? '今天' : quasarDate.formatDate(date, 'HH:mm' + (showSecond ? ':ss' : ''))
            }

            // 判断是否是昨天
            if (resDay === quasarDate.formatDate(quasarDate.subtractFromDate(now, { days: 1 }), formatYmd)) {
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
    if (
        $n_indexOf(format, 'YYYY') === -1
        && (
            ! hideCurrentYear
            || quasarDate.formatDate(date, 'YYYY') !== quasarDate.formatDate(now, 'YYYY')
        )
    ) {
        format = 'YYYY' + separator + format
    }

    return quasarDate.formatDate(date, format + (showSecond ? ':ss' : ''))
}
