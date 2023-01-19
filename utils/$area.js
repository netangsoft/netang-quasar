// 地址数据缓存
let _areaData = null

/**
 * 获取数据
 */
function getData(level = 3, params) {
    return _getData(() => import('@/configs/area3'), level, params)
}
function _getData(areaData, level, params) {
    return new Promise(function(resolve) {

        // 执行
        function run() {

            const para = Object.assign({
                // 忽略省市 id
                ignore: [],
            }, params)

            // 克隆树数据
            const treeData = _.cloneDeep(_areaData)
            const all = {}
            const rows = []

            // 是否有忽略省市区 id
            const isIgnore = utils.isValidArray(para.ignore)
            function checkIgnore(id) {
                return isIgnore && _.indexOf(para.ignore, id) > -1
            }

            // 省
            for (const item1 of treeData) {

                // 如果有忽略省
                if (checkIgnore(item1[1])) {
                    continue
                }

                all[item1[1]] = {
                    id: item1[1],
                    pid: 0,
                    title: item1[0],
                    level: 1,
                }

                // 市
                if (level > 1 && utils.isValidArray(item1[2])) {

                    for (let index2 = 0, len2 = item1[2].length; index2 < len2; index2++) {
                        const item2 = item1[2][index2]

                        // 如果有忽略市
                        if (checkIgnore(item2[1])) {
                            continue
                        }

                        all[item2[1]] = {
                            id: item2[1],
                            pid: item1[1],
                            title: item2[0],
                            level: 2,
                        }
                        item1[2][index2] = all[item2[1]]

                        // 区
                        if (level > 2 && utils.isValidArray(item2[2])) {
                            for (let index3 = 0, len3 = item2[2].length; index3 < len3; index3++) {
                                const item3 = item2[2][index3]

                                // 如果有忽略区
                                if (checkIgnore(item3[1])) {
                                    continue
                                }

                                all[item3[1]] = {
                                    id: item3[1],
                                    pid: item2[1],
                                    title: item3[0],
                                    level: 3,
                                }
                                item2[2][index3] = all[item3[1]]
                            }
                        }
                    }
                }
            }

            for (const key in all) {
                rows.push(all[key])
            }

            resolve(utils.toTree({
                data: rows,
            }))
        }

        if (_areaData) {
            run()
            return
        }

        areaData()
            .then((res)=>{
                _areaData = res.default
                run()
            })
    })
}

/**
 * 替换地址
 */
function replaceArea(val) {
    val = utils.trimString(val)
    return val.replace(/直辖市/g, '')
        .replace(/市/g, '')
        .replace(/区/g, '')
        .replace(/自治县/g, '')
        .replace(/自治州/g, '')
        .replace(/县/g, '')
}

/**
 * 获取详情
 */
async function getInfo(params) {

    let {
        // 地址数据
        areaData,
        // 级别
        level,
        // 地区编码
        code,
        // 省文字
        provinceText,
        // 市文字
        cityText,
        // 区文字
        areaText,
        // 详细区域文字
        regionText,

    } = Object.assign({
        // 地址数据
        areaData: null,
        // 级别
        level: 3,
        // 地区编码
        code: 0,
        // 省文字
        provinceText: '',
        // 市文字
        cityText: '',
        // 区文字
        areaText: '',
        // 详细区域文字
        regionText: '',
    }, params)

    if (! areaData) {
        areaData = await getData(level)
    }

    const { attrs, nodes, tree } = areaData

    // 先通过地区编码来查找
    let data = _.get(nodes, code)

    // 如果没有找到, 则通过文字来查找
    if (! data) {

        function getData() {

            // 获取省 start --------------------------------------------------
            const isAreaText = provinceText && cityText
            if (isAreaText || regionText) {

                for (const item1 of tree) {

                    const {
                        text: text1,
                        children: children1,
                    } = item1

                    const _text1 = utils.replaceAll(text1, '省', '')

                    if (
                        isAreaText ?
                            (
                                provinceText === text1
                                || utils.replaceAll(provinceText, '省', '') === _text1
                            )
                            : regionText.indexOf(_text1) > -1
                    ) {

                       // 获取市 start --------------------------------------------------
                       if (utils.isValidArray(children1)) {

                            for (const item2 of children1) {

                                const {
                                   text: text2,
                                   children: children2,
                                } = item2

                                const _text2 = replaceArea(text2)

                                if (
                                    isAreaText ?
                                        (
                                            cityText === text2
                                            || replaceArea(cityText) === _text2
                                        )
                                        : regionText.indexOf(_text2) > -1
                                ) {
                                    // 获取区 start --------------------------------------------------
                                    if (utils.isValidArray(children2)) {

                                        if (areaText || regionText) {

                                            for (const item3 of children2) {

                                                const {
                                                   text: text3,
                                                } = item3
                                                const _text3 = replaceArea(text3)

                                                if (
                                                    areaText ?
                                                        (
                                                            areaText === text3
                                                            || replaceArea(areaText) === _text3
                                                        )
                                                        : regionText.indexOf(_text3) > -1
                                                ) {
                                                    return item3
                                                }
                                            }
                                        }

                                        if (! data) {
                                            return children2[0]
                                        }
                                    }
                                    return false
                                    // 获取市 end --------------------------------------------------
                                }
                            }
                       }
                       return false
                       // 获取市 end --------------------------------------------------
                    }
                }
            }
            return false
        }

        data = getData()
        if (! data) {
            return false
        }
    }

    // 获取区
    const {
        attr,
    } = data

    const res = Object.assign({}, attr)

    let province
    let city
    let area

    // 如果为区
    if (level === 3) {

        // 获取区
        area = attr

        // 获取市
        city = attrs[area.pid]

        // 获取省
        province = attrs[city.pid]

    // 如果为市
    } else if (level === 2) {

        // 获取市
        city = attr

        // 获取市下第一个区
        area = nodes[city.id].children[0]

        // 获取省
        province = attrs[city.pid]

    // 否则为省
    } else {

        // 获取省
        province = attr

        // 获取省下第一个市
        city = nodes[province.id].children[0]

        // 获取市下第一个区
        area = nodes[city.id].children[0]
    }

    // 获取地区
    res.region = [
        province,
    ]

    // 获取地区 ids 数组
    res.region_ids = [
        province.id,
    ]

    // 获取地区文字
    const texts = [
        province.title,
    ]

    if (level >= 2) {
        res.region.push(city)
        res.region_ids.push(city.id)

        if (city.title !== province.title) {
            texts.push(city.title)
        }

        if (level === 3) {
            res.region.push(area)
            res.region_ids.push(area.id)

            const _areaText = area.title.replace('市辖区', '')
            if (texts[texts.length - 1] !== _areaText) {
                texts.push(_areaText)
            }
        }
    }

    res.region_text = texts.join('')

    // 返回数据示例
    // level: 3
    // pid: 140700
    // region:
    // [
    //     {
    //         level: 1
    //         pid: 0
    //         text: "山西省"
    //         value: 140000
    //     },
    //     {
    //         level: 2
    //         pid: 140000
    //         text: "晋中市"
    //         value: 140700
    //     },
    //     {
    //         level: 3
    //         pid: 140700
    //         text: "介休市"
    //         value: 140781
    //     }
    // ]
    // region_ids: [140000, 140700, 140781]
    // region_text: "山西省晋中市介休市"
    // text: "介休市"
    // value: 140781

    return res
}

utils.$area = {
    // 获取数据
    getData,
    // 获取详情
    getInfo,
}
