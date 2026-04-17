<template>
  <div class="page-container flex-container bg-page">
    <Header
      textColor="#222222"
      title="发布动态"
      right="发布"
      rightColor="#222222"
      :isBlur="false"
      @onClickLeft="onBack"
      @onClickRight="onPublish"
    />
    <div class="page-content">
      <van-form label-width="80px">
        <van-cell-group
          class="bg"
          :border="false"
        >
          <van-field
            name="articleType"
            label="类型"
          >
            <template slot="input">
              <van-radio-group
                v-model="formData.articleType"
                direction="horizontal"
                @change="reset"
              >
                <van-radio
                  :name="2"
                  checked-color="#109fff"
                  >图文</van-radio
                >
                <van-radio
                  :name="1"
                  checked-color="#109fff"
                  >视频</van-radio
                >
              </van-radio-group>
            </template>
          </van-field>
        </van-cell-group>
        <template v-if="formData.articleType === 1">
          <van-cell-group
            :border="false"
            class="title"
          >
            <van-field
              v-model="formData.title"
              name="title"
              type="textarea"
              placeholder="为内容起一个响亮的标题吧～"
              maxlength="20"
              rows="1"
              show-word-limit
              :autosize="true"
            />
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="上传封面"
              placeholder="请上传封面"
            >
              <template slot="input">
                <van-uploader
                  v-model="formData.mediaCoverImg"
                  accept="image/*"
                  :max-count="1"
                  :after-read="afterReadCover"
                />
              </template>
            </van-field>
          </van-cell-group>
          <van-cell-group>
            <van-field
              label="上传视频"
              placeholder="请上传视频"
            >
              <template slot="input">
                <van-uploader
                  v-model="formData.videoUrl"
                  accept="video/*"
                  :max-count="1"
                  :after-read="afterReadVideo"
                />
              </template>
            </van-field>
          </van-cell-group>
        </template>
        <van-cell-group v-if="formData.articleType === 2">
          <van-cell-group
            :border="false"
            class="title"
          >
            <van-field
              v-model="formData.title"
              name="title"
              type="textarea"
              placeholder="为内容起一个响亮的标题吧～"
              maxlength="20"
              rows="1"
              show-word-limit
              :autosize="true"
            />
          </van-cell-group>
          <van-field
            label="(最多可上传9张)"
            placeholder="请上传图片"
            class="column"
          >
            <template slot="input">
              <van-uploader
                v-model="formData.articlePictureUrl"
                accept="image/*"
                :max-count="9"
                :after-read="afterReadImages"
                @delete="deleteImage"
              />
            </template>
          </van-field>
        </van-cell-group>
        <van-cell-group>
          <van-field
            v-model="formData.articleDescription"
            name="articleDescription"
            type="textarea"
            placeholder="发布一下自己的想法吧～"
            maxlength="100"
            rows="2"
            show-word-limit
          />
        </van-cell-group>
        <div class="desc">
          <div>动态发布规则</div>
          <div>1. 用户注意：标题、描述、图片和视频均不得含有二维码、微信、QQ等联系方式。（否则不予通过）</div>
          <div>2. 视频大小不超过100M，以免上传失败。</div>
          <div>3. 发布精彩私密视频，小编选中后，即可获得平台3000元支付宝口令红包现金奖励！</div>
          <div>4. 如有其他业务合作，请联系在线客服。</div>
        </div>
        <van-cell-group>
          <van-field
            class="topic"
            name="expand"
            :label="`话题(${formData.expand.length + '/3'})`"
          >
            <template slot="input">
              <van-checkbox-group
                v-model="formData.expand"
                direction="horizontal"
                :max="3"
              >
                <van-checkbox
                  v-for="(tag, idx) in tagList"
                  :key="idx"
                  :name="tag.tagId"
                  checked-color="#109fff"
                  >#{{ tag.tagName }}</van-checkbox
                >
              </van-checkbox-group>
            </template>
          </van-field>
        </van-cell-group>
      </van-form>
    </div>
  </div>
</template>

<script>
  import Header from '@/components/Header'
  import { uploadFile, uploadAsyShard, contribution } from '@/apis/user'
  import { tagListAll } from '@/apis/media'
  import _ from 'lodash'
  import PubSub from 'pubsub-js'

  export default {
    name: 'Homepage',
    components: {
      Header,
    },
    data() {
      return {
        formData: {
          title: '',
          articleDescription: '',
          mediaCoverImg: [],
          articleType: 2,
          expand: [],
          videoUrl: [],
          articlePictureUrl: [],
        },
        mediaCoverImg: [],
        articlePictureUrl: [],
        videoUrl: [],
        loading: false,
        tagList: [],
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
      this.getTagListAll()
    },
    activated() {},
    methods: {
      reset(type) {
        this.formData = {
          title: '',
          articleDescription: '',
          mediaCoverImg: [],
          articleType: type,
          expand: [],
          videoUrl: [],
          articlePictureUrl: [],
        }
        this.articlePictureUrl = []
        this.mediaCoverImg = []
        this.videoUrl = []
        if (this.formData.articleType === 2) {
          this.mediaCoverImg = [this.userInfo.headUrl]
        }
      },
      onBack() {
        this.$router.go(-1)
      },
      onEditHead(path) {
        this.$router.push(path)
      },
      async getTagListAll() {
        const res = await tagListAll({
          mediaType: 3,
          status: 1,
        })
        if (res && res.code === 0) {
          this.tagList = res.data
        }
      },
      async afterReadCover(file) {
        const fileType = file.file.type
        if (fileType.indexOf('image') === -1) {
          return this.$toast('请选择图片上传')
        }
        file.status = 'uploading'
        file.message = '上传中...'
        const formData = new FormData()
        formData.append('file', file.file)
        const res = await uploadFile(formData, { timeout: 10 * 60 * 1000 })
        if (res && res.code === 0) {
          file.status = 'done'
          file.message = '上传成功'
          this.mediaCoverImg.push(res.data.url)
        } else {
          file.status = 'failed'
          file.message = '上传失败'
        }
      },
      async afterReadVideo(file) {
        const fileType = file.file.type
        if (fileType.indexOf('video') === -1) {
          return this.$toast('请选择视频上传')
        }
        file.status = 'uploading'
        file.message = '上传中...'
        const formData = new FormData()
        formData.append('file', file.file)
        PubSub.publish('SHOW_WAVEPROGRESS')
        const res = await uploadAsyShard(formData, {
          timeout: 10 * 60 * 1000,
          onUploadProgress: progress => {
            let progressPercent = Math.floor((progress.loaded / progress.total) * 100)
            if (progressPercent < 100) {
              file.message = `上传中${progressPercent}%`
              PubSub.publish('SET_WAVEPROGRESS', { rate: progressPercent })
            } else {
              file.message = `上传成功`
              PubSub.publish('HIDE_WAVEPROGRESS')
            }
          },
        }).catch(() => {
          file.message = `上传失败`
          PubSub.publish('HIDE_WAVEPROGRESS')
        })
        if (res && res.code === 0) {
          file.status = 'done'
          file.message = '上传成功'
          const data = {
            videoUrl: res.data.url,
            previewUrl: res.data.previewUrl,
            videoDuration: res.data.duration,
            videoType: res.data.duration >= 1200 ? 1 : 2,
          }
          this.videoUrl.push(data)
        } else {
          file.status = 'failed'
          file.message = '上传失败'
        }
      },
      async afterReadImages(file) {
        const fileType = file.file.type
        if (fileType.indexOf('image') === -1) {
          return this.$toast('请选择图片上传')
        }
        file.status = 'uploading'
        file.message = '上传中...'
        const formData = new FormData()
        formData.append('file', file.file)
        const res = await uploadFile(formData, { timeout: 10 * 60 * 1000 })
        if (res && res.code === 0) {
          file.status = 'done'
          file.message = '上传成功'
          this.articlePictureUrl.push(res.data.url)
        } else {
          file.status = 'failed'
          file.message = '上传失败'
        }
      },
      deleteImage({ index }) {
        this.articlePictureUrl.splice(index, 1)
      },
      async onPublish() {
        if (this.loading) {
          return null
        }
        if (this.formData.articleType === 1) {
          if (!this.videoUrl.length) {
            return this.$toast('请先上传视频')
          }
          if (!this.mediaCoverImg.length) {
            return this.$toast('请先上传封面')
          }
        }
        if (this.formData.articleType === 2) {
          if (!this.articlePictureUrl.length) {
            return this.$toast('请先上传图片')
          }
        }
        if (!this.formData.articleDescription) {
          return this.$toast('请先填写内容')
        }
        if (!this.formData.expand.length) {
          return this.$toast('请先选择话题')
        }
        const params = {
          title: this.formData.title,
          articleDescription: this.formData.articleDescription,
          mediaCoverImg: this.mediaCoverImg[0],
          expand: JSON.stringify(this.formData.expand),
          articleType: this.formData.articleType,
          articlePictureUrl: JSON.stringify(this.articlePictureUrl),
        }
        if (this.formData.articleType === 1) {
          const targetData = this.videoUrl[0]
          params['videoUrl'] = JSON.stringify([targetData.videoUrl])
          params['videoPreviewUrl'] = JSON.stringify([targetData.previewUrl])
          params['videoDuration'] = targetData.videoDuration
          params['videoType'] = targetData.videoType
        }
        this.loading = true
        const res = await contribution(params).catch(() => {
          this.loading = false
        })
        this.loading = false
        if (res && res.code === 0) {
          this.$toast('发布成功')
          this.reset(this.formData.articleType)
        }
      },
    },
  }
</script>

<style lang="less" scoped>
  .page-container {
  }
  .page-content {
    padding: 0 12px 16px;
    flex: 1;
    overflow: auto;
  }
  .bg {
    .van-cell {
      background: none !important;
    }
  }
  .column {
    display: flex;
    flex-direction: column;
    ::v-deep .van-cell__title {
      width: fit-content !important;
      margin-bottom: 5px;
    }
  }
  // .van-cell-group {
  //     .van-cell {
  //         padding: 0;
  //         line-height: 60px;
  //         .input-value {
  //             padding: 0 12px;
  //             width: 100%;
  //             text-align: right;
  //             font-size: 16px;
  //             color: #999999;
  //         }
  //     }
  // }
  .van-cell-group {
    background: none;

    .van-cell {
      background: #fff;
      border-radius: 6px;
      margin-bottom: 12px;
    }
  }
  .topic {
    display: block;
    background: none !important;
    padding: 0;
    .van-field__label {
      width: 100%;
    }
    .van-checkbox {
      margin-right: 0;
      margin-bottom: 10px;
    }
    ::v-deep .van-checkbox__icon + span {
      margin-top: 6px;
      margin-right: 0;
      background: #fff;
      border-radius: 99px;
      padding: 4px 8px;
    }
    ::v-deep .van-checkbox__icon {
      width: 0;
      overflow: hidden;
    }
    ::v-deep .van-checkbox__icon--checked + span {
      background: var(--theme-color);
      color: #fff;
      border-radius: 999px;
      padding: 4px 8px;
    }
    ::v-deep .van-checkbox__label {
      margin-left: 0;
      margin-right: 8px !important;
    }
  }
  .desc {
    padding: 12px 0;
    font-size: 12px;
    line-height: 20px;
    color: rgb(123 123 123);
    &>div:first-of-type {
      font-weight: bold;
      color: #222;
      font-size: 16px;
      margin-bottom: 10px;
    }
  }
</style>
