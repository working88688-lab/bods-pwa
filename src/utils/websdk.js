import axios from 'axios'
import store from '@/store'
import { decrypt } from '@/utils/aes'

export const WEB_SDK_CHANNEL_STORAGE_KEY = '__web_sdk_channel__'

function getLocalStorageSafe(key) {
  try {
    return String(localStorage.getItem(key) || '')
  } catch (e) {
    return ''
  }
}

function setLocalStorageSafe(key, value) {
  try {
    localStorage.setItem(key, String(value || ''))
  } catch (e) {
    // ignore
  }
}

export function setWebSdkChannelPersisted(channel) {
  setLocalStorageSafe(WEB_SDK_CHANNEL_STORAGE_KEY, channel)
}

export function getWebSdkChannelPersisted() {
  return getLocalStorageSafe(WEB_SDK_CHANNEL_STORAGE_KEY)
}

export function getDefaultWebSdkAppId() {
  // 与 tatagv-pwa 保持一致，便于后端聚合
  return 'JHG-002'
}

function getBaseURL() {
  const base = process.env.VUE_APP_BASE_API || ''
  return String(base || '').replace(/\/$/, '')
}

async function fetchEncryptedConfig() {
  // 该接口在不同环境可能返回：
  // - 纯字符串（encryptedConfig）
  // - 或 { code, data } 且 response.data 经过加密
  const url = `${getBaseURL()}/clientsdkreport/event`
  try {
    const resp = await axios.post(url, null, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        macct: process.env.VUE_APP_MERCHANTACCT,
        language: 'en_US',
        token: store?.state?.token || '',
        os: store?.state?.isApp ? 0 : 2,
        ver: '1.0',
      },
    })

    const data = resp?.data
    if (typeof data === 'string') return data
    if (data && typeof data === 'object' && typeof data.data === 'string') return data.data
    return ''
  } catch (e) {
    // 兼容接口返回加密文本的情况：尝试解密
    try {
      if (e && e.response && typeof e.response.data === 'string') {
        const parsed = JSON.parse(decrypt(e.response.data))
        return typeof parsed?.data === 'string' ? parsed.data : ''
      }
    } catch (_) {
      // ignore
    }
    return ''
  }
}

let initPromise = null

export async function initWebSdkOnce(opts = {}) {
  if (initPromise) return initPromise
  initPromise = (async () => {
    try {
      const sdk = window.WebSDK
      if (!sdk || typeof sdk.init !== 'function') return

      const encryptedConfig = await fetchEncryptedConfig()
      const resolvedChannel =
        typeof opts.channel === 'string' ? opts.channel : getWebSdkChannelPersisted()

      sdk.init({
        appId: String(opts.appId || getDefaultWebSdkAppId()),
        uid: String(opts.uid || ''),
        channel: String(resolvedChannel || ''),
        encryptedConfig: String(encryptedConfig || ''),
      })

      if (typeof sdk.notifyPageLoad === 'function') {
        sdk.notifyPageLoad()
      }
    } catch (e) {
      // ignore
    }
  })()
  return initPromise
}

export function setWebSdkUid(uid) {
  try {
    window.WebSDK && window.WebSDK.setUid && window.WebSDK.setUid(String(uid || ''))
  } catch (e) {
    // ignore
  }
}

export function setWebSdkChannel(channel) {
  setWebSdkChannelPersisted(channel)
  try {
    window.WebSDK && window.WebSDK.setChannel && window.WebSDK.setChannel(String(channel || ''))
  } catch (e) {
    // ignore
  }
}

export async function trackWebSdkEvent(event, payload = {}) {
  try {
    await initWebSdkOnce()
    const sdk = window.WebSDK
    if (!sdk || typeof sdk.track !== 'function') return
    const safePayload =
      payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
    void sdk.track({ event: String(event || ''), payload: safePayload })
  } catch (e) {
    // ignore
  }
}

export function initWebSdkForUser(userInfo, extra = {}) {
  try {
    const uid = String((userInfo && userInfo.userId) || '')
    if (!uid) return
    setWebSdkUid(uid)
    void initWebSdkOnce({ uid, channel: extra.channel })
  } catch (e) {
    // ignore
  }
}

