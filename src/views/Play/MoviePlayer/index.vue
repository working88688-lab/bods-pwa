<template>
  <div class="page-container flex-container vip">
    <div class="page-top">
      <Header textColor="#fff" width="auto" :isBlur="false" @onClickLeft="onBack" />
    </div>
    <Loading v-if="isInit" />
    <template v-else>
      <div class="empty-box" v-if="!videoInfo">
        <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="100" description="暂无数据" />
      </div>
      <div class="page-content flex-container" v-else>
        <div :class="'vidoe-wraper ' + device">
          <VideoPlayer :id="videoInfo.mediaId" idName="moviePlayer" :mediaType="videoInfo.mediaType"
            :video="videoInfo.video.videoUrl" :videoCover="videoInfo.video.videoCoverImg" :progressDot="progressDot"
            :adData="adData" :isAddView="!videoInfo.preview" :isShowDialogAd="showAdDialog" @ended="handleEnded" />
          <div class="preview-tip" v-if="videoInfo.preview">
            <div v-if="videoInfo.payType === 2" @click="onShowFeeReminder">
              预览10秒 金币购买看完整视频
            </div>
            <div v-if="videoInfo.payType === 3" @click="onRoute('/vip')">
              预览10秒 用户等级{{ videoInfo.video.userLevel }}看完整视频
            </div>
            <div v-if="videoInfo.payType === 4" @click="onRoute('/vip')">
              预览10秒 充VIP看完整视频
            </div>
          </div>
        </div>
        <div class="video-content flex-container">
          <div v-if="cdnLine" class="changeline" @click="onChangeLine">
            <img src="@/assets/images/changeline.png" />
            <span>{{ cdnLine.cdnName }}</span>
          </div>
          <van-tabs v-model="activedTab" title-inactive-color="#333333" title-active-color="#109fff" color="#109fff"
            background="none" :ellipsis="false" :shrink="true" @change="onChangeTab" class="sub-tabs flex-container">
            <van-tab title="详情" :name="1">
              <div class="video-detai">
                <div class="video-info">
                  <div class="video-title">
                    {{ videoInfo.video.videoTitle }}
                  </div>
                  <ExpandCollapseText :text="videoInfo.video.videoDescription" />
                  <div class="label-list" v-if="videoInfo.tagList">
                    <span class="label-item" v-for="(tag, idx) in videoInfo.tagList" :key="idx"
                      @click="onSearch(tag)">#{{ tag.tagName }}</span>
                  </div>
                  <div class="info-bottom">
                    <div class="like-wrap">
                      <span class="like" @click="onLike(videoInfo)">
                        <img v-if="videoInfo.hasFavor" src="@/assets/images/iconMyLike.png" />
                        <img v-else src="@/assets/images/iconLike4.png" />
                        <span>{{
                          formatNum(videoInfo.fakeFavorCount + videoInfo.favorCount) || 0
                          }}</span>
                      </span>
                    </div>
                    <div class="comment-wrap">
                      <span class="comment" @click="onComment(videoInfo)">
                        <img src="@/assets/images/icon-view.png" />
                        <span>{{ formatNum(videoInfo.commentCount) || 0 }}</span>
                      </span>
                    </div>
                    <div class="feedback-wrap">
                      <span class="feedback" @click="onFeedback(videoInfo)">
                        <img src="@/assets/images/icon-feedback.png" />
                        <span>视频反馈</span>
                      </span>
                    </div>
                    <div class="share-wrap">
                      <span class="share" @click="onShare(videoInfo)">
                        <img src="@/assets/images/icon_share.png" />
                        <span>分享</span>
                      </span>
                    </div>
                  </div>
                </div>
                <VideoImagePreview v-if="showVideoImagePreview" :previewImgValue="videoInfo.video.previewImg"
                  :height="100" />
                <div class="banner-wraper" v-if="showBanner">
                  <Banner location="video_detail_page" @onFinish="handleBannerFinish" />
                </div>
                <div class="recommend">
                  <div class="movie-title">推荐视频</div>
                  <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" class="movie-list"
                    @load="onLoad" v-if="recommendList.length">
                    <div class="masonry-grid">
                      <div class="grid-gutter"></div>
                      <div class="grid-item" v-for="(data, idx) in recommendList" :key="idx">
                        <BannerItem v-if="data.type === 'banner'" :bannerData="data.data" />
                        <MovieItem v-else :videoInfo="data" :coverHeight="data.coverHeight" :isReplace="true" />
                      </div>
                    </div>
                  </van-list>
                  <van-empty v-else :image="require('@/assets/images/emptyImage.png')" image-size="100"
                    description="暂无内容" />
                </div>
              </div>
            </van-tab>
            <van-tab title="评论" :name="2">
              <div class="video-Comment">
                <CommentBox ref="commentBoxRef" :videoInfo="videoInfo" />
              </div>
            </van-tab>
          </van-tabs>
        </div>
      </div>
    </template>
    <Loading v-if="isRefresh" />
    <VideoFeedbackDialog :mediaId="videoInfo && videoInfo.mediaId" ref="VideoFeedbackDialogEle" />
    <FeeReminder ref="feeReminder" :videoInfo="videoInfo" @onRefresh="handleRefresh" />
    <ShareDialog ref="ShareDialogRef" :cover="videoInfo ? videoInfo.video.videoCoverImg : null"
      :title="videoInfo ? videoInfo.video.videoTitle : null" />
    <PlayAds ref="playads" v-if="showAdDialog" :list="alertBannerList" :onFinished="onFinished" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import MovieItem from '@/components/MovieItem'
import { getMediaById, listMediaBySearchType, favorAdd, getvideoPreview } from '@/apis/media'
import { formatStrNum, string2Duration } from '@/utils/tools'
import VideoPlayer from '@/components/VideoPlayer'
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import Banner from '@/components/Banner'
import Loading from '@/components/Loading'
import FeeReminder from './FeeReminder'
import _ from 'lodash'
import BannerItem from '@/components/BannerItem'
import ShareDialog from '@/views/Work/components/ShareDialog'
import Masonry from 'masonry-layout'
import CommentBox from '@/components/Comment/CommentBox'
import PlayAds from '@/components/PlayAds'
import { Dialog } from 'vant'
import { useInsert } from '@/hooks'
import ExpandCollapseText from "@/components/ExpandCollapseText";
import VideoFeedbackDialog from "@/components/VideoFeedbackDialog";
import VideoImagePreview from '@/components/VideoImagePreview';

export default {
  name: 'Play',
  components: {
    Header,
    VideoPlayer,
    Swiper,
    SwiperSlide,
    MovieItem,
    Banner,
    CommentBox,
    Loading,
    FeeReminder,
    BannerItem,
    ShareDialog,
    Masonry,
    PlayAds,
    ExpandCollapseText,
    VideoFeedbackDialog,
    VideoImagePreview
  },
  data() {
    return {
      isInit: true,
      videoId: null,
      categoryId: null,
      videoInfo: null,
      progressDot: [],
      bannerList: [],
      recommendList: [],
      showBanner: true,
      playPrevAdList: null,
      adData: null,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      loading: false,
      finished: false,
      activedTab: 1,
      mediaId: null,
      alertBannerList: [],
      showAdDialog: false,
      isRefresh: false,
      banner_index: 0
    }
  },
  watch: {
    $route: {
      handler(newval, oldval) {
        if (newval.path === '/play' && newval.query.videoId) {
          this.init()
          if (!this.alertBannerList.length) {
            this.showAdDialog = false
          } else {
            this.showAdDialog = true
          }
        }
      },
    },
  },
  computed: {
    cdnLine() {
      return this.$store.state.cdnLine
    },
    cdnLineList() {
      return this.$store.state.cdnLineList
    },
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    device() {
      return this.$store.state.device
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    showVideoImagePreview() {
      return this.videoInfo && this.videoInfo.video.previewImg
    }
  },
  created() {
    // dialog弹窗广告
    const p1 = new Promise(async (resolve, reject) => {
      if (this.$store.state.banner && this.$store.state.banner['playmoviead']) {
        this.alertBannerList = this.$store.state.banner['playmoviead']
        this.showAdDialog = true
      } else {
        this.alertBannerList = []
        this.showAdDialog = false
      }
      return resolve()
    })
    // 获取推荐列表广告信息
    const p2 = new Promise(async (resolve, reject) => {
      if (this.$store.state.banner && this.$store.state.banner['movie_list']) {
        this.bannerList = this.$store.state.banner['movie_list']
      }
      return resolve()
    })
    // 获取视频播放前广告
    const p3 = new Promise(async (resolve, reject) => {
      if (this.$store.state.banner && this.$store.state.banner['movie_ad']) {
        this.playPrevAdList = this.$store.state.banner['movie_ad']
      }
      return resolve()
    })

    Promise.all([p1, p2, p3])
      .then(([r1, r2, r3]) => {
        this.init()
      })
      .catch(erroe => {
        Dialog.confirm({
          title: '提示',
          message: '配置广告数据失败，请刷新页面',
          className: 'gold-dialog',
        })
          .then(async () => {
            window.location.reload()
          })
          .catch(() => { })
      })
  },
  activated() {
    // 默认关闭评论弹窗，试看弹窗
    this.$refs.feeReminder && this.$refs.feeReminder.onClose()
    this.$refs.comment && this.$refs.comment.onCloseComment()
  },
  updated() {
    const LayoutDom = document.querySelector('.masonry-grid')
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.grid-gutter',
      })
    }
  },
  methods: {
    onFinished() {
      this.showAdDialog = false
    },
    onBack() {
      this.$router.go(-1)
    },
    async init() {
      const { videoId, categoryId } = this.$route.query
      if (!videoId || !categoryId) {
        return this.$router.go(-1)
      }
      this.adData = _.sample(this.playPrevAdList)
      this.videoId = videoId
      this.categoryId = categoryId
      this.getVideoInfo()
      this.page.pageNo = 1
      this.recommendList = []
      this.finished = false
      this.getRecommendList(null, true)
    },
    onChangeTab() {
      if (this.activedTab === 2) {
        const { mediaId } = this.videoInfo
        if (mediaId !== this.mediaId) {
          this.mediaId = mediaId
          this.$nextTick(() => {
            this.$refs.commentBoxRef.init()
          })
        }
      }
    },
    handleBannerFinish(data) {
      this.showBanner = !!data.length
    },
    async getVideoInfo() {
      const params = {
        mediaId: this.videoId,
        mediaType: 1,
      }
      this.isRefresh = true
      const res = await getMediaById(params).catch(() => {
        this.isInit = false
        this.isRefresh = false
      })
      if (res && res.code === 0) {
        this.videoInfo = res.data
        const markRes = await getvideoPreview({
          merchantAcct: this.videoInfo.merchantAcct,
          videoId: this.videoInfo.video.videoId,
        }).catch(() => {
          this.isInit = false
          this.isRefresh = false
        })
        this.isInit = false
        this.isRefresh = false
        if (markRes && markRes.code === 0) {
          this.progressDot = markRes.data.map((one, idx) => {
            return {
              time: string2Duration(one.previewTime),
              text: '标记点',
              image: this.imageBase + one.previewPic,
            }
          })
        }
      }
    },
    async getRecommendList(done, isRefresh) {
      this.loading = true
      const res = await listMediaBySearchType({
        ...this.page,
        mediaType: 1,
        categoryId: this.categoryId,
        searchType: 'RECOMMEND',
      })
      this.loading = false
      done && done()
      if (res && res.code === 0) {
        let resultData = []
        if (this.bannerList.length) {
          resultData = useInsert(this.dataDic.inADNub || 10, res.data.dataList, this.bannerList[this.banner_index])
          if (this.banner_index < this.bannerList.length - 1) {
            this.banner_index++
          } else {
            this.banner_index = 0
          }
        } else {
          resultData = res.data.dataList
        }
        resultData = resultData.map(one => {
          if (one.type !== 'banner') {
            if (one.video && one.video.videoCoverImg && one.video.coverHeight) {
              one['coverHeight'] = (one.video.coverHeight / one.video.coverWidth).toFixed(2) * 100 + '%'
            } else {
              one['coverHeight'] = '100%'
            }
          }
          return one
        })
        if (isRefresh) {
          this.recommendList = resultData
        } else {
          this.recommendList = this.recommendList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    /**
     * 每间隔指定长度插入广告
     * @param {number} len
     * @param {array} data
     */
    insertAd2List(len, data) {
      const chunkList = _.chunk(data, len)
      let resultData = []
      chunkList.forEach(one => {
        const banner = _.sample(this.bannerList)
        one.push({ type: 'banner', data: banner })
        resultData = _.concat(resultData, one)
      })
      return resultData
    },
    onLoad(done) {
      this.page.pageNo++
      this.getRecommendList(done, false)
    },
    async onLike(videoInfo) {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        mediaId: videoInfo.mediaId,
        favorType: 1,
      }
      const res = await favorAdd(params)
      if (res && res.code === 0) {
        if (this.videoInfo.hasFavor) {
          this.$set(this.videoInfo, 'favorCount', this.videoInfo.favorCount - 1)
        } else {
          this.$set(this.videoInfo, 'favorCount', this.videoInfo.favorCount + 1)
        }
        this.$set(this.videoInfo, 'hasFavor', !this.videoInfo.hasFavor)
      }
    },
    onShare() {
      this.$refs.ShareDialogRef.onShow()
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    onFeedback() {
      this.$refs.VideoFeedbackDialogEle.show()
    },
    onChangeLine() {
      if (this.cdnLineList.length <= 1) {
        this.$toast('没有更多可用线路')
      } else {
        this.$store.commit('CHANGE_CDNLINE')
      }
    },
    onShowFeeReminder() {
      this.$refs.feeReminder.onShow()
    },
    handleRefresh() {
      this.getVideoInfo()
    },
    handleEnded() {
      if (this.videoInfo.preview) {
        this.onShowFeeReminder()
      }
    },
    onSearch(label) {
      this.$router.push({
        path: '/search',
        query: {
          label: label.tagName,
          mediaType: 1,
        },
      })
    },
    onRoute(path) {
      this.$router.push(path)
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

.page-container {
  color: #333333;

  .page-top {
    position: absolute;
    z-index: 1200;
  }
}

.page-content {
  flex: 1;
  overflow: hidden;

  .vidoe-wraper {
    height: 210px;
    position: relative;
    background: #000;

    .preview-tip {
      display: inline-block;
      padding: 0 12px;
      height: 32px;
      line-height: 32px;
      border-radius: 4px 0 0 4px;
      background: linear-gradient(to right, rgb(251 147 168), rgb(253 250 198));
      font-size: 14px;
      color: rgb(7, 11, 31);
      position: absolute;
      top: 0;
      right: 0;
      z-index: 999;
    }
  }

  .vidoe-wraper.pc {
    height: 258px;
  }

  .video-content {
    flex: 1;
    overflow: hidden;
    position: relative;

    .changeline {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      cursor: pointer;
      position: absolute;
      right: 12px;
      top: 12px;
      z-index: 1;

      img {
        width: 22px;
        margin-right: 8px;
      }
    }

    .video-info {
      padding: 12px;
      margin: 0 12px 12px;
      background: #fffafb;
      border-radius: 6px;

      .video-title {
        font-weight: bold;
        font-size: 16px;
      }

      .label-list {
        display: flex;
        flex-flow: wrap;
        margin: 12px 0 0;

        .label-item {
          display: inline-block;
          font-size: 12px;
          color: #2a78f6;
          border-radius: 2px;
          margin: 0 12px 12px 0;
        }
      }

      .info-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--text-color);

        .like-wrap {
          span {
            margin-right: 6px;
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            cursor: pointer;

            img {
              width: 20px;
              margin-right: 4px;
            }
          }
        }

        .comment-wrap {
          span {
            margin-right: 6px;
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            cursor: pointer;

            img {
              width: 20px;
              margin-right: 4px;
            }
          }
        }

        .feedback-wrap {
          span {
            margin-right: 6px;
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            cursor: pointer;

            img {
              width: 20px;
              margin-right: 4px;
            }
          }
        }

        .share-wrap {
          span {
            display: inline-flex;
            align-items: center;
            font-size: 12px;
            cursor: pointer;

            img {
              width: 20px;
              margin-right: 4px;
            }
          }
        }
      }
    }

    .recommend {
      .movie-title {
        margin: 0 12px 12px;
      }

      .masonry-grid {
        margin: 0 16px;

        .grid-gutter {
          width: 3%;
        }

        .grid-item {
          width: 48.5%;
        }

        .banner {
          margin-bottom: 12px;
        }
      }
    }
  }
}

::v-deep .sub-tabs.van-tabs {
  flex: 1;
  overflow: hidden;

  .van-tabs__wrap {
    .van-tabs__nav {
      display: inline-flex;

      .van-tab {
        padding-bottom: 0;
        font-size: 15px;
        display: inline-flex;
      }

      .van-tab--active {
        font-size: 22px;
        position: relative;
        font-weight: bold;
      }

      .van-tabs__line {
        display: none;
      }
    }
  }

  .van-tabs__content {
    flex: 1;
    overflow: hidden;

    .van-tab__pane {
      height: 100%;
      overflow: hidden;

      .video-detai {
        height: 100%;
        overflow: auto;
      }

      .video-Comment {
        height: 100%;
        overflow: hidden;
      }
    }
  }
}
</style>
