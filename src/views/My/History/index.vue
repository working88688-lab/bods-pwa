<template>
  <div class="page-container flex-container history">
    <div class="page-top">
      <Header textColor="#222222" title="浏览记录" @onClickLeft="onBack" />
      <van-tabs
        v-if="tabList.length > 1"
        v-model="activeTab"
        title-inactive-color="#333333"
        title-active-color="#109fff"
        color="#109fff"
        background="none"
        :ellipsis="false"
        @change="onChangeTab"
        v-sticky="{ zIndex: 99, stickyTop: 44, disabled: false }"
      >
        <van-tab
          v-for="(tab, idx) in tabList"
          :key="idx"
          :title="tab.label"
          :name="tab.value"
        ></van-tab>
      </van-tabs>
    </div>
    <div class="page-content">
      <ComicsList v-if="activeTab === 8" />
      <CartoonList v-if="activeTab === 9" />
      <FictionList v-if="activeTab === 10" />
      <MovieList v-if="activeTab === 1" />
      <SquareList v-if="activeTab === 3" />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import ComicsList from './ComicsList'
import CartoonList from './CartoonList'
import FictionList from './FictionList'
import MovieList from './MovieList'
import SquareList from './SquareList'

export default {
  name: 'History',
  components: {
    Header,
    Loading,
    ComicsList,
    CartoonList,
    FictionList,
    MovieList,
    SquareList,
  },
  data() {
    return {
      activeTab: 8,
      tabList: [
        { label: '漫画', value: 8 },
        { label: '动漫', value: 9 },
        { label: '小说', value: 10 },
        { label: '视频', value: 1 },
        { label: '广场', value: 3 },
        // { label: '音频小说', value: 11 },
        // { label: '动态漫画', value: 16 }
      ],
      scrollTop: 0,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {},
  mounted() {},
  activated() {
    if (this.$route.query.videoType) {
      this.activeTab = this.$route.query.videoType * 1
    }
    this.$nextTick(() => {
      document.documentElement.scrollTop = this.scrollTop
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.documentElement.scrollTop
    next()
  },
  destroyed() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    onChangeTab() {},
  },
}
</script>

<style lang="less" scoped>
.history {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}
::v-deep .van-tabs {
  padding: 6px 0;
  .van-tabs__wrap {
    .van-tabs__nav {
      display: inline-flex;
      .van-tab {
        padding-bottom: 0;
        font-size: 15px;
        font-weight: bold;
      }
      .van-tab--active {
        font-size: 22px;
        position: relative;
      }
      .van-tabs__line {
        display: none;
      }
    }
  }
}
.page-content {
  flex: 1;
  overflow: auto;
}
</style>
