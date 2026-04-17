<template>
  <div class="page-main flex-container">
    <PageHeader :mediaType="8" />
    <van-tabs v-model="activedTab" :ellipsis="false" animated lazy-render class="page-tabs flex-container">
      <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.categoryId">
        <Banner location="recommend_page" />
        <van-notice-bar v-if="noticeText" left-icon="volume-o" color="#474747" background="#fff" :text="noticeText">
          <template #left-icon>
            <img src="@/assets/logo.png" style="width: 20px; height: 20px; margin-right: 4px" alt="" />
          </template>
        </van-notice-bar>

        <div v-if="tab.expand === '/2d_movie'">
          <Layout v-if="tab.expand === '/recommend' || tab.childCount > 1" :value="tab.categoryId" />
          <van-tabs v-model="active" :ellipsis="false" animated class="three"
            :class="{ visible: tab.child && tab.child.length < 2 }" v-else>
            <van-tab v-for="item in tab.child" :key="item.categoryId" :title="item.label">
              <List :value="item.categoryId" :child="item.child" :expand="item.expand" :level="3" />
            </van-tab>
          </van-tabs>
        </div>
        <category v-else :secondCategoryId="tab.categoryId" :isRecom="tab.expand === '/recom'"
          :mediaType="tab.mediaType" :child="tab.child" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import Banner from '@/components/Banner'
import PageHeader from '../components/PageHeader'
import _ from 'lodash'
import category from './category'
import List from './List.vue'
import Layout from '../../Movie/components/Layout.vue'

export default {
  name: 'Comics',
  components: {
    Banner,
    PageHeader,
    category,
    List,
    Layout,
  },
  computed: {
    appFooter() {
      return this.$store.state.appFooter
    },
    isApp() {
      return this.$store.state.isApp
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  data() {
    return {
      searchValue: '',
      activedTab: null,
      tabList: [],
      noticeText: '',
      scrollTop: 0,
      active: null,
    }
  },
  created() {
    const targetData = this.appFooter.find(one => one.expand === '/2d')
    if (targetData) {
      const targetDataList = targetData.child
        .map(one => {
          if (one.child) {
            const child = one.child.map(item => {
              return {
                label: item.thirdCategoryName,
                categoryId: item.categoryId,
                mediaType: one.expand === '/fiction' ? 10 : 8,
              }
            })
            const obj = {
              label: one.secondCategoryName,
              categoryId: one.categoryId,
              mediaType: one.expand === '/fiction' ? 10 : 8,
              expand: one.expand,
              child,
            }
            return obj
          } else {
            return null
          }
        })
        .filter(one => one)
      this.tabList = this.tabList.concat(targetDataList)
    } else {
      return this.$toast('获取分类信息失败')
    }
    console.log(this.tabList)

    this.getNoticeText()
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
  flex: 1;
  overflow: hidden;
  position: relative;

  >.van-tabs__content {
    flex: 1;
    overflow: hidden;

    >.van-tabs__track {
      height: 100%;

      >.van-tab__pane-wrapper {
        .van-tab__pane {
          height: 100%;
          overflow-y: auto;

          .van-tab__pane {
            overflow: hidden;
          }
        }
      }
    }
  }
}

::v-deep .van-notice-bar {
  height: 28px;
  padding: 0 10px;
  margin: 8px 16px 0;
  border-radius: 14px;

  .van-notice-bar__content {
    font-size: 12px;
  }
}

::v-deep .three {
  .van-tabs__wrap {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #f2f2f4;
    padding: 0 12px;

    .van-tabs__nav {
      padding: 0;

      .van-tab:first-of-type {
        padding-left: 0;
      }
    }
  }

  .filter {
    margin: 0 0 12px;
  }

  &.visible {
    .van-tabs__wrap {
      display: none;
    }
  }
}
</style>
