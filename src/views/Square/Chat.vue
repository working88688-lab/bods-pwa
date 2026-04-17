<template>
  <div>
    <div
      class="filter-content"
      v-sticky="{ zIndex: 10, stickyTop: -1, disabled: false }"
    >
      <van-tabs
        class="filter-tab"
        v-model="activedTab"
        background="none"
        title-active-color="#fff"
        title-inactive-color="#fff"
        :ellipsis="false"
        @change="onChangeTab"
      >
        <van-tab
          v-for="(tab, idx) in tabList"
          :key="idx"
          :title="tab.label"
          :name="tab.categoryId"
        ></van-tab>
      </van-tabs>
      <div class="filter">
        <div class="left">
          <van-icon name="location" />
          <span>{{ city || '全国' }}</span>
        </div>
        <div class="right" @click="onFilter">
          <van-icon name="filter-o" />
          <span>筛选</span>
        </div>
      </div>
    </div>
    <div class="page-content">
      <Loading v-if="isInit" />
      <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
        <div class="empty-box" v-if="!dataList.length">
          <van-empty
            :image="require('@/assets/images/emptyImage.png')"
            image-size="120"
            description="暂无数据哦~"
          />
        </div>
        <van-list
          v-else
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          class="data-list"
          @load="onLoad"
        >
          <div :class="'masonry-grid masonry-grid-' + activedTab">
            <div class="gutter-size"></div>
            <div class="grid-item" v-for="(data, idx) in dataList" :key="idx">
              <BannerItem
                v-if="data.type === 'banner'"
                :bannerData="data.data"
              />
              <LuoLiaoItem v-else :actorInfo="data" :key="idx" />
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <NudeChatSearchPopup ref="searchPopupRef" @onFinish="handleSearch" />
  </div>
</template>

<script>
import Loading from '@/components/Loading'
import NudeChatSearchPopup from './components/NudeChatSearchPopup'
import LuoLiaoItem from '@/components/LuoLiaoItem'
import BannerItem from '@/components/BannerItem'
import { listMediaBySearchType } from '@/apis/media'
import dayjs from 'dayjs'
import Masonry from 'masonry-layout'

export default {
  name: 'Streaming',
  components: {
    Loading,
    NudeChatSearchPopup,
    BannerItem,
    Masonry,
    LuoLiaoItem,
  },
  props: {
    categoryId: {
      type: String,
      default: '',
    },
    mediaType: {
      type: Number,
      default: 18,
    },
    child: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      showBanner: true,
      tabList: [],
      activedTab: null,
      city: '',
      scrollTop: 0,
      codeList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      dataList: [],
      refreshing: false,
      loading: false,
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
    squareData() {
      if (this.$store.state.appFooter) {
        return this.$store.state.appFooter.find(one => one.expand === '/square')
      } else {
        return {
          child: [],
        }
      }
    },
    isApp() {
      return this.$store.state.isApp
    },
  },
  created() {
    this.tabList = this.child.concat([
      { label: '我喜欢的', categoryId: 'USER_FAVOR_RECORD' },
    ])
    if (this.tabList[0]) {
      this.activedTab = this.tabList[0].categoryId
    }
    this.getDataList(null, true)
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
  updated() {
    const LayoutDom = document.querySelector('.masonry-grid-' + this.activedTab)
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: '.gutter-size',
      })
    }
  },
  methods: {
    handleBannerFinish(data) {
      this.showBanner = !!data.length
    },
    onChangeTab() {
      this.page.pageNo = 1
      this.isInit = true
      this.finished = false
      this.dataList = []
      this.getDataList(null, true)
    },
    onFilter() {
      this.$refs.searchPopupRef.onShow()
    },
    async onRoute(path) {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      this.$router.push(path)
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
      this.page.pageNo = 1
      this.isInit = true
      this.finished = false
      this.dataList = []
      this.getDataList(null, true)
    },
    async getDataList(done, isRefresh) {
      let params
      if (this.activedTab === 'USER_FAVOR_RECORD') {
        params = {
          ...this.page,
          mediaType: this.mediaType,
          searchType: 'USER_FAVOR_RECORD',
        }
      } else {
        params = {
          ...this.page,
          mediaType: this.mediaType,
          orderType: 'SORT_PUBLISH_WEIGHT',
          searchItem: this.codeList || [],
          categoryId: this.activedTab,
        }
      }
      this.loading = true
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        done && done()
        this.loading = false
        if (this.refreshing) {
          this.refreshing = false
        }
      })
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const resultData = res.data.dataList
        if (isRefresh) {
          this.dataList = resultData
        } else {
          this.dataList = this.dataList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    /**
     * 每间隔指定长度插入广告
     * @param {number} len
     * @param {array} data
     */
    insertAd2List(len, data) {
      const chunkList = _.chunk(data, len)
      let resultData = []
      chunkList.forEach(one => {
        const banner = _.sample(this.bannerList)
        one.push({ type: 'banner', data: banner })
        resultData = _.concat(resultData, one)
      })
      return resultData
    },
    onRefresh(done) {
      this.page.pageNo = 1
      this.getDataList(done, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
  },
}
</script>

<style lang="less" scoped>
.filter-content {
  width: 100%;
  background: #109fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 6px;
  color: #fff;

  .filter {
    position: relative;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    > div {
      font-size: 14px;
    }

    .left {
      display: inline-flex;
      align-items: center;
      margin-right: 16px;

      i {
        font-size: 20px;
      }
    }

    .right {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      cursor: pointer;

      i {
        font-size: 20px;
      }
    }
  }
}

::v-deep.filter-tab {
  flex: 1;
  height: 32px;
  overflow: hidden;
  .van-tabs__wrap {
    height: 32px;
  }
}

.page-content {
  padding: 12px 0 0;
}

.masonry-grid {
  margin: 0 12px;

  .gutter-size {
    width: 3%;
  }

  .grid-item {
    width: 48.5%;

    .banner {
      margin-bottom: 12px;
    }
  }
}
</style>
