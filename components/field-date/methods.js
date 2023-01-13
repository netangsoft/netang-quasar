import { date } from 'quasar'

export const quickRange = ['最近7天', '最近30天', '本月', '上月', '最近2个月', '最近3个月', '最近6个月', '今年', '去年', '最近1年', '最近2年']

export function getQuickRange(index, showSecond) {

    // 获取当前时间
    const now = new Date()

    const time = {
        from: '00:00',
        to: '23:59',
    }
    if (showSecond) {
        time.from += ':00'
        time.to += ':59'
    }

    // const quickRange = ['最近7天', '最近30天', '本周', '上周', '本月', '上月', '最近3个月', '最近6个月', '今年', '去年', '最近1年', '最近2年']
    switch (index) {

        // 最近7天
        case 0:
        // 最近30天
        case 1:
            return {
                date: {
                    from: date.formatDate(date.subtractFromDate(now, { days: index === 0 ? 7 : 30 }), 'YYYY/MM/DD'),
                    to: date.formatDate(now, 'YYYY/MM/DD'),
                },
                time,
            }

        // 本月
        case 2:
            return {
                date: {
                    from: date.formatDate(date.startOfDate(now, 'month'), 'YYYY/MM/DD'),
                    to: date.formatDate(date.endOfDate(now, 'month'), 'YYYY/MM/DD'),
                },
                time,
            }

        // 上月
        case 3:
            return {
                date: {
                    from: date.formatDate(date.startOfDate(date.subtractFromDate(now, { month: 1 }), 'month'), 'YYYY/MM/DD'),
                    to: date.formatDate(date.endOfDate(date.subtractFromDate(now, { month: 1 }), 'month'), 'YYYY/MM/DD'),
                },
                time,
            }

        // 最近2个月
        case 4:
        // 最近3个月
        case 5:
        // 最近6个月
        case 6:
            return {
                date: {
                    from: date.formatDate(date.subtractFromDate(now, { months: index === 4 ? 2 : (index === 5 ? 3 : 6) }), 'YYYY/MM/DD'),
                    to: date.formatDate(now, 'YYYY/MM/DD'),
                },
                time,
            }

        // 今年
        case 7:
            return {
                date: {
                    from: date.formatDate(date.startOfDate(now, 'year'), 'YYYY/MM/DD'),
                    to: date.formatDate(date.endOfDate(now, 'year'), 'YYYY/MM/DD'),
                },
                time,
            }

        // 去年
        case 8:
            return {
                date: {
                    from: date.formatDate(date.startOfDate(date.subtractFromDate(now, { year: 1 }), 'year'), 'YYYY/MM/DD'),
                    to: date.formatDate(date.endOfDate(date.subtractFromDate(now, { year: 1 }), 'year'), 'YYYY/MM/DD'),
                },
                time,
            }

        // 最近1年
        case 9:
        // 最近2年
        case 10:
            return {
                date: {
                    from: date.formatDate(date.subtractFromDate(now, { year: index === 9 ? 1 : 2 }), 'YYYY/MM/DD'),
                    to: date.formatDate(now, 'YYYY/MM/DD'),
                },
                time,
            }
    }
}
