<template>
    <div class="page-container">
        <Header textColor="#222222" color="#fff" title="提现" right="提现记录" rightColor="#222222" @onClickLeft="onBack" @onClickRight="onRoute('/withdrawRecord')"/>
        <div class="page-content">
            <Loading v-if="isInit" />
            <template v-else>
                <div class="balance">总收益：{{ userInfo && userInfo.balance }}</div>
                <van-form label-width="50px">
                    <van-cell-group>
                        <div class="field-label">提现金额</div>
                        <van-field
                            v-model="formData.amount"
                            name="amount"
                            type="number"
                            placeholder="提现金额不低于100元"
                        />
                    </van-cell-group>
                    <van-cell-group>
                        <div class="field-label">
                            <span>提现方式</span>
                            <span class="sub-label">周六日无法提现</span>
                        </div>
                        <van-field
                            v-model="formData.amount"
                            name="title"
                        >
                            <template slot="input">
                                <van-radio-group v-model="formData.withdrawalWay">
                                    <div class="wayType-item" v-for="(wayType, idx) in wayTypeList" :key="idx">
                                        <van-radio :disabled="!wayType.info" :name="wayType.value" checked-color="#d92514">
                                            <div>{{ wayType.label }}</div>
                                        </van-radio>
                                        <div class="btn-bind" v-if="!wayType.info" @click="onBind(wayType)">
                                            <span>去绑定</span>
                                            <van-icon name="arrow" />
                                        </div>
                                        <div v-else>
                                            <span class="btn-view" @click="onView(wayType)">查看</span>
                                            <span class="btn-update" @click="onBind(wayType)">换绑</span>
                                        </div>
                                    </div>
                                </van-radio-group>
                            </template>
                        </van-field>
                    </van-cell-group>
                </van-form>
                <div class="btn-box">
                    <van-button round block type="primary" :loading="loading" @click="onSubmit">提现申请</van-button>
                </div>
            </template>
            <BindWithdrawType ref="bindWithdrawType" :editable="isEditable" @close="handleClose" />
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import { withdrawAcctInfo, withdrawApply } from '@/apis/user'
import Loading from '@/components/Loading'
import BindWithdrawType from './BindWithdrawType'
import { Dialog } from 'vant'
import { centerUserInfo } from '@/apis/user'

export default {
    name: 'Recharge',
    components: {
        Header,
        Loading,
        BindWithdrawType
    },
    data(){
        return {
            isInit: true,
            loading: false,
            formData: {
                amount: null,
                withdrawalWay: null
            },
            wayTypeList: [
                { label: 'USDT', value: 'usdt', info: null },
                { label: '银行卡', value: 'bank', info: null },
                { label: '支付宝收款二维码', value: 'alipay', info: null },
                { label: '微信收款二维码', value: 'wechat', info: null }
            ],
            isEditable: false
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    created() {
        
    },
    activated() {
        this.getUserInfo()
        this.getWithdrawInfo()
    },
    methods: {
        async getUserInfo() {
            const res = await centerUserInfo()
                if (res && res.code === 0) {
                this.$store.commit('SET_USERINFO', res.data)
            }
        },
        onBack() {
            this.$router.push('/wallet')
        },
        onRoute(path) {
            this.$router.push(path)
        },
        async getWithdrawInfo() {
            const res = await withdrawAcctInfo({}).catch(() => {
                this.isInit = false
            })
            this.isInit = false
            if (res && res.code === 0) {
                this.withdrawData = res.data
                res.data.forEach(one => {
                    this.wayTypeList.forEach((wayType, idx) => {
                        if (wayType.value === one.type) {
                            const newData = Object.assign({}, wayType)
                            newData.info = one
                            this.$set(this.wayTypeList, idx, newData)
                        }
                    })
                })
            }
        },
        onBind(wayType) {
            this.isEditable = true
            this.$refs.bindWithdrawType.onShowComment(wayType)
        },
        onView(wayType) {
            this.isEditable = false
            this.$refs.bindWithdrawType.onShowComment(wayType)
        },
        handleClose(data) {
            if (data) {
                this.wayTypeList.forEach((wayType, idx) => {
                    if (wayType.value === data.type) {
                        const newData = Object.assign({}, wayType)
                        newData.info = data
                        this.$set(this.wayTypeList, idx, newData)
                    }
                })
            }
        },
        async onSubmit() {
            if (!this.formData.amount) {
                return this.$toast('请先输入提现金额')
            } else {
                if(this.formData.amount < 100) {
                    return this.$toast('提现金额至少100元')
                }
                if(this.formData.amount > this.userInfo.balance) {
                    return this.$toast('可提现金额超过总收益')
                }
            }
            if (!this.formData.withdrawalWay) {
                return this.$toast('请先选择提现方式')
            }
            const { amount, withdrawalWay} = this.formData
            const params = {
                withdrawalWay,
                amount
            }
            this.loading = true
            const res = await withdrawApply(params).catch(() => {
                this.loading = false
            })
            this.loading = false
            if (res && res.code === 0) {
                this.formData = {
                    amount: null,
                    withdrawalWay: null
                }
                Dialog.alert({
                    message: '提现发起成功，预计1-3个工作日打款',
                    confirmButtonText: '知道了'
                }).then(async () => {})
                const userData = Object.assign({}, this.userInfo)
                userData.balance = userData.balance - amount
                this.$store.commit('SET_USERINFO', userData)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.page-content {
    padding: 46px 12px 12px;
    background: #f5f5f5;
    min-height: 100vh;
    .balance {
        font-size: 14px;
        color: #1d1d1f;
        margin: 12px 0;
    }
    .wayType-item {
        height: 55px;
        line-height: 55px;
        display: flex;
        justify-content: space-between;
    }
    .btn-box {
        margin: 36px 12px 24px;
    }
    .btn-view {
        margin: 0 12px;
        color: #222222;
    }
    .btn-update {
        color: #d92514;
    }
}
::v-deep .van-form {
    .van-cell-group {
        .field-label {
            margin: 24px 0 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            .sub-label {
                font-size: 12px;
                color: #999999;
            }
        }
        .van-cell {
            background: #fff;
        }
    }
}
::v-deep .van-radio-group {
    width: 100%;
}
</style>