<template>
    <van-dialog v-model:show="showDialog" :showConfirmButton="false" :closeOnClickOverlay="false">
        <div class="dialog-content">
            <span class="btn-close" @click="onClose"></span>
            <div class="content">
                <div class="title">打赏</div>
                <van-form class="form-section">
                    <van-cell-group inset :border="false">
                        <van-field
                            v-model="form.amount"
                            name="mobile"
                            placeholder="请填写打赏金额"
                            :border="false"
                        />
                    </van-cell-group>
                </van-form>
                <div class="form-bottom">
                    <div class="balance" v-if="userInfo">
                        余额：{{ userInfo.coinBalance || 0 }}
                    </div>
                    <div class="recharge" @click="onRoute('/recharge')">去充值</div>
                </div>
                <div class="btn-box">
                    <van-button block round type="primary" :loading="submitLoading" @click="onBuy">打赏</van-button>
                </div>
            </div>
        </div>
    </van-dialog>
</template>

<script>
import { Dialog } from 'vant'
import { anchorPurchase } from '@/apis/media'

export default {
    name: 'ShareDialog',
    props: {
        comicData: {
            type: Object,
            default: () => {
                return null
            }
        }
    },
    data(){
        return {
            showDialog: false,
            form: {
                amount: ''
            },
            submitLoading: false,
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
    created() {},
    methods: {
        onShow() {
            this.showDialog = true
        },
        onClose() {
            this.form.amount = ''
            this.showDialog = false
        },
        async onBuy() {
            if (!this.form.amount) {
                return this.$toast('请先填写打赏金额')
            }
            if (!/^[1-9]\d*$/.test(this.form.amount)) {
                return this.$toast('请填写非零的正整数')
            }
            if (this.form.amount > this.userInfo.coinBalance) {
                return this.$toast('余额不足')
            }
            this.submitLoading = true
            const res = await anchorPurchase({
                merchantAcct: this.comicData.mediaType,
                mediaId: this.comicData.mediaId,
                type: 2,
                amount: this.form.amount
            }).catch(() => {
                this.submitLoading = false
            })
            this.submitLoading = false
            if (res && res.code === 0) {
                // 扣除金币
                const userData = Object.assign({}, this.userInfo)
                userData.coinBalance = userData.coinBalance - this.form.amount
                this.$store.commit('SET_USERINFO', userData)
                this.form.amount = ''
                this.onClose()
                Dialog.alert({
                    message: '打赏成功，感谢您的支持',
                    confirmButtonText: '确定'
                }).then(async () => {})
            }
        },
    }
}
</script>

<style lang="less" scoped>
.van-dialog {
    background: url(../../../assets/images/dialog_bg2.png) top / 100% no-repeat #fff;
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
            padding: 0 46px;
            .title {
                height: 72px;
                line-height: 72px;
                font-size: 20px;
                color: #862945;
                text-align: center;
            }
            .form-section {
                padding: 16px 0;
            }
            .form-bottom {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 12px;
                color: #862945;
            }
        }
        .btn-box {
            margin: 24px 0 42px;
        }
    }
}
::v-deep .van-cell-group {
    margin: 0;
}
::v-deep .van-cell {
    background: #fffafb;
    // .van-cell__value {
    //     background:#eeeeee;
    // }
}
</style>