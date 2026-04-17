<template>
  <div class="data-item" @click="onShow">
    <div class="data-top">
      <div class="free" v-if="itemInfo.payType === 1">限免</div>
      <div class="gold" v-if="itemInfo.payType === 2">
        <span>{{ itemInfo.goldPayUnit }}</span>
        <img src="@/assets/images/gold.png" />
      </div>
      <div class="level" v-if="itemInfo.payType === 3">
        Lv {{ itemInfo.userLevel || 0 }}
      </div>
      <div class="vip" v-if="itemInfo.payType === 4">VIP</div>
    </div>
    <div class="data-img">
      <img v-lazy="imageBase + itemInfo.comicVo.comicCover" />
    </div>
    <div class="data-status">
      {{ itemInfo.comicVo.chapterOver ? '已完结' : '连载中' }}
    </div>
    <div class="data-bottom">
      <div class="data-desc">
        <span class="data-name">{{ itemInfo.comicVo.comicName }}</span>
      </div>
      <div class="data-update">
        <div>{{ '更新至' + itemInfo.comicVo.chapterCurrentSeq }}</div>
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
import PubSub from 'pubsub-js'

export default {
  name: 'ComicsItem',
  props: {
    itemInfo: {
      type: Object,
      default: () => {
        return {}
      },
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
      this.$router.push({
        path: '/workDetail',
        query: {
          comicId: this.itemInfo.comicVo.comicId || this.itemInfo.mediaId,
        },
      })
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
  .data-top {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    .free {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #30d158;
      overflow: hidden;
      border-radius: 0 4px 0 4px;
    }
    .gold {
      padding: 4px 8px;
      font-size: 12px;
      color: #222222;
      background: rgb(255 227 0);
      overflow: hidden;
      border-radius: 0 4px 0 4px;
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
      border-radius: 0 4px 0 4px;
    }
    .vip {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #109fff;
      overflow: hidden;
      border-radius: 0 4px 0 4px;
    }
  }
  .data-img {
    display: block;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    img {
      width: 100%;
      height: auto;
    }
  }
  .data-bottom {
    .data-desc {
      width: 100%;
      padding: 2px 0;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .data-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .data-update {
      color: #109fff;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .tag-list {
        color: #5ac4ff;
        .tag-item {
          margin-left: 6px;
        }
      }
    }
  }
  .data-status {
    position: absolute;
    right: 0;
    bottom: 36px;
    background: #e6625c;
    border-radius: 4px;
    overflow: hidden;
    padding: 2px 6px;
    font-size: 10px;
    color: white;
  }
}
</style>
