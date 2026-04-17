<template>
  <div class="chat-input-box" :class="{ 'is-horizontal': isHorizontal }">
    <van-cell-group
      class="chat-input"
      :class="{ 'is-horizontal': isHorizontal }"
      :border="false"
    >
      <van-field
        v-model="message"
        placeholder="输入框聊天内容"
        @keyup.enter="onSubmit"
      >
        <template slot="label">
          <span @click="handelTip">打赏</span>
        </template>
        <template slot="extra">
          <div class="sub-btn" @click="onSubmit">发送</div>
        </template>
      </van-field>
    </van-cell-group>
    <van-dialog
      v-model:show="showDialog"
      :class="{ 'is-horizontal': isHorizontal }"
      :showConfirmButton="false"
      :closeOnClickOverlay="false"
    >
      <div class="content" v-if="actorInfo">
        <span class="close-btn" @click="onClose"></span>
        <div class="fee-coin">
          <div class="title">打赏小费</div>
          <van-form class="form-section">
            <van-cell-group inset :border="false">
              <van-field
                v-model="form.amount"
                name="mobile"
                placeholder="请填写打赏金额"
                :border="false"
              />
            </van-cell-group>
          </van-form>
          <div class="btn-box">
            <van-button
              block
              round
              type="primary"
              :loading="loading"
              @click="onBuy"
              >打赏</van-button
            >
          </div>
          <div class="form-bottom">
            <div class="balance" v-if="userInfo">
              余额：{{ userInfo.coinBalance || 0 }}
            </div>
            <div class="recharge" @click="onRoute('/recharge')">去充值</div>
          </div>
        </div>
      </div>
    </van-dialog>
    <TipNotify ref="TipNotifyRef" />
  </div>
</template>

<script>
import { anchorPurchase } from '@/apis/media'
import TipNotify from './TipNotify'
import PubSub from 'pubsub-js'
import { Dialog } from 'vant'

export default {
  name: 'ChatInput',
  components: {
    TipNotify,
  },
  props: {
    isHorizontal: {
      type: Boolean,
      default: false,
    },
    actorInfo: {
      type: Object,
      default: {},
    },
    roomInfo: {
      type: Object,
      default: function () {
        return null
      },
    },
  },
  data() {
    return {
      showDialog: false,
      form: {
        amount: '',
      },
      loading: false,
      notifyList: [],
      message: '',
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  methods: {
    handelTip() {
      this.showDialog = true
    },
    onClose() {
      this.showDialog = false
    },
    onRoute(path) {
      this.onClose()
      this.$router.push(path)
    },
    async onBuy() {
      if (!this.form.amount) {
        return this.$toast('请先填写打赏金额')
      }
      if (!/^[1-9]\d*$/.test(this.form.amount)) {
        return this.$toast('请填写非零的正整数')
      }
      if (this.form.amount > this.userInfo.coinBalance) {
        return this.$toast('余额不足')
      }
      this.loading = true
      const res = await anchorPurchase({
        merchantAcct: this.actorInfo.mediaType,
        mediaId: this.actorInfo.mediaId,
        type: 2,
        amount: this.form.amount,
      }).catch(() => {
        this.loading = false
      })
      this.loading = false
      if (res && res.code === 0) {
        // 扣除金币
        const userData = Object.assign({}, this.userInfo)
        userData.coinBalance = userData.coinBalance - this.form.amount
        this.$store.commit('SET_USERINFO', userData)
        this.$refs.TipNotifyRef.addNotify({
          userInfo: this.userInfo,
          amount: this.form.amount,
        })
        this.form.amount = ''
        this.onClose()
      }
    },
    onSubmit() {
      if (!this.userInfo || !this.userInfo.phoneNumber) {
        return Dialog.confirm({
          title: '提示',
          message: '请先绑定手机号才能发言',
          className: 'confirm-dialog',
        })
          .then(() => {
            this.$router.push('/bindPhone')
          })
          .catch(() => {})
      }
      if (!this.message) {
        return this.$toast('请先输入聊天内容')
      }
      this.sendMessage(2, this.message, 1)
    },
    /**
     * msgType 1:文本,   2:图片,  3:视频,   4:语音,   5:红包,   6:分享
     */
    sendMessage(chatType, content, msgType) {
      let messageData = {
        commandType: 'ROOM_CHAT',
        sentTime: null,
        data: {
          merchantAcct: this.actorInfo.merchantAcct,
          dialogueId: this.roomInfo.dialogueId,
          chatType,
          roomType: this.roomInfo.roomType,
          msgType,
          fromUserId: this.userInfo.userId,
          roomId: this.actorInfo.mediaId,
          refererUserId: null,
          refererMessageId: null,
          mediaType: null,
          mediaId: '',
          content,
        },
      }
      this.$store.ws.send(JSON.stringify(messageData))
      this.message = ''
    },
  },
}
</script>
<style lang="less" scoped>
.chat-input-box {
  width: 100%;
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 1002;
  text-align: center;
}
.chat-input-box.is-horizontal {
  width: 50%;
}
::v-deep .van-cell-group {
  .van-cell {
    background: #1d1d28;
    padding: 6px;
    height: 100%;
    .van-field__label {
      width: 32px;
      margin-right: 6px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #109fff;
    }
    .van-field__value {
      .van-field__body {
        height: 32px;
        background: #292a38;
        padding: 0 8px;
        .van-field__control {
          color: #ebebeb;
        }
      }
    }
    .sub-btn {
      height: 32px;
      line-height: 32px;
      padding: 0 16px;
      font-size: 14px;
      color: #ebebeb;
      background: #109fff;
      border-radius: 4px;
      margin-left: 8px;
    }
  }
}
::v-deep .is-horizontal.van-cell-group {
  .van-cell {
    padding: 3px;
    font-size: 6px;
    height: 20px;
    .van-field__label {
      width: 16px;
      margin-right: 3px;
    }
    .van-field__value {
      .van-field__body {
        height: 12px;
        padding: 0 4px;
        .van-field__control {
          font-size: 6px;
        }
        input::placeholder {
          font-size: 6px;
        }
      }
    }
    .sub-btn {
      height: 12px;
      line-height: 12px;
      padding: 0 4px;
      color: #ebebeb;
      background: #109fff;
      border-radius: 2px;
      margin-left: 4px;
      font-size: 6px;
    }
  }
}
.van-dialog {
  background-color: transparent;
  border-radius: 4px;
  .van-dialog__content {
    .content {
      text-align: center;
      color: #ebebeb;
      text-align: center;
      position: relative;
      background-color: transparent;
      .close-btn {
        position: absolute;
        top: 12px;
        right: 8px;
        z-index: 1;
        width: 24px;
        height: 24px;
        background: url(../../../assets/images/icon_close.png) center / 100%;
        cursor: pointer;
      }
      .fee-coin {
        background: #1d1d28;
        position: relative;
        padding: 36px;
        .title {
          font-size: 24px;
        }
        .form-section {
          margin: 32px 0 16px;
          .van-cell-group {
            background: #000;
            margin: 0;
          }
        }
        .desc {
          font-size: 15px;
          margin: 48px 0 24px;
          .tip {
            margin-top: 6px;
          }
        }
      }
      .fee-coin::after {
        content: '';
        width: 100%;
        height: 100%;
        background: #252633;
        position: absolute;
        left: 0;
        top: 120px;
        z-index: -1;
      }
      .form-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        .balance {
          color: #a3a3a3;
          font-size: 12px;
          margin-top: 12px;
        }
        .recharge {
          font-size: 14px;
          color: #85b8ee;
          cursor: pointer;
        }
      }
    }
  }
}
::v-deep .van-dialog.is-horizontal {
  width: 160px;
  .van-dialog__content {
    .content {
      .close-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 1;
        width: 10px;
        height: 10px;
        background: url(../../../assets/images/icon_close.png) center / 100%;
        cursor: pointer;
      }
      .fee-coin {
        background: #1d1d28;
        position: relative;
        padding: 6px;
        .title {
          font-size: 6px;
        }
        .form-section {
          margin: 6px 0 4px;
          .van-cell-group {
            background: #000;
            margin: 0;
            .van-cell {
              padding: 3px;
              font-size: 6px;
              height: 24px;
              .van-field__label {
                width: 16px;
                margin-right: 3px;
              }
              .van-field__value {
                .van-field__body {
                  height: 16px;
                  padding: 0 4px;
                  .van-field__control {
                    font-size: 6px;
                  }
                  input::placeholder {
                    font-size: 6px;
                  }
                }
              }
            }
          }
        }
        .desc {
          font-size: 6px;
          margin: 12px 0 6px;
          .tip {
            margin-top: 1.5px;
          }
        }
      }
      .fee-coin::after {
        content: '';
        width: 100%;
        height: 100%;
        background: #252633;
        position: absolute;
        left: 0;
        top: 120px;
        z-index: -1;
      }
      .form-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 3px;
        .balance {
          color: #a3a3a3;
          font-size: 4px;
          margin-top: 4px;
        }
        .recharge {
          font-size: 4px;
          color: #85b8ee;
          cursor: pointer;
        }
      }
    }
  }
}
::v-deep .van-button {
  border-radius: 24px;
  min-width: 160px;
}
::v-deep .is-horizontal .van-button {
  border-radius: 24px;
  height: 20px;
  font-size: 6px;
  min-width: 0;
}
</style>
