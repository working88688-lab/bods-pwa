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
            <div class="base-info">
              <div class="avatar" :class="data.vipFlag ? 'avatar-vip' : ''">
                <img
                  :src="
                    data.headUrl
                      ? imageBase + data.headUrl
                      : require('@/assets/images/img_default_avatar1.png')
                  "
                  alt="avatar"
                />
              </div>
            </div>
            <div class="info-content">
              <div class="user-name">{{ data.nickname }}</div>
              <div class="content">
                评论了您的动态<em>{{ data.title }}</em>
              </div>
            </div>
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
        type: 'comment',
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
  margin-bottom: 8px;
  background: #fff;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 8px;
  .base-info {
    width: 48px;
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
      background: url(../../../assets/images/vip_flag.png) no-repeat top center /
        100%;
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
  .info-content {
    width: calc(100% - 48px);
    .user-name {
      font-size: 15px;
    }
    .content {
      font-size: 12px;
      color: #a8a8a8;
      margin: 6px 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      em {
        color: #333;
      }
    }
  }
}
</style>
