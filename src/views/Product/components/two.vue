<template>
  <div class="two">
    <div class="item" v-for="(item, idx) in data" :key="idx" @click="onPlay(item)">
      <img v-lazy="item.product.productIcon.indexOf('http') > -1
        ? item.product.productIcon
        : imageBase + item.product.productIcon
        " class="icon" />
      <div class="title">{{ item.product.productName }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      first: true
    }
  },
  computed: {
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  methods: {
    onPlay(e) {
      this.$emit('item-click', e)
    }
  },
  deactivated() {
    this.first = false;
  }
}
</script>

<style scoped lang="less">
.two {
  display: flex;
  flex-wrap: wrap;

  .item {
    width: calc((100% - 12px) / 2);
    margin-bottom: 12px;
    margin-right: 12px;
    position: relative;

    &:nth-of-type(2n) {
      margin-right: 0;
    }

    .icon {
      width: 100%;
      aspect-ratio: 168 / 93;
      border-radius: 4px;

      &.animate {
        transform: scale(0);
        animation: zoomIn .5s forwards;
      }
    }

    .title {
      width: 100%;
      color: #f8f8f8;
      font-size: 14px;
      line-height: 17px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
