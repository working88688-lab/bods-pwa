<template>
  <div class="page-container">
    <Header
      textColor="#222222"
      :arrowBg="true"
      :isBlur="false"
      right="分享"
      rightType="icon"
      :rightIcon="require('@/assets/images/icon_share_v3.png')"
      @onClickLeft="onBack"
      @onClickRight="onShare"
    />
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="empty-box" v-if="!actorInfo">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="120"
            description="暂无数据哦~"
          />
        </div>
        <div
          v-if="actorInfo"
          class="actor-image"
          :style="{
            'background-image':
              'url(' + imageBase + actorInfo.actor.actorPicUrl[0] + ')',
          }"
        >
          <div class="image-info-left">
            <div>
              <span
                >{{
                  formatNum(
                    actorInfo.actor.totalOrderNum + actorInfo.actor.fakeOrderNum
                  ) || 0
                }}人约过</span
              >
            </div>
            <div>
              <span
                >{{
                  formatNum(actorInfo.fakeViewCount + actorInfo.viewCount) || 0
                }}人浏览</span
              >
            </div>
          </div>
          <div class="image-info-right">
            <span
              class="btn-play"
              @click="onRoute('/anchorImages', actorInfo)"
            ></span>
          </div>
          <div
            class="image-info-totle"
            v-if="actorInfo.actor && actorInfo.actor.actorPicUrl"
          >
            1 / {{ actorInfo.actor.actorPicUrl.length }}
          </div>
          <div class="image-info-like" @click="onLike">
            <img
              v-if="!actorInfo.hasFavor"
              src="@/assets/images/icon_like2.png"
            />
            <img v-else src="@/assets/images/icon_like_actived.png" />
            <div>
              {{
                formatNum(actorInfo.fakeFavorCount + actorInfo.favorCount) +
                '人喜欢'
              }}
            </div>
          </div>
        </div>
        <div class="actor-base" v-if="actorInfo">
          <div class="actor-info">
            <div class="actor-avatar">
              <img :src="imageBase + actorInfo.actor.actorCoverImg" />
            </div>
            <div class="actor-data">
              <div class="actor-data-username">
                <div>{{ actorInfo.actor.actorName }}</div>
                <div class="data-top">
                  <div class="free" v-if="actorInfo.payType === 1">限免</div>
                  <div class="gold" v-if="actorInfo.payType === 2">
                    <span>{{ actorInfo.goldPayUnit }}</span>
                    <img src="@/assets/images/gold.png" />
                  </div>
                  <div class="level" v-if="actorInfo.payType === 3">
                    Lv {{ actorInfo.userLevel || 0 }}
                  </div>
                  <div class="vip" v-if="actorInfo.payType === 4">VIP</div>
                </div>
              </div>
              <div class="actor-data-detail">
                <div>
                  {{ actorInfo.actor.actorHeight }}<span class="unit">身高</span
                  ><span>|</span>
                </div>
                <div>
                  {{ actorInfo.actor.actorAge }}<span class="unit">年龄</span
                  ><span>|</span>
                </div>
                <div>{{ actorInfo.actor.cup }}<span>|</span></div>
                <div>
                  {{ actorInfo.actor.actorStyle }}
                </div>
              </div>
            </div>
          </div>
          <div class="actor-contact">
            <template v-if="actorInfo.actor.actorContact">
              <div>{{ actorInfo.actor.actorContact }}</div>
              <div class="text-unlocked">已解锁</div>
            </template>
            <template v-else>
              <div>
                <span v-if="actorInfo.payType === 2">{{
                  actorInfo.goldPayUnit + '金币解锁联系方式'
                }}</span>
                <span v-else-if="actorInfo.payType === 3"
                  >Lv {{ actorInfo.userLevel || 0 }}解锁联系方式</span
                >
                <span v-else-if="actorInfo.payType === 4">VIP解锁联系方式</span>
              </div>
              <div class="btn-unlock" @click="onReserve">立即解锁</div>
            </template>
          </div>
          <div class="service">
            <div class="service-label">项目</div>
            <div class="service-desc">
              <template
                v-if="actorInfo.actor.type && actorInfo.actor.type.project"
              >
                <span
                  class="mr-12"
                  v-for="(pro, idx) in actorInfo.actor.type.project"
                  :key="idx"
                  >{{ pro.name }}</span
                >
              </template>
            </div>
          </div>
          <div class="info-data">
            <div class="info-title">资料</div>
            <div class="info-item">
              <div class="info-label">地区</div>
              <div class="info-value">{{ actorInfo.actor.actorCity }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">服务详情</div>
              <div class="info-value">
                {{ actorInfo.actor.actorServiceDetail }}
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">服务时间</div>
              <div class="info-value">
                {{ actorInfo.actor.actorServiceTime }}
              </div>
            </div>
          </div>
          <div class="banner-wraper">
            <Banner location="Beauty_Details" />
          </div>
        </div>
        <div class="btn-box" v-if="actorInfo">
          <span class="btn btn-commit" @click="onComment">
            评论（{{ formatNum(actorInfo.commentCount) }}）
          </span>
          <span class="btn btn-reserve" @click="onReserve">
            {{ actorInfo.actor.actorContact ? '已解锁' : '立即解锁' }}
          </span>
        </div>
      </template>
    </div>
    <van-dialog
      v-model:show="showDialog"
      class="reserve-dialog"
      :showConfirmButton="false"
      :closeOnClickOverlay="true"
      @close="onClose"
    >
      <div class="dialog-header">
        <van-icon name="cross" @click="onClose" />
      </div>
      <div class="content" v-if="actorInfo">
        <div class="dialog-title">解锁</div>
        <div class="dialog-gold">支付{{ actorInfo.goldPayUnit }}金币解锁</div>
        <div class="dialog-btn-box">
          <van-button
            round
            type="primary"
            :loading="isLoading"
            @click="submitReserve"
            >支付</van-button
          >
        </div>
        <div class="balance" v-if="userInfo">
          <span>金币余额：{{ userInfo.coinBalance }}</span>
          <span @click="onRoute('/recharge')">充值</span>
        </div>
      </div>
    </van-dialog>
    <Comment
      v-if="showComment"
      ref="comment"
      :videoInfo="actorInfo"
      @addComment="handleAddComment"
      @close="handleCloseComment"
    />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getMediaById, favorAdd, appointment, viewAdd } from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'
import Banner from '@/components/Banner'
import { Dialog } from 'vant'
import Comment from '@/components/Comment'
import PubSub from 'pubsub-js'

export default {
  name: 'AnchorLike',
  components: {
    Header,
    Loading,
    Banner,
    Comment,
  },
  data() {
    return {
      isInit: true,
      actorId: '',
      actorInfo: null,
      isLoading: false,
      showDialog: false,
      showComment: false,
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
  created() {
    this.getAnchorDetail()
  },
  activated() {
    if (!this.$route.query.actorId) {
      this.$router.push('/nudeChat')
    } else {
      if (this.$route.query.actorId !== this.actorId) {
        this.isInit = true
        this.actorInfo = null
        this.getAnchorDetail()
      }
    }
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    onRoute(path, anchorInfo) {
      if (anchorInfo) {
        this.$router.push({
          path: path,
          query: {
            actorId: anchorInfo.mediaId,
          },
        })
      } else {
        this.$router.push(path)
      }
    },
    async getAnchorDetail() {
      this.actorId = this.$route.query.actorId
      if (!this.actorId) {
        return this.$router.push('/nudeChat')
      }
      const params = {
        mediaId: this.actorId,
        mediaType: 4,
      }
      const res = await getMediaById(params).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        this.actorInfo = res.data
        this.actorInfo.actor.actorPicUrl = JSON.parse(
          this.actorInfo.actor.actorPicUrl
        )
        this.actorInfo.actor.actorVideoUrl = JSON.parse(
          this.actorInfo.actor.actorVideoUrl
        )
        viewAdd({
          mediaId: this.actorInfo.mediaId,
          mediaType: this.actorInfo.mediaType,
        })
      }
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    formatDurationStr(num) {
      return formatDuration(num)
    },
    async onLike() {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        mediaId: this.actorInfo.mediaId,
        favorType: 1,
      }
      this.isLoading = true
      const res = await favorAdd(params).catch(() => {
        this.isLoading = false
      })
      this.isLoading = false
      if (res && res.code === 0) {
        if (this.actorInfo.hasFavor) {
          this.$set(this.actorInfo, 'favorCount', this.actorInfo.favorCount - 1)
        } else {
          this.$set(this.actorInfo, 'favorCount', this.actorInfo.favorCount + 1)
        }
        this.$set(this.actorInfo, 'hasFavor', !this.actorInfo.hasFavor)
      }
    },
    async onReserve() {
      if (this.actorInfo.actor.actorContact) {
        return null
      }
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      if (
        this.actorInfo.payType === 3 &&
        this.actorInfo.userLevel > this.userInfo.expLevel
      ) {
        return Dialog.confirm({
          title: '提示',
          message: `需要Lv${this.actorInfo.userLevel}才能解锁，是否立即提升等级？`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.$router.push('/vip')
          })
          .catch(() => {})
      }
      if (this.actorInfo.payType === 4 && !this.userInfo.vipFlag) {
        return Dialog.confirm({
          title: '提示',
          message: `VIP用户才能解锁，是否立即开通？`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.$router.push('/vip')
          })
          .catch(() => {})
      }
      if (this.actorInfo.goldPayUnit > this.userInfo.coinBalance) {
        return Dialog.confirm({
          title: '提示',
          message: `金币余额不足，是否立即充值？`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.$router.push('/recharge')
          })
          .catch(() => {})
      }
      if (!this.actorInfo.actor.status) {
        this.showDialog = true
      }
    },
    onClose() {
      this.showDialog = false
    },
    async submitReserve() {
      if (this.actorInfo.goldPayUnit > this.userInfo.coinBalance) {
        return this.$toast('余额不足')
      }
      const params = {
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        actorId: this.actorInfo.actor.actorId,
        agentId: this.actorInfo.actor.agentId,
      }
      this.isLoading = true
      const res = await appointment(params).catch(() => {
        this.isLoading = false
      })
      this.isLoading = false
      if (res && res.code === 0) {
        const targetData = Object.assign({}, this.actorInfo.actor)
        targetData.status = 0
        this.$set(this.actorInfo, 'actor', targetData)
        this.$toast('解锁成功')
        const userData = Object.assign({}, this.userInfo)
        userData.coinBalance = userData.coinBalance - this.actorInfo.goldPayUnit
        this.$store.commit('SET_USERINFO', userData)
        this.onClose()
        this.getAnchorDetail()
      }
    },
    onComment() {
      this.showComment = true
      this.$nextTick(() => {
        this.$refs.comment.onShowComment()
      })
    },
    handleAddComment() {
      this.$set(this.actorInfo, 'commentCount', this.actorInfo.commentCount + 1)
    },
    handleCloseComment() {
      this.showComment = false
    },
    onShare() {},
  },
}
</script>

<style lang="less" scoped>
.page-container {
}
.page-content {
  min-height: 100vh;
  box-sizing: border-box;
  position: relative;
  .actor-image {
    width: 100%;
    height: 375px;
    color: #fff;
    background-size: cover;
    background-position: center 35%;
    background-repeat: no-repeat;
    position: relative;
    z-index: 0;
    .image-info-left {
      position: absolute;
      bottom: 10px;
      left: 10px;
      z-index: 1;
      div {
        margin-top: 14px;
        span {
          padding: 5px 15px;
          font-size: 12px;
          border-radius: 2px;
        }
      }
      > div:first-child span {
        background: #f45296;
      }
      > div:last-child span {
        background: #ad21eb;
      }
    }
    .image-info-right {
      position: absolute;
      bottom: 150px;
      right: calc((100% - 42px) / 2);
      z-index: 1;
      .btn-play {
        display: inline-block;
        width: 42px;
        height: 42px;
        background: url(../../assets/images/player_play.png) center / 100%
          no-repeat;
        cursor: pointer;
      }
    }
    .image-info-totle {
      width: 40px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      position: absolute;
      bottom: 10px;
      right: calc((100% - 40px) / 2);
      z-index: 1;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 10px;
      font-size: 10px;
    }
    .image-info-like {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 1;
      font-size: 10px;
      text-align: center;
      cursor: pointer;
      img {
        width: 40px;
        margin: 0 auto 6px;
      }
    }
  }
  .actor-image::after {
    content: '';
    width: 100%;
    height: 88px;
    background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
    position: absolute;
    left: 0;
    bottom: 0;
  }
  .actor-base {
    width: 100%;
    padding-bottom: 56px;
    .actor-info {
      padding: 12px;
      border-radius: 18px 18px 0 0;
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      .actor-avatar {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        overflow: hidden;
        padding: 3px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-right: 6px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }
      }
      .actor-data {
        flex: 1;
        > div:nth-child(1) {
          font-size: 20px;
          display: flex;
          align-items: center;
          .data-top {
            font-size: 12px;
            overflow: hidden;
            border-radius: 8px;
            margin-left: 8px;
            color: #fff;
            .free {
              padding: 4px 8px;
              background: #30d158;
            }
            .gold {
              padding: 4px 8px;
              color: #222222;
              background: rgb(255 227 0);
              display: inline-flex;
              align-items: center;
              justify-content: center;
              img {
                width: 12px;
                height: 12px;
                margin-left: 4px;
              }
            }
            .level {
              padding: 4px 8px;
              color: #fff;
              background: #ff613d;
            }
            .vip {
              padding: 4px 8px;
              color: #fff;
              background: #109fff;
            }
          }
        }
        .actor-data-detail {
          display: flex;
          align-items: center;
          span {
            margin: 0 8px;
          }
          .unit {
            margin: 0 0 0 4px;
          }
        }
        > div:nth-child(2) {
          font-size: 15px;
          margin: 12px 0 0;
        }
        .actor-price {
          color: #ffe172;
        }
      }
      .actor-btn {
        width: 80px;
      }
    }
    .actor-contact {
      margin: 12px;
      height: 42px;
      background: #fff;
      border-radius: 4px;
      padding: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      .gold {
        color: #109fff;
        margin-right: 4px;
      }
      .btn-unlock {
        padding: 6px 12px;
        background: #109fff;
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
      }
      .text-unlocked {
        color: #999999;
      }
    }
    .service {
      padding: 12px;
      .service-label {
        font-size: 18px;
        margin-bottom: 12px;
      }
      .service-desc {
        font-size: 12px;
        > span {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 8px;
          margin: 0 16px 16px 0;
          background: #fff;
          white-space: nowrap;
        }
      }
    }
    .info-data {
      padding: 12px;
      .info-title {
        font-size: 18px;
        margin-bottom: 12px;
      }
      .info-item {
        display: flex;
        align-items: center;
        margin-top: 16px;
        .info-label {
          color: #999999;
          font-size: 12px;
          width: 32px;
          margin-right: 18px;
        }
        .info-value {
          flex: 1;
          font-size: 14px;
        }
      }
    }
  }
  .banner-wraper {
    padding: 12px;
  }
  .btn-box {
    position: absolute;
    bottom: 0;
    z-index: 99;
    width: 100%;
    padding: 12px 36px;
    display: flex;
    justify-content: space-between;
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 42px;
      line-height: 42px;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
    }
    .btn-commit {
      background: #fff;
      color: #109fff;
    }
    .btn-reserve {
      background: #109fff;
      color: #fff;
    }
  }
}
.reserve-dialog.van-dialog {
  padding: 24px;
  text-align: center;
  .dialog-header {
    .van-icon {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 24px;
    }
  }
  .dialog-title {
    font-size: 20px;
    font-weight: bold;
    color: #222222;
  }
  .dialog-gold {
    font-size: 16px;
    color: #222222;
    margin: 16px 0;
  }
  .van-cell-group {
    background: #fff;
    margin-bottom: 1px;
  }
  .balance {
    text-align: left;
    font-size: 14px;
    margin: 14px 0 0;
    display: flex;
    justify-content: space-between;
    > span:first-child {
      color: #999999;
    }
    > span:last-child {
      color: #794fff;
    }
  }
  .dialog-btn-box {
    .van-button {
      width: 100%;
    }
    ::v-deep .van-button--plain {
      background: transparent !important;
      color: #d92514 !important;
      border-color: #d92514 !important;
    }
  }
}
</style>
