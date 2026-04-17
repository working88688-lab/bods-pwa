import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

/**
 * 超过四位数的数字转化为w格式,如：38128 => 3.8w，381285 => 38.1w
 * @param {number} num
 */
export const formatStrNum = (num) => {
    if (num <= 0 || isNaN(num)) {
        return '0'
    }
    const strNum = num.toString()
    if (strNum.length >= 5) {
        let prefix = strNum.substring(0, strNum.length - 4)
        if (strNum.length === 5) {
            prefix += '.' + strNum[1]
        }
        if (strNum.length === 6) {
            prefix += '.' + strNum[2]
        }
        return prefix + 'w'
    } else {
        return strNum
    }
}

/**
 * 获取设备类型
 */
export const getDevice = () => {
    const ua = navigator.userAgent;
    const platform = navigator.platform;
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    const isIOS = /iPhone|iPad|iPod/i.test(ua) && !window.MSStream;
    const isAndroid = /Android/i.test(ua);
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

    // 场景 1：PC 环境（包括 PC 上的模拟移动端）
    if (
        (!isMobile && !isIOS && !isAndroid) ||     // 没有移动设备标识
        (platform === 'Win32' || platform === 'MacIntel')  // Windows 或 Mac 平台
    ) {
        return 'pc';
    }

    // 场景 2-5：移动设备环境的具体区分
    if (isPWA) {
        if (isIOS) {
            return 'ios-pwa';  // 场景 2
        } else if (isAndroid) {
            return 'android-pwa';  // 场景 3
        }
    } else {
        if (isIOS) {
            return 'ios-h5';  // 场景 4
        } else if (isAndroid) {
            return 'android-h5';  // 场景 5
        }
    }

    return 'android';
}

/**
 * 下载app
 */
export const downloadApp = (device, inviteCode, appName, uuid, downloadPage, apkCdn) => {
    if (device === 'ios') {
        if (inviteCode) {
            location.href = `/front/cluser/c/ios/invite/file?merchantAcct=sf73&inviteCode=${inviteCode}&uuid=${uuid}`
        } else {
            location.href = `/front/cluser/c/ios/invite/file?merchantAcct=sf73&inviteCode=${appName}&uuid=${uuid}&codeType=agentCode`
        }
    } else if (device === 'android') {
        location.href = apkCdn + '/sf73/channel/apk/' + appName + '.apk';
    } else {
        location.href = downloadPage
    }
}


/**
 * 格式化时长
 * @param {*} num 
 */
export const formatDuration = (num) => {
    return dayjs.duration(num, 'seconds').format('HH:mm:ss')
}

/**
 * 字符串转时长
 * @param {*} string 
 */
export const string2Duration = (str) => {
    const numList = str.split(':').map(one => Number(one))
    return numList[0] * 3600 + numList[1] * 60 + numList[2]
}

/**
 * 从指定url中参数
 * @param {*} name 
 * @returns 
 */
export const getQueryString = (url_string, name) => {
    const url = new URL(url_string);
    return url.searchParams.get(name);
}

/**创建指定长度的随机字符串
 * 
 * @param {*} e 
 * @returns 
 */
export const randomString = (e) => {
    e = e || 32;
    var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}