<template>
  <div class="data-item" @click="onPlay(actorInfo)">
    <!-- <div class="data-top">
            <div class="free" v-if="(actorInfo.payType === 1)">限免</div>
            <div class="gold" v-if="(actorInfo.payType === 2)">
                <span>{{ actorInfo.goldPayUnit }}</span>
                <img src="@/assets/images/gold.png" />
            </div>
            <div class="level" v-if="(actorInfo.payType === 3)">Lv {{ actorInfo.userLevel || 0 }}</div>
            <div class="vip" v-if="(actorInfo.payType === 4)">VIP</div>
        </div> -->
    <div
      class="actor-img"
      v-lazy:background-image="imageBase + actorInfo.actor.actorCoverImg"
    >
      <span
        >{{
          formatNum(
            actorInfo.actor.totalOrderNum + actorInfo.actor.fakeOrderNum
          ) || 0
        }}人约过</span
      >
    </div>
    <div class="actor-bottom">
      <div class="actor-name">{{ actorInfo.actor.actorName }}</div>
      <!-- <div class="actor-desc">{{ actorInfo.actor.actorServiceDetail }}</div> -->
      <div class="actor-desc">
        <span class="price"
          >{{
            actorInfo.actor.startPayPrice +
            (actorInfo.actor.endPayPrice
              ? '-' + actorInfo.actor.endPayPrice
              : '')
          }}元</span
        >
        <!-- <span class="city">
                    <van-icon name="location" />
                    <span>{{ actorInfo.actor.actorCity }}</span>
                </span> -->
      </div>
    </div>
    <!-- <div class="actor-cp">{{ actorInfo.actor.totalOrderNum + actorInfo.actor.fakeOrderNum }}人约过</div> -->
  </div>
</template>

<script>
import { formatStrNum } from '@/utils/tools'

export default {
  name: 'MovieItem',
  props: {
    actorInfo: {
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
    onPlay(anchorInfo) {
      this.$router.push({
        path: '/nudeChatDetail',
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
  width: 100%;
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  color: #292a38;
  background: #fff;
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
  .actor-img {
    display: block;
    width: 100%;
    height: 200px;
    background-position: center;
    background-size: 100%;
    background-repeat: no-repeat;
    position: relative;
    span {
      position: absolute;
      bottom: 10px;
      left: 6px;
      padding: 4px 8px;
      font-size: 12px;
      text-align: center;
      background: rgba(0, 0, 0, 0.46);
      color: #fff;
      border-radius: 18px;
    }
  }
  .actor-bottom {
    background: #fff;
    padding: 6px;
    font-size: 13px;
    .actor-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #8e9199;
    }
    .actor-desc {
      width: 100%;
      padding: 3px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .price {
      color: #109fff;
      font-size: 14px;
    }
  }
  .actor-cp {
    position: absolute;
    left: 6px;
    bottom: 36px;
    background: #109fff;
    border-radius: 4px;
    overflow: hidden;
    padding: 6px 12px;
    font-size: 10px;
    color: white;
  }
}
</style>
