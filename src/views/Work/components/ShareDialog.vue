<template>
    <van-dialog v-model:show="showDialog" :showConfirmButton="false" :closeOnClickOverlay="false">
        <div class="dialog-content">
            <span class="btn-close" @click="onClose"></span>
            <div class="content" v-lazy:background-image="imageBase + cover" ref="capture">
                <div class="content-bottom">
                    <div class="comic-name">{{ title }}</div>
                    <div class="qr-code-wraper" v-if="showDialog">
                        <div class="qr-code" ref="qrCodeUrl"></div>
                        <div class="content-wraper">
                            <div class="invitacode">推广码 {{ userInfo.shareCode }}</div>
                            <div>官网：{{ dataDic.shareaddress }}</div>
                        </div>
                        <div class="logo">
                            <img src="@/assets/logo.png" alt="logo">
                        </div>
                    </div>
                </div>
            </div>
            <div class="btn-box">
                <van-button round type="primary" @click="onSaveImg">保存图片</van-button>
                <van-button round type="primary" @click="onCopy">复制链接</van-button>
            </div>
        </div>
    </van-dialog>
</template>

<script>
import QRCode from "qrcodejs2"
import html2canvas from 'html2canvas'

export default {
    name: 'ShareDialog',
    props: {
        cover: {
            type: String,
            default: ''
        },
        title: {
            type: String,
            default: ''
        }
    },
    data(){
        return {
            showDialog: false,
            link: '',
            qrcode: null,
        }
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
        dataDic() {
            return this.$store.state.dataDic
        }
    },
    created() {
        this.link = this.dataDic.shareaddress + '?inviteCode=' + this.userInfo.shareCode
    },
    methods: {
        onShow() {
            this.showDialog = true
            this.$nextTick(() => {
                this.creatQrCode()
            })
        },
        onClose() {
            this.showDialog = false
            this.qrcode = null
        },
        creatQrCode() {
            this.qrcode = new QRCode(this.$refs.qrCodeUrl, {
                text: this.link,
                width: 78,
                height: 78,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            })
        },
        onSaveImg() {
            if (this.isApp) {
                this.$toast('请截屏保存')
            } else {
                html2canvas(this.$refs.capture, { useCORS: true }).then(canvas => {
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
        },
        onCopy() {
            if (!this.link) {
                return this.$toast('获取分享链接失败')
            }
            this.$copyText(this.link).then( e => {
                this.$toast('复制成功')
            })
        },
    }
}
</script>

<style lang="less" scoped>
.van-dialog {
    background-color: transparent;
    border-radius: 0;
    width: 85%;
    .dialog-content {
        .btn-close {
            position: absolute;
            right: 6px;
            top: 6px;
            z-index: 1;
            display: inline-block;
            width: 24px;
            height: 24px;
            background: url(../../../assets/images/iconDeletePic.png) center / 100% no-repeat;
            cursor: pointer;
        }
        .content {
            width: 100%;
            height: 300px;
            background-position: top;
            background-size: cover;
            background-repeat: no-repeat;
            position: relative;
            .content-bottom {
                width: 100%;
                position: absolute;
                left: 0;
                bottom: 0;
                background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
                padding: 64px 12px 12px;
                .comic-name {
                    font-size: 20px;
                    color: #f8f8f8;
                    margin-bottom: 16px;
                    text-align: center;
                }
                .qr-code-wraper {
                    width: 100%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: space-between;
                    .qr-code {
                        width: 64px;
                        height: 64px;
                        display: inline-flex;
                        padding: 4px;
                        background: #fff;
                        margin: 0 auto;
                        border-radius: 6px;
                    }
                    .content-wraper {
                        width: calc(100% - 128px);
                        padding: 0 6px;
                        box-sizing: border-box;
                        font-size: 14px;
                        color: #f8f8f8;
                        text-align: center;
                        .invitacode {
                            color: #fff;
                            font-size: 18px;
                            margin-bottom: 8px;
                        }
                    }
                    .logo {
                        width: 64px;
                        img {
                            width: 100%;
                        }
                    }
                }
            }
        }
        .btn-box {
            margin-top: 12px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            .van-button {
                width: 150px;
                margin-bottom: 12px;
            }
        }
    }
}
</style>