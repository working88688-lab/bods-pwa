<template>
    <div class="page-container">
        <Header textColor="#222222" title="找回账号" :isBlur="false" @onClickLeft="onBack" />
        <div class="page-content">
            <van-tabs
                v-if="tabList.length > 1"
                v-model="activeTab"
                title-inactive-color="#f8f8f8"
                title-active-color="#d92514"
                color="#d92514"
                background="none"
                :ellipsis=false
                @change="onChangeTab"
                >
                <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.value"></van-tab>
            </van-tabs>
            <div class="form-section">
                <van-form @submit="onSubmit">
                    <van-cell-group inset :border="false">
                        <template v-if="activeTab === 1">
                            <van-field
                                v-model="loginForm.mobile"
                                name="mobile"
                                placeholder="请填写手机号"
                                :border="false"
                                @blur="onValidateform"
                            />
                            <van-field
                                v-model="loginForm.code"
                                name="code"
                                placeholder="请填写验证码"
                                :border="false"
                                @blur="onValidateform"
                            >
                                <template slot="extra">
                                    <span class="send" @click="onSend">{{ sendBtnTip }}</span>
                                </template>
                            </van-field>
                        </template>
                        <template v-if="activeTab === 2">
                            <van-field
                                label="二维码"
                                placeholder="请上传二维码"
                            >
                                <template slot="input">
                                    <van-uploader v-model="loginForm.mediaCoverImg" accept="image/*" :max-count="1" :after-read="afterReadCover" />
                                </template>
                            </van-field>
                        </template>
                    </van-cell-group>
                    <div class="btn-box">
                        <van-button round block type="primary" native-type="submit" :loading="loginLoading">找回</van-button>
                    </div>
                </van-form>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import { sendCodePhone, loginPhone } from '@/apis/user'
import QrcodeDecoder from 'qrcode-decoder'

export default {
    name: 'Login',
    components: { Header },
    data() {
        return {
            activeTab: 1,
            tabList: [
                { label: '手机号找回', value: 1},
                { label: '二维码找回', value: 2 }
            ],
            loginForm: {
                mobile: '',
                code: ''
            },
            isSend: false,
            sendLoading: false,
            sendBtnTip: '获取验证码',
            downLoad: 60,
            timer: null,
            loginLoading: false,
            isValidate: false
        }
    },
    computed: {},
    created() {},
    mounted() {},
    destroyed() {
        this.timer && clearInterval(this.timer)
    },
    methods: {
        onChangeTab() { },
        async onSend() {
            if(this.sendLoading || this.downLoad !== 60) {
                return null
            }
            if (!this.loginForm.mobile) {
                return this.$toast('请先填写手机号')
            } else {
                if (this.loginForm.mobile.length !== 11) {
                return this.$toast('请先填写正确的手机号')
                }
            }
            this.sendLoading = true
            const res = await sendCodePhone({ mobile: this.loginForm.mobile }).catch(() => {
                this.sendLoading = false
            })
            this.sendLoading = false
            if (res && res.code === 0) {
                this.$toast('验证码发送成功')
                this.isSend = true
                this.downloadTip()
            } else {
                if (res.code === 1 && res.msg === '验证码已发送，请查看短信') {
                    this.isSend = true
                    this.downloadTip()
                }
            }
        },
        downloadTip () {
            this.timer = setInterval(() => {
                if (this.downLoad < 0) {
                    clearInterval(this.timer)
                    this.downLoad = 60
                    this.sendBtnTip = '获取验证码'
                } else {
                    this.sendBtnTip = this.downLoad + '秒'
                    this.downLoad --
                }
            }, 1000)
        },
        onValidateform() {
            if (this.loginForm.mobile && this.loginForm.mobile.length === 11 && this.isSend && this.loginForm.code) {
                this.isValidate = true
            } else {
                this.isValidate = false
            }
        },
        async afterReadCover(file) {
            const fileType = file.file.type
            if (fileType.indexOf('image') === -1) {
                return this.$toast('请选择图片上传')
            }
            const qr = new QrcodeDecoder()
            const qrtext = qr.decodeFromImage(file.content)
            file.status = 'uploading';
            file.message = '上传中...';
            // const formData = new FormData()
            // formData.append('file', file.file)
            // const res = await uploadFile(formData, { timeout: 10 * 60 * 1000 })
            // if(res && res.code === 0) {
            //     file.status = 'done';
            //     file.message = '上传成功';
            //     this.mediaCoverImg.push(res.data.url)
            // } else {
            //     file.status = 'failed';
            //     file.message = '上传失败';
            // }
        },
        async onSubmit() {
            if (!this.loginForm.mobile) {
                return this.$toast('请先填写手机号')
            } else {
                if (this.loginForm.mobile.length !== 11) {
                return this.$toast('请先填写正确的手机号')
                }
            }
            if (!this.isSend) {
                return this.$toast('请先发送验证码')
            } else {
                if (!this.loginForm.code) {
                return this.$toast('请先填写验证码')
                }
            }
            const params = Object.assign({}, this.loginForm)
            this.loginLoading = true
            const res = await loginPhone(params).catch(() => {
                this.isSend = false
                this.loginLoading = false
                this.timer && clearInterval(this.timer)
                this.downLoad = 60
                this.sendBtnTip = '获取验证码'
            })
            this.isSend = false
            this.loginLoading = false
            this.timer && clearInterval(this.timer)
            this.downLoad = 60
            this.sendBtnTip = '获取验证码'
            if (res && res.code === 0) {
                this.$store.commit('SET_USERINFO', res.data)
                
                this.loginForm = {
                    mobile: '',
                    code: ''
                }
                this.isSend = false
                this.loginLoading = false
                this.$router.go(-1)
            }
        },
        onBack() {
            try {
                this.$router.go(-1)
            } catch (error) {
                this.$router.push('/')
            }
        }
    }
};
</script>

<style lang="less" scoped>
.page-content {
    padding: 64px 16px 16px;
    box-sizing: border-box;
    .form-section {
        margin: 24px 0;
    }
}
/deep/ .van-form {
    .van-cell-group {
        margin: 0 0 32px;
        border-radius: 10px;
        .van-cell {
            overflow: hidden;
            background: #fff;
            .van-field__control {
                height: 30px;
                line-height: 30px;
                font-size: 14px;
            }
        }
    }
    .send {
        font-size: 14px;
        height: 30px;
        line-height: 30px;
        color: #222222;
    }
    .btn-box {}
    .cs-box {
        margin: 15px 0;
        text-align: center;
        color: #8c9198;
        font-size: 14px;
        span:last-child {
            color: #06121e;
        }
    }
}
</style>