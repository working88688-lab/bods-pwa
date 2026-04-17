
<template>
    <van-dialog v-model:show="showFeeDialog" :showConfirmButton="false" :closeOnClickOverlay="false">
        <div class="content">
            <span class="close-btn" @click="onClose"></span>
            <div class="fee-vip" v-if="dialogData.type === 'vip'">
                <div class="title">{{ dialogData.title }}</div>
                <div class="desc">{{ dialogData.message }}</div>
                <div class="btn-box">
                    <van-button block round type="primary" class="btn-vip" @click="onRoute('/vip')">{{ dialogData.btnText }}</van-button>
                </div>
            </div>
            <div class="fee-level" v-if="dialogData.type === 'level'">
                <div class="title">{{ dialogData.title }}</div>
                <div class="desc">{{ dialogData.message }}</div>
                <div class="btn-box">
                    <van-button block round type="primary" class="btn-vip" @click="onRoute('/vip')">{{ dialogData.btnText }}</van-button>
                </div>
            </div>
            <div class="fee-coin" v-if="dialogData.type === 'coin' || dialogData.type === 'live'">
                <div class="title">{{ dialogData.title }}</div>
                <div class="desc">
                    {{ dialogData.message }}
                    <div class="tip" v-if="dialogData.tip">{{ dialogData.tip }}</div>
                </div>
                <div class="btn-box">
                    <template v-if="dialogData.type === 'coin'">
                        <van-button block round type="primary" class="btn-coin" @click="onRoute('/recharge')">{{ dialogData.btnText }}</van-button>
                    </template>
                    <template v-else>
                        <van-button block round type="primary" class="btn-coin" @click="onConfirm">{{ dialogData.btnText }}</van-button>
                        <div class="balance">金币余额 {{ userInfo.coinBalance }}</div>
                    </template>
                </div>
            </div>
        </div>
    </van-dialog>
</template>

<script>

export default {
    name: 'feeDialog',
    props: {},
    data() {
        return {
            dialogData: {},
            showFeeDialog: false
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    created() {},
    methods: {
        onShow(data) {
            this.dialogData = data
            this.showFeeDialog = true
        },
        onClose() {
            this.showFeeDialog = false
            this.$emit('onClose')
        },
        onRoute(path) {
            this.onClose()
            this.$router.push(path)
        },
        onConfirm() {
            this.showFeeDialog = false
            this.$emit('onConfirm', this.dialogData.data)
        }
    }
}
</script>
<style lang="less" scoped>
.van-dialog {
    background-color: transparent;
    border-radius: 4px;
    .van-dialog__content {
        .content {
            text-align: center;
            color: #ebebeb;
            text-align: center;
            position: relative;
            background-color: transparent;
            .close-btn {
                position: absolute;
                top: 42px;
                right: 8px;
                z-index: 1;
                width: 24px;
                height: 24px;
                background: url(../../../assets/images/icon_close.png) center / 100%;
                cursor: pointer;
            }
            .fee-vip {
                background: #fff;
                position: relative;
                padding: 120px 48px 24px;
                .title {
                    font-size: 24px;
                }
                .desc {
                    font-size: 15px;
                    margin: 48px 0 24px;
                }
            }
            .fee-vip::after {
                content: '';
                width: 100%;
                height: 100%;
                background: #252633;
                position: absolute;
                left: 0;
                top: 120px;
                z-index: -1;
            }
            .fee-coin {
                position: relative;
                padding: 120px 48px 24px;
                .title {
                    font-size: 24px;
                }
                .desc {
                    font-size: 15px;
                    margin: 48px 0 24px;
                    .tip {
                        margin-top: 6px;
                    }
                }
            }
            .fee-coin::after {
                content: '';
                width: 100%;
                height: 100%;
                background: #252633;
                position: absolute;
                left: 0;
                top: 120px;
                z-index: -1;
            }
            .balance {
                color: #a3a3a3;
                font-size: 12px;
                margin-top: 12px;
            }
        }
    }
}
::v-deep .van-button {
    border-radius: 24px;
}
</style>