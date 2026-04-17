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
                <template v-if="activeTab === 1">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.uploadImg" alt="" />
                  </div>
                  <div>排队中...</div>
                </template>
                <template v-if="activeTab === 6">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.uploadImg" alt="" />
                  </div>
                  <div>排队中...</div>
                </template>
                <template v-if="activeTab === 2">
                  <div class="data-img">
                    <img
                      v-for="(img, idx) in data.generateImg"
                      :key="idx"
                      v-lazy="img"
                      alt=""
                      @click="onPreview(data, idx)"
                    />
                  </div>
                  <div>
                    <span class="btn-download" @click="onDownload(data)"
                      >下载</span
                    >
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>
                <template v-if="activeTab === 3">
                  <div class="data-img-row">
                    <img v-lazy="imageBase + data.uploadImg" alt="" />
                  </div>
                  <div>
                    <span class="btn-download" @click="onAgain(data)"
                      >重新生成</span
                    >
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>

                <template v-if="activeTab === 4">
                  <div class="data-img">
                    <img v-lazy="imageBase + data.uploadImg" alt="" />
                  </div>
                  <div class="info-5-box">
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>
                <template v-if="activeTab === 5">
                  <div class="data-img">
                    <img v-lazy="imageBase + data.uploadImg" alt="" />
                  </div>
                  <div class="info-5-box">
                    <span class="info-5-reason"
                      >违规理由: {{ data.pythonImg }}</span
                    >
                    <span class="btn-delete" @click="onDelete(data)">删除</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getAiRecordPageList, dealWithFail, userDeletePic } from '@/apis/ai'
import { ImagePreview } from 'vant'
import { Dialog } from 'vant'

export default {
  name: 'aiRecord',
  components: {
    Header,
    Loading,
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
      activeTab: 1,
      tabList: [
        { label: '排队中', value: 1 },
        { label: '处理中', value: 6 },
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
    }
  },
  created() {
    this.onChangeTab()
  },
  mounted() {},
  methods: {
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
        aiStatus: this.activeTab,
      }
      this.loading = true
      const res = await getAiRecordPageList(params)
      this.isInit = false
      done && done()
      this.loading = false
      if (this.refreshing) {
        this.refreshing = false
      }
      if (res && res.code === 0) {
        const ressult = res.data.dataList.map(one => {
          if (one.generateImg) {
            one.generateImg = one.generateImg
              .split(',')
              .map(item => this.imageBase + item)
          } else {
            one.generateImg = []
          }
          return one
        })
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
    downloadImg(src) {
      var image = new Image()
      // 解决跨域 Canvas 污染问题
      image.setAttribute('crossOrigin', 'anonymous')
      image.onload = function () {
        var canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        var context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, image.width, image.height)
        var url = canvas.toDataURL('image/png') //得到图片的base64编码数据

        var a = document.createElement('a') // 生成一个a元素
        var event = new MouseEvent('click') // 创建一个单击事件
        a.download = name || 'photo' // 设置图片名称
        a.href = url // 将生成的URL设置为a.href属性
        a.dispatchEvent(event) // 触发a的单击事件
      }
      image.src = src
    },
    onDownload(data) {
      ImagePreview({
        images: data.generateImg,
        startPosition: 0,
      })
      this.$toast('请截屏保存')
    },
    onPreview(data, idx) {
      ImagePreview({
        images: data.generateImg,
        startPosition: 0,
      })
      this.$toast('请截屏保存')
    },
    async onAgain(data) {
      const res = await dealWithFail({ recordCode: data.recordCode })
      if (res && res.code === 0) {
        this.$toast('重新提交成功')
        this.dataList = this.dataList.filter(
          one => one.recordCode !== data.recordCode
        )
      }
    },
    async onDelete(data) {
      Dialog.confirm({
        title: '提示',
        message: '您确定删除吗？',
        className: 'confirm-dialog',
      })
        .then(async () => {
          const res = await userDeletePic({ recordCode: data.recordCode })
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
</style>
