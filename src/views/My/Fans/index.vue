<template>
  <div class="page-container flex-container">
    <Header title="粉丝列表" textColor="#000" @onClickLeft="onBack" />
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
          class="data-list"
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="data-item" v-for="(data, idx) in dataList" :key="idx">
            <div class="base-info">
              <div class="avatar">
                <img
                  :src="
                    data.headUrl
                      ? imageBase + data.headUrl
                      : require('@/assets/images/img_default_avatar1.png')
                  "
                  alt="avatar"
                />
              </div>
              <div class="base-info-data">
                <div class="info-data-top">
                  <span class="user-name">{{ data.nickName }}</span>
                  <span v-if="data.vipFlag" class="vip">VIP</span>
                </div>
                <div class="info-data-bottom">ID: {{ data.userId }}</div>
              </div>
            </div>
            <div class="flow-box">
              <span
                v-if="!data.followFlag"
                class="btn-flowed"
                @click="onFollow(data, true)"
                >回关</span
              >
              <span v-else class="btn-flow" @click="onFollow(data, false)"
                >已回关</span
              >
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import { followerPage } from '@/apis/user'
import Loading from '@/components/Loading'
import { follow } from '@/apis/user'

export default {
  name: 'Follow',
  components: {
    Header,
    Loading,
  },
  data() {
    return {
      isInit: true,
      finished: false,
      refreshing: false,
      loading: false,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      dataList: [],
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
    onBack() {
      this.$router.go(-1)
    },
    async getDataList(done, isRefresh) {
      const params = {
        ...this.page,
      }
      this.loading = true
      const res = await followerPage(params).catch(() => {
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
        if (isRefresh) {
          this.dataList = res.data.dataList
        } else {
          this.dataList = this.dataList.concat(res.data.dataList)
        }
        this.finished = res.data.current * this.page.pageSize >= res.data.total
      }
    },
    onRefresh() {
      this.page.pageNo = 1
      this.getDataList(null, true)
    },
    onLoad(done) {
      this.page.pageNo++
      this.getDataList(done)
    },
    async onFollow(data, status) {
      const params = {
        userId: data.userId,
      }
      const res = await follow(params)
      if (res && res.code === 0) {
        const targetIdx = _.findIndex(
          this.dataList,
          one => one.userId === data.userId
        )
        const targetData = this.dataList[targetIdx]
        targetData.followFlag = status
        this.$set(this.dataList, targetIdx, targetData)
        if (status) {
          this.$toast('回关成功')
        } else {
          this.$toast('取消成功')
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
.page-content {
  flex: 1;
  overflow: auto;
  padding: 0 16px 16px;
  .data-list {
    .data-item {
      padding: 12px 16px;
      background: #fff;
      margin-bottom: 6px;
      font-size: 14px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      .base-info {
        display: inline-flex;
        align-items: center;
        .avatar {
          position: relative;
          margin-right: 12px;
          img {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
          }
        }
        .base-info-data {
          .info-data-top {
            display: inline-flex;
            align-items: center;
            .user-name {
              font-size: 14px;
            }
            .vip {
              display: inline-block;
              padding: 2px 6px;
              background: #109fff;
              border-radius: 4px;
              font-size: 12px;
              color: #ffffff;
              font-weight: normal;
              margin-left: 4px;
            }
          }
          .info-data-bottom {
            margin-top: 4px;
            font-size: 12px;
          }
        }
      }
      .flow-box {
        display: inline-flex;
        align-items: center;
        .btn-flowed {
          display: inline-block;
          width: 64px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          color: #fff;
          background: #109fff;
          border: 1px solid #109fff;
          border-radius: 12px;
          font-size: 12px;
        }
        .btn-flow {
          display: inline-block;
          width: 64px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          color: #109fff;
          border: 1px solid #109fff;
          border-radius: 12px;
          font-size: 12px;
        }
      }
    }
  }
}
.van-pull-refresh {
  min-height: 50vh;
}
</style>
