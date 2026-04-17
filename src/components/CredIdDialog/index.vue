<template>
    <van-dialog v-model="showDialog" transition="none" class="qr-dialog" :showConfirmButton="false" :closeOnClickOverlay="!isOldQr"
        @close="onClose">
        <div class="content run-anim">
            <div class="dialog-title">避免账号丢失，请保存登录信息</div>
            <div class="capture-box" ref="capture">
                <img class="logo" src="@/assets/logo_lang.png" alt="logo" />
                <div class="qr-code-box">
                    <div class="qr-code" ref="qrCodeUrl"></div>
                </div>
                <div class="qr-tip">
                    {{ isOldQr ? '您目前的身份凭证二维码已失效，请立即保存新的身份凭证以防止数据丢失'
                        : '如果账号丢失，请到我的>设置>找回老帐号>二维码重新登录' }}
                </div>
            </div>
            <div class="dialog-btn-box">
                <van-button round type="primary" @click="onSave" color="#FFF">保存二维码</van-button>
            </div>
        </div>
    </van-dialog>
</template>
<script>
import QRCode from 'qrcodejs2'
import html2canvas from 'html2canvas'

export default {
    name: 'CredIdDialog',
    data() {
        return {
            showDialog: true,
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        dataDic() {
            return this.$store.state.dataDic
        },
        isOldQr() {
            return this.$store.state.isOldQr
        },
        path() {
            return this.$route.path
        },
        isApp() {
            return this.$store.state.isApp
        },
        isSaveQrCode() {
            return this.$store.state.isSaveQrCode
        },
    },
    mounted() {
        this.handleFinish()
    },
    methods: {
        handleFinish() {
            let link =
                (this.dataDic.shareaddress || 'https://xvideo.tw') +
                (this.$store.state.inviteCode
                    ? '?inviteCode=' + this.$store.state.inviteCode
                    : '') +
                '?uuid=' +
                this.userInfo.userId
                this.creatQrCode(link)
            // 浏览器直接访问,提示用户保存登录信息
            if (!this.isApp && !this.isSaveQrCode) {
                this.showDialog = true
            }
        },
        onSave() {
            html2canvas(this.$refs.capture).then(canvas => {
                const imgUrl = canvas.toDataURL('image/png')
                var eleLink = document.createElement('a')
                eleLink.href = imgUrl // 转换后的图片地址
                eleLink.download = '成人快手个人登录凭证.png'
                document.body.appendChild(eleLink)
                // 触发点击
                eleLink.click()
                // 然后移除
                document.body.removeChild(eleLink)
                this.$toast('二维码已保存至相册')
                this.onClose()
                this.$store.commit('SET_ISSAVEQRCODE', 1)
            })
        },
        onClose() {
            this.showDialog = false
            this.$emit('closeChange')
        },
        creatQrCode(text) {
            this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
                text: text,
                width: 136,
                height: 136,
                colorDark: '#000000',
                colorLight: '#ffffff',
                src: require('@/assets/logo.png'),
            })
        },
    },

}
</script>
<style lang="less" scoped>
::v-deep.qr-dialog {
  width: 65% !important;
  max-width: 300px !important;
  text-align: center;

  .dialog-title {
    line-height: 32px;
    font-size: 14px;
    color: #000;
  }

  .capture-box {
    display: inline-block;
    margin: 0 auto;
    padding: 12px;

    .logo {
      width: 60%;
      display: block;
      margin: 0 auto;
    }

    .qr-code-box {
      display: inline-block;

      .qr-code {
        padding: 6px;
      }
    }

    .qr-tip {
      font-size: 12px;
      color: #FE4101;
    }
  }

  .dialog-btn-box {
    margin-bottom: 12px;
  }

  .run-anim {
        animation: scaleFade 0.2s ease-out forwards;
    }

    @keyframes scaleFade {
        from {
            opacity: 0.5;
            transform: scale(0.98);
        }

        to {
            opacity: 1;
            transform: scale(1);
        }
    }
}
</style>