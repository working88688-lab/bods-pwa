<template>
    <van-popup v-model="showComment" class="comment-box" position="bottom" :lock-scroll="true">
        <div class="comment-header">
            <div class="comment-title">{{ editable ? '绑定' + wayType.label : '查看' + wayType.label }}</div>
            <span class="close-btn" @click="onClose()">
                <img src="@/assets/images/iconClose.png">
            </span>
        </div>
        <Loading v-if="isInit" height="300px" />
        <template v-else>
            <van-form label-width="50px" :disabled="!editable">
                <template v-if="formData.type === 'usdt'">
                    <van-cell-group :border="false">
                        <div class="field-label">USDT钱包地址</div>
                        <van-field
                            v-model="formData.account"
                            name="account"
                            placeholder="请填写USDT钱包地址"
                        />
                    </van-cell-group>
                    <div class="rule-section">
                        <div class="field-label">提现须知</div>
                        <div class="rule-list">
                            <p>1. 钱包地址必须为TRC20地址，请谨慎填写，因填写错误导致未收到提款金额，平台不予负责您的金额损失。</p>
                            <p>2. 目前仅在北京时间9点到21点（除周六日）可以提现。</p>
                            <p>3. 实际到账金额以打款当时汇率为准。</p>
                            <p>4. 每次提现需扣除XUSDT作为手续费。</p>
                        </div>
                    </div>
                </template>
                <template v-if="formData.type === 'bank'">
                    <van-cell-group :border="false">
                        <div class="field-label">银行卡号</div>
                        <van-field
                            v-model="formData.account"
                            name="account"
                            placeholder="请填写银行卡号"
                        />
                    </van-cell-group>
                    <van-cell-group :border="false">
                        <div class="field-label">银行名称</div>
                        <van-field
                            v-model="formData.bankName"
                            name="bankName"
                            placeholder="请填写银行名称"
                        />
                    </van-cell-group>
                    <van-cell-group :border="false">
                        <div class="field-label">持卡人姓名</div>
                        <van-field
                            v-model="formData.personName"
                            name="personName"
                            placeholder="请填写持卡人姓名"
                        />
                    </van-cell-group>
                    <van-cell-group :border="false">
                        <div class="field-label">开户地址</div>
                        <van-field
                            v-model="formData.bankRegion"
                            name="bankRegion"
                            placeholder="请填写开户地址"
                        />
                    </van-cell-group>
                    <van-cell-group :border="false">
                        <div class="field-label">电话</div>
                        <van-field
                            v-model="formData.tel"
                            name="tel"
                            placeholder="请填写电话"
                        />
                    </van-cell-group>
                    <div class="rule-section">
                        <div class="field-label">提现须知</div>
                        <div class="rule-list">
                            <p>1. 为了提现成功，请填写正确的开户信息。</p>
                            <p>2. 一旦提交不能修改，如需修改请联系客服。</p>
                            <p>3. 目前仅在北京时间9点到21点（除周六日）可以提现。</p>
                        </div>
                    </div>
                </template>
                <template v-if="formData.type === 'alipay' || formData.type === 'wechat'">
                    <van-cell-group :border="false">
                        <div class="field-label">收款二维码</div>
                        <template v-if="editable">
                            <van-uploader v-model="qrCodeImg" accept="image/*" :max-count="1" :after-read="afterRead" />
                        </template>
                        <template v-else>
                            <van-image width="160" height="160" :src="(imageBase + formData.account)" />
                        </template>
                    </van-cell-group>
                    <div class="rule-section">
                        <div class="field-label">提现须知</div>
                        <div class="rule-list">
                            <p>1. 为了提现成功，请上传正确的收款二维码。</p>
                            <p>2. 因收款二维码错误导致未收到提现金额，平台不予负责您的金额损失。</p>
                            <p>3. 目前仅在北京时间9点-21点(除周六日)可以提现。</p>
                            <p>4. 实际到账金额以打款当时汇率为主。</p>
                            <p>5. 每次提现需扣除X元作为手续费</p>
                        </div>
                    </div>
                </template>
            </van-form>
            <div class="btn-box btn-box-2" v-if="editable">
                <van-button round type="primary" :loading="isLoading" @click="onSubmit">绑定</van-button>
                <van-button round @click="onClose()">取消</van-button>
            </div>
            <div class="btn-box" v-else>
                <van-button round block @click="onClose()">取消</van-button>
            </div>
        </template>
    </van-popup>
</template>

<script>
import { uploadFile, withdrawAcctBind } from '@/apis/user'
import Loading from '@/components/Loading'

export default {
    name: 'BindWithdrawType',
    props: {
        editable: {
            type: Boolean,
            default: false
        }
    },
    components: { Loading },
    data() {
        return {
            isInit: true,
            showComment: false,
            formData: {
                type: '',
                account: '',
                bankName: '',
                personName: '',
                bankRegion: '',
                tel: '',
            },
            isLoading: false,
            showDialog: false,
            wayType: {},
            qrCodeImg: []
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
    mounted() {},
    methods: {
        onShowComment(wayType) {
            this.wayType = wayType
            this.isInit = false
            this.qrCodeImg = []
            this.formData = {
                type: this.wayType.value,
                account: this.wayType.info ? this.wayType.info.account : '',
                bankName: this.wayType.info ? this.wayType.info.bankName : '',
                personName: this.wayType.info ? this.wayType.info.personName : '',
                bankRegion: this.wayType.info ? this.wayType.info.bankRegion : '',
                tel: this.wayType.info ? this.wayType.info.tel : '',
            }
            this.showComment = true
        },
        onClose(data) {
            this.showComment = false
            this.$emit('close', data)
        },
        async afterRead(file) {
            const fileType = file.file.type
            if (fileType.indexOf('image') === -1) {
                return this.$toast('请选择图片上传')
            }
            file.status = 'uploading';
            file.message = '上传中...';
            const formData = new FormData()
            formData.append('file', file.file)
            const res = await uploadFile(formData)
            if(res && res.code === 0) {
                file.status = 'done';
                file.message = '上传成功';
                this.formData.account = res.data.url
            } else {
                file.status = 'failed';
                file.message = '上传失败';
            }
        },
        async onSubmit() {
            const { type, account, bankName, personName, bankRegion, tel } = this.formData
            let params = {}
            if (type === 'usdt') {
                if (!this.formData.account) {
                    return this.$toast('请先填写USDT钱包地址')
                }
                params = {
                    type,
                    account
                }
            }
            if (type === 'bank') {
                if (!this.formData.account) {
                    return this.$toast('请先填写银行卡号')
                }
                if (!this.formData.bankName) {
                    return this.$toast('请先填写银行名称')
                }
                if (!this.formData.personName) {
                    return this.$toast('请先填写持卡人姓名')
                }
                if (!this.formData.tel) {
                    return this.$toast('请先填写电话')
                }
                params = {
                    type,
                    account,
                    bankName,
                    personName,
                    bankRegion,
                    tel
                }
            }
            if (type === 'alipay' || type === 'wechat') {
                if (!this.formData.account) {
                    return this.$toast('请先上传二维码收款图片')
                }
                params = {
                    type,
                    account
                }
            }
            this.isLoading = true
            const res = await withdrawAcctBind(params).catch(() => {
                this.isLoading = false
            })
            this.isLoading = false
            if (res && res.code === 0) {
                this.$toast('绑定成功')
                this.onClose(params)
            }
        }
    }
};
</script>

<style lang="less" scoped>
.comment-box {
    min-height: 50%;
    border-radius: 12px 12px 0 0;
    .comment-header {
        position: relative;
        padding: 16px;
        z-index: 8;
        .comment-title {
            font-size: 18px;
            text-align: center;
        }
        .close-btn {
            position: absolute;
            top: 16px;
            right: 16px;
            cursor: pointer;
            img {
                width: 18px;
                height: 18px;
            }
        }
    }
    .empty-box {
        height: calc(100% - 110px);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .rule-section {
        margin: 36px 0 12px;
        .rule-list {
            font-size: 12px;
            p {
                margin: 6px 0;
            }
        }
    }
    .btn-box {
        margin: 24px 12px 12px;
        .van-button--default {
            background-color: #dddddf;
        }
    }
    .btn-box-2 {
        .van-button {
            width: calc((100% - 24px) / 2);
        }
        .van-button:first-child {
            margin-right: 24px;
        }
    }
}
::v-deep .van-form {
    padding: 0 12px 12px;
    .van-cell-group {
        .field-label {
            margin: 12px 0 12px!important;
        }
        .van-cell {
            background: #f5f5f5!important;
        }
    }
}
</style>