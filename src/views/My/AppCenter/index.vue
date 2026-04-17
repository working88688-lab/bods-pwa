<template>
  <div class="page-container">
    <Header
      color="#fff"
      textColor="#222222"
      title="应用中心"
      @onClickLeft="onBack"
    />
    <van-tabs
      v-if="tabList.length"
      v-model="activedTab"
      title-inactive-color="#707070"
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
        :name="tab.categoryId"
      ></van-tab>
    </van-tabs>
    <div class="page-content">
      <div class="banner-wraper" v-if="showBanner">
        <Banner location="recommend_page" @onFinish="handleBannerFinish" />
      </div>
      <keep-alive>
        <router-view :key="activedTab" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Banner from '@/components/Banner'
import _ from 'lodash'
import { Dialog } from 'vant'

export default {
  name: 'Setting',
  components: {
    Header,
    Banner,
  },
  data() {
    return {
      activedTab: null,
      tabList: [],
      showBanner: true,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    isApp() {
      return this.$store.state.isApp
    },
    appFooter() {
      return this.$store.state.appFooter
    },
  },
  created() {
    const targetData = this.appFooter.find(one => one.expand === '/product')
    if (targetData) {
      this.tabList = targetData.child.map(one => {
        const obj = {
          label: one.secondCategoryName,
          categoryId: one.categoryId,
        }
        return obj
      })
      if (this.$route.query.categoryId) {
        this.activedTab = this.$route.query.categoryId
      } else {
        if (this.tabList[0]) {
          this.activedTab = this.tabList[0].categoryId
        }
      }
      this.onChangeTab(this.activedTab)
    } else {
      Dialog.confirm({
        title: '提示',
        message: '获取菜单信息失败，请刷新页面',
        className: 'confirm-dialog',
      })
        .then(async () => {
          window.location.reload()
        })
        .catch(() => {})
    }
  },
  mounted() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    handleBannerFinish(data) {
      this.showBanner = !!data.length
    },
    onChangeTab(categoryId) {
      if (categoryId) {
        this.$router.push({
          path: '/appCenter/category',
          query: {
            categoryId: categoryId,
          },
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
  box-sizing: border-box;
  padding: 32px 0 0;
}
::v-deep .van-tabs {
  padding-bottom: 12px;
  background: #fff;
  .van-tabs__wrap {
    .van-tabs__nav {
      display: inline-flex;
      .van-tab {
        padding-bottom: 0;
        font-size: 16px;
      }
      .van-tab--active {
        font-size: 18px;
        position: relative;
      }
    }
  }
}
.banner-wraper {
  padding: 12px 16px 12px;
}
</style>
