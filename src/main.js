import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Vant from 'vant'
import 'vant/lib/index.css'
import '@/assets/styles/index.less'

import VueSticky from 'vue-sticky'
Vue.directive('sticky', VueSticky)

import VueLoadmore from 'vuejs-loadmore'
Vue.use(VueLoadmore)

import VueClipBoard from 'vue-clipboard2'
Vue.use(VueClipBoard)

import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload, {
  preLoad: 1.3,
  loading: require('@/assets/images/default.png'),
  error: require('@/assets/images/default.png'),
  attempt: 1,
})

Vue.use(Vant)

import './assets/font/iconfont.css'
import 'xgplayer/dist/index.min.css'
import 'normalize.css/normalize.css'

import { Toast, Dialog } from 'vant'
Vue.prototype.$toast = Toast

// 全局组件挂载
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app')

const CURRENT_VERSION = 'sf73.0.59' // 当前版本号
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`/sw.js?v=${CURRENT_VERSION}`)
      .then((registration) => {
        // 监听 Service Worker 的更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            // 立即跳过等待并激活新 Service Worker
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                // 新版本激活后通知客户端显示更新提示
                // 获取上次存储的版本号
                const storedVersion = localStorage.getItem('appVersion')
                if (storedVersion && storedVersion !== CURRENT_VERSION) {
                  if (
                    window.navigator.standalone ||
                    window.matchMedia('(display-mode: standalone)').matches
                  ) {
                    // 如果检测到新版本，显示更新提示弹窗
                    Dialog.alert({
                      title: '更新完成',
                      message: '新版本已应用，请点击重启',
                      className: 'top',
                      getContainer: 'body',
                      overlayClass: 'c-overlay',
                      beforeClose: (action, done) => {
                        if (action === 'confirm') {
                          window.location.reload(true)
                        }
                        done()
                      },
                    })
                  }
                }

                // 更新版本号存储
                localStorage.setItem('appVersion', CURRENT_VERSION)
              }
            })
          }
        })
      })
  })
}
