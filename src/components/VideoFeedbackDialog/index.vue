<template>
    <van-dialog v-model="showDialog" class="fd-dialog" :showConfirmButton="false" :closeOnClickOverlay="true">
        <div class="content">
            <div class="dialog-title">视频问题反馈</div>
            <div class="check-box">
                <van-field name="radio" label="">
                    <template #input>
                        <van-radio-group v-model="radio" v-for="(v, i) in checkboxList" :key="i" direction="horizontal">
                            <div class="row">
                                <div class="label">{{ v.label }}</div>
                                <van-radio :name="v.value"></van-radio>
                            </div>
                        </van-radio-group>
                    </template>
                </van-field>
            </div>
            <div class="dialog-btn-box">
                <van-button round class="mr-24" @click="hide">取消</van-button>
                <van-button round type="primary" :loading="reqing" loading-text="提交中..." @click="onSubmit">提交</van-button>
            </div>
        </div>
    </van-dialog>
</template>
<script>

import { commitIssue } from '@/apis/media'

export default {
    name: 'VideoFeedbackDialog',
    props: {
        mediaId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            showDialog: false,
            radio: null,
            reqing: false,
            // 0:画面卡顿，1:画面花屏，2无法播放 3加载很慢，4没有声音，5内容不符
            checkboxList: [
                {
                    value: 2,
                    label: '无法播放'
                },
                {
                    value: 3,
                    label: '加载很慢'
                },
                {
                    value: 4,
                    label: '没有声音'
                },
                {
                    value: 5,
                    label: '内容不符'
                },
                {
                    value: 0,
                    label: '画面卡顿'
                },
                {
                    value: 1,
                    label: '画面花屏'
                }
            ]
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    mounted() { },
    methods: {
        show() {
            this.showDialog = true
        },
        hide() {
            this.reqing = false
            this.showDialog = false
        },
        async onSubmit() {
            if (this.mediaId) {
                this.reqing = true
                let params = {
                    issueType: this.radio,
                    mediaId: this.mediaId
                }

                let res = await commitIssue(params)
                if (res.code === 0) {
                    this.$toast('反馈成功')
                }
                this.reqing = false
                this.hide()
            }
        }
    },
}
</script>
<style lang="less" scoped>
::v-deep.fd-dialog {
    width: 80% !important;
    max-width: 300px !important;
    text-align: center;
    padding: 16px;

    .dialog-title {
        font-size: 18px;
        color: #000;
        font-weight: 600;
    }

    .check-box {
        padding: 16px 0;
    }

    .dialog-btn-box {
        display: flex;

        .van-button {
            width: 45%;
        }

        .van-button--default {
            border: 1px solid var(--theme-color);
            color: var(--theme-color);
            border-radius: 24px;
        }
    }
}

::v-deep .van-cell {
    background: unset !important;

    .van-field__control {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
    }

    .van-radio__icon {
        background: #fff;
        font-size: 15px;
        border-radius: 50%;

        .van-icon {
            color: #fff;
        }
    }

    .van-radio__icon--checked {
        .van-icon {
            background-color: var(--theme-color) !important;
            border-color: var(--theme-color);

        }
    }

    .van-radio-group--horizontal {
        width: 50%;

        .row {
            display: flex;
            flex-direction: row;
            width: 100%;
            margin-top: 10px;

            .label {
                width: 75%;
                font-size: 14px;
                text-align: center;
            }

            .van-radio {
                flex: 1;
            }
        }
    }

}
</style>