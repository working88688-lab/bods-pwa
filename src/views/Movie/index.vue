<template>
  <div class="page-main flex-container">
    <PageHeader :mediaType="1" />
    <van-tabs v-model="activedTab" :ellipsis="false" animated lazy-render class="page-tabs flex-container"
      :class="{ dark: route === '/darknet' }">
      <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.categoryId">
        <template #title v-if="route === '/darknet'">
          <img src="@/assets/images/anwang.png" style="height: 40px" />
        </template>
        <Banner location="recommend_page" style="margin-bottom: 10px" />
        <van-notice-bar v-if="noticeText" left-icon="volume-o" color="#474747" background="#fff" :text="noticeText" />
        <Layout v-if="tab.expand === '/recommend'" :value="tab.categoryId" />
        <TagList v-else-if="tab.expand == '/tag'" :value="tab.categoryId" />
        <List v-else :value="tab.categoryId" :child="tab.child" :expand="tab.expand" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import Banner from '@/components/Banner'
import PageHeader from '@/views/Work/components/PageHeader'
import _ from 'lodash'
import category from './category'
import { useSecondaryNavigation } from '@/hooks'
import List from './components/List.vue'
import Layout from './components/Layout.vue'
import TagList from './components/TagList.vue'

export default {
  name: 'movie',
  components: {
    Banner,
    PageHeader,
    category,
    List,
    Layout,
    TagList,
  },
  props: {
    route: {
      type: String,
      default: '/movie',
    },
  },
  computed: {
    appFooter() {
      return this.$store.state.appFooter
    },
    isApp() {
      return this.$store.state.isApp
    },
    tabList() {
      let list = useSecondaryNavigation(this.route)
      const movieData = this.appFooter.find(one => one.expand === this.route)
      if (movieData && movieData.categoryDesc && Number(movieData.categoryDesc) !== 0) {
        this.activedTab = list[Number(movieData.categoryDesc) - 1].categoryId
      } else {
        this.activedTab = list[0].categoryId
      }
      return list
    },
    topBanner() {
      if (this.$store.state.banner && this.$store.state.banner['recommend_page']) {
        return this.$store.state.banner['recommend_page']
      } else {
        return []
      }
    },
    insertBanner() {
      if (this.$store.state.banner && this.$store.state.banner['movie_list']) {
        return this.$store.state.banner['movie_list']
      } else {
        return []
      }
    },
    noticeText() {
      if (this.$store.state.banner && this.$store.state.banner['notify']) {
        const data = this.$store.state.banner['notify'] || []
        return data.map(one => one.bannerName + '。').toString()
      } else {
        return null
      }
    },
  },
  data() {
    return {
      searchValue: '',
      activedTab: null,
      scrollTop: 0,
    }
  },
  created() {
    // this.getNoticeText()
  },
  mounted() { },
  activated() {
    this.$nextTick(() => {
      const pageContentDom = document.getElementsByClassName('van-tab__pane-wrapper')
      const idx = _.findIndex(this.tabList, one => one.categoryId === this.activedTab)
      if (pageContentDom && pageContentDom[idx]) {
        pageContentDom[idx].scrollTop = this.scrollTop
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    const pageContentDom = document.getElementsByClassName('van-tab__pane-wrapper')
    const idx = _.findIndex(this.tabList, one => one.categoryId === this.activedTab)
    if (pageContentDom && pageContentDom[idx]) {
      this.scrollTop = pageContentDom[idx].scrollTop
    }
    next()
  },
  destroyed() { },
  methods: {
    async getNoticeText() {
      if (this.$store.state.banner && this.$store.state.banner['notify']) {
        let res = this.$store.state.banner['notify']
        this.noticeText =
          res.map(one => one.bannerName + '。').toString() || '欢迎进入Boys，我们的永久域名https://jinman.vip'
      }
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .page-tabs {
  position: relative;

  &.dark {
    .van-tabs__wrap {
      .van-tabs__nav {
        justify-content: center;
      }
    }
  }

  >.van-tabs__content {
    flex: 1;
    overflow: hidden;

    >.van-tabs__track {
      height: 100%;

      >.van-tab__pane-wrapper {
        overflow: auto;
        padding: 0 12px;

        .b-swiper {
          padding: 0;
        }
      }
    }
  }
}

::v-deep .van-notice-bar {
  height: 28px;
  padding: 0 12px;
  margin: 8px 0 15px;
  border-radius: 14px;

  .van-notice-bar__content {
    font-size: 12px;
  }
}

.banner-wraper {
  padding: 0 12px 0;
}
</style>
