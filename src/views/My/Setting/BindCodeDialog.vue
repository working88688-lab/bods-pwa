<template>
    <van-dialog v-model:show="showDialog" :showConfirmButton="false" :closeOnClickOverlay="false">
        <div class="dialog-header">
            <div class="dialog-title">邀请码绑定</div>
            <van-icon name="close" @click="onClose" />
        </div>
        <div class="content">
            <van-form class="form-section">
                <van-cell-group inset :border="false">
                    <van-field
                        v-model="form.code"
                        name="code"
                        placeholder="请填写邀请码"
                        :border="false"
                    />
                </van-cell-group>
            </van-form>
            <div class="btn-box">
                <van-button round block type="primary" native-type="submit" :loading="loading" @click="onSubmit()">绑定</van-button>
            </div>
        </div>
    </van-dialog>
</template>

<script>
import Header from '@/components/Header'
import { bingInviteCode } from '@/apis/user'

export default {
    name: 'BindCodeDialog',
    components: { Header },
    data() {
        return {
            showDialog: false,
            form: {
                code: ''
            },
            loading: false
        }
    },
    computed: {},
    created() {},
    mounted() {},
    destroyed() {},
    methods: {
        onShow() {
            this.showDialog = true
        },
        onClose() {
            this.form.code = ''
            this.showDialog = false
        },
        async onSubmit() {
            if (!this.form.code) {
                return this.$toast('请先填写邀请码')
            }
            const params = Object.assign({}, this.form)
            this.loading = true
            const res = await bingInviteCode(params).catch(() => {
                this.loading = false
            })
            this.loading = false
            if (res && res.code === 0) {
                this.$store.commit('SET_USERINFO', res.data)
                this.onClose()
            }
        }
    }
};
</script>

<style lang="less" scoped>
.van-dialog {
    background: url(../../../assets/images/dialog_bg.png) top / 100% no-repeat #fff;
    border-radius: 8px;
    .van-dialog__content {
        .dialog-header {
            height: 100px;
            position: relative;
            .dialog-title {
                line-height: 100px;
                text-align: center;
                color: #862945;
                font-size: 20px;
                font-weight: bold;
            }
            .van-icon-close {
                position: absolute;
                top: 12px;
                right: 12px;
                z-index: 1;
                font-size: 24px;
                cursor: pointer;
                color: #862945;
            }
        }
        .content {
            text-align: center;
            color: #ebebeb;
            text-align: center;
            position: relative;
            padding: 36px 42px;
        }
    }
}
/deep/ .van-form {
    .van-cell-group {
        margin: 0 0 32px;
        border-radius: 24px;
        .van-cell {
            overflow: hidden;
            background: #f6f6f6;
            .van-field__control {
                height: 20px;
                line-height: 20px;
                font-size: 14px;
            }
        }
    }
}
</style>