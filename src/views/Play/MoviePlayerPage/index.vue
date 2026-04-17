<template>
  <div class="page-container flex-container">
    <div class="page-top">
      <Header v-if="!isInit" textColor="#fff" :arrowBg="true" width="auto" @onClickLeft="onBack" />
    </div>
    <Loading v-if="isInit" />
    <MaskComponent v-if="show && !isInit" />
    <template v-else-if="!show && !isInit">
      <div class="empty-box" v-if="!videoInfo">
        <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="100" description="暂无内容" />
      </div>
      <div class="page-main flex-container" v-else>
        <div class="video-content">
          <div :class="'vidoe-wraper'">
            <VideoPlayer :id="videoInfo.mediaId" idName="MoviePlayer" :mediaType="videoInfo.mediaType"
              :video="videoInfo.video.videoUrl" :videoCover="videoInfo.video.videoCoverImg" :adData="adData()"
              :isAddView="!videoInfo.preview" :isShowDialogAd="showAdDialog" :isAutoCloseAd="false" @ended="handleEnded"
              @close-popup="close" :isCanPlay="videoCanPlayer" />
          </div>
          <VideoInfo :videoInfo="videoInfo" @onComment="handleComment" />
        </div>
        <div class="page-content">
          <VideoImagePreview v-if="showVideoImagePreview" :previewImgValue="videoInfo && videoInfo.video.previewImg" :height="100" />
          <div class="banner-wraper" v-if="showBanner">
            <Banner location="video_detail_page" />
          </div>
          <RecommendList :videoInfo="videoInfo" />
        </div>
      </div>
    </template>
    <Comment ref="comment" :videoInfo="videoInfo" @addComment="handleAddComment" />
    <FeeReminder ref="feeReminder" :videoInfo="videoInfo" @onRefresh="handleRefresh" />
    <PlayAdDialog :onFinished="handleFinishedAd" @open="showAdDialog = true" @close="showAdDialog = false" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Advertise from '@/components/Advertise'
import MovieItem from '@/components/MovieItem'
import { getMediaById, listMediaBySearchType, favorAdd } from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import VideoPlayer from '@/components/VideoPlayer'
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import Banner from '@/components/Banner'
import Comment from '@/components/Comment'
import Loading from '@/components/Loading'
import FeeReminder from './FeeReminder'
import _ from 'lodash'
import { banner } from '@/apis/data'
import BannerItem from '@/components/BannerItem'
import Masonry from 'masonry-layout'
import PlayAdDialog from '@/components/PlayAdDialog'
import VideoInfo from './VideoInfo'
import RecommendList from './RecommendList'
import MaskComponent from "../../Darknet/Mask.vue";
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
    Comment,
    Loading,
    FeeReminder,
    BannerItem,
    PlayAdDialog,
    VideoInfo,
    RecommendList,
    Advertise,
    MaskComponent,
    VideoImagePreview
  },
  data() {
    return {
      isInit: true,
      videoId: null,
      categoryId: null,
      videoInfo: null,
      recommendList: [],
      showComment: false,
      isRefresh: true,
      showBanner: true,
      isLoadingAd: false,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      loading: false,
      adList: [],
      showAdDialog: false,
      videoCanPlayer: false,
      show: false,
    }
  },
  watch: {
    $route: {
      handler(newval, oldval) {
        if (newval) {
          if (newval.path === '/moviePlayer' && newval.query.videoId !== this.videoId) {
            this.init()
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
    device() {
      return this.$store.state.device
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    tip() {
      if (
        this.$store.state.banner &&
        this.$store.state.banner['darknet_tips'] &&
        this.$store.state.banner['darknet_tips'].length
      ) {
        return this.$store.state.banner['darknet_tips'][0]
      } else {
        return null
      }
    },
    showVideoImagePreview() {
      return this.videoInfo && this.videoInfo.video.previewImg
    }
  },
  created() {
    this.init()
  },
  activated() {
    this.videoCanPlayer = true
    // 默认关闭评论弹窗，试看弹窗
    this.$refs.feeReminder && this.$refs.feeReminder.onClose()
    this.$refs.comment && this.$refs.comment.onCloseComment()
  },
  deactivated() {
    this.videoCanPlayer = false
  },
  updated() {
    const LayoutDom = document.querySelector('.masonry-grid')
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.gutter-size',
      })
    }
  },
  methods: {
    adData() {
      if (
        this.$store.state.banner &&
        this.$store.state.banner['movie_ad'] &&
        this.$store.state.banner['movie_ad'].length
      ) {
        return _.sample(this.$store.state.banner['movie_ad'])
      } else {
        return null
      }
    },
    handleComment() {
      this.$refs.comment.onShowComment()
    },
    handleFinishedAd() {
      this.showAdDialog = false
    },
    close() {
      this.showPop = false
    },
    onBack() {
      this.$router.go(-1)
    },
    async init() {
      this.videoId = this.$route.query.videoId
      this.categoryId = this.$route.query.categoryId
      this.videoInfo = null
      this.isInit = true
      this.show = false
      if (!this.videoId) {
        return this.$router.go(-1)
      }
      this.getVideoInfo()
    },
    async getVideoInfo() {
      const params = {
        mediaId: this.videoId,
        mediaType: 1,
      }
      this.isInit = true
      const res = await getMediaById(params).catch(() => {
        if (!this.isLoadingAd) {
          this.isInit = false
        }
      })
      if (!this.isLoadingAd) {
        this.isInit = false
      }
      this.isRefresh = true
      if (res && res.code === 0) {
        this.videoInfo = res.data
        res.data.needVipCode && (this.show = !!res.data.needVipCode.length)
      } else {
        this.videoInfo = null
      }
    },
    handleAddComment() {
      this.$set(this.videoInfo, 'commentCount', this.videoInfo.commentCount + 1)
    },
    onShowFeeReminder() {
      this.$nextTick(() => {
        this.$refs.feeReminder.onShow()
      })
    },
    handleRefresh() {
      this.isRefresh = false
      this.getVideoInfo()
    },
    handleEnded() {
      if (this.videoInfo.preview) {
        this.onShowFeeReminder()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-top: var(--safe-area-top);

  .mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2999;

    .tip {
      width: 100%;
      height: 100%;
      border-radius: 0;

      ::v-deep img {
        object-fit: cover;
        border-radius: 0;
      }
    }

    .van-icon {
      position: absolute;
      z-index: 2;
      font-size: 24px;
      top: calc(var(--safe-area-top) + 10px);
      left: 15px;
      background: #222;
      width: 32px;
      height: 32px;
      border-radius: 99px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .page-top {
    position: absolute;
    top: calc(var(--safe-area-top));
    left: 0;
    z-index: 1200;
  }
}

.page-main {
  .vidoe-wraper {
    height: 210px;
    margin-bottom: 12px;
    position: relative;
    padding-top: calc(100% * (14 / 25));

    .video-player-box {
      position: absolute;
      top: 0;
      left: 0;
    }
  }

  .vidoe-wraper.pc {
    height: 258px;
  }

  .video-content {
    background: #111111;
    padding: 0 0 12px;
  }

  .page-content {
    flex: 1;
    overflow: auto;

    .banner-wraper {
      padding: 0 12px;
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
}
</style>
