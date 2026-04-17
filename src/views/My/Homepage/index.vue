<template>
  <div class="page-container flex-container">
    <div class="page-header">
      <i class="icon-arrow" @click="onBack"></i>
      <van-button class="btn-edit" @click="onEdit">编辑资料</van-button>
    </div>
    <template v-if="userData">
      <div class="user-weaper">
        <div class="user-weaper-bg"></div>
        <div class="user-info">
          <div class="user-base">
            <div class="avatar">
              <img
                :src="
                  userData.headUrl
                    ? imageBase + userData.headUrl
                    : require('@/assets/images/img_default_avatar1.png')
                "
                alt="avatar"
              />
              <img
                v-if="userData.vipFlag"
                class="vip-flag"
                src="@/assets/images/vip_actived.png"
                alt=""
              />
              <!-- <img
                v-else
                class="vip-flag"
                src="@/assets/images/vip_inactivated.png"
                alt=""
              /> -->
            </div>
            <div class="base-info">
              <div class="user-name">
                <span>{{ userData.nickName }}</span>
                <span class="level" v-if="userData.expLevel">Lv{{ userData.expLevel }}</span>
              </div>
              <!-- <div v-if="userData.vipFlag" class="vip-time">
                <span>会员有效期 {{ formatDate(userData.vipEnd) }}</span>
                <span class="renew" @click="onRoute('/vip')">续费</span>
              </div>
              <div v-else class="vip-time">非会员</div> -->
            </div>
          </div>
          <div class="top-info">
            <template v-if="!(userInfo && userInfo.userId === userData.userId)">
              <span
                v-if="userData.followFlag"
                class="btn-flowed"
                @click="onFollow(false)"
                >已关注</span
              >
              <span
                v-else-if="!userData.followFlag"
                class="btn-flow"
                @click="onFollow(true)"
                >+ 关注</span
              >
            </template>
          </div>
        </div>
        <div class="data-base">
          <div class="user-data">
            <div class="data-item" @click="onFollwed">
              <div class="data-value">{{ userData.followed || 0 }}</div>
              <div class="data-label">关注</div>
            </div>
            <div class="data-item" @click="onFans">
              <div class="data-value">{{ userData.followers || 0 }}</div>
              <div class="data-label">粉丝</div>
            </div>
          </div>
          <div class="user-desc">{{ userData.signature || '说一些让人们更好理解你的话。' }}</div>
        </div>
      </div>
      <div v-if="userInfo && userInfo.userId === userData.userId">
        <van-tabs
          v-model="actived"
          title-inactive-color="#222222"
          title-active-color="#109fff"
          background="none"
          :ellipsis="false"
          @change="onChangeTab"
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
        <div v-else class="row-list">
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
              class="movie-list"
              @load="onLoad"
            >
              <div>
                <Dynamic
                  v-for="(dynamic, idx) in dataList"
                  :key="idx"
                  type="brokeNews"
                  :dynamic="dynamic"
                  :showContentBottom="false"
                  :showFlow="false"
                  :showDelete="false"
                  :showDivider="idx !== dataList.length - 1"
                  @onDelete="handleDelete"
                />
              </div>
            </van-list>
          </van-pull-refresh>
        </div>
      </div>
    </template>
    <img src="@/assets/images/btn-publish.png" class="publish" @click="onRoute('/publish')" />
  </div>
</template>

<script>
import Header from '@/components/Header'
import { follow, getUserInfoById, followTotal } from '@/apis/user'
import { listMediaBySearchType } from '@/apis/media'
import Loading from '@/components/Loading'
import Dynamic from '@/components/Dynamic'
import Comment from '@/components/Comment'
import dayjs from 'dayjs'

export default {
  name: 'Homepage',
  components: {
    Header,
    Loading,
    Dynamic,
    Comment,
  },
  data() {
    return {
      userId: '',
      userData: null,
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      isInit: true,
      finished: false,
      dataList: [],
      actived: null,
      tabList: [
        { label: '已发布', value: 1 },
        { label: '审核中', value: 0 },
        { label: '未过审', value: -2 },
      ],
      scrollTop: null,
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
  },
  created() {},
  activated() {
    if (this.$route.query.userId !== this.userId) {
      this.init(1)
      this.scrollTop = 0
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
  methods: {
    formatDate(date) {
      return dayjs(date).format('YYYY-MM-DD')
    },
    init(value) {
      if (!this.$route.query.userId) {
        return this.$router.go(-1)
      }
      this.userData = null
      this.isInit = true
      this.page.pageNo = 1
      this.finished = false
      this.dataList = []
      this.actived = value
      this.userId = this.$route.query.userId
      if (this.userInfo && this.userInfo.userId === this.userId) {
        this.userData = Object.assign({}, this.userInfo)
        this.getFollewFansTotal(this.userData.userId)
      } else {
        this.getUserInfo()
      }
      if (this.actived === 1) {
        this.getDataList()
      } else {
        this.isInit = false
      }
    },
    onBack() {
      this.$router.go(-1)
    },
    onRoute(path) {
      this.$router.push(path)
    },
    onEdit() {
      this.$router.push('/setting')
    },
    onChangeTab(value) {
      this.isInit = true
      this.page.pageNo = 1
      this.finished = false
      this.dataList = []
      this.getDataList(null, true)
    },
    async getUserInfo() {
      const params = {
        userId: this.userId,
      }
      const res = await getUserInfoById(params).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        this.userData = res.data
        this.getFollewFansTotal(this.userData.userId)
      }
    },
    async getFollewFansTotal(userId) {
      const res = await followTotal({ userId })
      if (res && res.code === 0) {
        this.userData.followed = res.data.followed
        this.userData.followers = res.data.followers
      }
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        userId: this.userId,
        mediaType: 3,
        searchType: 'USER_PUBLISH_LIST',
        publishStatus: this.actived,
      }
      this.loading = true
      const res = await listMediaBySearchType(params).catch(() => {
        this.isInit = false
        this.loading = false
        done && done()
      })
      this.isInit = false
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      done && done()
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
    handleDelete(data) {
      this.dataList = this.dataList.filter(one => one.mediaId !== data.mediaId)
    },
    async onFollow() {
      if (!this.userInfo) {
        await this.$store.dispatch('macLogin')
      }
      const params = {
        userId: this.userData.userId,
      }
      const res = await follow(params)
      if (res && res.code === 0) {
        if (!this.userData.followFlag) {
          this.$toast('关注成功')
        } else {
          this.$toast('取消成功')
        }
        this.$set(this.userData, 'followFlag', !this.userData.followFlag)
      }
    },
    onFans() {
      if (this.userInfo && this.userInfo.userId === this.userData.userId) {
        this.onRoute('/fans')
      }
    },
    onFollwed() {
      if (this.userInfo && this.userInfo.userId === this.userData.userId) {
        this.onRoute('/follow')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.publish {
  width: 64px;
  position: absolute;
  bottom: 20px;
  right: 10px;
}

.page-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.page-header {
  width: 100%;
  height: 44px;
  line-height: 44px;
  position: absolute;
  z-index: 999;
  top: var(--safe-area-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 18px;
  .icon-arrow {
    display: inline-block;
    width: 24px;
    height: 24px;
    background: url(../../../assets/images/icon_arrow.png) center / 100%
      no-repeat;
  }
  .van-icon-add-o {
    font-size: 24px;
  }
}
.user-weaper {
  padding-top: calc(44px + var(--safe-area-top));
  position: relative;
  .user-weaper-bg {
    width: 100%;
    height: calc(150px + var(--safe-area-top));
    background: url(../../../assets/images/homepage_bg.png) center / 100%
      no-repeat;
    filter: blur(2px);
    position: absolute;
    top: 0;
    left: 0;
  }
  .user-weaper-bg::after {
    content: '';
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    position: absolute;
    top: 0;
    left: 0;
  }
  .user-info {
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    position: relative;
    .user-base {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      .avatar {
        position: relative;
        margin-bottom: 10px;
        img {
          width: 56px;
          height: 56px;
          object-fit: cover;
          background: #fff;
          border-radius: 50%;
          overflow: hidden;
        }
        .vip-flag {
          width: 16px;
          height: 16px;
          position: absolute;
          bottom: 4px;
          right: 0px;
        }
      }
      .base-info {
        padding: 0 6px;
        .user-name {
          font-size: 20px;
          color: #10141a;
          margin: 0 0 12px;
          display: inline-flex;
          align-items: center;
          .level {
            display: inline-block;
            padding: 2px 6px;
            background: #ff613d;
            border-radius: 4px;
            font-size: 10px;
            color: #ffffff;
            font-weight: normal;
            margin-left: 4px;
          }
        }
        .vip-time {
          font-size: 12px;
          color: #222222;
          .renew {
            color: #2a78f6;
            margin-left: 4px;
          }
        }
      }
    }
  }
  .data-base {
    position: relative;
    margin: 8px 16px;
    background: #fff;
    box-shadow: 0 0 12px #cecece40;
    border-radius: 8px;
    padding: 12px;
    .user-name {
      font-size: 20px;
      color: #10141a;
      margin: 16px 0 12px;
    }
    .user-desc {
      font-size: 12px;
      color: #4f5259;
    }
    .user-data {
      margin: 0 0 16px;
      display: flex;
      .data-item {
        flex: 1;
        display: inline-flex;
        align-items: flex-end;
        justify-content: center;
        font-size: 14px;
        border-right: 1px solid #9d9797;
        .data-value {
          color: #000;
          margin-right: 4px;
          font-weight: bold;
        }
        .data-label {
          color: #8e9199;
        }
      }
      .data-item:last-child {
        border-right: none;
      }
    }
  }
}
.page-content {
  flex: 1;
  overflow: auto;
  .row-list {
    padding: 12px 16px;
    overflow: hidden;
  }
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
::v-deep .van-button.btn-edit {
  color: #fff;
  height: 28px;
  line-height: 28px;
  background: #109fff !important;
  padding: 12px;
  font-size: 12px;
  border: none;
}
::v-deep .van-tabs {
  display: inline-flex;
  justify-content: center;
  .van-tabs__wrap {
    .van-tabs__nav {
      padding-top: 6px;
      justify-content: center;
      .van-tab {
        display: inline-flex;
        flex: none;
      }
      .van-tab--active {
        font-size: 16px;
      }
      .van-tabs__line {
        display: none;
      }
    }
  }
}
.van-pull-refresh {
  min-height: 50vh;
}
</style>
