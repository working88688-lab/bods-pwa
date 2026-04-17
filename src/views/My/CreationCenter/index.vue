<template>
  <div class="page-container flex-container">
    <div class="page-top">
      <Header
        color="#fff"
        textColor="#222222"
        title="创作中心"
        @onClickLeft="onBack"
      />
      <van-tabs
        v-model="activedTab"
        title-inactive-color="#333333"
        title-active-color="#109fff"
        color="#109fff"
        background="none"
        :ellipsis="false"
        @change="onChange"
      >
        <van-tab
          v-for="(tab, idx) in tabList"
          :key="idx"
          :title="tab.label"
          :name="tab.value"
        ></van-tab>
      </van-tabs>
    </div>
    <div class="page-content">
      <Loading v-if="isInit" />
      <template v-else>
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <div class="empty-box" v-if="!recordList.length">
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
            class="movie-list"
            @load="onLoad"
          >
            <div>
              <Dynamic
                v-for="(dynamic, idx) in recordList"
                :key="idx"
                type="brokeNews"
                :dynamic="dynamic"
                :showContentBottom="false"
                :showFlow="false"
                :showDelete="activedTab !== 1"
                :showDivider="idx !== recordList.length - 1"
                @onDelete="handleDelete"
              />
            </div>
          </van-list>
        </van-pull-refresh>
      </template>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { listMediaBySearchType } from '@/apis/media'
import Dynamic from '@/components/Dynamic'

export default {
  name: 'CreationCenter',
  components: {
    Header,
    Loading,
    Dynamic,
  },
  data() {
    return {
      isInit: true,
      tabList: [
        { label: '已发布', value: 1 },
        { label: '审核中', value: 0 },
        { label: '未过审', value: -2 },
      ],
      activedTab: 0,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      finished: false,
      recordList: [],
      refreshing: false,
      loading: false,
      scrollTop: null,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
  },
  created() {
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
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    onChange() {
      this.isInit = true
      this.page.pageNo = 1
      this.finished = false
      this.getDataList(null, true)
    },
    async getDataList(done, isRefresh) {
      const params = {
        ...this.page,
        userId: this.userInfo.userId,
        mediaType: 3,
        searchType: 'USER_PUBLISH_LIST',
        publishStatus: this.activedTab,
      }
      this.loading = true
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        done && done()
        this.loading = false
      })
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
        if (isRefresh) {
          this.recordList = resultData
        } else {
          this.recordList = this.recordList.concat(resultData)
        }
        this.finished = this.page.pageNo * this.page.pageSize > res.data.total
      }
    },
    onRefresh(done) {
      this.page.pageNo = 1
      this.getDataList(done, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
    handleDelete(data) {
      this.recordList = this.recordList.filter(
        one => one.mediaId !== data.mediaId
      )
    },
  },
}
</script>

<style lang="less" scoped>
.page-container {
  background: #f6f6f6;
  .page-top {
    background: #f6f6f6;
  }
}
::v-deep .van-tabs {
  padding: 0 16px;
  .van-tabs__wrap {
    .van-tabs__nav {
      display: inline-flex;
      padding: 0;
      .van-tab {
        padding: 0;
        font-size: 15px;
        margin-right: 16px;
      }
      .van-tab--active {
        font-size: 22px;
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
  padding: 12px 16px 0;
  flex: 1;
  overflow: auto;
  .data-list {
    padding: 12px 16px;
    .data-item {
      padding: 16px;
      background: #fff;
      color: #999999;
      margin-bottom: 8px;
      font-size: 12px;
      > div {
        display: flex;
        justify-content: space-between;
      }
      > div:first-child {
        margin-bottom: 8px;
        color: #222222;
      }
      > div:last-child {
        font-size: 15px;
      }
    }
  }
}
</style>
