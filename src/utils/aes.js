import CryptoJS from "crypto-js";

// 加密
export function encrypt(word, keyStr) {
    keyStr = keyStr ? keyStr : "GcgzsKdDZTumABNz7uujrCfPIk9TQ355";
    let key = CryptoJS.enc.Utf8.parse(keyStr);
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

// 解密
export function decrypt(word, keyStr) {
    keyStr = keyStr ? keyStr : "GcgzsKdDZTumABNz7uujrCfPIk9TQ355";
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}