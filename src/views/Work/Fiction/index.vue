<template>
  <div class="movie-page flex-container" :class="{ 'white-bg': !isRecom }">
    <div class="page-top">
      <PageHeader :mediaType="10" />
      <van-tabs
        v-model="activedTab"
        title-inactive-color="#333333"
        title-active-color="#020202"
        color="#020202"
        background="none"
        :ellipsis="false"
        @change="onChange"
      >
        <van-tab
          v-for="(tab, idx) in tabList"
          :key="idx"
          :title="tab.label"
          :name="tab.categoryId"
        ></van-tab>
      </van-tabs>
      <template v-if="!isRecom">
        <div class="banner-wraper" v-if="showBanner">
          <Banner location="recommend_page" @onFinish="handleBannerFinish" />
        </div>
        <div class="top-botom">
          <van-tabs
            v-if="subTabList.length > 1"
            class="sub-tabs"
            v-model="subActivedTab"
            title-inactive-color="#333333"
            title-active-color="#020202"
            color="#020202"
            background="none"
            :ellipsis="false"
            @change="onSubChange"
          >
            <van-tab
              v-for="(sub, idx) in subTabList"
              :key="idx"
              :title="sub.label"
              :name="sub.categoryId"
            ></van-tab>
          </van-tabs>
          <FilterComponent @onFilter="handleFilter" />
        </div>
      </template>
    </div>
    <div class="page-content">
      <template v-if="isRecom">
        <div class="banner-wraper" v-if="showBanner">
          <Banner location="recommend_page" @onFinish="handleBannerFinish" />
        </div>
      </template>
      <keep-alive>
        <router-view
          :key="activedTab + subActivedTab + searchType + chapterOver"
        />
      </keep-alive>
    </div>
    <Footer activePath="/fiction" />
  </div>
</template>

<script>
import Footer from '@/components/Footer'
import Banner from '@/components/Banner'
import PageHeader from '../components/PageHeader'
import _ from 'lodash'
import FilterComponent from '../components/FilterComponent'

export default {
  name: 'Fiction',
  components: {
    Footer,
    Banner,
    PageHeader,
    FilterComponent,
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
      subActivedTab: null,
      subTabList: [],
      showBanner: true,
      searchTypeList: [
        { label: '最新', value: 'SORT_PUBLISH' },
        { label: '最热', value: 'SORT_VIEW' },
      ],
      isRecom: false,
      searchType: 'SORT_RECOMMEND',
      chapterOver: 1,
    }
  },
  created() {
    const targetData = this.appFooter.find(one => one.expand === '/fiction')
    if (targetData) {
      this.tabList = targetData.child
        .map(one => {
          if (one.child) {
            const child = one.child.map(item => {
              return {
                label: item.thirdCategoryName,
                categoryId: item.categoryId,
                layout: item.layout,
              }
            })
            const obj = {
              label: one.secondCategoryName,
              categoryId: one.categoryId,
              expand: one.expand,
              child,
            }
            return obj
          } else {
            return null
          }
        })
        .filter(one => one)
      const { categoryId, isRecom } = this.$route.query
      if (isRecom === 'true') {
        this.isRecom = true
        this.activedTab = categoryId
        this.onSubChange(this.activedTab)
      } else {
        if (categoryId) {
          let targetCategoryData
          this.tabList.forEach(one => {
            if (one.child) {
              one.child.forEach(two => {
                if (two.categoryId === categoryId) {
                  targetCategoryData = one
                  this.activedTab = one.categoryId
                }
              })
            }
          })
          if (
            targetCategoryData &&
            targetCategoryData.child &&
            targetCategoryData.child[0]
          ) {
            if (targetCategoryData.expand === '/recom') {
              this.isRecom = true
              this.onSubChange(this.activedTab)
            } else {
              this.isRecom = false
              this.subTabList = targetCategoryData.child
              this.subActivedTab = categoryId
              this.onSubChange(this.subActivedTab)
            }
          } else {
            return this.$toast('获取分类信息失败')
          }
        } else {
          if (
            this.tabList[0] &&
            this.tabList[0].child &&
            this.tabList[0].child[0]
          ) {
            this.activedTab = this.tabList[0].categoryId
            if (this.tabList[0].expand === '/recom') {
              this.isRecom = true
              this.onSubChange(this.activedTab)
            } else {
              this.isRecom = false
              this.subTabList = this.tabList[0].child
              this.subActivedTab = this.tabList[0].child[0].categoryId
              this.onSubChange(this.subActivedTab)
            }
          } else {
            return this.$toast('获取分类信息失败')
          }
        }
      }
    } else {
      return this.$toast('获取分类信息失败')
    }
  },
  mounted() {},
  destroyed() {},
  methods: {
    onChange(categoryId) {
      this.subTabList = []
      this.subActivedTab = null
      let targetData = this.tabList.find(one => one.categoryId === categoryId)
      if (targetData && targetData.child && targetData.child[0]) {
        if (targetData.expand === '/recom') {
          this.isRecom = true
          this.onSubChange(categoryId)
        } else {
          this.isRecom = false
          this.subTabList = targetData.child
          this.subActivedTab = targetData.child[0].categoryId
          this.onSubChange(this.subActivedTab)
        }
      } else {
        return this.$toast('获取分类信息失败')
      }
    },
    onSubChange(categoryId) {
      let params
      if (this.isRecom) {
        params = {
          categoryId: categoryId,
          isRecom: this.isRecom,
        }
      } else {
        params = {
          categoryId: categoryId,
          isRecom: this.isRecom,
          searchType: this.searchType,
          chapterOver: this.chapterOver,
        }
      }
      this.$router.push({
        path: '/fiction/category',
        query: params,
      })
    },
    handleFilter({ orderType, chapterOver }) {
      this.searchType = orderType
      this.chapterOver = chapterOver
      let params
      if (this.isRecom) {
        params = {
          categoryId: this.subActivedTab,
          isRecom: this.isRecom,
        }
      } else {
        params = {
          categoryId: this.subActivedTab,
          isRecom: this.isRecom,
          searchType: this.searchType,
          chapterOver: this.chapterOver,
        }
      }
      this.$router.push({
        path: '/fiction/category',
        query: params,
      })
    },
    handleBannerFinish(data) {
      this.showBanner = !!data.length
    },
  },
}
</script>

<style lang="less" scoped>
.movie-page.white-bg {
  background: #fff;
}
.page-top {
  width: 100%;
  background: url(../../../assets/images/main-bg.png) top / 100% no-repeat;
  .van-search {
    padding: 6px 16px;
    background-color: transparent;
    .van-search__content {
      background-color: #fff;
      border-radius: 18px;
      .van-cell {
        color: #a3a3a3;
      }
    }
    .van-search__action {
      line-height: 0;
      text-align: center;
      padding: 0 0 0 6px;
      .action-item {
        font-size: 10px;
        color: #666666;
        display: inline-flex;
        width: 24px;
        height: 38px;
        flex-wrap: wrap;
        margin-left: 12px;
      }
      .icon-star {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: url(../../../assets/images/fuli.png) center / 50% no-repeat
          #109fff;
      }
      .icon-history {
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: url(../../../assets/images/qiandao.png) center / 50%
          no-repeat #109fff;
      }
    }
  }
}
::v-deep .van-tabs {
  .van-tabs__wrap {
    .van-tabs__nav {
      .van-tab {
        padding-bottom: 0;
        font-size: 15px;
        display: inline-flex;
      }
      .van-tab--active {
        font-size: 18px;
        position: relative;
        font-weight: bold;
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
.banner-wraper {
  padding: 0 16px;
}
.top-botom {
  background: #fff;
  padding: 6px 0;
}
::v-deep .sub-tabs.van-tabs {
  .van-tabs__wrap {
    .van-tabs__nav {
      .van-tab {
        font-size: 14px;
      }
      .van-tab--active {
        font-size: 18px;
      }
    }
  }
}
</style>
