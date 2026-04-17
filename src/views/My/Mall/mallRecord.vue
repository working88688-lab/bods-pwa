<template>
  <div class="page-container">
    <Header
      title="兑换记录"
      textColor="#222222"
      color="#fff"
      @onClickLeft="onBack"
    />
    <div class="page-content">
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
            finished-text=""
            class="movie-list"
            @load="onLoad"
          >
            <div class="data-row">
              <div class="data-item" v-for="(data, idx) in dataList" :key="idx">
                <div class="item-image">
                  <img v-lazy="imageBase + data.productImg" />
                </div>
                <div class="item-info">
                  <div>{{ data.productTitle }}</div>
                  <div>
                    <span>消耗金币：</span>
                    <span>{{ data.needCoin }}</span>
                  </div>
                </div>
              </div>
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
import { userGetAllRecord } from '@/apis/pointsMall'

export default {
  name: 'mallRecord',
  components: {
    Header,
    Loading,
  },
  data() {
    return {
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      dataList: [],
      refreshing: false,
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
  created() {},
  activated() {
    this.init()
  },
  destroyed() {},
  mounted() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    init() {
      this.isInit = true
      this.page.pageNo = 1
      this.dataList = []
      this.finished = false
      this.getDataList()
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
      }
      this.loading = true
      const res = await userGetAllRecord(params).catch(() => {
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
.page-content {
  padding: 60px 16px 0;
  min-height: 100vh;
  box-sizing: border-box;
  .data-row {
    .data-item {
      background: #181818;
      display: flex;
      align-items: center;
      padding: 8px;
      margin-bottom: 10px;
      border-radius: 10px;
      .item-image {
        width: 86px;
        height: 86px;
        margin-right: 8px;
        border-radius: 8px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .item-info {
        font-size: 16px;
        color: #fff;
        > div:nth-child(2) {
          font-size: 14px;
          margin-top: 14px;
          span:first-child {
            color: #9d9d9d;
          }
        }
      }
    }
  }
}
</style>
