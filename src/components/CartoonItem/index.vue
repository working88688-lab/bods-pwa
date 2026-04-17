<template>
  <div
    class="movie-item"
    :class="{ 'movie-item-large': largeItem }"
    :style="{ width: width }"
    @click="onShow"
  >
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
      :style="{ height: height }"
      :class="{ 'cover-border': showBorder, pc: device === 'pc' }"
      v-lazy:background-image="
        videoInfo.comicVo.comicCover.indexOf('http') > -1
          ? videoInfo.comicVo.comicCover
          : imageBase + videoInfo.comicVo.comicCover
      "
    >
      <img
        v-if="showStart"
        class="start-img"
        src="@/assets/images/player_play.png"
      />
    </div>
    <div class="video-bottom">
      <div class="video-title">{{ videoInfo.comicVo.comicName }}</div>
      <div class="video-status">
        {{
          videoInfo.comicVo.chapterOver
            ? '已完结'
            : '更新至' + videoInfo.comicVo.chapterCurrentSeq
        }}
      </div>
    </div>
  </div>
</template>

<script>
import { formatStrNum, formatDuration } from '@/utils/tools'
import PubSub from 'pubsub-js'

export default {
  name: 'cartoonItem',
  props: {
    videoInfo: {
      type: Object,
      default: {},
    },
    small: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    },
    ableClick: {
      type: Boolean,
      default: true,
    },
    showLike: {
      type: Boolean,
      default: true,
    },
    showBorder: {
      type: Boolean,
      default: false,
    },
    showStart: {
      type: Boolean,
      default: false,
    },
    largeItem: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    device() {
      return this.$store.state.device
    },
  },
  data() {
    return {}
  },
  created() {},
  methods: {
    formatNum(num) {
      return formatStrNum(num)
    },
    formatDurationStr(num) {
      return formatDuration(num)
    },
    onShow() {
      this.$router.push({
        path: '/workDetail',
        query: {
          comicId: this.videoInfo.comicVo.comicId || this.videoInfo.mediaId,
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
  cursor: pointer;
  border-radius: 8px;
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
      border-radius: 4px 0 4px 0;
    }
    .gold {
      padding: 4px 8px;
      font-size: 12px;
      color: #222222;
      background: rgb(255 227 0);
      overflow: hidden;
      border-radius: 4px 0 4px 0;
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
      font-size: 12px;
      color: #fff;
      background: #ff613d;
      overflow: hidden;
      border-radius: 4px 0 4px 0;
    }
    .vip {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #109fff;
      overflow: hidden;
      border-radius: 4px 0 4px 0;
    }
  }
  .video-cover {
    height: 96px;
    overflow: hidden;
    position: relative;
    background-position: top;
    background-size: 100%;
    background-repeat: no-repeat;
    background-color: #222222;
    .start-img {
      width: 64px;
      height: 64px;
      position: absolute;
      top: calc((100% - 64px) / 2);
      left: calc((100% - 64px) / 2);
    }
    .bottom {
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 4px 0;
      color: #f8f8f8;
      z-index: 1;
      font-size: 12px;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0.5)
      );
      .like {
        display: inline-flex;
        align-items: center;
        img {
          width: 16px;
          margin-right: 4px;
        }
      }
      .duration {
        padding: 4px;
      }
    }
  }
  .video-cover[lazy='loading'],
  .video-cover[lazy='error'] {
    background-position: center;
  }
  .video-cover.pc {
    height: 118px;
  }
  .cover-border {
    border: 1px solid #d92514;
  }
  .video-bottom {
    .video-title {
      width: 100%;
      font-size: 12px;
      margin: 6px 0 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .video-status {
      font-size: 12px;
      color: #d92514;
    }
  }
}
.movie-item-large {
  width: 100%;
  margin-right: 0;

  .video-cover {
    height: 190px;
  }
}
.V_H2L2 {
  .movie-item {
    width: 97% / 2;
    margin-right: 3%;
    .video-cover {
      height: 240px;
    }
  }
  .movie-item:nth-child(2n) {
    margin-right: 0;
  }
}
.V_H1L1 {
  .movie-item {
    width: 100%;
    .video-cover {
      height: 190px;
    }
  }
}
.V_H1L2,
.V_H2_2_2 {
  .movie-item {
    width: 97% / 2;
    margin-right: 3%;
    .video-cover {
      height: 96px;
    }
  }
  .movie-item:nth-child(2n) {
    margin-right: 0;
  }
}
.V_H2L3 {
  .movie-item {
    width: 94% / 3;
    margin-right: 3%;
    .video-cover {
      height: 146px;
    }
  }
  .movie-item:nth-child(3n) {
    margin-right: 0;
  }
}
.V_H3_1_2_2 {
  .movie-item:nth-child(1) {
    width: 100%;
    .video-cover {
      height: 192px;
    }
  }
  .movie-item:not(:first-child) {
    width: 97% / 2;
    margin-right: 3%;
    .video-cover {
      height: 96px;
    }
  }
  .movie-item:nth-child(2n + 1) {
    margin-right: 0;
  }
}
.V_H1_6 {
  .movie-item {
    width: calc((230% - 10%) / 6);
    margin-right: 2%;
    .video-cover {
      height: 85px;
    }
  }
  .movie-item:nth-child(6) {
    margin-right: 0;
  }
}
.V_H2_1_5 {
  .movie-item {
    width: 100%;
    .video-cover {
      height: 192px;
      overflow: hidden;
    }
  }
}
</style>
