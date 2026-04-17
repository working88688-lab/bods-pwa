<template>
    <van-dialog v-model:show="showDialog" class="voucher-dialog" :showConfirmButton="false" :closeOnClickOverlay="true" @close="onClose">
        <div class="content">
            <div class="card" ref="capture">
                <div class="card-top">
                    <div class="logo">
                        <img class="logo" src="@/assets/logo.png" alt="logo">
                    </div>
                    <div class="card-top-left">
                        <div>Boys身份凭证</div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="title">
                        <div>请勿外泄给他人</div>
                        <div>我的-找回账号-使用身份卡</div>
                    </div>
                    <div class="share-code">邀请码：{{ userInfo.shareCode }}</div>
                    <div class="qr-code" ref="qrCodeUrl"></div>
                    <div class="shareaddress">官网：{{ dataDic.shareaddress }}</div>
                </div>
            </div>
            <div class="btn-box">
                <van-button round block type="primary" @click="onSave">保存身份凭证</van-button>
            </div>
        </div>
    </van-dialog>
</template>
  
<script>
import QRCode from "qrcodejs2"
import html2canvas from 'html2canvas'

export default {
    name: 'VoucherDialog',
    components: { },
    data() {
        return {
            showDialog: false,
            qrcode: null,
            link: ''
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        isApp() {
            return this.$store.state.isApp
        },
        dataDic() {
            return this.$store.state.dataDic
        },
    },
    created() {
        this.link = (this.dataDic.shareaddress || 'https://xvideo.tw') + (this.$store.state.inviteCode ? '?inviteCode=' + this.$store.state.inviteCode : '') + '?uuid=' + this.$store.state.userInfo.userId
    },
    mounted() {},
    methods: {
        onShow() {
            this.showDialog = true
            if (!this.qrcode) {
                this.$nextTick(() => {
                    this.creatQrCode()
                })
            }
        },
        onClose() {
            this.showDialog = false
        },
        onSave() {
            this.$toast('请截屏保存')
        },
        creatQrCode() {
            this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
                text: this.link,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff"
            })
        }
    }
};
</script>

<style lang="less" scoped>
.van-dialog {
    .card {
        background: #fff;
        border-radius: 15px;
        overflow: hidden;
        .card-top {
            background: var(--theme-color);
            display: flex;
            align-items: center;
            padding: 14px;
            .logo {
                width: 66px;
                height: 66px;
                border-radius: 15px;
                img {
                    width: 100%;
                    height: 100%;
                }
            }
            .card-top-left {
                padding: 0 12px;
                font-size: 20px;
                color: #fff;
            }
        }
        .card-content {
            text-align: center;
            padding: 14px;
            color: rgb(34 34 34);
            .title {
                font-size: 16px;
            }
            .share-code {
                color: var(--theme-color);
                font-size: 16px;
                font-weight: bold;
                margin-top: 6px;
            }
            .qr-code {
                margin: 14px 0;
                display: flex;
                justify-content: center;
            }
            .shareaddress {
                display: inline-block;
                font-size: 14px;
                color: var(--theme-color);
                padding: 12px 24px;
                border: 1px solid var(--theme-color);
                border-radius: 24px;
            }
        }
    }
}
.btn-box {
    width: 100%;
    padding: 0 24px 24px;
}
</style>
