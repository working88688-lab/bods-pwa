<template>
  <div class="page-container flex-container">
    <PageHeader :mediaType="3" />
    <van-tabs
      v-model="activedTab"
      title-active-color="#109fff"
      :ellipsis="false"
      :swipeable="true"
      :animated="true"
      class="page-tabs flex-container"
    >
      <van-tab
        v-for="(tab, idx) in tabList"
        :key="idx"
        :title="tab.label"
        :name="tab.categoryId"
      >
        <Banner location="recommend_page" />
        <Game
          v-if="tab.expand === '/game'"
          :categoryId="tab.categoryId"
          :child="tab.child"
        />
        <Chat
          v-else-if="tab.expand === '/chat'"
          :categoryId="tab.categoryId"
          :child="tab.child"
        />
        <NudeChat
          v-else-if="tab.expand === '/nudeChat'"
          :categoryId="tab.categoryId"
          :child="tab.child"
        />
        <Category
          v-else
          :categoryId="tab.categoryId"
          :child="tab.child"
          :isDynamic="tab.expand === '/circle'"
        />
      </van-tab>
    </van-tabs>
    <HomeAdDialog location="square_view" />
    <div class="publish-btn" @click="onRoute('/publish')">
      <img src="@/assets/images/btn-publish.png" />
    </div>
  </div>
</template>

<script>
import Banner from '@/components/Banner'
import HomeAdDialog from '@/components/HomeAdDialog'
import Category from './Category'
import Game from './Game'
import Chat from './Chat'
import NudeChat from './NudeChat'
import PageHeader from '@/views/Work/components/PageHeader'

export default {
  name: 'Square',
  components: {
    Banner,
    HomeAdDialog,
    Category,
    Game,
    Chat,
    NudeChat,
    PageHeader
  },
  computed: {
    appFooter() {
      return this.$store.state.appFooter
    },
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  data() {
    return {
      activedTab: null,
      tabList: [],
      scrollTop: 0,
    }
  },
  created() {
    const menuData = this.appFooter.find(one => one.expand === '/square')
    if (!menuData) {
      return this.$toast('获取分类信息失败')
    }
    this.tabList = menuData.child.map(one => {
      let child = []
      if (one.child) {
        child = one.child.map(item => {
          return {
            label: item.thirdCategoryName,
            categoryId: item.categoryId,
          }
        })
      }
      const obj = {
        label: one.secondCategoryName,
        categoryId: one.categoryId,
        expand: one.expand,
        child,
      }
      return obj
    })
    if (this.tabList[0]) {
      this.activedTab = this.tabList[0].categoryId
    }
  },
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
  methods: {
    onRoute(path) {
      this.$router.push(path)
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {

}
::v-deep .page-tabs {
  position: relative;
  > .van-tabs__content {
    flex: 1;
    overflow: hidden;
    > .van-tabs__track {
      height: 100%;
      > .van-tab__pane-wrapper {
        overflow: auto;
      }
    }
  }
}

.publish-btn {
  position: absolute;
  right: 12px;
  bottom: 150px;

  img {
    width: 64px;
  }
}
</style>
