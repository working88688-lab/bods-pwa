<template>
  <div class="page-container">
    <Header
      textColor="#222222"
      title="充值确认"
      @onClickLeft="onBack"
    />
    <div class="page-content">
      <div class="waiting">
        <div class="waiting-img"></div>
        <div class="waiting-text">确认支付结果</div>
      </div>
      <div class="tip">
        支付后，若30分钟未到账，<br />请点击【<span @click="click">在线客服</span
        >】，选择充值遇到问题，<br />上传支付凭证为您处理
      </div>
      <div class="btn-box">
        <van-button
          round
          type="primary"
          class="btn-success"
          @click="onRoute('/mine')"
          >支付成功</van-button
        >
        <van-button
          round
          class="btn-fail"
          @click="onBack"
          >未支付</van-button
        >
      </div>
    </div>
  </div>
</template>

<script>
  import Header from '@/components/Header'
  import _ from 'lodash'

  export default {
    name: 'RechargeConfirm',
    components: {
      Header,
    },
    data() {
      return {}
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      wsInfo() {
        return this.$store.state.wsInfo
      },
      dataDic() {
        return this.$store.state.dataDic
      },
    },
    created() {},
    beforeRouteLeave(to, from, next) {
      this.scrollTop = document.documentElement.scrollTop
      next()
    },
    methods: {
      onBack() {
        this.$router.go(-1)
      },
      onRoute(path) {
        this.$router.push(path)
      },
      click() {
        const csUrl =
          this.dataDic.chat_url +
          `/im/index.html?appid=${this.dataDic.chat_appid}&userid=${this.userInfo.shareCode}&url=http%3A%2F%2Flocalhost%3A8035%2Ftestclient.html&skill=${this.dataDic.chat_skill}`
        window.open(csUrl, '_blank')
      },
    },
  }
</script>

<style lang="less" scoped>
  .page-container {
    .page-content {
      padding: 128px 16px 16px;
      box-sizing: border-box;
      .waiting {
        text-align: center;
        margin: 24px 0;
        .waiting-img {
          width: 80px;
          height: 80px;
          margin: 0 auto 6px;
          background: url(../../../assets/images/waiting.png) center / 100% no-repeat;
        }
        .waiting-text {
          color: #666666;
          font-size: 20px;
        }
      }
      .tip {
        color: #666666;
        font-size: 15px;
        line-height: 20px;
        text-align: center;
        span {
          color: #109fff;
        }
      }
      .btn-box {
        margin-top: 36px;
        text-align: center;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        .van-button {
          min-width: 240px;
        }
        .btn-fail {
          background: transparent !important;
          color: #999999;
          border: none;
          margin-top: 16px;
        }
      }
    }
  }
</style>
