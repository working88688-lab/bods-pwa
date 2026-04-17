<template>
  <div
    class="dynamic-box"
    v-if="dynamic"
    @click="toPlay(dynamic)"
  >
    <div
      class="user-box"
      v-if="dynamic.userInfoPo"
    >
      <div
        class="avatar"
        @click="toHomePage(dynamic.userInfoPo, $event)"
      >
        <img v-lazy="imageBase + dynamic.userInfoPo.headUrl" />
        <img
          v-if="dynamic.userInfoPo.vipFlag"
          class="vip-flag"
          src="@/assets/images/vip_actived.png"
          alt=""
        />
        <img
          v-else
          class="vip-flag"
          src="@/assets/images/vip_inactivated.png"
          alt=""
        />
      </div>
      <div
        class="user-info"
        @click="toHomePage(dynamic.userInfoPo, $event)"
      >
        <div>
          <div class="info-top">
            <div class="nick">{{ dynamic.userInfoPo.nickName }}</div>
            <span class="level">Lv{{ dynamic.userInfoPo.expLevel }}</span>
          </div>
          <div
            class="flow-box"
            v-if="showFlow"
          >
            <span
              v-if="dynamic.hasFollow"
              class="btn-flowed"
              @click="onFollow(dynamic, $event)"
              >已关注</span
            >
            <span
              v-else-if="!dynamic.hasFollow"
              class="btn-flow"
              @click="onFollow(dynamic, $event)"
              >关注</span
            >
          </div>
          <div
            class="delete-box"
            v-if="showDelete"
          >
            <span
              class="btn-delete"
              @click="onDelete(dynamic, $event)"
              >删除</span
            >
          </div>
        </div>
        <div class="time">
          <span>发帖时间：{{ moment(dynamic.publishTime).format('YYYY-MM-DD') }}</span>
        </div>
      </div>
    </div>
    <div
      class="content"
      v-if="dynamic.article"
    >
      <div class="desc">{{ dynamic.article.articleTitle }}</div>
      <div class="desc">{{ dynamic.article.articleDescription }}</div>
      <div
        class="pictures"
        v-if="dynamic.article.picUrl && dynamic.article.picUrl.length"
      >
        <template v-if="isDetail">
          <div
            class="img-box"
            :class="{ preview: dynamic.preview }"
            v-for="(pic, idx) in dynamic.article.picUrl"
            :key="idx"
            @click="handleImagePreview($event, idx)"
          >
            <img v-lazy="imageBase + pic" />
          </div>
        </template>
        <template v-else>
          <div
            class="img-box"
            :class="{ preview: dynamic.preview }"
            v-for="(pic, idx) in dynamic.article.picUrl"
            :key="idx"
            @click="handleImagePreview($event, idx)"
          >
            <img v-lazy="imageBase + pic" />
          </div>
        </template>
      </div>
      <div
        class="video-box"
        v-if="dynamic.article.videoUrl && dynamic.article.videoUrl.length"
      >
        <div
          class="video-preview"
          v-for="(videoData, idx) in dynamic.article.videoUrl"
          :key="idx"
        >
          <img v-lazy="imageBase + dynamic.article.articleCoverImg" />
          <img
            class="start-img"
            src="@/assets/images/player_play.png"
          />
        </div>
      </div>
    </div>
    <div class="label-fee">
      <div
        class="label-list"
        v-if="dynamic.tagList && dynamic.tagList.length"
      >
        <span
          class="label-item"
          v-for="(label, idx) in dynamic.tagList"
          :key="idx"
          @click="onSearch(label, $event)"
          >#{{ label.tagName }}</span
        >
      </div>
      <div class="fee">
        <!-- <span
          class="free"
          v-if="dynamic.payType === 1"
          >限免</span
        > -->
        <span
          class="gold"
          v-if="dynamic.payType === 2"
        >
          <span>{{ dynamic.goldPayUnit }}金币解锁</span>
        </span>
        <span
          class="level"
          v-if="dynamic.payType === 3"
          >Lv {{ dynamic.userLevel || 0 }}解锁</span
        >
        <span
          class="vip"
          v-if="dynamic.payType === 4"
          >VIP解锁</span
        >
      </div>
    </div>
    <div
      class="content-bottom"
      v-if="showContentBottom"
    >
      <div
        class="comment-like"
        v-if="showCommentLike"
      >
        <span
          class="like"
          @click="onLike(dynamic, $event)"
        >
          <img
            v-if="dynamic.hasFavor"
            src="@/assets/images/square_like_true.png"
          />
          <img
            v-else
            src="@/assets/images/square_like_false.png"
          />
          <span>{{ formatNum(dynamic.fakeFavorCount + dynamic.favorCount) || 0 }}</span>
        </span>
        <span>
          <img src="@/assets/images/icon-view.png" />
          <span>{{ formatNum(dynamic.fakeViewCount + dynamic.viewCount) || 0 }}</span>
        </span>
        <span
          class="comment"
          @click="onComment($event)"
        >
          <img src="@/assets/images/icon_comment_v3.png" />
          <span>{{ formatNum(dynamic.commentCount) || 0 }}</span>
        </span>
        <span
          v-if="showShare"
          class="share"
          @click="onShare($event)"
        >
          <img src="@/assets/images/icon-share.png" />
          <span>分享</span>
        </span>
      </div>
    </div>
    <van-divider
      v-if="showDivider"
      :style="{ borderColor: '#0000001a' }"
    />
    <van-dialog
      v-model:show="showShareDialog"
      :showConfirmButton="false"
      :closeOnClickOverlay="true"
      @close="onCloseDaolig"
    >
      <div class="dialog-content">
        <div
          class="content"
          ref="capture"
        >
          <div class="share-img">
            <img
              :src="imageBase + dynamic.article.articleCoverImg + '?' + new Date().getTime()"
              crossOrigin="anonymous"
            />
          </div>
          <div class="share-info">
            <div class="share-info-tag">
              <span v-for="(tag, idx) in dynamic.tagList">{{ tag.tagName }}</span>
            </div>
            <div class="share-info-desc">{{ dynamic.article.content }}</div>
          </div>
          <div class="share-bottom">
            <div class="logo">
              <img src="@/assets/logo.png" />
              <div>{{ domain }}</div>
            </div>
            <div
              ref="qrCodeUrl"
              class="qr-code"
            ></div>
          </div>
        </div>
        <div class="btn-box">
          <van-button
            round
            type="primary"
            @click="onSave"
            >保存图片</van-button
          >
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script>
  import { formatStrNum } from '@/utils/tools'
  import { follow, centerUserInfo } from '@/apis/user'
  import { Dialog } from 'vant'
  import { favorAdd, delContribution, purchase, getMediaById } from '@/apis/media'
  import { ImagePreview } from 'vant'
  import _ from 'lodash'
  import QRCode from 'qrcodejs2'
  import html2canvas from 'html2canvas'
  import moment from 'moment'

  export default {
    name: 'Dynamic',
    components: {},
    props: {
      type: {
        type: String,
        default: '',
      },
      dynamic: {
        type: Object,
        default: {
          userInfoPo: {},
          hasFollow: false,
          article: {},
        },
      },
      showDivider: {
        type: Boolean,
        default: false,
      },
      showCommentLike: {
        type: Boolean,
        default: true,
      },
      showFlow: {
        type: Boolean,
        default: true,
      },
      showDelete: {
        type: Boolean,
        default: false,
      },
      isDetail: {
        type: Boolean,
        default: false,
      },
      showContentBottom: {
        type: Boolean,
        default: true,
      },
      showShare: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        coinNum: null,
        loading: false,
        showShareDialog: false,
        domain: '',
        downloadLink: '',
        qrcode: null,
        moment
      }
    },
    computed: {
      userInfo() {
        return this.$store.state.userInfo
      },
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
      dataDic() {
        return this.$store.state.dataDic
      },
    },
    created() {
      this.domain = this.dataDic.domain || 'tjs006.com'
    },
    mounted() {},
    methods: {
      toHomePage(user, event) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        this.$router.push({
          path: '/homepage',
          query: {
            userId: user.userId,
          },
        })
      },
      async toPlay(dynamic) {
        if (!this.userInfo) {
          await this.$store.dispatch('macLogin')
        }
        if (dynamic.preview) {
          if (dynamic.payType === 2) {
            if (this.userInfo.coinBalance < dynamic.goldPayUnit) {
              return Dialog.confirm({
                title: '提示',
                message: `充值金币解锁完整内容`,
                className: 'confirm-dialog',
              })
                .then(async () => {
                  this.$router.push('/recharge')
                })
                .catch(() => {})
            } else {
              return Dialog.confirm({
                title: '提示',
                message: `是否花费${dynamic.goldPayUnit}金币购买完整内容？`,
                className: 'confirm-dialog',
              })
                .then(async () => {
                  const params = {
                    mediaId: dynamic.mediaId,
                    mediaType: dynamic.mediaType,
                  }
                  const res = await purchase(params)
                  if (res && res.code === 0) {
                    const userData = Object.assign({}, this.userInfo)
                    userData.coinBalance = userData.coinBalance - dynamic.goldPayUnit
                    this.$store.commit('SET_USERINFO', userData)
                    let targetData = Object.assign({}, dynamic)
                    targetData.preview = false
                    this.$emit('changeData', { data: targetData, action: 'buy' })
                    this.handleSuccess(dynamic)
                  }
                })
                .catch(() => {})
            }
          } else if (dynamic.payType === 3) {
            return Dialog.confirm({
              title: '提示',
              message: `提升等级解锁完整内容`,
              className: 'confirm-dialog',
            })
              .then(async () => {
                this.$router.push('/vip')
              })
              .catch(() => {})
          } else if (dynamic.payType === 4) {
            return Dialog.confirm({
              title: '提示',
              message: `开通VIP解锁完整视频`,
              className: 'confirm-dialog',
            })
              .then(async () => {
                this.$router.push('/vip')
              })
              .catch(() => {})
          }
        } else {
          this.$router.push({
            path: '/squareDetail',
            query: {
              mediaId: this.dynamic.mediaId,
            },
          })
        }
      },
      async handleSuccess(data) {
        this.$toast('购买成功')
        this.$router.push({
          path: '/squareDetail',
          query: {
            mediaId: data.mediaId,
          },
        })
      },
      formatNum(num) {
        return formatStrNum(num)
      },
      async onLike(dynamic, event) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        if (!this.userInfo) {
          await this.$store.dispatch('macLogin')
        }
        const params = {
          mediaId: dynamic.mediaId,
          favorType: 3,
        }
        const res = await favorAdd(params)
        if (res && res.code === 0) {
          let targetData = Object.assign({}, dynamic)
          targetData.hasFavor = !dynamic.hasFavor
          if (targetData.hasFavor) {
            this.$toast('点赞成功')
            targetData.favorCount += 1
          } else {
            this.$toast('取消成功')
            targetData.favorCount -= 1
          }
          this.$emit('changeData', { data: targetData, action: 'like' })
        }
      },
      onComment(onComment, event) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        this.$emit('onComment', this.dynamic)
      },
      async onFollow(dynamic, event) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        if (!this.userInfo) {
          await this.$store.dispatch('macLogin')
        }
        const params = {
          userId: dynamic.userInfoPo.userId,
        }
        const res = await follow(params)
        if (res && res.code === 0) {
          let targetData = Object.assign({}, dynamic)
          targetData.hasFollow = !targetData.hasFollow
          if (targetData.hasFollow) {
            this.$toast('关注成功')
          } else {
            this.$toast('取消成功')
          }
          this.$emit('changeData', { data: targetData, action: 'follow' })
        }
      },
      async onDelete(dynamic, event) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        if (!this.userInfo) {
          await this.$store.dispatch('macLogin')
        }
        Dialog.confirm({
          title: '提示',
          message: '您确定要删除此条动态吗？',
        })
          .then(async () => {
            const params = {
              mediaType: 3,
              userId: dynamic.userInfoPo.userId,
              mediaId: dynamic.mediaId,
              publishStatus: 0,
            }
            const res = await delContribution(params)
            if (res && res.code === 0) {
              this.$toast('删除成功')
              this.$emit('onDelete', dynamic)
            }
          })
          .catch(() => {})
      },
      onSearch(label, event) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        this.$router.push({
          path: '/search',
          query: {
            label: label.tagName,
            mediaType: 3,
          },
        })
      },
      handleImagePreview(event, idx) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        if (!this.dynamic.preview) {
          const imageList = this.dynamic.article.picUrl.map(one => this.imageBase + one)
          ImagePreview({
            images: imageList,
            startPosition: idx,
          })
        } else {
          this.toPlay(this.dynamic)
        }
      },
      async getUserInfo() {
        const res = await centerUserInfo()
        if (res && res.code === 0) {
          this.$store.commit('SET_USERINFO', res.data)
        }
      },
      async onShare(event) {
        if (event && event.stopPropagation) {
          event.stopPropagation()
        } else {
          window.event.cancelBubble = true
        }
        this.$router.push('/promote')
        // if (!this.userInfo) {
        //     await this.$store.dispatch('macLogin')
        // }
        // this.downloadLink = this.dataDic.shareaddress + '?inviteCode=' + this.userInfo.shareCode
        // this.showShareDialog = true
        // if (!this.qrcode) {
        //     this.$nextTick(() => {
        //         this.creatQrCode()
        //     })
        // }
      },
      onCloseDaolig() {
        this.showShareDialog = false
      },
      onSave() {
        html2canvas(this.$refs.capture, {
          useCORS: true,
        }).then(canvas => {
          const imgUrl = canvas.toDataURL('image/png')
          var eleLink = document.createElement('a')
          eleLink.href = imgUrl // 转换后的图片地址
          eleLink.download = 'share-qrcode.png'
          document.body.appendChild(eleLink)
          // 触发点击
          eleLink.click()
          // 然后移除
          document.body.removeChild(eleLink)
          this.$toast('二维码已保存至相册，打开扫一扫即可分享')
        })
        this.showShareDialog = false
      },
      creatQrCode() {
        this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
          text: this.downloadLink,
          width: 60,
          height: 60,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
        })
      },
    },
  }
</script>

<style lang="less" scoped>
  .dynamic-box {
    color: #666666;
    .user-box {
      display: flex;
      align-items: center;
      .avatar {
        position: relative;
        img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          object-fit: cover;
        }
        .vip-flag {
          width: 16px;
          height: 16px;
          position: absolute;
          bottom: 0;
          right: 0px;
        }
      }
      .user-info {
        width: calc(100% - 36px);
        margin-left: 10px;
        > div {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
        }
        .info-top {
          width: 100%;
          display: inline-flex;
          align-items: center;
          .nick {
            max-width: calc(100% - 80px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
            font-weight: 400;
          }
          .level {
            display: inline-block;
            padding: 2px 6px;
            background: #ff613d;
            border-radius: 4px;
            font-size: 10px;
            color: #ffffff;
            font-weight: normal;
            margin-left: 4px;
          }
        }
        .time {
          font-size: 12px;
          color: rgb(102 102 102);
          margin-top: 5px;
        }
      }
      .flow-box {
        flex-shrink: 0;
        .btn-flow {
          display: block;
          padding: 4px 8px;
          text-align: center;
          color: #fff;
          background: var(--theme-color);
          border-radius: 12px;
          font-size: 12px;
          white-space: nowrap;
        }
        .btn-flowed {
          display: block;
          padding: 4px 8px;
          background: #999;
          border-radius: 99px;
          font-size: 12px;
          white-space: nowrap;
          color: #fff;
        }
      }
      .delete-box {
        .btn-delete {
          display: inline-block;
          width: 64px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          color: #fff;
          background: #999999;
          border: 1px solid #999999;
          border-radius: 12px;
          font-size: 12px;
        }
      }
    }
    > .content {
      .desc {
        font-size: 14px;
        font-weight: 400;
        margin: 6px 0;
        white-space: pre-wrap;
      }
      .pictures {
        display: flex;
        flex-wrap: wrap;
        .img-box {
          width: calc((100% - 12px) / 3);
          margin-right: 6px;
          margin-bottom: 6px;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
          img {
            width: 100%;
            height: 100px;
            object-fit: cover;
          }
        }
        .img-box:nth-child(3n) {
          margin-right: 0;
        }
        .img-box-more {
          position: relative;
          img {
            filter: blur(5px);
          }
          span {
            width: 100%;
            height: 100px;
            line-height: 100px;
            text-align: center;
            font-size: 20px;
            background: #00000066;
            color: #f8f8f8;
            position: absolute;
            left: 0;
            bottom: 0;
          }
        }
        .img-box.preview::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          background: #211906cc;
        }
        .img-box.preview::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          z-index: 2;
          width: 28px;
          height: 32px;
          background: url(../../assets/images/icon-lock.png) center / 60% no-repeat;
        }
        .img-box.preview {
          img {
            filter: blur(4px);
          }
        }
      }
      .video-preview {
        width: 240px;
        height: 240px;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        margin-top: 12px;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .start-img {
          width: 64px;
          height: 64px;
          position: absolute;
          top: 88px;
          left: 88px;
        }
      }
      .hide-content {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    .label-fee {
      display: flex;
      justify-content: space-between;
      margin: 0 0 6px;
      .label-list {
        margin: 0 0 6px;
        .label-item {
          color: #2a78f6;
          border-radius: 12px;
          overflow: hidden;
          font-size: 12px;
          padding: 4px 0;
          margin-right: 16px;
        }
        .label-item:last-child {
          margin-right: 0;
        }
      }
      .fee {
        > span {
          padding: 3px 6px;
          border-radius: 6px 0 6px 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          font-size: 12px;
          color: #fff;
          img {
            width: 12px;
            height: 12px;
            margin-left: 4px;
          }
        }
        .free {
          background: #71d19c;
        }
        .gold {
          color: #333;
          background: #ffe300;
        }
        .level {
          background: #ff613d;
        }
        .vip {
          background: #109fff;
        }
      }
    }

    .content-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .comment-like {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        > span {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          img {
            width: 20px;
            margin-right: 4px;
          }
        }
        > span:last-child {
          margin-right: 0;
        }
      }
      .reward {
        display: inline-flex;
        align-items: center;
        img {
          width: 20px;
          margin-right: 4px;
        }
        span {
          color: #109fff;
          font-size: 12px;
        }
      }
    }
  }
  /deep/ .van-divider {
    margin: 15px 0 24px !important;
    border-color: #60607c;
  }
  ::v-deep .van-form {
    margin: 24px 0;
    .van-cell-group {
      .van-cell {
        background: #fff;
      }
    }
  }
  .van-dialog {
    background-color: transparent;
    width: inherit;
    .dialog-content {
      .content {
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        .share-img {
          img {
            width: 300px;
            height: 168px;
            object-fit: cover;
          }
        }
        .share-info {
          padding: 16px;
          .share-info-title {
            font-size: 15px;
            color: #0c0c0c;
            font-weight: bold;
          }
          .share-info-tag {
            margin: 8px 0;
            span {
              font-size: 12px;
              color: #109fff;
              padding: 4px 8px;
              margin-right: 10px;
              background: #ffeff4;
              border-radius: 10px;
            }
          }
          .share-info-desc {
            font-size: 12px;
            color: #0c0c0c;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
        .share-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px 16px;
          .logo {
            img {
              width: 40px;
              height: 40px;
            }
            div {
              font-size: 14px;
              color: #0c0c0c;
            }
          }
        }
      }
      .btn-box {
        margin-top: 28px;
        text-align: center;
      }
    }
  }
</style>
