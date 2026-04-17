<template>
  <div
    class="rank-item"
    :class="index < 5 ? `top${index}` : ''"
    @click="handleclick"
  >
    <div class="left">
      <img
        v-lazy="imageBase + data.video.videoCoverImg"
        alt=""
      />
      <img
        :src="require(`@/assets/images/top${index}.png`)"
        alt=""
      />
      <div class="left-right">
        <div
          class="free"
          v-if="data.payType === 1"
        >
          限免
        </div>
        <div
          class="gold"
          v-if="data.payType === 2"
        >
          <img src="@/assets/images/gold.png" />
          <span>{{ data.goldPayUnit }}</span>
        </div>
        <div
          class="level"
          v-if="data.payType === 3"
        >
          Lv {{ data.userLevel || 0 }}
        </div>
        <div
          class="vip"
          v-if="data.payType === 4"
        >
          VIP
        </div>
      </div>
    </div>
    <div class="right">
      <div class="van-multi-ellipsis--l3 title">
        {{ data.video.videoTitle }}
      </div>
      <div>
        <div>
          <van-icon name="like-o" />
          <span>
            {{ formatStrNum(data.fakeFavorCount + data.favorCount) || 0 }}
          </span>
        </div>
        <div>
          <van-icon name="eye-o" />
          <span>
            {{ formatStrNum(data.fakeFavorCount + data.favorCount) || 0 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { formatStrNum } from '@/utils/tools'
  export default {
    props: {
      data: {
        type: Object,
        default: () => {},
      },
      index: {
        type: Number,
        default: 1,
      },
    },
    data() {
      return { formatStrNum }
    },
    computed: {
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
    },
    methods: {
      handleclick() {
        this.$emit('click', this.data)
      },
    },
  }
</script>

<style scoped lang="less">
  .rank-item {
    display: flex;
    align-items: stretch;
    margin: 12px;
    padding: 8px 9px;
    border-radius: 5px;
    height: 108px;
    background: #f5f5f5;
    position: relative;
    overflow: hidden;
    .left {
      position: relative;
      aspect-ratio: 160 / 90;
      overflow: hidden;
      margin-right: 10px;
      height: 100%;
      &.top1 {
        background: linear-gradient(to right, #f8ead0, #fff29e);
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: inherit; /* 继承圆角 */
          background: linear-gradient(to right, #fff5c0, #ffd69b); /* 渐变色 */
          z-index: -1;
        }
      }
      &.top2 {
        background: linear-gradient(to right, #d5d5d5, #ededed);
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: inherit; /* 继承圆角 */
          background: linear-gradient(to right, #f3f5f6, #dfdfdf); /* 渐变色 */
          z-index: -1;
        }
      }
      &.top3 {
        background: linear-gradient(to right, #d9a896, #f6eed0);
        position: relative;
        &::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: inherit; /* 继承圆角 */
          background: linear-gradient(to right, #fff0c8, #ffb191); /* 渐变色 */
          z-index: -1;
        }
      }
      &.top4 {
        background: #f5f5f5;
      }
      & > img:first-of-type {
        width: 100%;
        height: 100%;
        vertical-align: middle;
        border-radius: 7px;
        object-fit: cover;
      }
      & > img:last-of-type {
        position: absolute;
        top: 0;
        left: 0;
        width: 29px;
        height: 25px;
      }
      .left-right {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        .free {
          padding: 4px 8px;
          font-size: 12px;
          color: #fff;
          background: #30d158;
          overflow: hidden;
          border-radius: 0px 7px 0 7px;
        }
        .gold {
          padding: 4px 8px;
          font-size: 12px;
          color: #222222;
          background: rgb(255 227 0);
          overflow: hidden;
          border-radius: 0px 7px 0 7px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          img {
            width: 12px;
            height: 12px;
            margin-right: 4px;
          }
        }
        .level {
          padding: 4px 8px;
          font-size: 12px;
          color: #fff;
          background: #ff613d;
          overflow: hidden;
          border-radius: 0px 7px 0 7px;
        }
        .vip {
          padding: 4px 8px;
          font-size: 12px;
          color: #fff;
          background: #109fff;
          overflow: hidden;
          border-radius: 0px 7px 0 7px;
        }
      }
    }
    .right {
      min-width: 100px;
      color: #000;
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .title {
        width: 100%;
        font-size: 14px;
        line-height: 1.5;
      }
      & > div {
        display: flex;
        & > div {
          width: 50%;
          display: flex;
          align-items: center;
          font-size: 14px;
          line-height: 1.5;
          .van-icon {
            font-size: 19px;
            margin-right: 2px;
          }
        }
      }
    }
  }
</style>
