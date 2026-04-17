<template>
    <div class="page-container flex-container page">
        <Header textColor="#222222" title="绑定手机号" @onClickLeft="onBack" />
        <div class="page-content">
            <van-form @submit="onSubmit">
                <van-cell-group inset :border="false">
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
                </van-cell-group>
                <div class="btn-box">
                    <van-button round block type="primary" native-type="submit" :loading="loginLoading">绑定</van-button>
                </div>
            </van-form>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import { sendCodePhone, bindPhone } from '@/apis/user'

export default {
    name: 'Login',
    components: { Header },
    data() {
        return {
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
            const res = await bindPhone(params).catch(() => {
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
    padding: 16px;
    box-sizing: border-box;
    flex: 1;
    overflow: auto;
}
/deep/ .van-form {
    .van-cell-group {
        margin: 0 0 70px;
        .van-cell {
            overflow: hidden;
            background: #fff;
            margin-bottom: 10px;
            border-radius: 24px;
            .van-field__control {
                height: 20px;
                line-height: 20px;
                font-size: 14px;
            }
        }
    }
    .send {
        font-size: 14px;
        height: 20px;
        line-height: 20px;
        color: #2a78f6;
    }
    .btn-box {}
}
</style>