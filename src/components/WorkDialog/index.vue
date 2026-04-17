<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    :style="{ height: '500px', 'max-height': '80%', background: '#fff' }"
    @closed="onClose"
  >
    <div class="popup-content" v-if="workDetail">
      <div class="popup-top">
        <div class="popup-title">作品详情</div>
        <div
          class="btn-collect"
          :class="{ 'btn-collected': workDetail.hasCollect }"
          @click="onCollect"
        >
          {{ workDetail.hasCollect ? '取消收藏' : '收藏' }}
        </div>
      </div>
      <div class="popup-info">
        <div class="popup-cover">
          <img :src="imageBase + workDetail.comicVo.comicCover" />
        </div>
        <div class="popup-data">
          <div class="popup-title">{{ workDetail.comicVo.comicName }}</div>
          <div class="popup-author">
            {{
              workDetail.comicVo.comicAuthor +
              ' | 共' +
              workDetail.comicVo.chapterTotal +
              '话'
            }}
          </div>
          <div class="popup-tag">
            <div class="tag-item" v-for="(tag, idx) in workDetail.tagList">
              {{ tag.tagName }}
            </div>
          </div>
        </div>
      </div>
      <div class="popup-desc">
        <div class="popup-desc-title">作品简介</div>
        <div class="popup-desc-content">{{ workDetail.comicVo.comicDesc }}</div>
      </div>
    </div>
    <div class="btn-box">
      <van-button round class="mr-24" @click="onDetail">作品详情</van-button>
      <van-button round type="primary" @click="onPlay">开始阅读</van-button>
    </div>
  </van-popup>
</template>

<script>
import { collectMedia, cancelCollectMedia } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import PubSub from 'pubsub-js'

export default {
  name: 'WorkDialog',
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  data() {
    return {
      show: false,
      workDetail: null,
    }
  },
  created() {
    PubSub.subscribe('SHOW_WORK_DETAIL', (msg, data) => {
      this.workDetail = data
      this.show = true
    })
  },
  beforeDestroy() {
    PubSub.unsubscribe('SHOW_WORK_DETAIL')
  },
  methods: {
    formatNum(num) {
      return formatStrNum(num)
    },
    onClose() {
      this.show = false
      this.workDetail = null
    },
    onPlay() {
      if (this.workDetail.mediaType === 8) {
        this.$router.push({
          path: '/comicsPlay',
          query: {
            comicId: this.workDetail.comicVo.comicId,
          },
        })
      } else if (this.workDetail.mediaType === 9) {
        this.$router.push({
          path: '/cartoonPlay',
          query: {
            comicId: this.workDetail.comicVo.comicId,
            payType: this.workDetail.payType,
          },
        })
      } else if (this.workDetail.mediaType === 10) {
        this.$router.push({
          path: '/fictionPlay',
          query: {
            comicId: this.workDetail.comicVo.comicId,
          },
        })
      }
      this.onClose()
    },
    onDetail() {
      if (this.workDetail.mediaType === 8) {
        this.$router.push({
          path: '/comicsDetail',
          query: {
            comicId: this.workDetail.comicVo.comicId,
          },
        })
      } else if (this.workDetail.mediaType === 9) {
        this.$router.push({
          path: '/cartoonDetail',
          query: {
            comicId: this.workDetail.comicVo.comicId,
          },
        })
      } else if (this.workDetail.mediaType === 10) {
        this.$router.push({
          path: '/fictionDetail',
          query: {
            comicId: this.workDetail.comicVo.comicId,
          },
        })
      }
      this.onClose()
    },
    async onCollect() {
      if (this.workDetail.hasCollect) {
        const res = await cancelCollectMedia({
          merchantAcct: this.workDetail.merchantAcct,
          mediaType: this.workDetail.mediaType,
          mediaId: this.workDetail.mediaId,
        })
        if (res && res.code === 0) {
          this.$toast('取消成功')
          this.$set(this.workDetail, 'hasCollect', !this.workDetail.hasCollect)
        }
      } else {
        const res = await collectMedia({
          merchantAcct: this.workDetail.merchantAcct,
          mediaType: this.workDetail.mediaType,
          mediaId: this.workDetail.mediaId,
        })
        if (res && res.code === 0) {
          this.$toast('收藏成功')
          this.$set(this.workDetail, 'hasCollect', !this.workDetail.hasCollect)
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.popup-content {
  height: calc(100% - 75px);
  overflow-y: auto;
  .popup-top {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    .popup-title {
      width: calc(100% - 64px);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 12px;
    }
    .btn-collect {
      width: 64px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      border-radius: 12px;
      font-size: 13px;
      color: #fff;
      background: #109fff;
      box-sizing: border-box;
    }
    .btn-collected {
      background: #fff;
      color: #109fff;
      border: 1px solid #109fff;
    }
  }
  .popup-info {
    padding: 0 16px;
    display: flex;
    align-items: center;
    .popup-cover {
      width: 75px;
      height: 100px;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .popup-data {
      width: calc(100% - 75px);
      padding-left: 16px;
      .popup-title {
        font-size: 15px;
        font-weight: bold;
        color: #333333;
      }
      .popup-author {
        font-size: 12px;
        color: #666666;
        margin: 8px 0;
      }
      .popup-tag {
        .tag-item {
          display: inline-block;
          padding: 4px 12px;
          font-size: 12px;
          color: #fff;
          background: #109fff;
          border-radius: 16px;
          margin: 0 12px 12px 0;
        }
      }
    }
  }
  .popup-desc {
    padding: 16px;
    .popup-desc-title {
      font-size: 14px;
      color: #333333;
      margin-bottom: 12px;
    }
    .popup-desc-content {
      font-size: 12px;
      line-height: 1.5;
      color: #666666;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
    }
  }
}
.btn-box {
  padding: 12px;
  .van-button {
    width: calc((100% - 24px) / 2);
    border-radius: 24px;
  }
  .van-button--default {
    color: #109fff;
    background: #fff;
    border: 1px solid #109fff;
  }
}
</style>
