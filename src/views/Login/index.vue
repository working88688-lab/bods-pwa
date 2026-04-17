<template>
  <div class="login-page page">
    <Header
      title="登录"
      textColor="#222"
      :isBlur="false"
      @onClickLeft="onBack"
    />
    <van-tabs
      v-if="list.length > 1"
      v-model="active"
      :ellipsis="false"
      animated
    >
      <van-tab
        v-for="(tab, idx) in list"
        :key="idx"
        :title="tab.label"
        :name="tab.value"
      >
        <van-cell-group inset :border="false">
          <template v-if="tab.value === 1">
            <van-field
              v-model="phone.mobile"
              name="mobile"
              placeholder="请填写手机号"
              :border="false"
            />
            <van-field
              v-model="phone.code"
              name="code"
              placeholder="请填写验证码"
              :border="false"
            >
              <template slot="extra">
                <span class="send" @click="onSend">{{ sendBtnTip }}</span>
              </template>
            </van-field>
          </template>
          <template v-if="tab.value === 2">
            <QrReader @onDecode="onDecode" />
          </template>
          <template v-if="tab.value === 3">
            <van-field
              v-model="account.username"
              name="username"
              placeholder="请输入账号"
              :border="false"
            />
            <van-field
              v-model="account.password"
              type="password"
              name="password"
              placeholder="请输入密码"
              :border="false"
            />
          </template>
        </van-cell-group>
      </van-tab>
    </van-tabs>
    <div class="submit" v-if="active !== 2">
      <van-button type="primary" :loading="loading" @click="submit"
        >完成</van-button
      >
    </div>
  </div>
</template>

<script>
import { Header, QrReader } from '@/components'
import {
  sendCodePhone,
  loginPhone,
  useQrFindOldAccount,
  login,
  getDeviceId,
} from '@/apis/user'
import md5 from 'md5'
import { encrypt } from '@/utils/rsa'
import { initWebSdkForUser } from '@/utils/websdk'

export default {
  name: 'Login',
  components: { Header, QrReader },
  data() {
    return {
      active: 2,
      list: [
        { label: '二维码', value: 2 },
        { label: '手机号', value: 1 },
        { label: '账号登录', value: 3 },
      ],
      loginForm: {
        mobile: '',
        code: '',
      },
      username: '',
      isSend: false,
      sendLoading: false,
      sendBtnTip: '获取验证码',
      downLoad: 60,
      timer: null,
      loginLoading: false,
      isValidate: false,
      password: null,
      phone: {
        mobile: null,
        code: null,
      },
      account: {
        username: null,
        password: null,
      },
      loading: false,
      sending: false,
      uuid: null,
    }
  },
  computed: {
    inviteCode() {
      return this.$store.state.inviteCode
    },
    agentCode() {
      return this.$store.state.agentCode
    },
  },
  created() {},
  mounted() {},
  destroyed() {
    this.timer && clearInterval(this.timer)
  },
  methods: {
    async useDeviceId() {
      const response = await getDeviceId({})
      if (response.code === 0) {
        this.$store.commit('SET_UUID', response.data)
        this.$router.push('/mine')
      }else{
        this.$toast(res.msg)
      }
    },
    async onDecode(e) {
      if (e) {
        const link = new URL(e)
        const search = new URLSearchParams(link.search)
        const uuid = search.get('uuid')
        if (uuid) {
          const inviteCode = search.get('inviteCode') || ''
          const params = {
            merchantAcct: process.env.VUE_APP_MERCHANTACCT,
            mac: uuid,
            os: this.$store.state.isApp ? 0 : 2,
            tips: md5(
              process.env.VUE_APP_MERCHANTACCT +
                uuid +
                (this.$store.state.isApp ? 0 : 2)
            ),
            inviteCode,
          }
          const response = await useQrFindOldAccount({
            encrypt: encrypt(JSON.stringify(params)),
          })
          if (response && response.code === 0) {
            const { token, infoPo } = response.data
            this.$store.commit('SET_TOKEN', token)
            this.$store.commit('SET_USERINFO', infoPo)
            initWebSdkForUser(infoPo, {})
            inviteCode && this.$store.commit('SET_INVITECODE', inviteCode)
            this.useDeviceId()
          }
        } else {
          this.$toast('二维码读取失败，请重新上传')
        }
      } else {
        this.$toast('二维码读取失败，请重新上传')
      }
    },
    async accountLogin() {
      try {
        this.loading = true
        const params = {
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
          os: 1,
          ...this.account,
        }
        const response = await login({
          encrypt: encrypt(JSON.stringify(params)),
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        })
        if (response.code === 0) {
          const { token, infoPo } = response.data
          this.$store.commit('SET_TOKEN', token)
          this.$store.commit('SET_USERINFO', infoPo)
          initWebSdkForUser(infoPo, {})
          this.useDeviceId()
        }
      } catch (error) {
        //
      } finally {
        this.loading = false
      }
    },
    async phoneLogin() {
      const params = {
        ...this.phone,
        inviteCode: this.inviteCode,
        agentCode: this.agentCode,
      }
      this.loading = true
      const response = await loginPhone(params).catch(() => {
        this.sending = false
        this.loading = false
        this.timer && clearInterval(this.timer)
        this.downLoad = 60
        this.sendBtnTip = '获取验证码'
      })
      if (response && response.code === 0) {
        this.sending = false
        this.loading = false
        this.timer && clearInterval(this.timer)
        this.downLoad = 60
        this.sendBtnTip = '获取验证码'
        const { token, infoPo } = response.data
        this.$store.commit('SET_TOKEN', token)
        this.$store.commit('SET_USERINFO', infoPo)
        initWebSdkForUser(infoPo, {})
        this.useDeviceId()
      } else {
        this.sending = false
        this.loading = false
        this.timer && clearInterval(this.timer)
        this.downLoad = 60
        this.sendBtnTip = '获取验证码'
      }
    },
    submit() {
      if (this.active === 1) {
        if (this.phone.mobile && this.phone.code) {
          this.phoneLogin()
        } else {
          this.$toast('手机号和验证码不能为空')
        }
      } else {
        if (this.active === 3) {
          if (this.account.username && this.account.password) {
            this.accountLogin()
          } else {
            this.$toast('账号和密码不能为空')
          }
        }
      }
    },
    async onSend() {
      const regex = /^1[3-9]\d{9}$/
      if (!this.sending) {
        if (this.phone.mobile) {
          if (regex.test(this.phone.mobile)) {
            const res = await sendCodePhone({
              mobile: this.phone.mobile,
            }).catch(() => (this.sending = false))
            if (res.code === 0) {
              this.sending = true
              this.downloadTip()
            } else {
              this.$toast(res.msg)
            }
          } else {
            return this.$toast('请输入正确的手机号')
          }
        } else {
          this.$toast('请输入手机号')
        }
      }
    },
    downloadTip() {
      this.timer = setInterval(() => {
        if (this.downLoad < 0) {
          clearInterval(this.timer)
          this.sendBtnTip = '获取验证码'
          this.sending = false
        } else {
          this.sendBtnTip = this.downLoad + '秒'
          this.downLoad--
        }
      }, 1000)
    },
    onBack() {
      try {
        this.$router.go(-1)
      } catch (error) {
        this.$router.push('/')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.login-page {
  height: 100%;

  ::v-deep .van-tabs {
    .van-tabs__line {
      display: none;
    }
    .van-tab {
      color: #222;
    }
    .van-tab--active {
      color: #109fff;
    }
    .van-tabs__nav {
      justify-content: center;

      .van-tab__text {
        font-size: 16px;
      }
    }

    .van-tab__pane {
      padding: 16px;

      .van-cell-group {
        margin: 0;

        .van-cell {
          border-radius: 10px;
          background: #efefef;
          margin-bottom: 15px;
          height: 44px;
        }

        .send {
          font-size: 14px;
          height: 30px;
          color: #109fff;
        }
      }
    }
  }

  .submit {
    width: 100%;
    padding: 0 16px;

    .van-button {
      width: 100%;
      border-radius: 22px;
    }
  }
}
</style>
