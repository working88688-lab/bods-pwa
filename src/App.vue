<template>
  <div id="app">
    <LoadingPage v-if="isLoadingPage" @onInited="handleInited" @onFinish="handleFinish" />
    <div class="page-wraper van-safe-area-top" :style="style()">
      <template v-if="showMainPage">
        <keep-alive>
          <router-view />
        </keep-alive>
        <AdModal />
        <HomeSuspendAd location="home_suspend_ad" showClose />
        <InstallAPP v-if="show" />
      </template>
      <!-- <WaveProgress
        v-if="showWaveProgress"
        :rate="rate"
        ref="WaveProgressRef"
      /> -->
    </div>
    <Footer />
  </div>
</template>
<script>
import LoadingPage from '@/components/LoadingPage'
import { useDomain } from '@/apis/data'
import dayjs from 'dayjs'
import WaveProgress from '@/components/WaveProgress'
import Footer from '@/components/Footer'
import AdModal from '@/components/AdModal'
import HomeSuspendAd from '@/components/HomeSuspendAd'
import InstallAPP from '@/components/InstallAPP'
import { useDarkPermission } from '@/apis/user'
import { useFooterData } from '@/hooks'
import _ from 'lodash'
import GoDB from 'godb'

export default {
  name: 'App',
  components: {
    LoadingPage,
    WaveProgress,
    Footer,
    AdModal,
    HomeSuspendAd,
    InstallAPP,
  },
  data() {
    return {
      isLoadingPage: true,
      showMainPage: false,
      showDialog: false,
      link: '',
      wsTimer: null,
      pingData: JSON.stringify({
        commandType: 'PING',
        sentTime: null,
        data: {},
      }),
      shareData: null,
      isHorizontal: false,
      minHeight: window.innerHeight + 'px',
      showWaveProgress: false,
      rate: 0,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    isApp() {
      return this.$store.state.isApp
    },
    device() {
      return this.$store.state.device
    },
    activePath() {
      return this.$route.path
    },
    authorize_category() {
      const darknet = useFooterData().find(item => item.path === '/darknet')
      const id = darknet ? darknet.name : ''
      if (id && this.$store.state.dataDic.authorize_category) {
        return JSON.parse(this.$store.state.dataDic.authorize_category)[id]
      }
    },
    show() {
      return this.$store.state.device.includes('h5')
    },
  },
  created() {
    const searchStrList = decodeURIComponent(window.location.search)
      .split('?')
      .filter(one => one)
    const inviteCode = searchStrList.find(one => one.indexOf('inviteCode') > -1)
    const agentCode = searchStrList.find(one => one.indexOf('agentCode') > -1)
    const iosApp = searchStrList.find(one => one.indexOf('iosApp') > -1)
    const uuid = searchStrList.find(one => one.indexOf('uuid') > -1)
    if (inviteCode) {
      this.$store.commit('SET_INVITECODE', inviteCode.replace('inviteCode=', ''))
    }
    if (agentCode) {
      this.$store.commit('SET_AGENTCODE', agentCode.replace('agentCode=', ''))
    }
    if (uuid) {
      this.$store.commit('SET_UUID', uuid.replace('uuid=', ''))
    }
    if (iosApp) {
      this.$store.commit('SET_ISAPP', 1)
    }
    // document.addEventListener('visibilitychange', this.handleVisiable)

    // 链接soket
    // PubSub.subscribe('ON_CONNECT_SOCKET', (msg, token) => {
    //   const wsUrl = `wss://im.apitjs.com/websocket?token=${Base64.encode(token)}&macct=${
    //     process.env.VUE_APP_MERCHANTACCT
    //   }`
    //   this.wsTimer && clearInterval(this.wsTimer)
    //   if (this.$store.ws) {
    //     this.$store.ws.destroy()
    //     this.$store.ws = null
    //   }
    //   this.$store.ws = new WS(wsUrl)
    // })

    // PubSub.subscribe('CONNECT_SOCKET_SUCCESS', (msg, data) => {
    //   this.wsTimer && clearInterval(this.wsTimer)
    //   // 发送心跳
    //   this.wsTimer = setInterval(() => {
    //     this.$store.ws.send(this.pingData)
    //   }, 10000)
    // })

    // // 获取聊天室列表
    // PubSub.subscribe('ON_GET_CHATROOM', async (msg, data) => {
    //   const res = await chatRoomList()
    //   if (res && res.code === 0) {
    //     this.$store.commit('SET_CHATROOMLIST', res.data)
    //   }
    // })

    // // 监听聊天室新消息
    // PubSub.subscribe('ROOM_CHAT', async (msg, data) => {
    //   // 监听来自群聊的新消息
    //   if (data.roomType === 2) {
    //     if (this.$route.path === '/groupChat') {
    //       this.$store.commit('SET_UNREADMESSAGET', false)
    //     } else {
    //       this.$store.commit('SET_UNREADMESSAGET', true)
    //     }
    //   }
    // })

    // // token失效，重新获取token连接socket
    // PubSub.subscribe('INVALID_TOKEN', msg => {
    //   this.$store.dispatch('macLogin')
    // })

    // // 显示波浪上传进度组件
    // PubSub.subscribe('SHOW_WAVEPROGRESS', msg => {
    //   this.showWaveProgress = true
    //   this.rate = 0
    // })

    // // 设置波浪上传进度
    // PubSub.subscribe('SET_WAVEPROGRESS', (msg, data) => {
    //   this.rate = data.rate
    // })

    // // 隐藏波浪上传进度组件
    // PubSub.subscribe('HIDE_WAVEPROGRESS', msg => {
    //   this.showWaveProgress = false
    //   this.rate = 0
    // })
  },
  mounted() { },
  beforeDestroy() {
    // document.removeEventListener('visibilitychange', this.handleVisiable)
    // PubSub.unsubscribe('ON_CONNECT_SOCKET')
    // PubSub.unsubscribe('ON_GET_CHATROOM')
    // PubSub.unsubscribe('ROOM_CHAT')
    // PubSub.unsubscribe('CONNECT_SOCKET_SUCCESS')
    // PubSub.unsubscribe('INVALID_TOKEN')
    // this.wsTimer && clearInterval(this.wsTimer)
    // if (this.$store.ws) {
    //   this.$store.ws.destroy()
    // }
  },
  methods: {
    async getDarkPermission() {
      const response = await useDarkPermission()
      if (response.code === 0) {
        let list = []
        const darknet = useFooterData().find(item => item.path === '/darknet')
        const id = darknet ? darknet.name : ''
        if (id && this.$store.state.dataDic.authorize_category) {
          list = JSON.parse(this.$store.state.dataDic.authorize_category)[id]
        }
        const vipIds = response.data.map(item => item.vipCode)

        const arr = _.intersection(list, vipIds)
        if (arr.length) {
          this.$store.commit('SET_DARK_SHOW')
        }
      }
    },
    style() {
      if (window.navigator.standalone) {
        if (this.$route.meta.show) {
          return {
            height: `calc(${window.innerHeight}px - 50px - env(safe-area-inset-bottom))`,
          }
        } else {
          return {
            height: `${window.innerHeight}px`,
          }
        }
      } else {
        if (this.$route.meta.show) {
          return {
            height: `calc(${window.innerHeight}px - 50px)`,
          }
        } else {
          return {
            height: `${window.innerHeight}px`,
          }
        }
      }
    },
    handleVisiable(e) {
      if (e.target.visibilityState === 'visible') {
        const currTime = dayjs().valueOf()
        // 如果app被切出时长超过一个小时，重新加载页面进入
        if (currTime - this.$store.state.appLeaveTime > 60 * 60 * 1000) {
          if (this.$store.ws) {
            this.$store.ws.destroy()
          }
          window.location.reload()
        }
      } else {
        this.$store.state.appLeaveTime = dayjs().valueOf()
      }
    },
    async handleInited() {
      this.showMainPage = true
      this.getDarkPermission()
      window.addEventListener('load', async () => {
        const res = await useDomain({
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
          domainType: 1,
        })
        if (res && res.code === 0 && res.data.length) {
          localStorage.setItem('domain', JSON.stringify(res.data.map(item => item.url)))
        }
      })
    },
    handleFinish() {
      this.isLoadingPage = false
      const godb = new GoDB('localDB')
      this.$store.commit('SET_GODB', godb)
    }
  },
}
</script>

<style lang="less">
#app {
  margin: 0 auto;
  color: #333;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: content-box;
  background: url(./assets/images/main-bg.png) top / 100% no-repeat #f6f6f6;

  .page-wraper {}
}

@media all and (min-width: 769px) {
  #app.pc {
    max-width: 500px;

    * {
      max-width: 500px;
    }
  }
}

.qr-dialog {
  width: 65% !important;
  max-width: 300px !important;
  text-align: center;
  border-radius: 6px !important;

  .dialog-title {
    line-height: 32px;
    font-size: 14px;
  }

  .capture-box {
    display: inline-block;
    margin: 0 auto;
    padding: 12px;

    .logo {
      width: 60%;
      display: inline-block;
    }

    .qr-code-box {
      display: inline-block;

      .qr-code {
        padding: 6px;
      }
    }

    .qr-tip {
      font-size: 12px;
      color: #109fff;
    }
  }

  .dialog-btn-box {
    margin-bottom: 12px;

    .save-btn {
      background-color: #109fff !important;
      color: #fff !important;
      border: none !important;
    }
  }
}
</style>
