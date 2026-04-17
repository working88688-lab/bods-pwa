<template>
  <div class="notice-content">
    <Loading v-if="isInit" />
    <template v-else>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
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
          <div class="data-item" v-for="(data, idx) in dataList" :key="idx">
            <div class="data-base">
              <div class="title">{{ data.title }}</div>
              <div class="time">{{ data.createTime }}</div>
            </div>
            <div class="data-content">{{ data.contentText }}</div>
          </div>
        </van-list>
      </van-pull-refresh>
    </template>
  </div>
</template>

<script>
import Loading from '@/components/Loading'
import { messagePage } from '@/apis/user'

export default {
  name: 'LikeNotice',
  components: {
    Loading,
  },
  data() {
    return {
      isInit: true,
      finished: false,
      refreshing: false,
      loading: false,
      dataList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
  },
  created() {
    this.getDataList()
  },
  mounted() {},
  methods: {
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        type: 'notice',
      }
      this.loading = true
      const res = await messagePage(params)
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        if (isRefresh) {
          this.dataList = res.data.dataList
        } else {
          this.dataList = this.dataList.concat(res.data.dataList)
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
  },
}
</script>

<style lang="less" scoped>
.notice-content {
  margin: 16px;
}
.data-item {
  padding: 12px 16px;
  background: #ffff;
  margin-bottom: 8px;
  font-size: 14px;
  border-radius: 8px;
  .data-base {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    .title {
      font-size: 15px;
    }
    .time {
      font-size: 12px;
    }
  }
  .data-content {
    font-size: 12px;
    margin-top: 10px;
  }
}
</style>
