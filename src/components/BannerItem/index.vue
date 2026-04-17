<template>
  <div class="banner">
    <Advertise :banner="bannerData" />
    <div class="banner-title" v-if="showTitle">{{ bannerData.bannerName || '广告' }}</div>
  </div>
</template>

<script>
  import Advertise from '@/components/Advertise'

  export default {
    name: 'BannerItem',
    components: {
      Advertise,
    },
    props: {
      bannerData: {
        type: Object,
        default: () => {},
      },
      showTitle: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {}
    },
    mounted() {},
    destroyed() {},
    created() {},
    methods: {},
  }
</script>

<style lang="less" scoped>
  .banner {
    overflow: hidden;
    position: relative;
    color: #292a38;
    cursor: pointer;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 0 12px #cecece40;
    .banner-item {
      overflow: hidden;
    }
    .banner-title {
      width: 100%;
      padding: 5px;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
