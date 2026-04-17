<template>
    <van-dialog v-model:show="showDialog" :showConfirmButton="false" :closeOnClickOverlay="true">
        <div class="content">
            <div class="content-top" ref="capture">
                <div class="logo"></div>
                <div class="invitacode">
                    <div>我的邀请码</div>
                    <div>{{ userInfo.shareCode }}</div>
                </div>
                <div class="qr-code" ref="qrCodeUrl"></div>
                <div class="qr-tip">请使用UC浏览器或者自带浏览器扫描下载</div>
            </div>
        </div>
        <div class="btn-box">
            <van-button round type="primary" @click="onSaveImg">保存图片</van-button>
        </div>
    </van-dialog>
</template>

<script>
import QRCode from "qrcodejs2"
import html2canvas from 'html2canvas'

export default {
    name: 'ShareImage',
    props: {
        link: {
            type: String,
            default: ''
        }
    },
    data(){
        return {
            showDialog: false,
            qrcode: null
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        }
    },
    created() {},
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
        creatQrCode() {
            this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
                text: this.link,
                width: 96,
                height: 96,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            })
        },
        onSaveImg() {
            html2canvas(this.$refs.capture).then(canvas => {
                const imgUrl = canvas.toDataURL("image/png")
                var eleLink = document.createElement("a")
                eleLink.href = imgUrl; // 转换后的图片地址
                eleLink.download = "share-qrcode.png"
                document.body.appendChild(eleLink)
                // 触发点击
                eleLink.click()
                // 然后移除
                document.body.removeChild(eleLink)
                this.$toast('二维码已保存至相册，打开扫一扫即可分享')
            })
        }
    }
}
</script>

<style lang="less" scoped>
.van-dialog {
    background-color: transparent;
    border-radius: 0;
    .van-dialog__content {
        .content {
            text-align: center;
            color: #fff;
            text-align: center;
            position: relative;
            .content-top {
                padding: 245px 0 16px;
                background: url(../../../assets/images/promote.png) top / 100% no-repeat;
                text-align: center;
                position: relative;
                .logo {
                    width: 48px;
                    height: 48px;
                    background: url(../../../assets/logo.png) top / 100% no-repeat;
                    position: absolute;
                    left: 12px;
                    top: 12px;
                }
                .invitacode {
                    color: #fff;
                    font-size: 14px;
                    >div:last-child {
                        font-size: 16px;
                        margin: 8px 0;
                    }
                }
                .qr-code {
                    padding: 6px;
                    background: #fff;
                    display: table;
                    margin: 0 auto;
                }
                .qr-tip {
                    margin: 12px 0;
                    font-size: 12px;
                    color: #0f0f0f;
                }
            }
        }
        .btn-box {
            margin-top: 12px;
            text-align: center;
            button {
                width: 160px;
            }
        }
    }
}
</style>