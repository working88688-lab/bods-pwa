<template>
  <div class="page-container flex-container bg-page">
    <Header textColor="#222222" title="详情" @onClickLeft="onBack" />
    <div class="flex-container">
      <Loading v-if="isInit" />
      <template v-else>
        <template v-if="dataInfo">
          <div class="page-content">
            <div class="user-box" v-if="dataInfo.userInfoPo">
              <div class="avatar" @click="toHomePage(dataInfo.userInfoPo)">
                <img v-lazy="imageBase + dataInfo.userInfoPo.headUrl" />
                <img v-if="dataInfo.userInfoPo.vipFlag" class="vip-flag" src="@/assets/images/vip_actived.png" alt="" />
                <img v-else class="vip-flag" src="@/assets/images/vip_inactivated.png" alt="" />
              </div>
              <div class="user-info" @click="toHomePage(dataInfo.userInfoPo)">
                <div>
                  <div class="info-top">
                    <div class="nick">{{ dataInfo.userInfoPo.nickName }}</div>
                    <span class="level" v-if="dataInfo.userInfoPo.expLevel">Lv{{ dataInfo.userInfoPo.expLevel }}</span>
                  </div>
                  <div class="flow-box">
                    <span :class="dataInfo.hasFollow ? 'btn-flowed' : 'btn-flow'" @click="onFollow($event)">{{
                      dataInfo.hasFollow ? '已关注' : '关注' }}</span>
                  </div>
                </div>
                <!-- <div class="time">
                  <span>{{ formatTime(dataInfo.article.createTime) }}</span>
                  <span v-if="dataInfo.preview">
                    <span
                      class="free"
                      v-if="dataInfo.payType === 1"
                      >限免</span
                    >
                    <span
                      class="gold"
                      v-if="dataInfo.payType === 2"
                    >
                      <span>{{ dataInfo.goldPayUnit }}</span>
                      <img src="@/assets/images/gold.png" />
                    </span>
                    <span
                      class="level"
                      v-if="dataInfo.payType === 3"
                      >Lv {{ dataInfo.userLevel || 0 }}</span
                    >
                    <span
                      class="vip"
                      v-if="dataInfo.payType === 4"
                      >VIP</span
                    >
                  </span>
                </div> -->
              </div>
            </div>
            <div class="content" v-if="dataInfo.article">
              <div class="desc">
                {{ dataInfo.article.articleTitle || dataInfo.article.articleDescription }}
              </div>
              <div class="label-list" v-if="dataInfo.tagList && dataInfo.tagList.length">
                <span class="label-item" v-for="(label, idx) in dataInfo.tagList" :key="idx"
                  @click="onSearch(label)">#{{ label.tagName }}</span>
              </div>
              <div class="article-preview" v-if="dataInfo.preview && dataInfo.article.articleType === 3">
                <img v-lazy="imageBase + dataInfo.article.articleCoverImg" />
                <div class="mask">
                  <template v-if="dataInfo.payType === 2"> {{ dataInfo.goldPayUnit || 0 }}金币解锁 </template>
                  <template v-else-if="dataInfo.payType === 3"> Lv{{ dataInfo.userLevel }}解锁 </template>
                  <template v-else-if="dataInfo.payType === 4"> VIP解锁 </template>
                </div>
              </div>
              <template v-else>
                <template v-if="dataInfo.article.articleType === 3">
                  <div class="content-html" v-html="dataInfo.article.contentHtml"></div>
                </template>
                <div class="videos" v-if="dataInfo.article.playUrls && dataInfo.article.playUrls.length">
                  <div class="video-box" :class="{ preview: dataInfo.preview }"
                    v-for="(videoData, idx) in dataInfo.article.playUrls" :key="idx">
                    <VideoPlayer :id="dataInfo.mediaId + '-video-' + idx" :isAddView="false" :autoplay="false"
                      :startplay="false" :video="videoData" :videoCover="dataInfo.article.articleCoverImg"
                      @ended="handleEnded" />
                  </div>
                </div>
                <div class="pictures" :class="'pictures-' + dataInfo.article.picUrl.length"
                  v-if="dataInfo.article.picUrl && dataInfo.article.picUrl.length">
                  <div class="img-box" :class="{ preview: dataInfo.preview }"
                    v-for="(pic, idx) in dataInfo.article.picUrl" :key="idx">
                    <img v-lazy="imageBase + pic" />
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="page-bottom" v-if="dataInfo">
            <div class="comment-like">
              <span @click="onLike">
                <img v-if="dataInfo.hasFavor" src="@/assets/images/square_like_true.png" />
                <img v-else src="@/assets/images/square_like_false.png" />
                <span>{{ formatNum(dataInfo.fakeFavorCount + dataInfo.favorCount) || 0 }}</span>
              </span>
              <span>
                <img src="@/assets/images/icon-view.png" />
                <span>{{ formatNum(dataInfo.fakeViewCount + dataInfo.viewCount) || 0 }}</span>
              </span>
              <span @click="onComment">
                <img src="@/assets/images/icon_comment_v3.png" />
                <span>{{ formatNum(dataInfo.commentCount) || 0 }}</span>
              </span>
              <span class="share" @click="onShare">
                <img src="@/assets/images/icon_share.png" />
                <span>分享</span>
              </span>
            </div>
          </div>
        </template>
        <div class="empty-box" v-else>
          <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="200" description="暂无数据哦~" />
        </div>
      </template>
    </div>
    <van-dialog v-model:show="showShareDialog" :showConfirmButton="false" :closeOnClickOverlay="true"
      @close="onCloseDaolig">
      <div class="dialog-content">
        <div class="content" ref="capture" v-if="dataInfo">
          <div class="share-img">
            <img :src="imageBase + dataInfo.article.articleCoverImg + '?' + new Date().getTime()"
              crossOrigin="anonymous" />
          </div>
          <div class="share-info">
            <div class="share-info-tag">
              <span v-for="(tag, idx) in dataInfo.tagList">#{{ tag.tagName }}</span>
            </div>
            <div class="share-info-desc">
              {{ dataInfo.article.articleDescription || dataInfo.article.articleTitle }}
            </div>
          </div>
          <div class="share-bottom">
            <div class="logo">
              <img src="@/assets/logo.png" />
              <div>{{ domain }}</div>
            </div>
            <div ref="qrCodeUrl" class="qr-code"></div>
          </div>
        </div>
        <div class="btn-box">
          <van-button round type="primary" @click="onSave">保存图片</van-button>
        </div>
      </div>
    </van-dialog>
    <Comment v-if="showComment" ref="commentRef" :videoInfo="dataInfo" @addComment="handleAddComment"
      @close="handleCloseComment" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getMediaById, viewAdd, favorAdd, purchase } from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import { follow, centerUserInfo } from '@/apis/user'
import { Dialog } from 'vant'
import { ImagePreview } from 'vant'
import _ from 'lodash'
import QRCode from 'qrcodejs2'
import html2canvas from 'html2canvas'
import dayjs from 'dayjs'
import VideoPlayer from '@/components/VideoPlayer'
import axios from 'axios'
import Comment from '@/components/Comment'

export default {
  name: 'SquareDetail',
  components: {
    Header,
    Loading,
    VideoPlayer,
    Comment,
  },
  data() {
    return {
      isInit: true,
      dataInfo: null,
      mediaId: '',
      domain: '',
      coinNum: null,
      loading: false,
      showShareDialog: false,
      downloadLink: '',
      qrcode: null,
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
    dataDic() {
      return this.$store.state.dataDic
    },
  },
  created() {
    this.domain = this.dataDic.domain || 'tjs006.com'
  },
  activated() {
    const mediaId = this.$route.query.mediaId
    if (this.mediaId !== mediaId) {
      this.init()
    }
  },
  methods: {
    init() {
      this.mediaId = this.$route.query.mediaId
      this.dataInfo = null
      this.showShareDialog = false
      this.qrcode = null
      this.isInit = true
      this.getDataList()
    },
    onBack() {
      this.$router.go(-1)
    },
    async getDataList() {
      let params = {
        mediaId: this.mediaId,
        mediaType: 3,
      }
      const res = await getMediaById(params).catch(() => {
        this.isInit = false
      })
      if (res && res.code === 0) {
        this.dataInfo = res.data
        if (this.dataInfo.article.picUrl) {
          this.dataInfo.article.picUrl = JSON.parse(this.dataInfo.article.picUrl)
        }
        if (this.dataInfo.preview) {
          this.dataInfo.article['playUrls'] = JSON.parse(this.dataInfo.article.previewVideoUrl || '[]') || []
        } else {
          this.dataInfo.article['playUrls'] = JSON.parse(this.dataInfo.article.videoUrl || '[]') || []
        }
        if (this.dataInfo.article.articleType === 3 && !this.dataInfo.preview) {
          const contentRes = await axios.get(this.imageBase + this.dataInfo.article.content, {
            transformRequest: [(data, headers) => {
              // 注意：headers 是 merge 之后、待发送的最终 headers 对象
              delete headers.macct;
              delete headers.language;
              // 如果你想把所有自定义头都清空，也可以遍历 headers，然后删掉非浏览器原生的那些
              return data;
            }],
          }).catch(() => {
            this.isInit = false
          })
          this.isInit = false
          if (contentRes && contentRes.status === 200) {
            this.dataInfo.article['contentHtml'] = contentRes.data.replaceAll('SF_CDN_BASE', this.imageBase)
          }
        } else {
          this.isInit = false
        }
        if (!this.dataInfo.preview) {
          viewAdd({
            mediaId: this.dataInfo.mediaId,
            mediaType: 3,
          })
        }
      }
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    formatTime(time) {
      return dayjs(time).format('MM-DD HH:mm:ss')
    },
    formatDurationStr(num) {
      return formatDuration(num)
    },
    toHomePage(user) {
      this.$router.push({
        path: '/homepage',
        query: {
          userId: user.userId,
        },
      })
    },
    handleEnded() {
      if (this.dataInfo.preview) {
        this.onBuy()
      }
    },
    async handleSuccess() {
      const params = {
        mediaId: this.dataInfo.mediaId,
        mediaType: this.dataInfo.mediaType,
      }
      const res = await getMediaById(params).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        this.dataInfo = res.data
        if (this.dataInfo.article.picUrl) {
          this.dataInfo.article.picUrl = JSON.parse(this.dataInfo.article.picUrl)
        }
        if (this.dataInfo.preview) {
          this.dataInfo.article['playUrls'] = JSON.parse(this.dataInfo.article.previewVideoUrl || '[]') || []
        } else {
          this.dataInfo.article['playUrls'] = JSON.parse(this.dataInfo.article.videoUrl || '[]') || []
        }
        if (this.dataInfo.article.articleType === 3 && !this.dataInfo.preview) {
          const contentRes = await axios.get(this.imageBase + this.dataInfo.article.content).catch(() => {
            this.isInit = false
          })
          this.isInit = false
          if (contentRes && contentRes.status === 200) {
            this.dataInfo.article['contentHtml'] = contentRes.data.replaceAll('SF_CDN_BASE', this.imageBase)
          }
        } else {
          this.isInit = false
        }
        this.$toast('购买成功')
        if (!this.dataInfo.preview) {
          viewAdd({
            mediaId: this.dataInfo.mediaId,
            mediaType: 3,
          })
        }
      }
    },
    onBuy() {
      if (this.dataInfo.payType === 2) {
        if (this.userInfo.coinBalance < this.dataInfo.goldPayUnit) {
          return Dialog.confirm({
            title: '提示',
            message: `充值金币解锁`,
            className: 'confirm-dialog',
          })
            .then(async () => {
              this.$router.push('/recharge')
            })
            .catch(() => { })
        } else {
          return Dialog.confirm({
            title: '提示',
            message: `是否花费${this.dataInfo.goldPayUnit}金币解锁？`,
            className: 'confirm-dialog',
          })
            .then(async () => {
              const params = {
                mediaId: this.dataInfo.mediaId,
                mediaType: this.dataInfo.mediaType,
              }
              this.isInit = true
              const res = await purchase(params).catch(() => {
                this.isInit = false
              })
              if (res && res.code === 0) {
                const userData = Object.assign({}, this.userInfo)
                userData.coinBalance = userData.coinBalance - this.dataInfo.goldPayUnit
                this.$store.commit('SET_USERINFO', userData)
                this.handleSuccess()
              }
            })
            .catch(() => { })
        }
      } else if (this.dataInfo.payType === 3) {
        return Dialog.confirm({
          title: '提示',
          message: this.dataInfo.userLevel >= 8 ? '开通微密卡解锁' : '提升等级解锁',
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.$router.push('/vip')
          })
          .catch(() => { })
      } else if (this.dataInfo.payType === 4) {
        return Dialog.confirm({
          title: '提示',
          message: `开通VIP解锁`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.$router.push('/vip')
          })
          .catch(() => { })
      }
    },
    async onLike() {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        mediaId: this.dataInfo.mediaId,
        favorType: 3,
      }
      const res = await favorAdd(params)
      if (res && res.code === 0) {
        this.$set(this.dataInfo, 'hasFavor', !this.dataInfo.hasFavor)
        if (this.dataInfo.hasFavor) {
          this.$toast('点赞成功')
          this.dataInfo.favorCount += 1
        } else {
          this.$toast('取消成功')
          this.dataInfo.favorCount -= 1
        }
      }
    },
    async onFollow(event) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      } else {
        window.event.cancelBubble = true
      }
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        userId: this.dataInfo.userInfoPo.userId,
      }
      const res = await follow(params)
      if (res && res.code === 0) {
        this.$set(this.dataInfo, 'hasFollow', !this.dataInfo.hasFollow)
        if (this.dataInfo.hasFollow) {
          this.$toast('关注成功')
        } else {
          this.$toast('取消成功')
        }
      }
    },
    onSearch(label) {
      this.$router.push({
        path: '/search',
        query: {
          label: label.tagName,
          type: 3,
        },
      })
    },
    handleImagePreview(event, idx) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      } else {
        window.event.cancelBubble = true
      }
      if (idx !== 0 && this.dataInfo.preview) {
        return this.onBuy()
      }
      let imageList = []
      if (this.dataInfo.preview) {
        imageList = this.dataInfo.article.picUrl.slice(0, 1).map(one => this.imageBase + one)
      } else {
        imageList = this.dataInfo.article.picUrl.map(one => this.imageBase + one)
      }
      ImagePreview({
        images: imageList,
        startPosition: idx,
      })
    },
    async getUserInfo() {
      const res = await centerUserInfo()
      if (res && res.code === 0) {
        this.$store.commit('SET_USERINFO', res.data)
      }
    },
    onComment() {
      this.showComment = true
      this.$nextTick(() => {
        this.$refs.commentRef.onShowComment()
      })
    },
    handleAddComment() {
      this.$set(this.dataInfo, 'commentCount', this.dataInfo.commentCount + 1)
    },
    handleCloseComment() { },
    async onShare() {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      this.downloadLink = this.dataDic.shareaddress + '?inviteCode=' + this.userInfo.shareCode
      this.showShareDialog = true
      if (!this.qrcode) {
        this.$nextTick(() => {
          this.creatQrCode()
        })
      }
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
    handleChangeData({ data, action }, idx) {
      this.dataInfo = data
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {}

.page-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
  color: #666666;
  position: relative;

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

      >div {
        width: 100%;
        height: 36px;
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
          color: #000;
          font-size: 16px;
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
        margin-top: 10px;

        .gold {
          padding: 3px 6px;
          background: rgb(255 227 0);
          overflow: hidden;
          border-radius: 4px;
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
          padding: 3px 6px;
          color: #fff;
          background: #ff613d;
          overflow: hidden;
          border-radius: 4px;
        }

        .vip {
          padding: 3px 6px;
          color: #fff;
          background: #109fff;
          overflow: hidden;
          border-radius: 4px;
        }
      }
    }

    .flow-box {
      .btn-flow {
        display: inline-block;
        width: 60px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        background: #109fff;
        color: #fff;
        border-radius: 4px;
        font-size: 12px;
        border-radius: 999px;
      }

      .btn-flowed {
        display: inline-block;
        width: 60px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        background: rgb(153 153 153);
        border-radius: 12px;
        font-size: 12px;
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

  >.content {
    .desc {
      font-size: 14px;
      font-weight: 400;
      margin: 6px 0;
      white-space: pre-wrap;
      color: #000;
      font-size: 18px;
      margin-top: 10px;
    }

    .pictures {
      display: flex;
      flex-wrap: wrap;

      .img-box {
        width: 100%;
        margin-bottom: 6px;
        border-radius: 4px;
        overflow: hidden;
        position: relative;

        img {
          width: 100%;
        }
      }

      .img-box.preview:not(:first-child)::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        background: #211906cc;
      }

      .img-box.preview:not(:first-child)::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        z-index: 2;
        width: 28px;
        height: 32px;
        background: url(../../assets/images/icon-lock.png) center / 60% no-repeat;
      }

      .img-box.preview:not(:first-child) {
        img {
          filter: blur(15px);
        }
      }
    }

    .pictures-1 {
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

    .video-box {
      width: 100%;
      height: 220px;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
      margin-top: 12px;
    }

    .hide-content {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .article-preview {
      position: relative;
      overflow: hidden;

      img {
        width: 100%;
        filter: blur(5px);
      }

      .mask {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        right: 0;
        z-index: 1;
        background: #211906cc;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .label-list {
    margin: 6px 0 6px;

    .label-item {
      color: #999999;
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

  .banner-wraper {
    padding: 12px 0;
  }

  .banner-swiper {
    .banner-item {
      img {
        width: 100%;
        border-radius: 6px;
      }
    }
  }
}

.page-bottom {
  width: 100%;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .comment-like {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;

    >span {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;

      img {
        width: 22px;
        margin-right: 4px;
      }
    }
  }

  .content-fee {
    font-size: 12px;
    color: #000;
    padding: 8px 12px;
    background: #ffcc2a;
    border-radius: 4px;
  }

  .reward {
    display: inline-flex;
    align-items: center;

    img {
      width: 20px;
      margin-right: 4px;
    }

    span {
      color: #ffcc2a;
      font-size: 12px;
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
        padding: 8px 16px;

        .share-info-title {
          font-size: 15px;
          color: #0c0c0c;
          font-weight: bold;
        }

        .share-info-tag {
          margin: 0 0 8px;

          span {
            font-size: 12px;
            margin-right: 10px;
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
      margin-top: 16px;
      text-align: center;

      .van-button {
        width: 160px;
      }
    }
  }
}
</style>
