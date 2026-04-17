<template>
  <div class="layout">
    <div class="header">
      <div class="title">
        <img
          class="title-icon"
          v-if="data.categoryCoverImg"
          :src="imageBase + data.categoryCoverImg"
          alt=""
        />
        <span>{{ data.categoryName }}</span>
      </div>
      <div class="more" v-if="showMore" @click="$emit('more')">
        <span>更多</span>
        <van-icon name="arrow" />
      </div>
    </div>
    <div class="content">
      <div
        v-for="item in data.mediaList.slice(0, 4)"
        :key="item.mediaId"
        @click="$emit('item', item)"
      >
        <div class="img-box">
          <img v-lazy="imageBase + item.video.videoCoverImg" alt="" />
          <div class="tag" :class="usePayType(item).class">
            <img
              v-if="item.payType === 2"
              src="@/assets/images/tag_icon.png"
              alt=""
            />
            {{ usePayType(item).text }}
          </div>
          <div class="time">{{ formatDuration(item.video.videoDuration) }}</div>
        </div>
        <div class="van-ellipsis name">{{ item.video.videoTitle }}</div>
      </div>
    </div>
    <div class="btns" v-if="!showMore">
      <div @click="$emit('change', 4)">换一批</div>
      <div @click="$emit('more')">查看更多</div>
    </div>
  </div>
</template>

<script>
import { usePayType } from './utils'
import { formatDuration } from '@/utils/tools'

export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    showMore: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  data() {
    return { usePayType, formatDuration }
  },
}
</script>

<style scoped lang="less">
.layout {
  margin-bottom: 15px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    .title {
      font-size: 18px;
      line-height: 1.5;
      color: #222;
      display: flex;
      align-items: center;
      img {
        width: 24px;
        height: 24px;
        vertical-align: middle;
        margin-right: 4px;
      }
    }
    .more {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--theme-color);
    }
  }
  .content {
    display: flex;
    flex-wrap: wrap;
    & > div {
      background: #fff;
      border-radius: 8px;
      margin-bottom: 15px;
      width: calc((100% - 12px) / 2);
      flex-shrink: 0;
      &:nth-of-type(2n) {
        margin-left: 12px;
      }
      .img-box {
        padding-top: calc((93 / 168) * 100%);
        position: relative;
        & > img {
          border-radius: 8px 8px 0 0;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          vertical-align: middle;
        }
        .tag {
          position: absolute;
          top: 0;
          left: 0;
          color: #fff;
          font-size: 12px;
          padding: 2px 10px;
          border-radius: 6px 0 6px 0;
          width: fit-content;
          z-index: 2;
          &.free {
            background: #71d19c;
          }
          &.gold {
            background: #ffe300;
            color: #333;
            display: flex;
            align-items: center;
            img {
              width: 12px;
              height: 12px;
              align-items: center;
              margin-right: 4px;
              vertical-align: middle;
            }
          }
          &.level {
            background: #ff613d;
          }
          &.vip {
            background: var(--theme-color);
          }
        }
        .time {
          color: #fff;
          position: absolute;
          bottom: 6px;
          right: 6px;
          z-index: 2;
          font-size: 12px;
        }
      }
      .name {
        font-size: 13px;
        line-height: 1.5;
        margin: 6px;
      }
    }
  }
  .btns {
    display: flex;
    justify-content: space-around;
    text-align: center;
    font-size: 14px;
    & > div:first-of-type {
      width: 40%;
      background: #fff;
      color: #000;
      border-radius: 8px;
      padding: 8px 0;
    }
    & > div:last-of-type {
      width: 40%;
      background: var(--theme-color);
      color: #fff;
      padding: 8px 0;
      border-radius: 8px;
    }
  }
}
</style>
