<template>
  <div class="page-container">
    <Header @onClickLeft="onBack" @setTypeValue="handleSetTypeValue" />
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
          @load="onLoad"
        >
          <div class="data-row">
            <div class="data-item" v-for="(data, idx) in dataList" :key="idx">
              <div class="base-info" v-if="data.userInfo">
                <div
                  class="avatar"
                  :class="data.userInfo.vipFlag ? 'avatar-vip' : ''"
                >
                  <img
                    :src="
                      data.userInfo.headUrl
                        ? imageBase + data.userInfo.headUrl
                        : require('@/assets/images/img_default_avatar1.png')
                    "
                    alt="avatar"
                  />
                </div>
                <div>{{ data.userInfo.nickName }}</div>
              </div>
              <div class="flow-box">
                <span class="btn-flowed" @click="onRelease(data)">{{
                  listType === 1 ? '取消禁言' : '取消禁入'
                }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import Header from './Header'
import Loading from '@/components/Loading'
import { blacklist, releaseSpeak, releaseEnter } from '@/apis/chat'
import { Dialog } from 'vant'

export default {
  name: 'History',
  components: {
    Header,
    Loading,
  },
  data() {
    return {
      roomId: null,
      scrollTop: 0,
      isInit: true,
      finished: false,
      refreshing: false,
      loading: false,
      dataList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      listType: 1,
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
    if (this.userInfo.expand !== 'true') {
      return this.$router.go(-1)
    }
  },
  activated() {
    if (!this.$route.query.roomId) {
      return this.$router.go(-1)
    } else {
      this.roomId = this.$route.query.roomId
      if (this.isInit) {
        return null
      }
      this.isInit = true
      this.page.pageNo = 1
      this.finished = false
      this.dataList = []
      this.getDataList(null, true)
    }
    this.$nextTick(() => {
      document.documentElement.scrollTop = this.scrollTop
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.documentElement.scrollTop
    next()
  },
  destroyed() {},
  mounted() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    handleSetTypeValue(value) {
      this.listType = value
      this.isInit = true
      this.page.pageNo = 1
      this.finished = false
      this.dataList = []
      this.getDataList(null, true)
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        merchantAcct: process.env.VUE_APP_MERCHANTACCT,
        roomId: this.roomId,
        type: this.listType,
      }
      this.loading = true
      const res = await blacklist(params)
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
    onRelease(data) {
      const tips =
        this.listType === 1
          ? `您确定要解除用户${data.userInfo.nickName}的禁言吗？`
          : `您确定要解除用户${data.userInfo.nickName}的禁入吗？`
      Dialog.confirm({
        title: '提示',
        message: tips,
        className: 'confirm-dialog',
      })
        .then(async () => {
          if (this.listType === 1) {
            const params = {
              merchantAcct: process.env.VUE_APP_MERCHANTACCT,
              roomId: this.roomId,
              userId: data.userId,
              userCode: data.userCode,
              type: 1,
            }
            const res = await releaseSpeak(params)
            if (res && res.code === 0) {
              this.dataList = this.dataList.filter(
                one => one.userId !== data.userId
              )
              this.$toast('解除成功')
            }
          } else {
            const params = {
              merchantAcct: process.env.VUE_APP_MERCHANTACCT,
              roomId: this.roomId,
              userId: data.userId,
              userCode: data.userCode,
              type: 2,
            }
            const res = await releaseEnter(params)
            if (res && res.code === 0) {
              this.dataList = this.dataList.filter(
                one => one.userId !== data.userId
              )
              this.$toast('解除成功')
            }
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .van-tabs {
  background: #fff;
  .van-tabs__wrap {
    .van-tabs__nav {
      display: inline-flex;
      .van-tab {
        padding-bottom: 0;
        font-size: 15px;
        color: #ebebeb;
      }
      .van-tab--active {
        font-size: 22px;
        position: relative;
      }
      .van-tab--active::after {
        content: '';
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: linear-gradient(
          to right,
          rgba(121, 79, 255, 1),
          rgba(121, 79, 255, 0)
        );
        position: absolute;
        bottom: 6px;
        right: 6px;
      }
      .van-tabs__line {
        display: none;
      }
    }
  }
}
.page-content {
  .data-row {
    .data-item {
      padding: 12px 16px;
      margin-bottom: 4px;
      font-size: 14px;
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
        .avatar-vip::after {
          content: '';
          width: 16px;
          height: 16px;
          background: url(../../../assets/images/vip_flag.png) no-repeat top
            center / 100%;
          position: absolute;
          right: 0;
          bottom: 0;
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
          color: #85b8ee;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
