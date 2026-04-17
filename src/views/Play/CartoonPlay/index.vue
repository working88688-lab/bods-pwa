<template>
  <div class="page-container flex-container">
    <div class="page-top">
      <Header textColor="#fff" :isBlur="false" @onClickLeft="onBack" />
    </div>
    <div class="page-content flex-container">
      <Loading v-if="isInit" />
      <template v-else>
        <div class="empty-box" v-if="!chapterData">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="100"
            description="暂无内容"
          />
        </div>
        <div class="chapter-content flex-container" v-else>
          <div :class="'vidoe-wraper ' + device">
            <VideoPlayer
              :id="chapterData.mediaId"
              idName="cartoonPlayer"
              :mediaType="chapterData.mediaType"
              :video="
                chapterData.chapterVo.chapterContent ||
                chapterData.chapterVo.previewUrl
              "
              :videoCover="chapterData.chapterVo.chapterCover || ''"
              :adData="adData"
              :isAddView="!chapterData.preview"
              :isShowDialogAd="showAdDialog"
              @ended="handleEnded"
            />
            <div class="preview-tip" v-if="chapterData.preview">
              <div v-if="chapterData.payType === 2" @click="onShowFeeReminder">
                预览10秒 金币购买看完整视频
              </div>
              <div v-if="chapterData.payType === 3" @click="onRoute('/vip')">
                预览10秒 用户等级{{ video.userLevel }}看完整视频
              </div>
              <div v-if="chapterData.payType === 4" @click="onRoute('/vip')">
                预览10秒 充VIP看完整视频
              </div>
            </div>
          </div>
          <div class="video-content flex-container">
            <div v-if="cdnLine" class="changeline" @click="onChangeLine">
              <img src="@/assets/images/changeline.png" />
              <span>{{ cdnLine.cdnName }}</span>
            </div>
            <van-tabs
              v-model="activedTab"
              title-inactive-color="#333333"
              title-active-color="#109fff"
              color="#109fff"
              background="none"
              :ellipsis="false"
              :shrink="true"
              class="sub-tabs flex-container"
              @change="onChangeTab"
            >
              <van-tab title="详情" :name="1">
                <div class="video-detai">
                  <div class="video-info">
                    <div class="video-title">
                      <span
                        >第{{
                          chapterData.chapterVo.chapterSeq > 9
                            ? chapterData.chapterVo.chapterSeq
                            : '0' + chapterData.chapterVo.chapterSeq
                        }}集</span
                      >
                      <span v-if="comicData">{{
                        comicData.comicVo.comicName +
                        chapterData.chapterVo.chapterName
                      }}</span>
                    </div>
                    <div class="info-label" v-if="comicData">
                      <span class="info-bottom-status" v-if="comicData">
                        <span>{{
                          comicData.comicVo.chapterOver ? '已完结' : '连载中'
                        }}</span>
                        <span>{{
                          comicData.comicVo.chapterOver
                            ? ' | 共' + comicData.comicVo.chapterTotal + '话'
                            : ' | 更新至' + comicData.comicVo.chapterCurrentSeq
                        }}</span>
                      </span>
                    </div>
                    <Episode
                      v-if="comicData && chapterData"
                      :comicData="comicData"
                      :chapterData="chapterData"
                    />
                    <div class="label-list" v-if="comicData">
                      <span
                        class="label-item"
                        v-for="(tag, idx) in comicData.tagList"
                        :key="idx"
                        @click="onSearch(tag)"
                        >#{{ tag.tagName }}</span
                      >
                    </div>
                    <div class="info-bottom">
                      <div class="comment-like">
                        <span class="like" @click="onLike(chapterData)">
                          <img
                            v-if="chapterData.hasFavor"
                            src="@/assets/images/iconMyLike.png"
                          />
                          <img v-else src="@/assets/images/iconLike4.png" />
                          <span>{{
                            formatNum(
                              chapterData.fakeFavorCount +
                                chapterData.favorCount
                            ) || 0
                          }}</span>
                        </span>
                        <span class="comment">
                          <img src="@/assets/images/icon-view.png" />
                          <span>{{
                            formatNum(
                              chapterData.fakeViewCount + chapterData.viewCount
                            ) || 0
                          }}</span>
                        </span>
                        <span class="share" @click="onShare(chapterData)">
                          <img src="@/assets/images/icon_share.png" />
                          <span>分享</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="banner-wraper" v-if="showBanner">
                    <Banner
                      location="video_detail_page"
                      @onFinish="handleBannerFinish"
                    />
                  </div>
                  <div class="recommend">
                    <div class="movie-title">推荐视频</div>
                    <van-list
                      v-model:loading="loading"
                      :finished="finished"
                      finished-text="没有更多了"
                      class="data-list"
                      @load="onLoad"
                    >
                      <div class="masonry-grid">
                        <div class="grid-gutter"></div>
                        <div
                          class="grid-item"
                          v-for="(data, idx) in recommendList"
                          :key="idx"
                        >
                          <BannerItem
                            v-if="data.type === 'banner'"
                            :bannerData="data.data"
                          />
                          <WorkItem
                            v-else
                            :itemInfo="data"
                            :coverHeight="data.coverHeight"
                            :isReplace="true"
                          />
                        </div>
                      </div>
                    </van-list>
                  </div>
                </div>
              </van-tab>
              <van-tab title="评论" :name="2">
                <div class="video-Comment">
                  <CommentBox ref="commentBoxRef" :videoInfo="chapterData" />
                </div>
              </van-tab>
            </van-tabs>
          </div>
        </div>
      </template>
      <FeeReminder
        ref="feeReminder"
        :videoInfo="chapterData"
        @onRefresh="handleRefresh"
      />
      <ShareDialog
        ref="ShareDialogRef"
        :cover="
          (chapterData && chapterData.chapterVo.chapterCover) ||
          (comicData && comicData.comicVo.comicCover)
        "
        :title="comicData && comicData.comicVo.comicName"
      />
      <PlayAds
        ref="playads"
        v-if="showAdDialog"
        :list="alertBannerList"
        :onFinished="onFinished"
      />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import {
  comicById,
  chapterById,
  pageChapterByComicId,
  listMediaByPageAndSortType,
} from '@/apis/comic'
import {
  listMediaBySearchType,
  collectMedia,
  cancelCollectMedia,
  favorAdd,
} from '@/apis/media'
import Loading from '@/components/Loading'
import VideoPlayer from '@/components/VideoPlayer'
import ShareDialog from '@/views/Work/components/ShareDialog'
import _ from 'lodash'
import Banner from '@/components/Banner'
import { formatStrNum, string2Duration } from '@/utils/tools'
import BannerItem from '@/components/BannerItem'
import FeeReminder from '../MoviePlayer/FeeReminder'
import Episode from './Episode'
import WorkItem from '@/components/WorkItem'
import Masonry from 'masonry-layout'
import CommentBox from '@/components/Comment/CommentBox'
import PlayAds from '@/components/PlayAds'
import { Dialog } from 'vant'

export default {
  name: 'ComicsPlay',
  components: {
    Header,
    Loading,
    VideoPlayer,
    Banner,
    BannerItem,
    FeeReminder,
    Episode,
    CommentBox,
    WorkItem,
    ShareDialog,
    Masonry,
    PlayAds,
  },
  watch: {
    $route: {
      handler(val) {
        if (val.path === '/cartoonPlay') {
          this.isInit = true
          this.comicData = null
          this.chapterData = null
          const { comicId, chapterId } = val.query
          if (comicId && chapterId) {
            this.getChapterById(comicId, chapterId)
            this.getComicData()
          } else if (comicId && !chapterId) {
            this.getComicById()
            this.getComicData()
          }
          if (!this.alertBannerList.length) {
            this.showAdDialog = false
          } else {
            this.showAdDialog = true
          }
          this.adData = _.sample(this.playPrevAdList)
        }
      },
    },
  },
  data() {
    return {
      alertBannerList: [],
      isInit: true,
      comicId: null,
      comicData: null,
      chapterId: null,
      chapterData: null,
      nextChapterData: null,
      adData: null,
      isLoadingAd: true,
      showBanner: true,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      loading: false,
      finished: false,
      bannerList: [],
      recommendList: [],
      showPopover: false,
      activedTab: 1,
      mediaId: null,
      alertBannerList: [],
      playPrevAdList: [],
      showAdDialog: false,
    }
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
    godb() {
      return this.$store.state.godb
    },
    dataDic() {
      return this.$store.state.dataDic
    },
  },
  created() {
    // dialog弹窗广告
    const p1 = new Promise(async (resolve, reject) => {
      if (this.$store.state.banner && this.$store.state.banner['playmoviead']) {
        this.alertBannerList = this.$store.state.banner['playmoviead']
        this.showAdDialog = true
      } else {
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
        this.adData = _.sample(this.playPrevAdList)
        this.getComicById()
        this.getComicData()
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
          .catch(() => {})
      })
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
  mounted() {},
  activated() {},
  methods: {
    onFinished() {
      this.showAdDialog = false
    },
    onBack() {
      this.$router.go(-1)
    },
    onChangeTab() {
      if (this.activedTab === 2) {
        const { mediaId } = this.chapterData
        if (mediaId !== this.mediaId) {
          this.mediaId = mediaId
          this.$nextTick(() => {
            this.$refs.commentBoxRef.init()
          })
        }
      }
    },
    async getComicData() {
      if (!this.$route.query.comicId) {
        this.isInit = false
        return this.$toast('获取章节信息失败')
      } else {
        this.comicId = this.$route.query.comicId
      }
      const res = await comicById({
        comicId: this.comicId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        this.comicData = res.data
      }
    },
    handleBannerFinish(data) {
      this.showBanner = !!data.length
    },
    async getComicById() {
      if (!this.$route.query.comicId) {
        this.isInit = false
        return this.$toast('获取章节信息失败')
      } else {
        this.comicId = this.$route.query.comicId
      }
      this.chapterData = null
      if (this.$route.query.chapterId) {
        this.getChapterById(this.comicId, this.$route.query.chapterId)
      } else {
        const res = await pageChapterByComicId({
          pageNo: 1,
          pageSize: 1,
          comicId: this.comicId,
          merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        }).catch(() => {
          this.isInit = false
        })
        this.isInit = false
        if (res && res.code === 0) {
          const firstChapter = res.data.dataList[0]
          if (firstChapter) {
            this.getChapterById(this.comicId, firstChapter.chapterId)
          } else {
            return this.$toast('获取章节信息失败')
          }
        } else {
          return this.$toast('获取章节信息失败')
        }
      }
    },
    async getChapterById(comicId, chapterId) {
      const res = await chapterById({
        comicId,
        chapterId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      }).catch(() => {
        this.isInit = false
        return this.$toast('获取章节信息失败')
      })
      this.isInit = false
      if (res && res.code === 0) {
        this.chapterData = res.data
        if (this.chapterData.preview) {
        } else {
          this.godb.table('history').add({
            mediaId: comicId,
            chapterId: chapterId,
          })
        }
        if (this.chapterData.chapterVo.nextChapterId) {
          this.getNextChapterById(
            comicId,
            this.chapterData.chapterVo.nextChapterId
          )
        }
      } else {
        return this.$toast('获取章节信息失败')
      }
    },
    async getNextChapterById(comicId, chapterId) {
      const res = await chapterById({
        comicId,
        chapterId,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      })
      if (res && res.code === 0) {
        this.nextChapterData = res.data
      }
    },
    async getRecommendList(done, isRefresh) {
      this.loading = true
      const res = await listMediaByPageAndSortType({
        ...this.page,
        comicType: 9,
        orderType: 'SORT_PUBLISH',
      })
      this.loading = false
      done && done()
      if (res && res.code === 0) {
        let resultData = []
        if (this.bannerList.length) {
          resultData = this.insertAd2List(
            this.dataDic.inADNub || 10,
            res.data.dataList
          )
        } else {
          resultData = res.data.dataList
        }
        resultData = resultData.map(one => {
          if (one.type !== 'banner') {
            if (
              one.comicVo &&
              one.comicVo.comicCover &&
              one.comicVo.coverHeight
            ) {
              one['coverHeight'] =
                (one.comicVo.coverHeight / one.comicVo.coverWidth).toFixed(2) *
                  100 +
                '%'
            } else if (
              one.comicVo &&
              one.comicVo.chapterCover &&
              one.comicVo.chapterCoverHeight
            ) {
              one['coverHeight'] =
                (
                  one.comicVo.chapterCoverHeight / one.comicVo.chapterCoverWidth
                ).toFixed(2) *
                  100 +
                '%'
            } else if (
              one.chapterVo &&
              one.chapterVo.chapterCover &&
              one.chapterVo.coverHeight
            ) {
              one['coverHeight'] =
                (one.chapterVo.coverHeight / one.chapterVo.coverWidth).toFixed(
                  2
                ) *
                  100 +
                '%'
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
    onPrev() {
      this.$router.push({
        path: '/cartoonPlay',
        query: {
          comicId: this.comicId,
          chapterId: this.chapterData.chapterVo.preChapterId,
          payType: this.chapterData.payType,
        },
      })
    },
    onNext() {
      this.$router.push({
        path: '/cartoonPlay',
        query: {
          comicId: this.comicId,
          chapterId: this.chapterData.chapterVo.nextChapterId,
          payType: this.chapterData.payType,
        },
      })
    },
    handleEnded() {
      if (this.chapterData.preview) {
        this.onShowFeeReminder()
      }
    },
    onShowFeeReminder() {
      this.$refs.feeReminder.onShow()
    },
    handleRefresh() {
      this.getComicById()
    },
    onSearch(label) {
      this.$router.push({
        path: '/search',
        query: {
          label: label.tagName,
          mediaType: 9,
        },
      })
    },
    async onLike() {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        mediaId: this.chapterData.mediaId,
        favorType: this.chapterData.mediaType,
      }
      const res = await favorAdd(params)
      if (res && res.code === 0) {
        if (this.chapterData.hasFavor) {
          this.$set(
            this.chapterData,
            'favorCount',
            this.chapterData.favorCount - 1
          )
        } else {
          this.$set(
            this.chapterData,
            'favorCount',
            this.chapterData.favorCount + 1
          )
        }
        this.$set(this.chapterData, 'hasFavor', !this.chapterData.hasFavor)
      }
    },
    async onCollect() {
      if (this.chapterData.hasCollect) {
        const res = await cancelCollectMedia({
          merchantAcct: this.chapterData.merchantAcct,
          mediaType: this.chapterData.mediaType,
          mediaId: this.chapterData.mediaId,
        })
        if (res && res.code === 0) {
          this.$toast('取消成功')
          this.$set(
            this.chapterData,
            'hasCollect',
            !this.chapterData.hasCollect
          )
        }
      } else {
        const res = await collectMedia({
          merchantAcct: this.chapterData.merchantAcct,
          mediaType: this.chapterData.mediaType,
          mediaId: this.chapterData.mediaId,
        })
        if (res && res.code === 0) {
          this.$toast('收藏成功')
          this.$set(
            this.chapterData,
            'hasCollect',
            !this.chapterData.hasCollect
          )
        }
      }
    },
    onShare() {
      this.$refs.ShareDialogRef.onShow()
    },
    formatNum(num) {
      return formatStrNum(num)
    },
    onRoute(path) {
      this.$router.push(path)
    },
    onChangeLine() {
      if (this.cdnLineList.length <= 1) {
        this.$toast('没有更多可用线路')
      } else {
        this.$store.commit('CHANGE_CDNLINE')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
  background-color: #fff;
  color: #333333;
  .page-top {
    position: absolute;
    z-index: 1200;
  }
}
.page-content {
  flex: 1;
  overflow: hidden;
  .chapter-content {
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
        background: linear-gradient(
          to right,
          rgb(251 147 168),
          rgb(253 250 198)
        );
        font-size: 14px;
        color: rgb(7, 11, 31);
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1200;
      }
    }
    .vidoe-wraper.pc {
      height: 258px;
    }
    img {
      width: 100%;
      display: block;
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
          > span:first-child {
            margin-right: 4px;
          }
        }
        .info-label {
          margin: 6px 0;
          .info-bottom-status {
            font-size: 12px;
            color: #666666;
          }
        }
        .label-list {
          display: inline-flex;
          flex-flow: wrap;
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
          .comment-like {
            span {
              margin-right: 24px;
              display: inline-flex;
              align-items: center;
              font-size: 12px;
              cursor: pointer;
              img {
                width: 22px;
                margin-right: 6px;
              }
            }
            span:last-child {
              margin-right: 0;
            }
          }
        }
        .comic-like {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #666666;
          margin: 16px 0 0;
          > div {
            width: 20%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 6.3%;
            img {
              width: 24px;
              height: 24px;
              margin-right: 8px;
            }
          }
          > div:last-child {
            margin-right: 0;
          }
        }
      }
    }
    .recommend {
      margin: 16px 12px 0;
      .movie-title {
        margin-bottom: 12px;
      }
      .masonry-grid {
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
