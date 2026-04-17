<template>
  <div class="install-app" @click="onInstall">
    <img src="@/assets/logo_lang.png" />
    <span>添加应用</span>
  </div>
</template>

<script>
import { Dialog } from 'vant'
import { downloadApp } from '@/utils/tools'

export default {
  name: 'InstallAPP',
  components: {},
  computed: {
    key() {
      return this.$route.path
    },
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
.install-app {
  width: 160px;
  background: #109fff;
  border-radius: 5px;
  position: absolute;
  z-index: 999;
  bottom: 80px;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  font-size: 15px;
  color: #fff;
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: auto;
    height: 24px;
    margin-right: 8px;
  }
}
</style>
