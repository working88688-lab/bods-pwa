<template>
  <div class="one">
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
.one {
  display: flex;
  flex-wrap: wrap;

  .item {
    width: 100%;
    margin-bottom: 12px;

    .icon {
      width: 100%;
      aspect-ratio: 343 / 165;
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
