<template>
  <van-popup
    v-model:show="showPop"
    position="bottom"
    :style="{ width: '100%', height: 'auto' }"
    class="flex-container"
    getContainer="#app"
  >
    <div class="pop-top">
      <div class="left-icon" @click="close">
        <van-icon name="arrow-left" />
      </div>
    </div>
    <div class="pop-content">
      <div class="section" v-if="activedData">
        <div class="section-title">模板 - {{ activedData.templateName }}</div>
        <img
          class="preview"
          v-if="activedData.aiType === 1"
          v-lazy="imageBase + activedData.aiCover"
          @click="onPreview"
        />
        <div
          class="preview-video"
          v-if="activedData && activedData.aiType === 2"
          @click="onPreviewVideo"
        >
          <img v-lazy="imageBase + activedData.aiCover" />
          <div class="play">
            <van-icon name="play-circle-o" />
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">上传脸部信息</div>
        <van-uploader
          v-model="fileList"
          accept="image/*"
          :max-count="1"
          :before-read="beforeRead"
          :after-read="afterRead"
          @delete="deleteAIImg"
        >
          <div class="default-image" slot="default">
            <div>
              <div>示例图</div>
              <img src="@/assets/images/sample-graph.png" alt="" />
              <div>
                <van-icon name="add-o" />
                <span>点击上传</span>
              </div>
            </div>
          </div>
        </van-uploader>
      </div>
    </div>
    <div class="btn-box" v-if="activedData">
      <div class="billing">
        <div>
          消耗金币：{{
            activedData.aiType === 1
              ? dataDic.upload_price
              : activedData.aiVideoPrice
          }}
        </div>
        <div>免费次数：{{ freeTimes }}</div>
      </div>
      <van-button round block type="primary" @click="onSubmit">生成</van-button>
    </div>
  </van-popup>
</template>

<script>
import {
  getAiPicFreeTimes,
  uploadAiFaceImg,
  submitAiFacePicture,
} from '@/apis/ai'
import { centerUserInfo } from '@/apis/user'
import VideoPlayer from '@/components/VideoPlayer'
import { Dialog } from 'vant'
import { ImagePreview } from 'vant'

export default {
  name: 'CreatorPopUp',
  components: {
    VideoPlayer,
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    imageBase() {
      return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
    },
    dataDic() {
      return this.$store.state.dataDic
    },
  },
  data() {
    return {
      showPop: false,
      freeTimes: 0,
      aiImg: null,
      fileList: [],
      activedData: null,
    }
  },
  created() {},
  mounted() {},
  activated() {},
  destroyed() {},
  methods: {
    onShow(data) {
      this.showPop = true
      this.activedData = data
      this.getUserInfo()
      this.getFreeTimes()
    },
    close() {
      this.activedData = null
      this.showPop = false
      this.$emit('close')
    },
    onPreview() {
      ImagePreview({
        images: [this.imageBase + this.activedData.aiCover],
        startPosition: 0,
      })
    },
    onPreviewVideo() {
      this.$emit('previewVideo', this.activedData)
    },
    async getFreeTimes() {
      const res = await getAiPicFreeTimes({
        aiType: this.activedData.aiType,
      }).catch(() => {
        this.isInit = false
      })
      this.isInit = false
      if (res && res.code === 0) {
        const { freeTime } = res.data
        this.freeTimes = freeTime || 0
      }
    },
    async getUserInfo() {
      const res = await centerUserInfo()
      if (res && res.code === 0) {
        this.$store.commit('SET_USERINFO', res.data)
      }
    },
    beforeRead(file) {
      if (
        !this.freeTimes &&
        this.userInfo.coinBalance < this.activedData.aiVideoPrice
      ) {
        Dialog.confirm({
          title: '提示',
          message: `金币余额不足，是否立即充值`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.onRoute('/wallet?type=coin')
          })
          .catch(() => {})
        return false
      }
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        this.$toast('请上传 jpg / png 格式图片')
        return false
      }
      const maxSize = this.dataDic.ai_size ? this.dataDic.ai_size : 2
      if (file.size > maxSize * 1024 * 1024) {
        this.$toast(`图片最大为${maxSize}Mb`)
        return false
      }
      return true
    },
    async afterRead(file) {
      const fileType = file.file.type
      if (fileType.indexOf('image') === -1) {
        return this.$toast('请选择图片上传')
      }
      file.status = 'uploading'
      file.message = '上传中...'
      const formData = new FormData()
      formData.append('file', file.file)
      formData.append('aiType', this.activedData.aiType)
      formData.append('confCode', this.activedData.confCode)
      const res = await uploadAiFaceImg(formData).catch(() => {
        file.status = 'failed'
        file.message = '上传失败'
      })
      if (res && res.code === 0) {
        file.status = 'done'
        file.message = '上传成功'
        this.aiImg = res.data
      } else {
        file.status = 'failed'
        file.message = '上传失败'
      }
    },
    deleteAIImg() {
      this.aiImg = null
    },
    onSubmit() {
      if (!this.userInfo) {
        return this.onLogin()
      }
      if (!this.aiImg) {
        return this.$toast('请先上传图片')
      }
      if (this.freeTimes === 0) {
        let price = 0
        if (this.activedData.aiType === 1) {
          price = this.dataDic.upload_price
        } else {
          price = this.activedData.aiVideoPrice
        }
        if (this.userInfo.coinBalance < price) {
          return Dialog.confirm({
            title: '提示',
            message: `金币余额不足，是否立即充值`,
            className: 'confirm-dialog',
          })
            .then(async () => {
              this.onRoute('/wallet?type=coin')
            })
            .catch(() => {})
        } else {
          return Dialog.confirm({
            title: '提示',
            message: `是否花费${price}金币提交照片处理？`,
            className: 'confirm-dialog',
          })
            .then(async () => {
              this.handleSubmit()
            })
            .catch(() => {})
        }
      } else {
        return Dialog.confirm({
          title: '提示',
          message: `当前有${this.freeTimes}次免费机会，是否提交照片体验？`,
          className: 'confirm-dialog',
        })
          .then(async () => {
            this.handleSubmit()
          })
          .catch(() => {})
      }
    },
    async handleSubmit() {
      const params = {
        userFaceImg: this.aiImg,
        userContentImg: '',
        aiType: this.activedData.aiType,
        faceConfCode: this.activedData.confCode,
      }
      if (this.activedData.aiType === 2) {
        params['videoName'] = this.activedData.videoName
      } else {
        params.userContentImg = this.activedData.aiCover
      }
      const res = await submitAiFacePicture(params)
      if (res && res.code === 0) {
        if (this.freeTimes) {
          this.freeTimes--
        } else {
          const userData = Object.assign({}, this.userInfo)
          userData.coinBalance =
            userData.coinBalance - this.activedData.aiVideoPrice
          this.$store.commit('SET_USERINFO', userData)
        }
        this.aiImg = null
        this.fileList = []
        this.close()
        Dialog.alert({
          title: '提示',
          message: `提交成功，请到生成记录中查看和下载`,
        })
          .then(async () => {})
          .catch(() => {})
      }
    },
  },
}
</script>

<style lang="less" scoped>
.van-popup {
  overflow: hidden;
  background: #fafafa;
  .pop-top {
    background: #fff;
    .left-icon {
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      i {
        font-size: 24px;
        color: #000;
      }
    }
  }
  .pop-content {
    flex: 1;
    overflow: auto;
  }
}

.section {
  padding: 0 12px 12px;
  text-align: center;
  .section-title {
    text-align: left;
    font-size: 16px;
    padding: 12px 0;
    font-weight: bold;
  }
  .preview {
    max-width: 80%;
    margin: 0 auto;
    height: 200px;
    object-fit: cover;
  }
  .preview-video {
    position: relative;
    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    .play {
      position: absolute;
      top: calc((100% - 48px) / 2);
      left: calc((100% - 48px) / 2);
      i {
        font-size: 48px;
        color: #fff;
      }
    }
  }
}
.note {
  width: 100%;
  padding: 0 16px 12px;
  text-align: left;
  font-size: 14px;
  color: #a3a3a3;

  > div {
    margin: 6px 0;
    line-height: 1.5;
  }
  > div:first-child {
    color: var(--theme-color);
  }
  .img-list {
    display: flex;
    align-items: center;
    justify-content: space-around;
    .img-item {
      width: 76px;
      img {
        width: 100%;
        margin-bottom: 6px;
      }
    }
  }
}

.btn-box {
  width: 100%;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px;
  .billing {
    flex: 1;
    display: inline-flex;
    align-items: center;
    > div {
      margin-right: 12px;
    }
  }
  button {
    width: 120px;
  }
}
.tips {
  width: 260px;
  margin: 0 auto;
  font-size: 16px;
  padding: 24px 0 12px;

  > div {
    margin: 4px 0;
  }

  span {
    color: var(--theme-color);
  }
}
.operate {
  padding: 0 6px;
}

::v-deep .van-uploader {
  width: 330px;
  height: 200px;
  background: #fff;
  border: 1px dashed var(--theme-color);
  .van-uploader__wrapper,
  .van-uploader__input-wrapper,
  .default-image {
    width: 100%;
    height: 100%;
  }
  .default-image {
    color: var(--theme-color);
    display: flex;
    align-items: center;
    justify-content: center;
    > div {
      > div:first-child {
        font-size: 12px;
        color: rgb(153 153 153);
      }
      img {
        width: 100px;
        height: 100px;
        margin: 5px 0;
      }
      > div:last-child {
        font-size: 12px;
        color: var(--theme-color);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 16px;
          margin-right: 3px;
        }
      }
    }
  }
  .van-uploader__preview {
    width: 100%;
    height: 100%;
    margin: 0;
    .van-uploader__preview-image {
      width: 100%;
      height: 100%;
    }
  }
}
.un-login {
  width: 165px;
  margin: 0 auto;
  background: #fff;
  img {
    width: 100%;
  }
}
</style>
