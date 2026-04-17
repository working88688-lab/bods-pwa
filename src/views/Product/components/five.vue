<template>
  <div class="five">
    <div
      class="item"
      v-for="(item, idx) in data"
      :key="idx"
      @click="onPlay(item)"
    >
      <img
        v-lazy="
          item.product.productIcon.indexOf('http') > -1
            ? item.product.productIcon
            : imageBase + item.product.productIcon
        "
        class="icon"
      />
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
      first: true,
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
    },
  },
  deactivated() {
    this.first = false
  },
}
</script>

<style scoped lang="less">
.five {
  display: flex;
  flex-wrap: wrap;

  .item {
    width: calc((100% - 36px) / 4);
    margin-right: 12px;
    margin-bottom: 12px;

    &:nth-of-type(4n) {
      margin-right: 0;
    }

    .icon {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 4px;
    }

    .title {
      width: 100%;
      padding: 5px;
      text-align: center;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
