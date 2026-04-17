<template>
  <div class="page-container">
    <div
      class="page-top"
      v-sticky="{ zIndex: 99, stickyTop: 0, disabled: false }"
    >
      <div class="page-header">
        <div class="left">
          <van-icon name="location-o" />
          <span>{{ city || '全国' }}</span>
        </div>
        <div class="header-title">
          {{ menuData ? menuData.firstCategoryName : '' }}
        </div>
        <div class="right" @click="onClickRight">
          <span class="icon-filter"></span>
        </div>
      </div>
      <div
        class="tabs-wraper"
        v-sticky="{ zIndex: 10, stickyTop: 44, disabled: false }"
      >
        <van-tabs
          v-model="activedTab"
          title-inactive-color="#333333"
          title-active-color="#109fff"
          color="#109fff"
          background="none"
          :ellipsis="false"
          :shrink="true"
          :before-change="beforeChange"
          @change="onChangeTab"
        >
          <van-tab
            v-for="(tab, idx) in tabList"
            :key="idx"
            :title="tab.label"
            :name="tab.categoryId"
          ></van-tab>
        </van-tabs>
      </div>
    </div>
    <keep-alive>
      <router-view :key="activedTab" />
    </keep-alive>
    <Footer activePath="/nudeChat" />
    <SearchPopup ref="searchPopupRef" @onFinish="handleSearch" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import _ from 'lodash'
import Footer from '@/components/Footer'
import SearchPopup from './SearchPopup'
import PubSub from 'pubsub-js'

export default {
  name: 'NudeChat',
  components: {
    Header,
    Loading,
    Footer,
    SearchPopup,
  },
  data() {
    return {
      tabList: [],
      activedTab: null,
      city: '',
      codeList: [],
      scrollTop: 0,
      menuData: null,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    appFooter() {
      return this.$store.state.appFooter
    },
    isApp() {
      return this.$store.state.isApp
    },
  },
  created() {
    this.menuData = this.appFooter.find(one => one.expand === '/nudeChat')
    if (!this.menuData) {
      return this.$toast('获取分类信息失败')
    }
    this.tabList = this.menuData.child.map(one => {
      const obj = {
        label: one.secondCategoryName,
        categoryId: one.categoryId,
      }
      return obj
    })
    this.tabList.push({
      label: '我喜欢的',
      categoryId: 'USER_FAVOR_RECORD',
    })
    if (this.$route.query.categoryId) {
      this.activedTab = this.$route.query.categoryId
    } else {
      if (this.tabList[0]) {
        this.activedTab = this.tabList[0].categoryId
      }
    }
    this.onChangeTab(this.activedTab)
  },
  activated() {
    this.$nextTick(() => {
      document.documentElement.scrollTop = this.scrollTop
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.documentElement.scrollTop
    next()
  },
  methods: {
    onClickRight() {
      this.$refs.searchPopupRef.onShow()
    },
    async onRoute(path) {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      this.$router.push(path)
    },
    onChangeTab(categoryId) {
      this.$router.push({
        path: '/nudeChat/category',
        query: {
          categoryId: categoryId,
        },
      })
      this.$nextTick(() => {
        PubSub.publish('ON_SEARCH', this.codeList)
      })
    },
    async beforeChange(categoryId) {
      if (categoryId === 'USER_FAVOR_RECORD') {
        if (!this.userInfo) {
          await this.$store.dispatch('macLogin')
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    handleSearch(data) {
      this.codeList = []
      data.forEach((one, m) => {
        if (one.name === '城市') {
          const targetCity = one.itemList.find(item => item.selecte)
          if (targetCity) {
            this.city = targetCity.name
            this.codeList.push(targetCity.code)
          } else {
            this.city = ''
          }
        } else {
          one.itemList.forEach(two => {
            if (two.selecte) {
              this.codeList.push(two.code)
            }
          })
        }
      })
      PubSub.publish('ON_SEARCH', this.codeList)
    },
  },
}
</script>

<style lang="less" scoped>
.page-top {
  width: 100%;
  .page-header {
    width: 100%;
    height: 44px;
    line-height: 44px;
    display: flex;
    align-items: center;
    background: #fff;
    .left {
      width: 80px;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      i {
        font-size: 16px;
      }
      span {
        font-size: 14px;
        margin-left: 3px;
      }
    }
    .header-title {
      flex: 1;
      height: 44px;
      line-height: 44px;
      text-align: center;
      font-size: 17px;
    }
    .right {
      width: 80px;
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 12px;
      cursor: pointer;
      .icon-filter {
        display: inline-block;
        width: 24px;
        height: 24px;
        background: url(../../assets/images/filter.png) center / 100% no-repeat;
      }
    }
  }
}
::v-deep .van-tabs {
  .van-tabs__wrap {
    .van-tabs__nav {
      display: inline-flex;
      .van-tab {
        padding-bottom: 0;
        font-size: 15px;
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
.page-container {
  min-height: 100vh;
}
</style>
