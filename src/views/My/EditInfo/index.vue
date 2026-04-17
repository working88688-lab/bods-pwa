<template>
  <div class="page-container flex-container edit">
    <Header
      title="个人资料"
      textColor="#222222"
      rightColor="#222222"
      right="保存"
      @onClickLeft="onBack"
      @onClickRight="onSave"
    />
    <div class="page-content">
      <van-form label-width="50px">
        <van-cell-group :border="false">
          <div class="avatar-box">
            <van-uploader
              v-model="fileList"
              accept="image/*"
              :preview-full-image="false"
              :max-count="1"
              :after-read="afterReadCover"
            />
          </div>
          <van-field
            v-model="editForm.nickName"
            name="nickName"
            label="昵称"
            placeholder="请填写昵称"
            :border="false"
            input-align="right"
          />
          <van-field name="radio" label="性别" :readonly="!userInfo.vipFlag">
            <template #input>
              <van-radio-group v-model="editForm.gender" direction="horizontal">
                <van-radio
                  v-for="(genderType, idx) in genderTypeList"
                  :key="idx"
                  :name="genderType.value"
                  checked-color="#109fff"
                  >{{ genderType.label }}</van-radio
                >
              </van-radio-group>
            </template>
          </van-field>
          <van-field
            v-model="editForm.signature"
            name="signature"
            label="签名"
            placeholder="请填写签名"
            type="textarea"
            :border="false"
            input-align="right"
            :autosize="{ minHeight: 120, maxHeight: 120 }"
            :maxlength="100"
            :show-word-limit="true"
          />
        </van-cell-group>
      </van-form>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'
import { infoUpdate, uploadFile } from '@/apis/user'

export default {
  name: 'Homepage',
  components: {
    Header,
  },
  data() {
    return {
      editForm: {
        headUrl: '',
        nickName: '',
        signature: '',
        gender: 0,
      },
      fileList: [],
      genderTypeList: [
        { label: '保密', value: 0 },
        { label: '男', value: 1 },
        { label: '女', value: 2 },
      ],
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
    const { headUrl, nickName, signature, gender } = this.userInfo
    this.editForm = {
      headUrl,
      nickName,
      signature,
      gender,
    }
    this.fileList = [{ url: this.imageBase + headUrl, isImage: true }]
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    beforeDelete() {
      if (!this.userInfo.vipFlag) {
        this.$toast('只有VIP才能修改头像')
        return false
      }
      this.editForm.headUrl = ''
      return true
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
      const res = await uploadFile(formData, {
        timeout: 10 * 60 * 1000,
        onUploadProgress: progress => {
          let progressPercent = Math.floor(
            (progress.loaded / progress.total) * 100
          )
          if (progressPercent < 100) {
            file.message = `上传中${progressPercent}%`
          } else {
            file.message = `上传成功`
          }
        },
      })
      if (res && res.code === 0) {
        file.status = 'done'
        file.message = '上传成功'
        this.editForm.headUrl = res.data.url
      } else {
        file.status = 'failed'
        file.message = '上传失败'
      }
    },
    async onSave() {
      // if (!this.userInfo.vipFlag) {
      //   return this.$toast('只有VIP才能修改')
      // }
      if (!this.editForm.headUrl) {
        return this.$toast('请上传头像')
      }
      if (!this.editForm.nickName) {
        return this.$toast('请先填写昵称')
      }
      const res = await infoUpdate(this.editForm)
      if (res && res.code === 0) {
        this.$router.go(-1)
        this.$toast('提交成功，请等待审核')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.edit {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}
.page-content {
  padding: 16px;
}
.van-cell-group {
  .van-cell {
    padding: 12px;
    background: #fff;
    margin-bottom: 12px;
    border-radius: 6px;
    .input-value {
      padding: 0 12px;
      width: 100%;
      text-align: right;
      font-size: 16px;
      .avatar {
        display: inline-block;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        img {
          width: 48px;
          height: 48px;
        }
      }
    }
  }
}
.avatar-box {
  text-align: center;
  margin: 24px 0;
}
::v-deep .van-uploader {
  .van-uploader__preview {
    margin: 0;
    position: relative;
    .van-image {
      border-radius: 50%;
      overflow: hidden;
    }
  }
  .van-uploader__preview-delete {
    width: 100%;
    height: 100%;
    background: url(../../../assets/images/icon_change_avatar.png) no-repeat
      center / 100%;
    position: absolute;
    top: 0;
    left: 0;
    .van-uploader__preview-delete-icon {
      font-size: 0;
      color: #000;
      top: -12px;
      right: -12px;
    }
  }
  .van-uploader__upload {
    background-color: #fff;
  }
}
::v-deep .van-cell-group {
  .van-cell {
    .van-cell__title {
      font-size: 16px;
    }
    .van-field__control {
      color: #222222;
      justify-content: flex-end;
    }
  }
}
</style>
