<template>
  <div class="data-item" @click="onPlay(liveInfo)">
    <div class="data-top">
      <div class="free" v-if="liveInfo.payType === 1">限免</div>
      <div class="gold" v-if="liveInfo.payType === 2">
        <span>{{ liveInfo.goldPayUnit }}金币</span>
        <img src="@/assets/images/gold.png" />
      </div>
      <div class="level" v-if="liveInfo.payType === 3">
        Lv {{ liveInfo.userLevel || 0 }}
      </div>
      <div class="vip" v-if="liveInfo.payType === 4">VIP</div>
    </div>
    <img
      class="actor-img"
      v-if="liveInfo.anchor.isOnline"
      v-lazy="
        liveInfo.liveImage && liveInfo.liveImage.indexOf('http') > -1
          ? liveInfo.liveImage
          : imageBase + liveInfo.liveImage
      "
    />
    <img
      class="actor-img"
      v-else
      v-lazy="
        liveInfo.anchor.avatarUrl &&
        liveInfo.anchor.avatarUrl.indexOf('http') > -1
          ? liveInfo.anchor.avatarUrl
          : imageBase + liveInfo.anchor.avatarUrl
      "
    />
    <div class="actor-bottom">
      <div class="actor-desc">
        <span class="actor-name">{{
          liveInfo.anchor.name || liveInfo.anchor.username
        }}</span>
        <!-- <template v-for="(country, idx) in countryList">
                    <span class="actor-country" v-if="country.value === liveInfo.anchor.country" :key="idx">
                        {{ country.text }}
                    </span>
                </template> -->
        <div class="status" :class="{ online: liveInfo.anchor.isOnline }">
          {{ liveInfo.anchor.isOnline ? '在线' : '离线' }}
        </div>
      </div>
      <div class="actor-number">
        <div>
          <img src="@/assets/images/hot.png" alt="" />
          <span>{{ formatNum(liveInfo.anchor.favoritedCount) }}</span>
        </div>
        <div>
          <img src="@/assets/images/peoples.png" alt="" />
          <span>{{ formatNum(liveInfo.anchor.viewersCount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatStrNum, formatDuration } from '@/utils/tools'

export default {
  name: 'LiveItem',
  props: {
    liveInfo: {
      type: Object,
      default: {},
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
    return {
      countryList: [
        { text: '中国', value: 'cn' },
        { text: '香港', value: 'hk' },
        { text: '日本', value: 'jp' },
        { text: '澳门', value: 'mo' },
        { text: '台湾', value: 'tw' },
        { text: '韩国', value: 'kr' },
      ],
    }
  },
  created() {
    this.liveInfo['liveImage'] =
      this.liveInfo.anchor.previewUrlThumbBig ||
      this.liveInfo.anchor.avatarUrl ||
      this.liveInfo.anchor.previewUrl ||
      this.liveInfo.anchor.previewUrlThumbSmall
  },
  methods: {
    formatNum(num) {
      return formatStrNum(num)
    },
    formatDurationStr(num) {
      return formatDuration(num)
    },
    onPlay(anchorInfo) {
      this.$router.push({
        path: '/live',
        query: {
          actorId: anchorInfo.mediaId,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.data-item {
  width: 48.5%;
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  .data-top {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    .free {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #30d158;
      overflow: hidden;
      border-radius: 4px 4px 4px 0;
    }
    .gold {
      padding: 4px 8px;
      font-size: 12px;
      color: #222222;
      background: rgb(255 227 0);
      overflow: hidden;
      border-radius: 4px 4px 4px 0;
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
      border-radius: 4px 4px 4px 0;
    }
    .vip {
      padding: 4px 8px;
      font-size: 12px;
      color: #fff;
      background: #109fff;
      overflow: hidden;
      border-radius: 4px 4px 4px 0;
    }
  }
  .actor-img {
    display: block;
    width: 100%;
    height: 132px;
    object-fit: cover;
  }
  .actor-bottom {
    background: #fff;
    padding: 8px;
    .actor-desc {
      width: 100%;
      height: 21px;
      line-height: 18px;
      padding: 5px 0;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .actor-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .status {
        padding: 1px 4px;
        font-size: 12px;
        color: #fff;
        background: #5c5c5c;
        overflow: hidden;
        border-radius: 2px;
      }
      .online {
        background: #1fb774;
      }
    }
    .actor-number {
      display: flex;
      align-items: center;
      margin-top: 8px;
      font-size: 12px;
      > div {
        display: inline-flex;
        align-items: center;
        margin-right: 32px;
        img {
          width: 12px;
          margin-right: 4px;
        }
      }
    }
  }

  .actor-cp {
    position: absolute;
    left: 5px;
    bottom: 34px;
    background: #109fff;
    border-radius: 4px;
    overflow: hidden;
    padding: 6px 12px;
    font-size: 10px;
    color: white;
  }
}
</style>
