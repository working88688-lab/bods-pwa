<template>
  <div class="page-main flex-container">
    <van-tabs
      v-if="tabList.length > 1"
      v-model="activeTab"
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
              <div class="data-time">{{ data.generateTime }}</div>
              <div class="data-cont">
                <template v-if="activeTab === 0">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.userFaceImg" alt="" />
                  </div>
                  <div>排队中...</div>
                </template>
                <template v-if="activeTab === 1">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.userFaceImg" alt="" />
                  </div>
                  <div>处理中...</div>
                </template>
                <template v-if="activeTab === 2">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.userFaceImg" alt="" />
                  </div>
                  <div>
                    <span class="btn-download" @click="onPlay(data)">播放</span>
                    <span class="btn-download" @click="onDownload(data, idx)"
                      >下载</span
                    >
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>
                <template v-if="activeTab === 3">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.userFaceImg" alt="" />
                  </div>
                  <div>
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>

                <template v-if="activeTab === 4">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.userFaceImg" alt="" />
                  </div>
                  <div class="info-5-box">
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>
                <template v-if="activeTab === 5">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.userFaceImg" alt="" />
                  </div>
                  <div class="info-5-box">
                    <span class="info-5">违规理由: {{ data.pythonImg }}</span>
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    <FullScreenPlayerDialog
      v-if="showPlayerDialog"
      :id="videoCode"
      :videoUrl="videoUrl"
      @closePlay="handleClosePlay"
    />
    <van-overlay
      :show="showProgres"
      class="progres-overlay"
      @click="show = false"
    >
      <van-circle
        v-model:current-rate="currentRate"
        :rate="0"
        :speed="100"
        color="#ff3271"
        :text="text"
      />
    </van-overlay>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import FullScreenPlayerDialog from '../FullScreenPlayerDialog'
import {
  getAiFaceResult,
  userDeleteAiface,
  userDownloadAiface,
} from '@/apis/ai'
import { Dialog } from 'vant'
import download from '@/utils/download'
import { centerUserInfo } from '@/apis/user'

export default {
  name: 'aiRecord',
  components: {
    Header,
    Loading,
    FullScreenPlayerDialog,
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    isApp() {
      return this.$store.state.isApp
    },
  },
  data() {
    return {
      aiType: 2,
      activeTab: 1,
      tabList: [
        { label: '排队中', value: 0 },
        { label: '处理中', value: 1 },
        { label: '生成成功', value: 2 },
        { label: '生成失败', value: 3 },
        { label: '异常', value: 4 },
        { label: '违规', value: 5 },
      ],
      isInit: true,
      finished: false,
      refreshing: false,
      loading: false,
      dataList: [],
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      showPlayerDialog: false,
      videoCode: null,
      videoUrl: null,
      isLoading: false,
      showProgres: false,
      currentRate: 0,
      text: '',
    }
  },
  created() {
    this.getUserInfo()
    this.onChangeTab()
  },
  mounted() {},
  methods: {
    async getUserInfo() {
      const res = await centerUserInfo()
      if (res && res.code === 0) {
        this.$store.commit('SET_USERINFO', res.data)
      }
    },
    onChangeTab() {
      this.isInit = true
      this.page.pageNo = 1
      this.finished = false
      this.dataList = []
      this.getDataList(null, true)
    },
    async getDataList(done, isRefresh) {
      let params = {
        ...this.page,
        aiType: this.aiType,
        aiStatus: this.activeTab,
      }
      this.loading = true
      const res = await getAiFaceResult(params)
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const ressult = res.data.dataList
        if (isRefresh) {
          this.dataList = ressult
        } else {
          this.dataList = this.dataList.concat(ressult)
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
    onPlay(data) {
      this.videoUrl = this.imageBase + data.generateContent
      this.videoCode = data.recordCode
      this.showPlayerDialog = true
    },
    async onDownload(data, idx) {
      let tip = `<p>${
        data.downloadNum === 0
          ? '您是否确定下载？'
          : '首次下载免费，之后每次下载收费1金币，您是否确定下载？'
      }</p>`
      if (this.isApp) {
        tip += `<p class="dialog-tips">(提示：IOS下载完成后无法退出当前白色页面，保存视频后请重新打开APP)</p>`
      }
      Dialog.confirm({
        title: '提示',
        message: tip,
        className: 'confirm-dialog',
      })
        .then(async () => {
          if (this.isLoading) {
            return null
          }
          this.isLoading = true
          const res = await userDownloadAiface({
            recordCode: data.recordCode,
          }).catch(() => {
            this.isLoading = false
          })
          this.isLoading = false
          if (res && res.code === 0) {
            if (data.downloadNum !== 0) {
              this.getUserInfo()
            }
            const targetData = Object.assign({}, data)
            targetData.downloadNum++
            this.$set(this.dataList, idx, targetData)
            this.showProgres = true
            this.text = '下载中'
            download(this.imageBase + data.generateContent, null, null, e => {
              this.currentRate = (e.loaded / e.total) * 100
              if (e.loaded / e.total === 1) {
                this.text = '下载完成'
                setTimeout(() => {
                  this.showProgres = false
                }, 1000)
              }
            })
          }
        })
        .catch(() => {})
    },
    handleClosePlay() {
      this.showPlayerDialog = false
      this.videoUrl = null
      this.videoCode = null
    },
    async onDelete(data) {
      Dialog.confirm({
        title: '提示',
        message: '您确定删除吗？',
        className: 'confirm-dialog',
      })
        .then(async () => {
          const res = await userDeleteAiface({ recordCode: data.recordCode })
          if (res && res.code === 0) {
            this.$toast('删除成功')
            this.dataList = this.dataList.filter(
              one => one.recordCode !== data.recordCode
            )
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="less" scoped>
.page-main {
  flex: 1;
  overflow: hidden;
  .page-content {
    flex: 1;
    overflow: auto;
  }
}
::v-deep .van-tabs {
  .van-tabs__wrap {
    height: 30px;
    .van-tabs__nav {
      .van-tab {
        padding-bottom: 0;
        background: #ffffff1a;
        margin-left: 12px;
        font-size: 14px;
      }
      .van-tab--active {
        font-weight: bold;
      }
      .van-tab:first-child {
        margin-left: 0;
      }
      .van-tabs__line {
        display: none;
      }
    }
  }
}
.page-content {
  padding: 0 0 16px;
  text-align: center;
  .data-row {
    padding: 0 16px;
    .data-item {
      font-size: 14px;
      text-align: left;
      margin-bottom: 16px;
      .data-time {
        color: #d5d5d5;
        margin-bottom: 10px;
      }
      .data-cont {
        display: flex;
        align-items: center;
        color: #d5d5d5;
        .data-img-row {
          width: 80px;
          height: 80px;
          margin-right: 16px;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .data-img {
          width: 170px;
          height: 80px;
          margin-right: 10px;
          img {
            display: inline-block;
            width: 80px;
            height: 80px;
            object-fit: cover;
            margin-right: 10px;
          }
          img:nth-child(2) {
            margin-right: 0;
          }
        }
        .btn-download,
        .btn-delete {
          color: #ff3271;
          border: 1px solid #ff3271;
          font-size: 12px;
          padding: 4px 16px;
          border-radius: 5px;
        }
        .btn-download {
          margin-right: 5px;
        }
        .info-5-box {
          display: flex;
          flex-direction: column;
          .info-5 {
            margin-bottom: 4px;
          }
        }
      }
    }
  }
}
.van-pull-refresh {
  min-height: 50vh;
}
::v-deep .progres-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  .van-circle {
    .van-circle__text {
      color: #fff;
    }
  }
}
</style>
