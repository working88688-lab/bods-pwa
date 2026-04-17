<template>
  <div class="jump-section">
    <div class="card">
      <div @click="onRoute('/vip')">
        <img src="@/assets/images/vip_card_bg.png" alt="" />
        <div>
          <div>
            <img src="@/assets/images/vip-icon.png" alt="" />
            <span>会员特权</span>
          </div>
          <div>
            {{
              userInfo.vipFlag
                ? '有效期至' + formatDate(userInfo.vipEnd)
                : '尊享VIP特权'
            }}
          </div>
        </div>
        <div class="btn">
          {{ userInfo && userInfo.vipFlag ? '续费' : '立即开通' }}
        </div>
      </div>
      <div @click="onRoute('/recharge')">
        <img src="@/assets/images/gold_card_bg.png" alt="" />
        <div>
          <div>
            <img
              src="@/assets/images/gold-icon.png"
              alt=""
              style="height: 24px"
            />
            <span>我的钱包</span>
          </div>
          <div>余额：{{ userInfo.coinBalance || 0 }}</div>
        </div>
        <div class="btn">立即充值</div>
      </div>
    </div>
    <div class="jump-list">
      <div
        class="jump-item"
        v-for="(jump, idx) in jumpList"
        :key="idx"
        @click="onRoute(jump.path)"
      >
        <img class="icon" :src="jump.icon" />
        <div class="label">{{ jump.label }}</div>
      </div>
    </div>
    <div class="bottom-jump-list">
      <div
        class="bottom-jump-item"
        v-for="(jump, idx) in jumpList2"
        :key="idx"
        @click="onRoute(jump.path)"
      >
        <div>
          <img :src="jump.icon" alt="" />
          <div>{{ jump.label }}</div>
        </div>
        <div>
          <template v-if="!jump.path">
            {{ jump.data }}
          </template>
          <van-icon v-else name="arrow" />
        </div>
      </div>
    </div>
    <VoucherDialog ref="VoucherDialogRef" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import VoucherDialog from './VoucherDialog'

export default {
  name: 'JupmList',
  components: {
        VoucherDialog
    },
  data() {
    return {
      jumpList: [
        // { label: '我的钱包', icon: require('../../assets/images/my_wallet.png'), path: '/wallet' },
        {
          label: '分享',
          icon: require('../../assets/images/promote.svg'),
          path: '/promote',
        },
        {
          label: '收藏',
          icon: require('../../assets/images/my_love.png'),
          path: '/like',
        },
        {
          label: '购买',
          icon: require('../../assets/images/my_buy.png'),
          path: '/buy',
        },
        {
          label: '历史',
          icon: require('../../assets/images/my_history.png'),
          path: '/history',
        },
        {
          label: '应用',
          icon: require('../../assets/images/my_product.png'),
          path: '/product',
        },
      ],
      jumpList2: [
        {
          label: '签到',
          icon: require('../../assets/images/my_check.png'),
          path: '/signin',
        },
        {
          label: '联系客服',
          icon: require('../../assets/images/my_cs.png'),
          path: 'cs',
        },
        {
          label: '身份凭证',
          icon: require('../../assets/images/idcard.svg'),
          path: 'voucher',
        },
        {
          label: '广告商务对接',
          icon: require('../../assets/images/my_contact.png'),
          path: 'telegram',
        },
        {
          label: '版本',
          icon: require('../../assets/images/my_version.png'),
          path: '',
          data: '1.0.12',
        },
        {
          label: '清除缓存',
          icon: require('../../assets/images/my_clear.png'),
          path: '',
          data: '0.0Mb',
        },
      ],
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    wsInfo() {
      return this.$store.state.wsInfo
    },
    isApp() {
      return this.$store.state.isApp
    },
    dataDic() {
      return this.$store.state.dataDic
    },
  },
  created() {},
  mounted() {},
  methods: {
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD')
    },
    onRoute(path) {
      if (!path) {
        return null
      }
      if (path === 'cs') {
        const csUrl =
          this.dataDic.chat_url +
          `/im/index.html?appid=${this.dataDic.chat_appid}&userid=${this.userInfo.shareCode}&url=http%3A%2F%2Flocalhost%3A8035%2Ftestclient.html&skill=${this.dataDic.chat_skill}`
        if (this.wsInfo && csUrl) {
          if (this.isApp) {
            // const jumpData = JSON.stringify({
            //     jumpTo: this.wsInfo.csUrl
            // })
            // const jumpStr = encodeURI(jumpData)
            // this.$router.push({
            //     path: '/iframe',
            //     query: {
            //         jumpStr: jumpStr
            //     }
            // })
            window.open(csUrl, '_blank')
          } else {
            window.open(csUrl, '_blank')
          }
        } else {
          this.$toast('获取客服信息失败')
        }
      } else if (path === 'telegram') {
        if (this.dataDic.telegram) {
          window.open(this.dataDic.telegram, '_blank')
        } else {
          this.$toast('获取商务信息失败')
        }
      } else if (path === 'voucher') {
        this.$refs.VoucherDialogRef.onShow()
      } else if (path === 'chatRoom') {
        if (this.wsInfo && this.wsInfo.roomUrl) {
          if (this.isApp) {
            window.open(this.wsInfo.roomUrl, '_self')
          } else {
            window.open(this.wsInfo.roomUrl, '_blank')
          }
        } else {
          this.$toast('获取官方聊天群失败')
        }
      } else {
        this.$router.push(path)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.jump-section {
  margin: 16px;
  .card {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    & > div {
      width: calc((100% - 10px) / 2);
      position: relative;
      & > img {
        width: 100%;
        vertical-align: middle;
      }
      & > div:first-of-type {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 10px;
        & > div:first-of-type {
          display: flex;
          align-items: center;
          font-size: 16px;
          color: #fff;
          margin-bottom: 10px;
          img {
            height: 15px;
            margin-right: 5px;
          }
        }
        & > div:last-of-type {
          color: #000;
          font-size: 10px;
          line-height: 1.5;
        }
      }
      .btn {
        width: fit-content;
        background: var(--theme-color);
        color: #fff;
        padding: 4px 10px;
        border-radius: 999px;
        position: absolute;
        right: 10px;
        bottom: 10px;
        font-size: 10px;
      }
    }
  }
}
.vip-coin {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > div {
    width: 48%;
  }
}
.vip {
  background: url(../../assets/images/vip_card_bg.png) center / cover no-repeat;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 8px;
  .vip-left {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 12px;
    img {
      height: 20px;
      margin-right: 6px;
    }
  }
  .vip-value {
    margin: 12px 0;
    font-size: 12px;
    color: #fff;
  }
  .vip-right {
    text-align: right;
    .btn {
      display: inline-block;
      padding: 4px 8px;
      text-align: center;
      background: #109fff;
      border-radius: 12px;
      color: #fff;
      font-size: 12px;
    }
  }
}
.jump-list {
  display: flex;
  flex-wrap: wrap;
  border-radius: 4px;
  background: #fff;
  .jump-item {
    width: 20%;
    text-align: center;
    padding: 16px 0;
    cursor: pointer;
    .icon {
      width: 36px;
    }
    .label {
      font-size: 12px;
      margin-top: 6px;
    }
  }
}
.bottom-jump-list {
  margin-top: 16px;
  background: #fff;
  border-radius: 8px;
  .bottom-jump-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    > div:first-child {
      display: inline-flex;
      align-items: center;
      font-weight: bold;
      img {
        width: 24px;
        margin-right: 16px;
      }
    }
    > div:last-child {
      color: #999999;
    }
  }
}
</style>
