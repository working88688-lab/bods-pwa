<template>
  <div class="loading-page">
    <div v-if="loadingData" class="start-up" @click="onJump">
      <div class="start-info" :style="{
        background: `url(${imageBase + startUpInfo.bannerImageUrl
          }) no-repeat`,
      }" />
      <span class="down-time" @click="onClose">
        {{ downTime ? `${downTime}s(跳过)` : '关闭' }}
      </span>
    </div>
    <div class="loadingText">{{ loadingText }}</div>
  </div>
</template>

<script>
import { getCdnLineByMerAcct, listAllCategory } from '@/apis/media'
import { banner, clickBanner, getDicByKeys } from '@/apis/data'
import _ from 'lodash'
import { Dialog } from 'vant'
import { useBanner } from '@/apis/user'
import { requestMultiple } from '../../utils'
import { initWebSdkForUser, setWebSdkChannel } from '@/utils/websdk'

export default {
  name: 'LoadingPage',
  data() {
    return {
      loadingText: '正在为您配置数据中',
      startUpInfo: null,
      downTime: 5,
      timer: null,
      isLoading: true,
      inited: false,
    }
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    uuid() {
      return this.$store.state.uuid
    },
    isApp() {
      return this.$store.state.isApp
    },
    loadingData() {
      return Boolean(this.imageBase && this.startUpInfo)
    },
  },
  created() {
    // 启动阶段尽早持久化渠道码（ch）
    try {
      const params = new URLSearchParams(window.location.search || '')
      const ch = params.get('ch') || params.get('channel') || ''
      if (ch) setWebSdkChannel(ch)
    } catch (e) {
      // ignore
    }
    this.useConfig()
  },
  destroyed() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    // 登录
    async useLogin() {
      try {
        const response = await this.$store.dispatch('macLogin')
        if (response && response.code === 0) {
          const { token, infoPo } = response.data
          this.$store.commit('SET_TOKEN', token)
          this.$store.commit('SET_USERINFO', infoPo)
          initWebSdkForUser(infoPo, {})
          return true
        } else {
          this.dialogTips('登录失败，请刷新重试')
        }
      } catch (error) {
        this.dialogTips('登录失败，请刷新重试')
      }
    },
    async useConfig() {
      // 获取cdn
      const p1 = async () => {
        this.loadingText = '正在获取线路'
        try {
          const res = await getCdnLineByMerAcct({})
          if (res && res.code === 0) {
            this.$store.commit('SET_CDNLINELIST', res.data)
            this.loadingText = '正在读取最快线路'
            const cdn = await requestMultiple(
              res.data.map(item => item.cdnLine + '/filehome/emmav')
            )
            this.$store.commit(
              'SET_CDNLINE',
              res.data.find(item => cdn.includes(item.cdnLine))
            )
            this.loadingText = '线路读取完成，请稍后'
            return true
          }
        } catch (error) {
          this.dialogTips('配置数据失败，请刷新页面')
          return false
        }
      }

      // 获取启动页广告
      const p2 = async () => {
        try {
          const res = await banner({
            merchantAcct: process.env.VUE_APP_MERCHANTACCT,
            bannerLocation: 'loading_page',
          })
          if (res && res.code === 0) {
            this.startUpInfo = _.sample(res.data)
            return true
          }
        } catch (error) {
          this.dialogTips('配置数据失败，请刷新页面')
          return false
        }
      }

      // 所有广告位
      const p3 = async () => {
        try {
          const response = await useBanner({})
          if (response && response.code === 0) {
            this.$store.commit('setBanner', response.data)
            return true
          }
        } catch (error) {
          this.dialogTips('配置数据失败，请刷新页面')
          return false
        }
      }

      // 分类信息
      const p4 = async () => {
        try {
          const res = await listAllCategory({})
          if (res && res.code === 0) {
            this.$store.commit('SET_APPFOOTER', res.data)
            return true
          }
        } catch (error) {
          this.dialogTips('配置数据失败，请刷新页面')
          return false
        }
      }

      // 字典
      const p5 = async () => {
        try {
          const res = await getDicByKeys({
            dataKey: [
              'official_key',
              'domain',
              'shareaddress',
              'gift_vip',
              'downloadPage',
              'inADNub',
              'insert_ad',
              'watermark',
              'aiupload_time',
              'upload_price',
              'ai_size',
              'apk_cdn',
              'telegram',
              'advertiseTime',
              'chat_url',
              'chat_appid',
              'chat_skill',
              'qrcode_link',
              'authorize_category',
              'website'
            ],
          })
          if (res && res.code === 0) {
            this.$store.commit('SET_DATADIC', res.data)
            return true
          }
        } catch (error) {
          this.dialogTips('配置数据失败，请刷新页面')
          return false
        }
      }

      const result = await Promise.all([p1(), p2()])
      const config = await Promise.all([this.useLogin(), p3(), p4(), p5()])
      if (result.every(Boolean) && config.every(Boolean)) {
        this.inited = result.every(Boolean) && config.every(Boolean)
        this.$emit('onInited')
        if (!this.startUpInfo) {
          this.$emit('onFinish')
        }
      }
    },
    countdown() {
      this.isLoading = false
      this.timer = setInterval(() => {
        if (this.downTime > 0) {
          this.downTime--
        } else {
          clearInterval(this.timer)
          // if (this.inited) {
          //   this.$emit('onFinish')
          // } else {
          //   setTimeout(() => {
          //     this.countdown()
          //   }, 100)
          // }
        }
      }, 1000)
    },
    onJump() {
      clickBanner({ bannerCode: this.startUpInfo.bannerCode })
      this.$emit('onFinish')
      if (this.startUpInfo.jumpType === 0) {
        // jumpType = 0 ===> 内链
        if (this.startUpInfo.jumpUrl === 'JUMP_LINK_VIP') {
          this.$router.push('/vip')
        } else if (this.startUpInfo.jumpUrl === 'CHARGE_LINK_COIN') {
          this.$router.push('/recharge')
        } else if (this.startUpInfo.jumpUrl === 'JUMP_LINK_PROXY') {
          this.$router.push('/promote')
        } else if (this.startUpInfo.jumpUrl === 'JUMP_LINK_STREAM') {
          this.$router.push('/streaming')
        } else if (this.startUpInfo.jumpUrl === 'JUMP_LINK_CHECK') {
          this.$router.push('/signin')
        } else {
          this.$router.push(this.startUpInfo.jumpUrl)
        }
      } else if (this.startUpInfo.jumpType === 1) {
        window.open(this.startUpInfo.jumpUrl, '_blank')
      } else {
        // jumpType = 3 ===> 不跳
        return null
      }
    },
    onClose(event) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      } else {
        window.event.cancelBubble = true
      }
      if (!this.downTime) {
        if (this.inited) {
          this.$emit('onFinish')
        } else {
          this.$toast('配置还未完成，请稍后再试')
        }
      }
    },
    dialogTips(msg) {
      Dialog.confirm({
        title: '提示',
        message: msg,
        zIndex: 3001,
      })
        .then(async () => {
          window.location.reload()
        })
        .catch(() => { })
    },
  },
  watch: {
    loadingData: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val) {
          this.countdown()
        }
      },
    },
  },
}
</script>

<style lang="less" scoped>
.loading-page {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 3000;
  background: url(../../assets/start.jpg) no-repeat;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;

  .loadingText {
    position: absolute;
    bottom: 20px;
    z-index: 1;
  }

  .start-up {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 2;

    .start-info {
      width: 100%;
      height: 100%;
      background-size: cover !important;
      background-position: center !important;
    }

    .down-time {
      width: fit-content;
      height: 28px;
      padding: 4px 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 16px;
      font-size: 14px;
      line-height: 20px;
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      position: absolute;
      top: calc(12px + env(safe-area-inset-top));
      right: 12px;
      cursor: pointer;
      border: 1px solid rgba(255, 255, 255, 0.435);
    }
  }
}
</style>
