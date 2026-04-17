<template>
  <div class="data-item" @click="onShow">
    <div class="data-img">
      <div class="data-top">
        <div class="free" v-if="itemInfo.payType === 1">限免</div>
        <div class="gold" v-if="itemInfo.payType === 2">
          <span>金币</span>
          <img src="@/assets/images/gold.png" />
        </div>
        <div class="level" v-if="itemInfo.payType === 3">
          Lv {{ itemInfo.userLevel || 0 }}
        </div>
        <div class="vip" v-if="itemInfo.payType === 4">VIP</div>
      </div>
      <div
        class="cover-img"
        :style="{ width: coverWidth, 'padding-top': coverHeight }"
        v-if="itemInfo.mediaType === 9"
      >
        <img v-lazy="imageBase + itemInfo.comicVo.chapterCover" />
      </div>
      <div
        class="cover-img"
        :style="{ width: coverWidth, 'padding-top': coverHeight }"
        v-else
      >
        <img v-lazy="imageBase + itemInfo.comicVo.comicCover" />
      </div>
      <div class="data-status">
        {{ itemInfo.comicVo.chapterOver ? '已完结' : '连载中' }}
      </div>
    </div>
    <div class="data-bottom">
      <div class="data-desc">
        <span class="data-name">{{ itemInfo.comicVo.comicName }}</span>
      </div>
      <div class="data-update">
        <div v-if="itemInfo.comicVo.chapterOver" class="view-num">
          <van-icon name="eye-o" />
          <span>{{
            formatNum(itemInfo.fakeViewCount + itemInfo.viewCount) || 0
          }}</span>
        </div>
        <div v-else>{{ '更新至' + itemInfo.comicVo.chapterCurrentSeq }}</div>
        <div class="tag-list">
          <span
            class="tag-item"
            v-for="(tag, idx) in itemInfo.tagList"
            :key="idx"
            >{{ tag.tagName }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'

export default {
  name: 'ComicsItem',
  props: {
    itemInfo: {
      type: Object,
      default: () => {
        return {}
      },
    },
    coverWidth: {
      type: String,
      default: '100%',
    },
    coverHeight: {
      type: String,
      default: 'auto',
    },
    isReplace: {
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
  created() {},
  methods: {
    formatNum(num) {
      return formatStrNum(num)
    },
    onShow() {
      if (this.isReplace) {
        this.$router.replace({
          path: '/workDetail',
          query: {
            comicId: this.itemInfo.comicId || this.itemInfo.mediaId,
          },
        })
      } else {
        this.$router.push({
          path: '/workDetail',
          query: {
            comicId: this.itemInfo.comicId || this.itemInfo.mediaId,
          },
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.data-item {
  margin-bottom: 12px;
  overflow: hidden;
  position: relative;
  color: #292a38;
  cursor: pointer;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 0 12px #cecece40;
  .data-top {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 12px;
    .free {
      padding: 3px 6px;
      color: #fff;
      background: #1fb774;
      overflow: hidden;
      border-radius: 4px;
    }
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
  .data-img {
    display: block;
    width: 100%;
    overflow: hidden;
    position: relative;
    .cover-img {
      position: relative;
      > img {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        object-fit: cover;
      }
    }
  }
  .data-status {
    position: absolute;
    right: 0;
    bottom: 0;
    background: #e6625c;
    border-radius: 4px;
    overflow: hidden;
    padding: 2px 6px;
    font-size: 10px;
    color: white;
  }
  .data-bottom {
    padding: 5px;
    .data-desc {
      width: 100%;
      padding: 0 0 4px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .data-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }
    .data-update {
      color: #109fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .view-num {
        color: #999999;
        display: inline-flex;
        align-items: center;
        .van-icon {
          font-size: 16px;
          margin-right: 2px;
        }
      }
      .tag-list {
        color: #5ac4ff;
        .tag-item {
          margin-left: 6px;
        }
      }
    }
  }
}
</style>
