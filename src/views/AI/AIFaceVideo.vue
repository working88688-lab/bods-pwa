<template>
  <div class="page-main flex-container">
    <Loading v-if="isInit" />
    <template v-else>
      <div
        class="search-section"
        @touchstart.stop
        @touchmove.stop
        @touchend.stop
      >
        <div class="tabs" v-if="categoryNameList.length > 1">
          <div
            v-for="(tab, idx) in categoryNameList"
            :key="idx"
            :name="tab.categoryName"
          >
            <div
              :class="
                tab.displayName === currentTab
                  ? 'tabs-item selected'
                  : 'tabs-item'
              "
              slot="title"
              @click="() => onCurrentTabChange(tab.displayName)"
            >
              {{ tab.displayName }}
            </div>
          </div>
        </div>
        <div class="filter">
          <div
            @click="onFilterDate"
            :class="{ actived: sortRule === 7 || sortRule === 8 }"
          >
            <span>上架时间</span>
            <span
              class="sort"
              :class="{ sort_up: sortRule === 7, sort_down: sortRule === 8 }"
            ></span>
          </div>
          <div
            @click="onFilterTimes"
            :class="{ actived: sortRule === 3 || sortRule === 4 }"
          >
            <span>使用次数</span>
            <span
              class="sort"
              :class="{ sort_up: sortRule === 3, sort_down: sortRule === 4 }"
            ></span>
          </div>
          <div
            @click="onFilterPrice"
            :class="{ actived: sortRule === 1 || sortRule === 2 }"
          >
            <span>价格排序</span>
            <span
              class="sort"
              :class="{ sort_up: sortRule === 1, sort_down: sortRule === 2 }"
            ></span>
          </div>
        </div>
      </div>
      <div class="page-content">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <Loading v-if="listLoading" />
          <template v-else>
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
              @load="onLoad"
            >
              <div class="video-grid">
                <div
                  class="grid-item"
                  v-for="(data, idx) in dataList"
                  :key="idx"
                >
                  <FaceItem
                    :itemData="data"
                    :coverHeight="data.coverHeight"
                    :className="activedData === data ? 'actived' : ''"
                    @onSelected="handleSelected"
                  >
                  </FaceItem>
                </div>
              </div>
            </van-list>
          </template>
        </van-pull-refresh>
      </div>
    </template>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import FaceItem from './FaceItem'
import {
  getAiPicFreeTimes,
  uploadAiFaceImg,
  uploadAiContentImg,
  submitAiFacePicture,
  getFaceConfPageList,
  getMerAiFaceCategoryPage,
} from '@/apis/ai'
import { centerUserInfo } from '@/apis/user'
import { Dialog } from 'vant'
import Masonry from 'masonry-layout'

export default {
  name: 'AI',
  components: {
    Header,
    Loading,
    FaceItem,
    Masonry,
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    aiupload_time() {
      return this.dataDic.aiupload_time
    },
    upload_price() {
      return this.dataDic.upload_price ? this.dataDic.upload_price * 1 : 0
    },
  },
  data() {
    return {
      isInit: true,
      dataList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      refreshing: false,
      loading: false,
      activedData: null,
      aiType: 2,
      categoryNameList: [{ displayName: '全部', categoryName: '全部' }],
      currentTab: null,
      listLoading: false,
      sortRule: 8,
      sortRuleList: [
        { label: '价格升序', value: 1 },
        { label: '价格降序', value: 2 },
        { label: '次数升序', value: 3 },
        { label: '次数降序', value: 4 },
        { label: '时间升序', value: 7 },
        { label: '时间降序', value: 8 },
      ],
    }
  },
  async created() {
    const res = await getMerAiFaceCategoryPage({
      merchantAcct: process.env.VUE_APP_MERCHANTACCT,
      aiType: this.aiType,
      pageNo: 1,
      pageSize: 99,
    })
    if (res && res.code === 0) {
      this.categoryNameList = this.categoryNameList.concat(
        res.data.dataList.map(one => ({
          displayName: one.categoryName,
          categoryName: one.categoryName,
          categoryImg: one.categoryImg,
        }))
      )
    }
    this.currentTab = this.categoryNameList[0].categoryName
    this.getTemplateList(null, true)
  },
  mounted() {},
  activated() {},
  updated() {
    const LayoutDom = document.querySelector('.video-grid')
    if (LayoutDom) {
      new Masonry(LayoutDom, {
        itemSelector: '.grid-item',
        gutter: 10,
      })
    }
  },
  methods: {
    onFilterTimes() {
      if (this.sortRule === 3) {
        this.sortRule = 4
      } else if (this.sortRule === 4) {
        this.sortRule = 3
      } else {
        this.sortRule = 4
      }
      this.page.pageNo = 1
      this.dataList = []
      //   this.isInit = true
      this.getTemplateList(null, true)
    },
    onFilterDate(e) {
      if (this.sortRule === 7) {
        this.sortRule = 8
      } else if (this.sortRule === 8) {
        this.sortRule = 7
      } else {
        this.sortRule = 8
      }
      if (e === 'default') {
        this.sortRule = null
      }
      this.page.pageNo = 1
      this.dataList = []
      //   this.isInit = true
      this.getTemplateList(null, true)
    },
    onFilterPrice() {
      if (this.sortRule === 1) {
        this.sortRule = 2
      } else if (this.sortRule === 2) {
        this.sortRule = 1
      } else {
        this.sortRule = 2
      }
      this.page.pageNo = 1
      this.dataList = []
      //   this.isInit = true
      this.getTemplateList(null, true)
    },
    async getTemplateList(done, isRefresh) {
      const parmas = {
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        aiType: this.aiType,
        sortRule: this.sortRule,
        ...this.page,
      }
      if (this.currentTab && this.currentTab !== '全部') {
        parmas['categoryName'] = this.currentTab
      }
      this.loading = true
      const res = await getFaceConfPageList(parmas).catch(() => {
        done && done()
        this.loading = false
        if (this.refreshing) {
          this.refreshing = false
        }
        this.listLoading = false
      })

      done && done()
      this.loading = false
      this.listLoading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      this.isInit = false
      if (res && res.code === 0) {
        const resultList = res.data.dataList.map(one => {
          if (one.coverHeight && one.coverWidth) {
            one['coverHeight'] =
              (one.coverHeight / one.coverWidth).toFixed(2) * 100 + '%'
          } else {
            one['coverHeight'] = (106 / 168) * 100 + '100%'
          }
          return one
        })
        if (isRefresh) {
          this.dataList = resultList
        } else {
          this.dataList = this.dataList.concat(resultList)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    onRefresh(done) {
      this.page.pageNo = 1
      this.getTemplateList(done, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getTemplateList(done)
    },
    handleSelected(data) {
      this.activedData = data
      this.$emit('onSelected', data)
    },
    onLogin() {
      this.$router.push('/login')
    },
    onCurrentTabChange(e) {
      this.currentTab = e
      this.page.pageNo = 1
      this.dataList = []
      this.listLoading = true
      this.getTemplateList(null, true)
    },
  },
}
</script>

<style lang="less" scoped>
.page-main {
  text-align: center;
  padding: 0 16px;
}

.search-section {
  .tabs {
    display: flex;
    margin-bottom: 12px;
    overflow: auto;

    .tabs-item {
      font-size: 14px;
      line-height: 21px;
      margin-right: 24px;
      cursor: pointer;
      color: #222222;
      white-space: nowrap;
    }

    .selected {
      color: #109fff;
    }
  }

  .filter {
    display: flex;
    //   align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    color: rgb(155 159 163);
    height: 32px;
    box-sizing: content-box;
    font-size: 14px;

    .actived {
      color: #109fff;
      border: 1px solid #109fff;
    }

    & > div:first-of-type {
      height: 100%;
      padding: 0 10px;
    }

    > div {
      display: inline-flex;
      align-items: center;
      border: 1px solid rgb(155 159 163);
      padding: 0 10px;
      border-radius: 6px;
      text-align: center;
    }

    .sort {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: url(../../assets/images/icon-sort.svg) top / 100% no-repeat;
    }

    .sort_down {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: url(../../assets/images/icon-sort-ac.svg) top / 100% no-repeat;
    }

    .sort_up {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: url(../../assets/images/icon-sort-ac.svg) top / 100% no-repeat;
      transform: rotate(180deg);
    }
  }
}

.page-content {
  flex: 1;
  overflow: auto;
}

.video-grid {
  .grid-item {
    width: calc((100% - 10px) / 2);
  }
}

::v-deep .van-pull-refresh {
  min-height: 100%;
}
</style>
