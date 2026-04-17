<template>
  <div class="page-container flex-container vip">
    <Header
      textColor="#000"
      rightColor="#666"
      title="分享推广"
      right="推广记录"
      @onClickLeft="onBack"
      @onClickRight="onRecord"
    />
    <Loading v-if="isInit" />
    <div
      v-else
      class="page-content"
    >
      <div
        v-if="promtionAd"
        class="content-top"
        ref="capture"
        :style="{
          'background-image': 'url(' + imageBase + promtionAd.bannerImageUrl + ')',
        }"
      >
        <div class="qr-code-wraper">
          <div
            class="qr-code"
            ref="qrCodeUrl"
          ></div>
          <div class="content-wraper">
            <div class="invitacode">推广码 {{ userInfo.shareCode }}</div>
            <div>官网：{{ dataDic.website }}</div>
          </div>
          <div class="logo">
            <img
              src="@/assets/logo.png"
              alt="logo"
            />
          </div>
        </div>
      </div>
      <div class="btn-box">
        <van-button
          round
          plain
          type="primary"
          class="mr-24 save-btn"
          @click="showShareImage"
          >保存图片</van-button
        >
        <van-button
          round
          type="primary"
          class="copy-btn"
          @click="onCopy"
          >复制链接</van-button
        >
      </div>
      <div class="rules">
        <div class="invite-box">
          <div class="invite-num"><span class="icon-num"></span>已邀请人数 {{ inviteData.invitedNum }}人</div>
          <div class="give-num">
            <span class="icon-day"></span>
            可获得
            <template v-if="inviteData.giveType === 'vip'">VIP{{ inviteData.shouldGetNum }}天</template>
            <template v-else>金币{{ inviteData.shouldGetNum }}</template>
          </div>
        </div>
        <div class="rules-list">
          <template v-if="inviteList && inviteList.length">
            <div
              v-for="(invite, idx) in inviteList"
              :key="idx"
              class="rules-item first"
            >
              成功推广{{ invite.inviteNum }}人，送
              <template v-if="invite.giveType === 'vip'"> {{ invite.giveNum }} 天VIP, </template>
              <template v-if="invite.giveType === 'coin'"> {{ invite.giveNum }} 金币, </template>
              <template v-if="invite.giveType === 'undress'"> {{ invite.giveNum }} 次AI脱衣, </template>
              <template v-if="invite.giveType === 'faceimg'"> {{ invite.giveNum }} 次AI图片换脸, </template>
              <template v-if="invite.giveType === 'facevideo'"> {{ invite.giveNum }} 次AI视频换脸, </template>
            </div>
          </template>
          <div class="rules-item">
            双方需要在[设置]
            中完成绑定邀请码才算成功。需要手动领取VIP领取成功后，自动延长VIP时长，金币领取成功，自动累计到钱包账户。
          </div>
        </div>
      </div>
      <div class="receive-box">
        <van-button
          round
          type="primary"
          :disabled="!inviteData.shouldGetNum"
          :loading="isLoading"
          class="receive-btn"
          @click="onReceive"
          >立即领取</van-button
        >
      </div>
    </div>
    <PlayAds
      ref="playads"
      v-if="alertBannerList.length"
      :list="alertBannerList"
    />
  </div>
</template>

<script>
  import Header from '@/components/Header'
  import QRCode from 'qrcodejs2'
  import html2canvas from 'html2canvas'
  import { userGetInviteConfig, getAvailableRecord, receiveRightNow } from '@/apis/activity'
  import { centerUserInfo } from '@/apis/user'
  import Loading from '@/components/Loading'
  import _ from 'lodash'
  import PlayAds from '@/components/PlayAds'

  export default {
    name: 'Promote',
    components: {
      Header,
      Loading,
      PlayAds,
    },
    data() {
      return {
        isInit: true,
        link: '',
        qrcode: null,
        inviteList: [],
        inviteData: {},
        isLoading: false,
        promtionAd: null,
        alertBannerList: [],
      }
    },
    watch: {
      $route: {
        handler(val) {
          if (this.$refs?.playads?.onShow) {
            this.$refs.playads.onShow()
          }
        },
      },
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
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
    },
    async created() {
      if (this.$store.state.banner && this.$store.state.banner['promtion']) {
        let res = this.$store.state.banner['promtion']
        this.isInit = false
        this.promtionAd = _.sample(res)
      }
      this.isInit = false

      if (this.$store.state.banner && this.$store.state.banner['sharead']) {
        this.alertBannerList = this.$store.state.banner['sharead']
      }
      this.link =
        (this.dataDic.qrcode_link ? this.dataDic.qrcode_link : this.dataDic.shareaddress) +
        '?inviteCode=' +
        this.userInfo.shareCode
      if (!this.qrcode) {
        this.$nextTick(() => {
          this.creatQrCode()
        })
      }
      this.getInviteConfig()
      this.getInviteData()
    },
    activated() {},
    methods: {
      onBack() {
        this.$router.go(-1)
      },
      onRecord() {
        this.$router.push('/promoteRecord')
      },
      async getInviteConfig() {
        const res = await userGetInviteConfig({
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        })
        if (res && res.code === 0) {
          this.inviteList = res.data
        }
      },
      async getInviteData() {
        const res = await getAvailableRecord({
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        })
        if (res && res.code === 0) {
          this.inviteData = res.data
        }
      },
      showShareImage() {
        if (!this.link) {
          return this.$toast('获取分享链接失败')
        }
        html2canvas(this.$refs.capture, { useCORS: true }).then(canvas => {
          const imgUrl = canvas.toDataURL('image/png')
          var eleLink = document.createElement('a')
          eleLink.href = imgUrl // 转换后的图片地址
          eleLink.download = 'Boys个人分享码.png'
          document.body.appendChild(eleLink)
          // 触发点击
          eleLink.click()
          // 然后移除
          document.body.removeChild(eleLink)
          this.$toast('二维码已保存至相册，打开扫一扫即可分享')
        })
      },
      onCopy() {
        if (!this.link) {
          return this.$toast('获取分享链接失败')
        }
        this.$copyText(this.link).then(e => {
          this.$toast('复制成功')
        })
      },
      creatQrCode() {
        this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
          text: this.link,
          width: 78,
          height: 78,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
        })
      },
      async onReceive() {
        this.isLoading = true
        const res = await receiveRightNow({}).catch(() => {
          this.isLoading = false
        })
        this.isLoading = false
        if (res && res.code === 0) {
          this.$toast('领取成功')
          this.getInviteData()
          this.getUserInfo()
        }
      },
      async getUserInfo() {
        const res = await centerUserInfo()
        if (res && res.code === 0) {
          this.$store.commit('SET_USERINFO', res.data)
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .vip {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(../../../assets/images/top_bg.png) top / 100% no-repeat transparent;
    padding-top: calc(var(--safe-area-top));
  }
  .page-content {
    padding: 16px;
    box-sizing: border-box;
    flex: 1;
    overflow: auto;

    .content-top {
      height: 460px;
      background-position: top;
      background-size: cover;
      background-repeat: no-repeat;
      text-align: center;
      position: relative;
      border-radius: 16px;

      .qr-code-wraper {
        width: 100%;
        padding: 32px 16px;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        position: absolute;
        left: 0;
        bottom: 0;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
        border-radius: 0 0 16px 16px;

        .content-wraper {
          width: calc(100% - 128px);
          padding: 0 6px;
          box-sizing: border-box;
          font-size: 14px;
          color: #f8f8f8;
          text-align: center;

          .invitacode {
            color: #fff;
            font-size: 18px;
            margin-bottom: 8px;
          }
        }

        .logo {
          width: 64px;

          img {
            width: 100%;
          }
        }
      }
    }

    .rules {
      margin: 24px 0;
      background: #fff;
      box-shadow: 0 0 12px #cecece40;
      border-radius: 16px;

      .rules-title {
        font-size: 16px;
      }

      .rules-item {
        margin-top: 8px;
      }

      .invite-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #109fff0f;
        color: #862945;
        padding: 16px;
        font-size: 12px;

        > div {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          width: 50%;
        }

        > div:nth-child(2n-1) {
          border-right: 1px solid #8629451a;
        }

        > div:nth-child(2n) {
          justify-content: flex-end;
        }

        .icon-num {
          display: inline-block;
          width: 16px;
          height: 16px;
          background: url(../../../assets/images/icon_number.png) center / 100% no-repeat;
          margin-right: 6px;
        }

        .icon-day {
          display: inline-block;
          width: 16px;
          height: 16px;
          background: url(../../../assets/images/icon_day.png) center / 100% no-repeat;
          margin-right: 6px;
        }
      }

      .rules-list {
        padding: 16px;
      }
    }

    .btn-box {
      margin-top: 24px;
      text-align: center;

      .van-button {
        width: calc((100% - 24px) / 2);
      }

      .van-button--default {
        color: #000;
      }
    }

    .receive-box {
      .receive-btn {
        width: 100%;
      }
    }
  }

  ::v-deep .copy-btn {
    // background-color: #109fff !important;
    border: none !important;
    color: #fff;
  }

  ::v-deep .save-btn {
    background: none !important;
    border: 1px solid var(--theme-color) !important;
    color: var(--theme-color);
  }

  ::v-deep .qr-code {
    width: 64px;
    height: 64px;
    display: inline-flex;
    padding: 4px;
    background: #fff;
    margin: 0 auto;
    border-radius: 6px;
    img {
      width: 100% !important;
      height: 100% !important;
    }
  }
</style>
