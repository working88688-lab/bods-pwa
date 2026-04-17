<template>
  <van-tabbar
    v-if="show && tabs.length > 1"
    v-model="active"
    :placeholder="true && tabs.length > 1"
    active-color="var(--theme-color)"
    inactive-color="#999"
    :border="false"
  >
    <van-tabbar-item
      v-for="item in tabs"
      :key="item.path"
      :name="item.path"
      :to="item.path"
      replace
    >
      <span>{{ item.label }}</span>
      <template #icon="props">
        <img :src="props.active ? item.active : item.default" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<script>
import { useFooterData } from '@/hooks'
export default {
  data() {
    return { useFooterData }
  },
  computed: {
    active: {
      get() {
        return this.$route.name
      },
      set() {},
    },
    show() {
      return this.$route.meta.show
    },
    tabs() {
      return useFooterData().filter(item => item.expand !== '/product' && item.expand !== '/video')
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .van-tabbar {
  background: #f2f2f4;
  left: auto;
  max-width: 500px;

  .van-tabbar-item--active {
    background: #f2f2f4;
  }

  .van-tabbar-item__text {
    font-size: 10px;
  }

  .van-tabbar-item__icon {
    margin-bottom: 3px;

    img {
      width: 22px;
      height: 22px;
    }
  }
}
</style>
