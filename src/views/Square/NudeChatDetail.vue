<template>
  <div class="page-container flex-container">
    <div class="page-top">
      <Header
        textColor="#222222"
        :arrowBg="true"
        :isBlur="false"
        @onClickLeft="onBack"
      />
    </div>
    <Loading v-if="isInit" />
    <template v-else>
      <div class="page-content">
        <div class="empty-box" v-if="!actorInfo">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="120"
            description="暂无数据哦~"
          />
        </div>
        <template v-else>
          <div class="actor-image">
            <van-swipe @change="onSwipeChange">
              <van-swipe-item
                v-for="(item, idx) in swiperDataList"
                :key="idx"
                @click="onPlay(item, idx)"
              >
                <img :src="imageBase + item.imgUrl" />
                <img
                  v-if="item.type === 'video'"
                  class="start"
                  src="@/assets/images/player_play.png"
                />
              </van-swipe-item>
              <template #indicator>
                <div class="custom-indicator">
                  {{ swipeIndex + 1 }}/{{ swiperDataList.length }}
                </div>
              </template>
            </van-swipe>
            <div class="image-info-left">
              <div>
                <span
                  >{{
                    formatNum(
                      actorInfo.actor.totalOrderNum +
                        actorInfo.actor.fakeOrderNum
                    ) || 0
                  }}人约过</span
                >
              </div>
              <div>
                <span
                  >{{
                    formatNum(actorInfo.fakeViewCount + actorInfo.viewCount) ||
                    0 | rounding
                  }}人浏览</span
                >
              </div>
            </div>
            <div class="actor-image-bottom">
              <div class="image-info-right" @click="onLike">
                <img
                  v-if="actorInfo.hasFavor"
                  src="@/assets/images/icon_like_actived.png"
                />
                <img v-else src="@/assets/images/icon_like2.png" />
                <!-- <div>{{ formatNum(actorInfo.fakeFavorCount + actorInfo.favorCount) || 0 }}人喜欢</div> -->
              </div>
            </div>
          </div>
          <div class="actor-base">
            <div class="actor-info">
              <div class="pay-price">¥{{ actorInfo.actor.startPayPrice }}</div>
              <div class="flex p-info">
                <div class="actor-data-username">
                  <div>{{ actorInfo.actor.actorName }}</div>
                </div>
                <div class="actor-info-bottom">
                  <!-- <span> {{ actorInfo.actor.actorCity }} </span> -->
                  <span>{{ actorInfo.actor.actorHeight }}身高</span>
                  <span> {{ actorInfo.actor.actorAge }}年龄</span>
                  <span>{{ actorInfo.actor.cup }}</span>
                </div>
              </div>
            </div>
            <!-- <div class="tip">
                            <div>官方提示</div>
                            <div>约炮消费。谨记“先服务后给钱”的原则，先给钱被骗，平台不承担任何责任。</div>
                        </div> -->
            <!-- <div class="banner-wraper">
                            <Banner location="Beauty_Details" />
                        </div> -->
            <div class="actor-contact">
              <template v-if="actorInfo.actor.actorContact">
                <div class="contact">{{ actorInfo.actor.actorContact }}</div>
                <!-- <div class="text-unlocked">已解锁</div> -->
              </template>
              <template v-else>
                <div class="contact" @click="onReserve">
                  <div v-if="actorInfo.payType === 2">
                    <span class="gold">{{ actorInfo.goldPayUnit }}</span>
                    金币解锁联系方式
                  </div>
                  <div v-else-if="actorInfo.payType === 3">
                    <span class="gold">Lv {{ actorInfo.userLevel || 0 }}</span>
                    解锁联系方式
                  </div>
                  <div v-else-if="actorInfo.payType === 4">
                    <span class="gold">VIP</span>
                    解锁联系方式
                  </div>
                </div>
                <!-- <div class="btn-unlock" @click="onReserve">立即解锁</div> -->
              </template>
            </div>
            <div class="info-data">
              <div class="info-title">服务项目</div>
              <div class="service-desc">
                <span
                  class="mr-12"
                  v-for="(pro, idx) in actorInfo.actor.type.project"
                  :key="idx"
                  >{{ pro.name }}</span
                >
              </div>
            </div>
            <div class="info-data">
              <div class="info-title">TA的资料</div>
              <div class="">
                所在地区：<span> {{ actorInfo.actor.actorCity }} </span>
              </div>
              <div class="desc">
                服务时间：{{ actorInfo.actor.actorServiceTime }}
              </div>
              <div class="desc">
                简介：{{ actorInfo.actor.actorServiceDetail }}
              </div>
            </div>
            <div class="info-data"></div>
            <CommentList
              ref="CommentListRef"
              :videoInfo="actorInfo"
              @onReply="onReply"
            />
            <div class="content-bottom">
              <van-cell-group :border="false">
                <van-field
                  ref="contInput"
                  v-model="commentFormData.content"
                  name="comment"
                  :placeholder="placeholderText"
                  @blur="onBlur"
                >
                  <template slot="extra">
                    <van-button
                      type="primary"
                      class="comment-btn"
                      size="small"
                      :loading="isLoading"
                      @click="onSubmit"
                      >评论</van-button
                    >
                  </template>
                </van-field>
              </van-cell-group>
              <div class="content-bottom-right">
                <div @click="onLike">
                  <img
                    v-if="actorInfo.hasFavor"
                    src="@/assets/images/ic_dynamic_liked.svg"
                  />
                  <img v-else src="@/assets/images/ic_dynamic_like.svg" />
                  <span>{{
                    this.formatNum(
                      this.actorInfo.fakeFavorCount + this.actorInfo.favorCount
                    ) || 0 | rounding
                  }}</span>
                </div>
                <div class="share" @click="onShare">
                  <img src="@/assets/images/icon_share.png" />
                  <span>分享</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- <div class="page-bottom">
                <van-button round block type="primary" @click="onComment">评论</van-button>
            </div> -->
    </template>
    <van-dialog
      v-model:show="showDialog"
      class="reserve-dialog"
      :showConfirmButton="false"
      :closeOnClickOverlay="true"
      @close="onClose"
    >
      <div class="content">
        <div class="dialog-title">提交联系方式</div>
        <van-form>
          <van-cell-group :border="false">
            <van-field
              v-model="formData.userContact"
              name="userContact"
              placeholder="请填写联系方式"
            />
          </van-cell-group>
        </van-form>
        <div class="tips">
          我们将在
          <span>13: 00-03: 00</span>
          时间内为您服务，请您稍后留意好友申请!
        </div>
        <div class="dialog-btn-box">
          <van-button round plain type="primary" @click="onClose"
            >取消</van-button
          >
          <van-button
            round
            type="primary"
            :loading="isLoading"
            @click="submitReserve"
            >提交</van-button
          >
        </div>
      </div>
    </van-dialog>
    <CommentPopup ref="CommentRef" :videoInfo="actorInfo" />
    <FullScreenPlayerDialog
      v-if="showPlayerDialog"
      :id="videoCode"
      :videoUrl="videoUrl"
      @closePlay="handleClosePlay"
    />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import FullScreenPlayerDialog from '@/components/FullScreenPlayerDialog'
import {
  getMediaById,
  favorAdd,
  appointmentSever,
  viewAdd,
  appointment,
  commentAdd,
} from '@/apis/media'
import { formatStrNum, formatDuration, randomString } from '@/utils/tools'
import _ from 'lodash'
import Banner from '@/components/Banner'
import { Dialog, ImagePreview } from 'vant'
import CommentPopup from './components/CommentPopup.vue'
import CommentList from './components/CommentList'

export default {
  name: 'NudeChatDetail',
  components: {
    Header,
    Loading,
    Banner,
    CommentPopup,
    CommentList,
    FullScreenPlayerDialog,
  },
  data() {
    return {
      isInit: true,
      mediaType: 4,
      actorId: '',
      actorInfo: null,
      isLoading: false,
      showDialog: false,
      commentFormData: {
        content: '',
        parentId: '',
        rootCommentId: '',
      },
      formData: {
        userContact: '',
        goldPayUnit: '',
      },
      isReserve: false,
      currentCode: null,
      info: null,
      showChildComment: null,
      rowData: {},
      placeholderText: '输入评论',
      swiperDataList: [],
      showPlayerDialog: false,
      videoCode: null,
      videoUrl: null,
      swipeIndex: 0,
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
  filters: {
    // 保留一位小数并四舍五入
    rounding(val) {
      if (!val) return 0
      return val > 1000 ? (val / 1000).toFixed(1) + 'k' : val
    },
  },
  async created() {},
  activated() {
    const { actorId, mediaType } = this.$route.query
    if (!actorId) {
      this.$router.push('/')
    } else {
      if (actorId !== this.actorId) {
        this.actorId = actorId
        this.mediaType = mediaType ? mediaType * 1 : 4
        this.isInit = true
        this.actorInfo = null
        this.swiperDataList = []
        this.swipeIndex = 0
        this.getAnchorDetail()
      }
    }
  },
  methods: {
    async onSubmit() {
      if (!this.commentFormData.content) {
        return this.$toast('请先填写评论内容')
      }
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const { content } = this.commentFormData
      const params = {
        content,
        mediaId: this.actorInfo.mediaId,
        commentType: this.actorInfo.mediaType,
        parentId: this.rowData?.parentId || '',
        rootCommentId: this.rowData?.rootCommentId || '',
      }
      console.log(this.rowData, params)
      this.isLoading = true
      const res = await commentAdd(params).catch(() => {
        this.isLoading = false
      })
      this.isLoading = false
      if (res && res.code === 0) {
        this.commentFormData.content = ''
        this.$toast('评论成功，请等待审核通过')
      }
    },
    async onShare() {
      this.$router.push('/promote')
    },
    onBlur() {
      if (this.rowData) {
        this.commentFormData.parentId = this.rowData.commentId
        this.commentFormData.rootCommentId = this.rowData.rootCommentId
      } else {
        this.commentFormData.parentId = ''
        this.commentFormData.rootCommentId = ''
      }
      this.rowData = null
      this.placeholderText = '请输入内容'
    },
    async onReserve() {
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
      if (this.freeTimes) {
        return Dialog.confirm({
          title: '提示',
          message: `您有${this.freeTimes}次免费解锁次数，是否确认解锁？`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.submitReserve()
          })
          .catch(() => {})
      } else {
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
      }
    },
    onSwipeChange(index) {
      this.swipeIndex = index
    },
    onPlay(item, i) {
      if (item.type === 'video') {
        this.videoUrl = this.imageBase + item.videoUrl
        this.videoCode = randomString(24)
        this.showPlayerDialog = true
      } else {
        ImagePreview({
          images: this.swiperDataList.map(item => this.imageBase + item.imgUrl),
          startPosition: i,
        })
      }
    },
    handleClosePlay() {
      this.showPlayerDialog = false
      this.videoUrl = null
      this.videoCode = null
    },
    handleChildComment(data) {
      this.showChildComment = data
    },
    onReply(data) {
      this.rowData = data
      this.placeholderText = '@' + data.userInfoPo.nickName
      this.onComment()
    },
    onComment() {
      this.$refs.CommentRef.onShowComment({
        rowData: this.rowData,
        placeholder: this.placeholderText,
      })
    },
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
      if (!this.actorId) {
        return this.$router.push('/')
      }
      const params = {
        mediaId: this.actorId,
        mediaType: this.mediaType,
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
        // 将封面也加入轮播图中
        this.swiperDataList.push({
          type: 'image',
          imgUrl: this.actorInfo.actor.actorCoverImg,
        })
        // 将图片加入轮播图中
        this.actorInfo.actor.actorPicUrl.forEach(one => {
          this.swiperDataList.push({
            type: 'image',
            imgUrl: one,
          })
        })
        // 将视频加入轮播图中
        this.actorInfo.actor.actorVideoUrl.forEach(one => {
          this.swiperDataList.push({
            type: 'video',
            videoUrl: one,
            imgUrl: this.actorInfo.actor.actorCoverImg,
          })
        })
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
    // async onReserve(e) {
    //     if (!this.userInfo) {
    //         await this.$store.dispatch('macLogin')
    //     }
    //     if (this.actorInfo.payType === 3 && this.actorInfo.userLevel > this.userInfo.expLevel) {
    //         return Dialog.confirm({
    //                 title: '提示',
    //                 message: `需要Lv${this.actorInfo.userLevel}才能解锁，是否立即提升等级？`,
    //                 className: 'confirm-dialog'
    //             }).then(async () => {
    //                 this.$router.push('/vip')
    //             }).catch(() => {})
    //     }
    //     if (this.actorInfo.payType === 4 && !this.userInfo.vipFlag) {
    //         return Dialog.confirm({
    //             title: '提示',
    //             message: `VIP用户才能解锁，是否立即开通？`,
    //             className: 'confirm-dialog'
    //         }).then(async () => {
    //             this.$router.push('/vip')
    //         }).catch(() => {})
    //     }
    //     if (!this.actorInfo.actor.status) {
    //         this.formData.goldPayUnit = this.actorInfo.goldPayUnit
    //         this.showDialog = true
    //     }
    // },
    async onBuy(e) {
      this.currentCode = e.code
      this.formData.goldPayUnit = e.code.goldPayUnit - 0
      this.showDialog = true
    },
    onClose() {
      this.showDialog = false
      this.formData = {
        userContact: '',
        goldPayUnit: '',
      }
    },
    async submitReserve() {
      if (this.isReserve) {
        return null
      }
      if (!this.formData.userContact) {
        return this.$toast('请先填写联系方式')
      } else {
        if (
          this.formData.goldPayUnit > this.userInfo.coinBalance ||
          this.userInfo.coinBalance === 0
        ) {
          return this.$toast('余额不足')
        }
        let params
        let res
        this.isReserve = true
        if (this.mediaType === 4) {
          params = {
            merchantAcct: process.env.VUE_APP_MERCHANTACCT,
            actorId: this.actorInfo.actor.actorId,
            agentId: this.actorInfo.actor.agentId,
            userContact: this.formData.userContact,
          }
          res = await appointment(params).catch(() => {
            this.isReserve = false
          })
        } else if (this.mediaType === 18) {
          params = {
            merchantAcct: process.env.VUE_APP_MERCHANTACCT,
            actorId: this.actorInfo.actor.actorId,
            typeCode: this.currentCode,
            userContact: this.formData.userContact,
          }
          res = await appointmentSever(params).catch(() => {
            this.isReserve = false
          })
        }
        this.isReserve = false
        if (res && res.code === 0) {
          const targetData = Object.assign({}, this.actorInfo.actor)
          targetData.status = 0
          this.$set(this.actorInfo, 'actor', targetData)
          this.$toast('提交成功')
          const userData = Object.assign({}, this.userInfo)
          userData.coinBalance =
            userData.coinBalance - this.formData.goldPayUnit
          this.$store.commit('SET_USERINFO', userData)
          this.onClose()
          if (this.mediaType === 4) {
            this.getAnchorDetail()
          }
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.content-bottom {
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 1111;
  background: #fff;
  padding: 8px 16px;
  padding-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  > div {
    display: inline-flex;
    align-items: center;
  }
  .van-cell-group {
    flex: 1;
  }
  img {
    width: 24px;
    margin-right: 4px;
  }
  .content-bottom-right {
    color: #8e9199;
    > div {
      margin-left: 16px;
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      img {
        width: 24px;
        margin-right: 4px;
      }
    }
    > div:first-child {
      margin-left: 0;
    }
  }
  .content-fee {
    > span {
      display: inline-block;
      padding: 6px 12px;
      font-size: 12px;
      color: #fff;
      border-radius: 16px;
    }
    .free {
      background: #30d158;
    }
    .gold {
      background: #ff3271;
    }
    .level {
      background: #1fb774;
    }
    .vip {
      background: linear-gradient(to bottom, #f72da0, #fa2445);
    }
  }
}
::v-deep.van-cell-group {
  background: #f1f1f1;
  margin-right: 24px;
  border-radius: 16px;
  .van-cell {
    padding: 0;
    .van-cell__value {
      .van-field__body {
        input {
          padding: 4px;
          color: #000;
          padding-left: 12px;
          height: 36px;
        }
      }
    }
    .van-button {
      font-size: 12px;
      height: 36px;
    }
  }
}
.empty-box {
  height: calc(100% - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-top {
  position: absolute;
  top: calc(var(--safe-area-top));
  z-index: 999;
}

.page-content {
  flex: 1;
  overflow: auto;
  color: #fff;
  position: relative;
  .contact {
    width: 100%;
    height: 60px;
    border-radius: 5px;
    color: #fff;
    display: flex;
    align-items: center;
    padding-left: 40px;
    background: #109fff url('../../assets/images/icon_lock.png') no-repeat;
    background-position: 10px center;
    background-size: 16px;
    font-size: 14px;
  }
  .pay-price {
    color: #ff4539;
    font-weight: 600;
    font-size: 18px;
  }
  .p-info {
    margin: 20px 0;
  }
  .actor-image {
    width: 100%;
    height: 375px;
    position: relative;
    .van-swipe {
      width: 100%;
      height: 100%;
      position: relative;
      .van-swipe-item {
        width: 100%;
        height: 100%;
        position: relative;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .start {
          width: 48px;
          height: 48px;
          position: absolute;
          top: calc((100% - 48px) / 2);
          left: calc((100% - 48px) / 2);
        }
      }
      .custom-indicator {
        position: absolute;
        left: 20px;
        width: 50px;
        bottom: 20px;
        text-align: center;
        background: rgba(0, 0, 0, 0.46);
        color: #fff;
        padding: 3px 0;
        border-radius: 12px;
        font-size: 12px;
      }
    }
    .image-info-left {
      position: absolute;
      top: 10px;
      right: 0;
      > div {
        margin-top: 6px;
        text-align: left;
        font-size: 12px;
        width: 90px;
        background: rgba(0, 0, 0, 0.46);
        padding: 5px 0px;
        text-align: center;
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
      }
      > div:first-child {
        margin-top: 0;
      }
    }
    .actor-image-bottom {
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      font-size: 12px;

      .image-info-right {
        text-align: center;
        img {
          width: 36px;
        }
      }
    }
  }
  .actor-base {
    width: 100%;
    background: #fff;
    color: #000;
    padding: 16px;
    padding-bottom: 76px;

    .actor-info {
      .actor-data-username {
        font-size: 18px;
        padding-right: 10px;
      }
      .actor-info-bottom {
        span {
          display: inline-block;
          padding: 0px 10px;
          font-size: 13px;
          & + span {
            border-left: 1px solid #8e9199;
          }
        }
        > span:first-child {
          margin-left: 0;
        }
        span:nth-child(1) {
          // background: rgb(197 255 248);
        }
        span:nth-child(2) {
          // background: rgb(197 203 255);
        }
        span:nth-child(3) {
          // background: rgb( 255 227 154);
        }
        span:nth-child(4) {
          // background: rgb( 255 227 154);
        }
      }

      .actor-btn {
        width: 80px;
      }
    }

    .tip {
      background: rgb(246 243 255);
      padding: 8px 16px;
      display: flex;
      align-items: center;
      border-radius: 6px;
      > div:first-child {
        width: 48px;
        background-image: linear-gradient(
          to right,
          rgb(250 184 86),
          rgb(255 72 237)
        );
        -webkit-background-clip: text;
        color: transparent;
        font-size: 18px;
        font-weight: bold;
      }
      > div:last-child {
        flex: 1;
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .info-data {
      margin: 16px 0;
      font-size: 14px;
      color: #8e9199;

      .info-title {
        font-size: 14px;
        margin-bottom: 12px;
        color: #8e9199;
      }

      .actor-type {
        display: inline-block;
        padding: 6px 8px;
        font-size: 12px;
        border-radius: 16px;
        background: #333;
      }

      .contact {
        background: #333;
        padding: 12px 16px;
        font-size: 12px;
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .van-button {
          height: 24px;
          font-size: 12px;
        }
      }

      .desc {
        color: rgb(142 145 153);
        font-size: 14px;
        margin-top: 6px;
      }

      .service-desc {
        > span {
          display: inline-block;
          padding: 6px 8px;
          border-radius: 16px;
          margin: 0 10px 10px 0;
          background: #109fff;
          color: #fff;
          white-space: nowrap;
          font-size: 12px;
        }

        .service-item {
          width: 100%;
          display: flex;
          align-items: flex-start;
          height: 38px;
          margin-bottom: 10px;
          font-size: 12px;

          & > div {
            border: 1px solid rgb(112 112 112);
            flex: 1;
            border-radius: 6px;
            height: 100%;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 14px;

            .service-name {
              color: #000;
            }

            .service-price {
              color: #109fff;
            }
          }

          & > button {
            width: 86px;
            height: 38px;
            border-radius: 16px;
          }
        }
      }
    }
  }

  .banner-wraper {
    margin: 16px 0;
  }
}

.page-bottom {
  text-align: center;
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  margin: auto;
  padding: 0 100px;
}

.reserve-dialog.van-dialog {
  padding: 0px 24px 24px;
  text-align: center;
  background: #fff;

  .dialog-title {
    font-size: 16px;
    margin: 24px 0 36px;
  }

  .tips {
    font-size: 14px;
    line-height: 20px;
    margin: 11px 0 15px;
    text-align: left;

    span {
      color: #109fff;
    }
  }

  .dialog-desc {
    font-size: 14px;
    color: #109fff;
    margin: 14px 0;
  }

  .van-cell-group {
    .field-label {
      color: #fff;
      font-size: 14px;
      margin-bottom: 12px;
    }
    ::v-deep .van-cell {
      overflow: hidden;
      background: #f6f6f6;
      border-radius: 24px;
      margin-bottom: 12px;
      .van-field__control {
        height: 24px;
        line-height: 24px;
        font-size: 14px;
        color: #000;
      }
    }
  }

  .balance {
    text-align: left;
    font-size: 14px;
    color: #109fff;
    margin: 14px 0;
    display: flex;
    justify-content: space-between;
  }

  .dialog-btn-box {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;

    .van-button {
      min-width: 120px;
      height: 40px;
    }

    ::v-deep .van-button--plain {
      background: transparent !important;
      color: #109fff !important;
      border-color: #109fff !important;
    }
  }
}
</style>
