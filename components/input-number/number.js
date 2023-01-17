/**
 * 删除前后字符
 * @param {string} value
 * @param {string} char
 * @param {RegExp} regExp
 * @returns {string}
 */
function trimExtraChar(value, char, regExp) {
    const index = value.indexOf(char)
    let prefix = ''

    if (index === -1) {
        return value
    }

    if (char === '-' && index !== 0) {
        return value.slice(0, index)
    }

    if (char === '.' && value.match(/^(\.|-\.)/)) {
        prefix = index ? '-0' : '0'
    }

    return (
        prefix + value.slice(0, index + 1) + value.slice(index).replace(regExp, '')
    )
}

/**
 * 格式化数字
 * @param {string} value
 * @param {boolean} allowDot
 * @param {boolean} allowMinus
 * @returns {string}
 */
export function formatNumbers(
    value,
    allowDot = true,
    allowMinus = true
) {
    if (allowDot) {
        value = trimExtraChar(value, '.', /\./g)
    } else {
        value = value.split('.')[0]
    }

    if (allowMinus) {
        value = trimExtraChar(value, '-', /-/g)
    } else {
        value = value.replace(/-/, '')
    }

    const regExp = allowDot ? /[^-0-9.]/g : /[^-0-9]/g

    return value.replace(regExp, '')
}

/**
 * 增加数字
 * @param {number} num1
 * @param {number} num2
 * @returns {number}
 */
export function addNumber(num1, num2) {
    const cardinal = 10 ** 10
    return Math.round((num1 + num2) * cardinal) / cardinal
}
