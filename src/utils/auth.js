import Cookies from 'js-cookie'

const UserNameKey = 'CLSQ-UserInfo'

export function getUserInfo() {
  let info = Cookies.get(UserNameKey)
  return info ? JSON.parse(info) : null
}

export function setUserInfo(info) {
  const infoStr = JSON.stringify(info)
  return Cookies.set(UserNameKey, infoStr, { expires: 30 })
}

export function removeUserInfo() {
  return Cookies.remove(UserNameKey)
}

const SearchLabelKey = 'CLSQ-SearchLabel'

export function getSearchLabel() {
  let info = Cookies.get(SearchLabelKey)
  return info ? JSON.parse(info) : []
}

export function setSearchLabel(info) {
  const infoStr = JSON.stringify(info)
  return Cookies.set(SearchLabelKey, infoStr, { expires: 30 })
}

export function removeSearchLabel() {
  return Cookies.remove(SearchLabelKey)
}

export function getCookie(key) {
  return Cookies.get(key)
}

export function setCookie(key, value) {
  return Cookies.set(key, value, { expires: 30 })
}

export function removeCookie(key) {
  return Cookies.remove(key)
}
