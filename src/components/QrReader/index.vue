<template>
  <div class="qr-reader">
    <van-uploader :max-count="1" v-model="fileList" :after-read="afterRead" />
    <div class="text">请上传二维码</div>
  </div>
</template>

<script>
import jsqr from 'jsqr'
export default {
  data() {
    return {
      fileList: []
    }
  },
  methods: {
    afterRead({ file }) {
      this.decodeQRCodeFromFile(file)
    },
    async decodeQRCodeFromFile(file) {
      const reader = new FileReader()
      reader.onload = event => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

          // 使用二维码解码库进行二维码识别
          const code = jsqr(imageData.data, canvas.width, canvas.height)

          if (code && code.data) {
            this.$emit('onDecode', code.data)
            return code.data
          }else{
            return this.$toast('未识别到二维码，请重新上传')
          }
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    },
  },
}
</script>

<style scoped lang="less">
.qr-reader {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  justify-content: space-between;
  background: #fff;
  border-radius: 24px;
  padding: 16px;

  .uploader {
    background: #f7f8fa;
    width: 80px;
    height: 80px;
    border-radius: 1px;
    display: flex;
    align-items: center;
    justify-content: center;

    input {
      display: none;
    }

    .qrcode-stream-wrapper {
      display: none;
    }

    .file-label {
      width: 100%;
      height: 100%;
      position: relative;

      img {
        width: 100%;
        height: 100%;
      }

      .van-icon {
        position: absolute;
        right: 0;
        right: 0;
      }
    }
  }

  .text {
    font-size: 14px;
    color: #646566;
  }
}
</style>
