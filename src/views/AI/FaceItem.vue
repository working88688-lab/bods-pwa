<template>
  <div class="data-item" :class="className" @click="onSelected(itemData)">
    <div class="content" :style="{ paddingTop: coverHeight }">
      <img v-lazy="imageBase + itemData.aiCover" alt="" />
      <van-icon class="paly" name="play-circle" />
      <div class="hot">
        <van-icon name="fire" />
        <span>热门</span>
      </div>
      <div class="count" v-if="itemData.aiCount + itemData.fakeCount > 0">
        {{ itemData.aiCount + itemData.fakeCount + '人使用' }}
      </div>
    </div>
    <div class="title">{{ itemData.templateName }}</div>
  </div>
</template>

<script>
import { formatStrNum, formatDuration } from '@/utils/tools'

export default {
  name: 'FaceItem',
  props: {
    className: {
      type: String,
      default: '',
    },
    itemData: {
      type: Object,
      default: {},
    },
    coverWidth: {
      type: String,
      default: '100%',
    },
    coverHeight: {
      type: String,
      default: 'auto',
    },
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
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
    formatDurationStr(num) {
      return formatDuration(num)
    },
    onSelected(itemData) {
      this.$emit('onSelected', itemData)
    },
    onPlayVideo(event) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      } else {
        window.event.cancelBubble = true
      }
      this.$emit('onPlayVideo', this.itemData)
    },
  },
}
</script>

<style lang="less" scoped>
.data-item {
  width: 100%;
  margin-bottom: 16px;
  .content {
    position: relative;
    .paly {
      width: 30px;
      height: 30px;
      font-size: 30px;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      margin: auto;
      z-index: 10;
      color: rgba(255, 255, 255, .5);
    }
    & > img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      vertical-align: middle;
      z-index: 1;
      border-radius: 8px;
      object-fit: cover;
    }
    .hot {
      width: fit-content;
      height: fit-content;
      position: absolute;
      bottom: 6px;
      right: 6px;
      display: flex;
      align-items: center;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.3);
      z-index: 10;
      color: var(--theme-color);
      font-size: 10px;
      padding: 4px 8px;
      .van-icon {
        margin-right: 4px;
      }
    }
    .count {
      position: absolute;
      left: 6px;
      top: 6px;
      width: fit-content;
      background: linear-gradient(to right, #93e8fb, #c7c6fd);
      color: #294986;
      font-size: 10px;
      padding: 4px 8px;
      border-radius: 999px;
      z-index: 10;
    }
  }
  .title {
    text-align: left;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    margin-top: 8px;
  }
}
</style>
