<template>
  <van-dialog
    v-model:show="showDialog"
    :showConfirmButton="false"
    :closeOnClickOverlay="false"
  >
    <div class="content" v-if="videoInfo">
      <van-icon name="cross" class="close-btn" @click="onClose" />
      <!-- 金币付费 -->
      <div class="fee-gold" v-if="videoInfo.payType === 2">
        <div class="title">提示</div>
        <div class="desc">观看完整版需支付</div>
        <div class="gold">
          <span>{{ videoInfo.goldPayUnit || 0 }}</span>
          <span></span>
        </div>
        <div class="balance" v-if="userInfo">
          账户余额：{{ userInfo.coinBalance || 0 }}
          <span v-if="userInfo.coinBalance < videoInfo.goldPayUnit"
            >余额不足</span
          >
        </div>
        <div class="btn-box">
          <van-button round type="primary" plain class="mr-24" @click="onClose"
            >取消</van-button
          >
          <van-button
            v-if="userInfo && userInfo.coinBalance < videoInfo.goldPayUnit"
            round
            type="primary"
            @click="onRoute('/recharge')"
            >购买金币</van-button
          >
          <van-button v-else round type="primary" @click="onBuy"
            >购买</van-button
          >
        </div>
      </div>
      <!-- 用户等级 -->
      <div class="fee-gold" v-if="videoInfo.payType === 3">
        <div class="title">提示</div>
        <div class="desc">观看完整影片需Lv{{ videoInfo.userLevel }}</div>
        <div class="balance" v-if="userInfo">
          当前等级：Lv{{ userInfo.expLevel || 0 }}
        </div>
        <div class="btn-box">
          <van-button round type="primary" plain class="mr-24" @click="onClose"
            >取消</van-button
          >
          <van-button round type="primary" @click="onRoute('/vip')"
            >升级等级</van-button
          >
        </div>
      </div>
      <!-- VIP -->
      <div class="fee-vip" v-if="videoInfo.payType === 4">
        <div class="title">提示</div>
        <div class="desc">升级VIP即可观看完整版</div>
        <div class="btn-box">
          <van-button round type="primary" plain class="mr-24" @click="onClose"
            >取消</van-button
          >
          <van-button
            round
            type="primary"
            class="btn-vip"
            :loading="loading"
            @click="onRoute('/vip')"
            >购买VIP</van-button
          >
        </div>
        <van-divider
          :style="{
            borderColor: '#00000080',
            padding: '0 8px',
            fontSize: '12px',
          }"
          >邀请好友免费观看</van-divider
        >
        <div class="btn-box">
          <van-button
            round
            block
            type="primary"
            plain
            class="btn-invite"
            @click="onRoute('/promote')"
            >立即邀请</van-button
          >
        </div>
      </div>
    </div>
  </van-dialog>
</template>

<script>
import { purchase } from '@/apis/media'

export default {
  name: 'FeeReminder',
  props: {
    videoInfo: {
      type: Object,
      default: () => {
        return null
      },
    },
  },
  data() {
    return {
      showDialog: false,
      loading: false,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  created() {},
  methods: {
    onShow() {
      this.showDialog = true
    },
    onClose() {
      this.showDialog = false
    },
    onRoute(path) {
      this.$router.push(path)
    },
    async onBuy() {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        mediaId: this.videoInfo.mediaId,
        mediaType: this.videoInfo.mediaType,
      }
      this.loading = true
      const res = await purchase(params).catch(() => {
        this.loading = false
      })
      this.loading = false
      if (res && res.code === 0) {
        const userData = Object.assign({}, this.userInfo)
        userData.coinBalance = userData.coinBalance - this.videoInfo.goldPayUnit
        this.$store.commit('SET_USERINFO', userData)
        this.$emit('onRefresh')
        this.$toast('购买成功')
        this.onClose()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.van-dialog {
  background: url(../../../assets/images/dialog_bg2.png) top / 100% no-repeat
    #fff;
  .van-dialog__content {
    .content {
      text-align: center;
      text-align: center;
      position: relative;
      .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 1;
        font-size: 20px;
        cursor: pointer;
      }
      .fee-gold {
        position: relative;
        padding: 24px;
        .title {
          font-size: 24px;
        }
        .desc {
          font-size: 15px;
          margin: 48px 0 12px;
        }
        .gold {
          span:first-child {
            font-size: 24px;
            color: #109fff;
          }
          span:last-child {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: url(../../../assets/images/gold.png) center / 100%
              no-repeat;
            margin-left: 6px;
          }
        }
        .balance {
          font-size: 15px;
          margin: 12px 0 36px;
        }
        .btn-box {
          text-align: center;
        }
      }
      .fee-vip {
        position: relative;
        padding: 24px;
        .title {
          font-size: 24px;
        }
        .desc {
          font-size: 15px;
          margin: 48px 0 24px;
        }
      }
    }
  }
}
::v-deep .van-button {
  min-width: 120px;
  font-size: 16px;
  height: 42px;
  line-height: 42px;
}
::v-deep .van-button.btn-vip {
  background: #109fff !important;
  border-color: #109fff !important;
  color: #ebebeb !important;
}
::v-deep .van-button.btn-invite {
  background: #109fff !important;
  border-color: #109fff !important;
  color: #ebebeb !important;
}
::v-deep .van-button--plain {
  background: transparent !important;
  color: #109fff !important;
  border-color: #109fff !important;
}
</style>
