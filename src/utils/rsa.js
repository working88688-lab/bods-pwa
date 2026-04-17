import JSEncrypt from 'jsencrypt'
import Encrypt from 'encryptlong'

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCgsH82stbCUaE1fTsotU0E2HWU9uQz496NFKgjjHBnBzqk9YtYcowNFxaOz6G5Q3bw5j/+0+iAD58/n99ENjFkipiulu30eRiUpHUVFyc+EJ14FLKIXNksQWTuAivCkIYcDNP42in1nyjdXrpps7klCMm9MeAz8Mm+k9r1MGVJsQIDAQAB'

export function resPublicData(data) {
  var jsencrypt = new JSEncrypt()
  jsencrypt.setPublicKey(publicKey)
  var result = jsencrypt.encrypt(data)
  return result
}
export function encrypt(data) {
  const PUBLIC_KEY = publicKey
  var enceyptor = new Encrypt()
  enceyptor.setPublicKey(PUBLIC_KEY)
  var result = enceyptor.encryptLong(data)
  return result
}
