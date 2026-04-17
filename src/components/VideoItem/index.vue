<template>
  <div class="movie-item" @click="onPlay(videoInfo.video)">
    <div class="video-top">
      <div class="free" v-if="videoInfo.payType === 1">限免</div>
      <div class="gold" v-if="videoInfo.payType === 2">
        <span>{{ videoInfo.goldPayUnit }}</span>
        <img src="@/assets/images/gold.png" />
      </div>
      <div class="level" v-if="videoInfo.payType === 3">
        Lv {{ videoInfo.userLevel || 0 }}
      </div>
      <div class="vip" v-if="videoInfo.payType === 4">VIP</div>
    </div>
    <div
      class="video-cover"
      v-lazy:background-image="
        videoInfo.video.videoCoverImg.indexOf('http') > -1
          ? videoInfo.video.videoCoverImg
          : imageBase + videoInfo.video.videoCoverImg
      "
    >
      <div class="like">
        <img v-if="videoInfo.hasFavor" src="@/assets/images/iconMyLike.png" />
        <img v-else src="@/assets/images/iconLike5.png" />
        <span>{{
          formatNum(videoInfo.fakeFavorCount + videoInfo.favorCount) || 0
        }}</span>
      </div>
    </div>
    <div class="bottom">
      <div>{{ videoInfo.video.videoTitle }}</div>
      <!-- <div class="tag-list" v-if="videoInfo.tagList && videoInfo.tagList.length">
                <span class="tag-item" v-for="(tag, idx) in videoInfo.tagList" :key="idx">{{ tag.tagName }}</span>
            </div> -->
    </div>
  </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'

export default {
  name: 'MovieItem',
  props: {
    videoInfo: {
      type: Object,
      default: {},
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  data() {
    return {}
  },
  created() {
    this.videoInfo.tagList = this.videoInfo.tagList.splice(0, 3)
  },
  methods: {
    formatNum(num) {
      return formatStrNum(num)
    },
    onPlay() {
      this.$router.push({
        path: '/videoPlayer',
        query: {
          shortVideoId: this.videoInfo.mediaId,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.movie-item {
  width: 97% / 2;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  .video-top {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    .free {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #30d158;
      overflow: hidden;
      border-radius: 6px 0 6px 0;
    }
    .gold {
      padding: 4px 8px;
      font-size: 12px;
      color: #222222;
      background: rgb(255 227 0);
      overflow: hidden;
      border-radius: 6px 0 6px 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      img {
        width: 9px;
        height: 9px;
        margin-left: 4px;
      }
    }
    .level {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #ff613d;
      overflow: hidden;
      border-radius: 6px 0 6px 0;
    }
    .vip {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #109fff;
      overflow: hidden;
      border-radius: 6px 0 6px 0;
    }
  }
  .video-cover {
    height: 218px;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    background-position: center;
    background-size: 100%;
    background-repeat: no-repeat;
    background-color: #222222;
    .like {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6));
      padding: 8px;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #f0f0f0;
      img {
        width: 14px;
        margin-right: 4px;
      }
    }
  }
  .bottom {
    padding: 8px 0 0;
    > div:first-child {
      width: 100%;
      font-size: 12px;
      margin: 6px 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .like {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      img {
        width: 16px;
        margin-right: 6px;
      }
    }
    .tag-list {
      white-space: nowrap;
      .tag-item {
        background: #109fff;
        color: #fff;
        padding: 2px 6px;
        font-size: 12px;
        margin-right: 4px;
        border-radius: 2px;
      }
    }
  }
}
</style>
