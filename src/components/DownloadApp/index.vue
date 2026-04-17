<template>
  <div class="download-app">
    <div class="logo-lang">
      <img src="@/assets/logo_lang.png" />
    </div>
    <div class="download-btn" @click="onInstall">
      <van-icon name="back-top" />
      <span>下载APP</span>
    </div>
  </div>
</template>

<script>
import { downloadApp } from '@/utils/tools'
import { Dialog } from 'vant'

export default {
  name: 'DownloadApp',
  computed: {
    downloadPage() {
      return this.$store.state.dataDic
        ? this.$store.state.dataDic.downloadPage
        : 'https://hiowrxc3.com'
    },
    dataDic() {
      return this.$store.state.dataDic
    },
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {
    onInstall() {
      const uuid = this.$store.state.uuid
      const agentCode = this.$store.state.agentCode
      const inviteCode = this.$store.state.inviteCode
      const appName = agentCode || '6IB73LT2'
      const device = this.$store.state.device
      Dialog.confirm({
        message: '将应用安装到桌面',
        cancelButtonText: '下次再说',
        confirmButtonText: '立即安装',
      })
        .then(async () => {
          downloadApp(
            device,
            inviteCode,
            appName,
            uuid,
            this.downloadPage,
            this.dataDic.apk_cdn
          )
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="less" scoped>
.download-app {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  img {
    height: 32px;
    width: auto;
  }
  .download-btn {
    cursor: pointer;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    color: #109fff;
    border: 1px solid #109fff;
    padding: 4px;
    border-radius: 4px;
    .van-icon-back-top {
      transform: rotate(180deg);
      font-size: 18px;
      margin-right: 2px;
    }
  }
}
</style>
