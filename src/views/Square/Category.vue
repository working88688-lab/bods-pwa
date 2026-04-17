<template>
  <div class="page-content">
    <div class="search-area" v-if="isDynamic && tagList.length"
      v-sticky="{ zIndex: 99, stickyTop: -1, disabled: false }" @touchstart.stop @touchmove.stop @touchend.stop>
      <div class="tag-list" v-if="tagList.length">
        <div v-for="item in tagList" :key="item.tagId" @click="searchHotTag(item)" class="tag-item"
          :class="{ actived: searchHot.tagName === item.tagName }">
          {{ item.tagName }}
        </div>
      </div>
      <div class="filter-item" v-if="searchHot && searchHot.tagName === '全部'">
        <div v-for="(sort, idx) in searchTypeList" :key="idx" :class="{ actived: searchType === sort.value }"
          @click="onChangeSort(sort.value)">{{ sort.label }}</div>
      </div>
    </div>
    <div class="filter-item sticky" v-if="!isDynamic">
        <div v-for="(sort, idx) in searchTypeList" :key="idx" :class="{ actived: searchType === sort.value }"
          @click="onChangeSort(sort.value)">{{ sort.label }}</div>
      </div>
    <Loading v-if="isInit" />
    <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
      <div class="empty-box" v-if="!dataList.length">
        <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="100" description="暂无内容" />
      </div>
      <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <div class="row-list" v-for="(dynamic, idx) in dataList" :key="idx">
          <BannerItem v-if="dynamic.type === 'banner'" :bannerData="dynamic.data" :showTitle="false" style="margin-bottom: 24px;" />
          <Dynamic v-else type="brokeNews" :dynamic="dynamic" :showDivider="idx !== dataList.length - 1" :showFlow="!userInfo ||
            (dynamic.userInfoPo &&
              dynamic.userInfoPo.userId !== userInfo.userId)
            " @changeData="handleChangeData($event, idx)" @onComment="handleComment" />
        </div>
      </van-list>
    </van-pull-refresh>
    <Comment v-if="showComment" ref="comment" :videoInfo="rowData" @addComment="handleAddComment"
      @close="handleCloseComment" />
  </div>
</template>

<script>
import { listMediaBySearchType, hotTag, searchMedia } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import Dynamic from '@/components/Dynamic'
import Loading from '@/components/Loading'
import Comment from '@/components/Comment'
import _ from 'lodash'
import BannerItem from '@/components/BannerItem'
import { useInsert } from '@/hooks'

export default {
  name: 'BrokeNews',
  components: {
    Dynamic,
    Loading,
    Comment,
    BannerItem,
  },
  props: {
    categoryId: {
      type: String,
      default: '',
    },
    isDynamic: {
      type: Boolean,
      default: true,
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
      isInit: true,
      refreshing: false,
      loading: false,
      finished: false,
      dataList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      showComment: false,
      rowData: null,
      scrollTop: null,
      tagList: [],
      isSearchHot: false,
      searchHot: { tagName: '全部', tagId: null },
      searchType: 'SORT_PUBLISH_WEIGHT',
      searchTypeList: [
        { label: '最新', value: 'SORT_PUBLISH_WEIGHT' },
        { label: '推荐', value: 'recommend' },
        { label: '最热', value: 'SORT_VIEW' },
        { label: '精华', value: 'SORT_FAVOR' },
      ],
      index: 0
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    appFooter() {
      return this.$store.state.appFooter
    },
    dataDic() {
      return this.$store.state.dataDic
    },
    bannerList() {
      if (
        this.$store.state.banner &&
        this.$store.state.banner['squarelist_ad']
      ) {
        return this.$store.state.banner['squarelist_ad']
      } else {
        return []
      }
    },
  },
  async created() {
    this.init()
  },
  activated() { },
  methods: {
    async init() {
      if (this.isDynamic) {
        this.getHotLabel()
      }
      this.getDataList()
    },
    async getHotLabel() {
      const res = await hotTag({ mediaType: 3 })
      if (res && res.code === 0) {
        const resultList = [this.searchHot].concat(
          res.data.filter(one => one.hot)
        )
        this.tagList = resultList
      }
    },
    searchHotTag(tag) {
      if (tag && tag.tagId) {
        this.searchHot = tag
        this.isSearchHot = true
      } else {
        this.searchHot = tag
        this.isSearchHot = false
      }
      this.isInit = true
      this.page.pageNo = 1
      this.dataList = []
      this.getDataList(null, true)
    },
    onChangeSort(sort) {
      if (this.searchType === sort) {
        return null
      }
      this.searchType = sort
      this.isInit = true
      this.page.pageNo = 1
      this.dataList = []
      this.getDataList(null, true)
    },
    async getDataList(done, isRefresh) {
      this.loading = true
      let params
      if (this.isSearchHot) {
        params = {
          ...this.page,
          mediaType: 3,
          tags: [this.searchHot.tagName],
          orderType: 'SORT_PUBLISH_WEIGHT',
        }
      } else {
        if (this.categoryId === 'follow') {
          if (!this.userInfo) {
            await this.$store.dispatch('macLogin')
          }
          params = {
            ...this.page,
            mediaType: 3,
            searchType: 'USER_FOLLOW_RECORD',
          }
        } else {
          const targetMenu = this.appFooter.find(
            one => one.expand === '/square'
          )
          if (!targetMenu) {
            return this.$toast('获取分类信息失败')
          }
          if (!this.child[0]) {
            this.isInit = false
            return this.$toast('获取分类信息失败')
          }
          params = {
            ...this.page,
            mediaType: 3,
            categoryId: this.child[0].categoryId,
            orderType: this.searchType,
          }
        }
      }
      let res
      if (this.isSearchHot) {
        res = await searchMedia(params)
      } else {
        res = await listMediaBySearchType(params)
      }
      done && done()
      this.isInit = false
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const resultData = res.data.dataList.map(one => {
          if (one.article.picUrl) {
            one.article.picUrl = JSON.parse(one.article.picUrl)
          }
          if (one.article.videoUrl) {
            one.article.videoUrl = JSON.parse(one.article.videoUrl)
          }
          return one
        })
        let resultList = []
        if (this.bannerList.length) {
          resultList = useInsert(
            this.dataDic.inADNub || 10,
            resultData,
            this.bannerList[this.index]
          )
          if (this.index < this.bannerList.length - 1) {
            this.index++
          } else {
            this.index = 0
          }
        }
        if (isRefresh) {
          this.dataList = resultList
        } else {
          this.dataList = this.dataList.concat(resultList)
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
    formatNum(num) {
      return formatStrNum(num)
    },
    handleChangeData({ data, action }, idx) {
      if (action === 'like' || action === 'buy') {
        this.$set(this.dataList, idx, data)
      } else if (action === 'follow') {
        this.dataList.forEach((one, i) => {
          if (
            data.userInfoPo &&
            one.userInfoPo &&
            data.userInfoPo.userId === one.userInfoPo.userId
          ) {
            let targetData = Object.assign({}, one)
            targetData.hasFollow = data.hasFollow
            this.$set(this.dataList, i, targetData)
          }
        })
      }
    },
    handleComment(data) {
      this.rowData = data
      this.showComment = true
      this.$nextTick(() => {
        this.$refs.comment.onShowComment()
      })
    },
    handleAddComment() {
      const targetIndex = _.findIndex(
        this.dataList,
        one => one.mediaId === this.rowData.mediaId
      )
      const targetData = this.dataList[targetIndex]
      targetData.commentCount += 1
      this.$set(this.dataList, targetIndex, targetData)
    },
    handleCloseComment() { },
  },
}
</script>

<style lang="less" scoped>
.page-content {
  .search-area {
    background: #fff;
    padding-top: 15px;
    margin-bottom: 20px;

    .tag-list {
      margin: 0 12px;
      overflow-x: auto;
      display: flex;

      .tag-item {
        margin-right: 8px;
        font-size: 14px;
        line-height: 1.5;
        flex-shrink: 0;
        border-radius: 999px;
        transition: all 0.4s;
        justify-content: center;
        color: #fff;
        white-space: nowrap;
        padding: 2px 8px;
        color: #9b9fa3;
        border: 1px solid #9b9fa3;
        height: 27px;

        &.actived {
          background: var(--theme-color);
          color: #fff;
          transition: all 0.4s;
          border-color: var(--theme-color);
        }
      }

    }

  }
  .filter-item {
    display: flex;
    padding: 0 12px;
    padding-bottom: 15px;
    padding-top: 15px;

    >div {
      padding: 0 8px;
      margin-right: 16px;
      border-radius: 999px;
      font-size: 14px;
      color: #9b9fa3;
      border: 1px solid #9b9fa3;
      height: 27px;
      line-height: 27px;
    }

    .actived {
      color: #fff;
      background: var(--theme-color);
      border-color: var(--theme-color);
    }
  }

  .sticky {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
  }

  .row-list {
    padding: 0 16px;
  }
}
</style>
