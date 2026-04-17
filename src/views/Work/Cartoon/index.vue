<template>
  <div class="page-main flex-container">
    <PageHeader :mediaType="9" />
    <van-tabs v-model="activedTab" :ellipsis="false" :swipeable="true" :animated="true"
      class="page-tabs flex-container">
      <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.categoryId">
        <Banner location="recommend_page" />
        <van-notice-bar v-if="noticeText" left-icon="volume-o" color="#474747" background="#fff" :text="noticeText" />
        <category :secondCategoryId="tab.categoryId" :isRecom="tab.expand === '/recom'"
          :isJalan="tab.expand === '/jalan'" :mediaType="tab.mediaType" :child="tab.child" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import Banner from '@/components/Banner'
import PageHeader from '../components/PageHeader'
import _ from 'lodash'
import category from './category'

export default {
  name: 'Anime',
  components: {
    Banner,
    PageHeader,
    category,
  },
  computed: {
    appFooter() {
      return this.$store.state.appFooter
    },
    isApp() {
      return this.$store.state.isApp
    },
  },
  data() {
    return {
      searchValue: '',
      activedTab: null,
      tabList: [],
      noticeText: '',
      scrollTop: 0,
    }
  },
  created() {
    this.tabList = [
      {
        label: '最新',
        categoryId: 'latest',
        mediaType: 9,
        child: [
          {
            label: '最新',
            categoryId: 'latest',
            mediaType: 9,
          },
        ],
      },
    ]
    const targetData = this.appFooter.find(one => one.expand === '/anime')
    if (targetData) {
      const targetDataList = targetData.child
        .map(one => {
          let child = []
          if (one.child) {
            child = one.child.map(item => {
              return {
                label: item.thirdCategoryName,
                categoryId: item.categoryId,
                mediaType: 9,
              }
            })
          }
          const obj = {
            label: one.secondCategoryName,
            categoryId: one.categoryId,
            mediaType: one.expand === '/jalan' ? 13 : 9,
            expand: one.expand,
            child,
          }
          return obj
        })
        .filter(one => one)
      this.tabList = this.tabList.concat(targetDataList)
    } else {
      return this.$toast('获取分类信息失败')
    }
    this.getNoticeText()
  },
  mounted() { },
  activated() {
    this.$nextTick(() => {
      const pageContentDom = document.getElementsByClassName(
        'van-tab__pane-wrapper'
      )
      const idx = _.findIndex(
        this.tabList,
        one => one.categoryId === this.activedTab
      )
      if (pageContentDom && pageContentDom[idx]) {
        pageContentDom[idx].scrollTop = this.scrollTop
      }
    })
  },
  beforeRouteLeave(to, from, next) {
    const pageContentDom = document.getElementsByClassName(
      'van-tab__pane-wrapper'
    )
    const idx = _.findIndex(
      this.tabList,
      one => one.categoryId === this.activedTab
    )
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
          res.map(one => one.bannerName + '。').toString() ||
          '欢迎进入Boys，我们的永久域名https://jinman.vip'
      }
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .page-tabs {
  position: relative;

  >.van-tabs__content {
    flex: 1;
    overflow: hidden;

    >.van-tabs__track {
      height: 100%;

      >.van-tab__pane-wrapper {
        overflow: auto;
      }
    }
  }
}

::v-deep .van-notice-bar {
  height: 28px;
  padding: 0 12px;
  margin: 8px 16px 0;
  border-radius: 14px;

  .van-notice-bar__content {
    font-size: 12px;
  }
}

::v-deep .banner-swiper {
  padding: 0;
}
</style>
