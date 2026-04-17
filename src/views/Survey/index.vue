<template>
    <div class="survey-page">
        <Loading v-if="pageLoading" />
        <template v-else>
            <div class="back-box">
                <van-icon name="arrow-left" color="#fff" @click="$router.go(-1)" />
            </div>
            <div class="content-wrap">
                <div class="lump-expl">
                    <div class="e-title">
                        <img class="img" src="@/assets/images/e-title-1.png" />
                    </div>
                    <div class="expl-box">
                        <div v-html="surveyData.activityDesc"></div>
                    </div>
                </div>
                <div class="lump-qs">
                    <div class="qs-top">
                        <img class="img" src="@/assets/images/e-title-2.png" />
                    </div>
                    <van-form ref="form" @failed="onFailed" @submit="onSubmit" :disabled="surveyData.submit == '1'"
                        scroll-to-error :show-error-message="false">
                        <div class="from-content">
                            <div class="progress-box">
                                <div class="progress">
                                    <van-progress :percentage="progressPercentage" stroke-width="6" :show-pivot="false"
                                        color="linear-gradient(to right, #a85bff, #7232dd)" />
                                </div>
                                <span class="txt">{{ answeredCount }}/{{ questionList.length }}</span>
                            </div>
                            <div class="qs-list" v-for="(item, i) in questionList" :key="i">
                                <!-- 单选题 -->
                                <div v-if="item.questionType == 1" class="type1">
                                    <div class="title">{{ i + 1 }}、{{ item.questionName }} <span
                                            class="f-txt">（单选）</span></div>
                                    <van-field name="radio" label=""
                                        :rules="[{ validator: (value) => value, type: 'string', required: true, message: '请选择答案' }]">
                                        <template #input>
                                            <van-radio-group v-model="item.radio" :disabled="surveyData.submit == '1'">
                                                <van-radio v-if="item.itemA" :name="item.itemA">{{ item.itemA
                                                }}</van-radio>
                                                <van-radio v-if="item.itemB" :name="item.itemB">{{ item.itemB
                                                }}</van-radio>
                                                <van-radio v-if="item.itemC" :name="item.itemC">{{ item.itemC
                                                }}</van-radio>
                                                <van-radio v-if="item.itemD" :name="item.itemD">{{ item.itemD
                                                }}</van-radio>
                                                <van-radio v-if="item.itemE" :name="item.itemE">{{ item.itemE
                                                }}</van-radio>
                                                <van-radio v-if="item.itemF" :name="item.itemF">{{ item.itemF
                                                }}</van-radio>
                                            </van-radio-group>
                                        </template>
                                    </van-field>
                                </div>
                                <!-- 多选 -->
                                <div v-if="item.questionType == 2" class="type2">
                                    <div class="title">{{ i + 1 }}、{{ item.questionName }}<span
                                            class="f-txt">（多选）</span></div>
                                    <van-field name="checkboxGroup" label=""
                                        :rules="[{ validator: (value) => value.length > 0, type: 'array', required: true, message: '请选择答案' }]">
                                        <template #input>
                                            <van-checkbox-group v-model="item.checkbox"
                                                :disabled="surveyData.submit == '1'">
                                                <van-checkbox v-if="item.itemA" :name="item.itemA">{{
                                                    item.itemA
                                                }}</van-checkbox>
                                                <van-checkbox v-if="item.itemB" :name="item.itemB">{{
                                                    item.itemB
                                                }}</van-checkbox>
                                                <van-checkbox v-if="item.itemC" :name="item.itemC">{{
                                                    item.itemC
                                                }}</van-checkbox>
                                                <van-checkbox v-if="item.itemD" :name="item.itemD">{{
                                                    item.itemD
                                                }}</van-checkbox>
                                                <van-checkbox v-if="item.itemE" :name="item.itemE">{{
                                                    item.itemE
                                                }}</van-checkbox>
                                                <van-checkbox v-if="item.itemF" :name="item.itemF">{{
                                                    item.itemF
                                                }}</van-checkbox>
                                            </van-checkbox-group>
                                        </template>
                                    </van-field>
                                </div>
                                <!-- 简短回答 -->
                                <div v-if="item.questionType === '0'" class="type3">
                                    <div class="title">{{ i + 1 }}、{{ item.questionName }}<span
                                            class="f-txt">（必填）</span></div>
                                    <div class="key-list">
                                        <van-field v-model="item.simpleAnswer" :error="false" name="validator" placeholder="请输入您的答案"
                                            :rules="[{ validator: (value) => { if (!value) return false; return true }, type: 'string', message: '请输入内容' }]" />
                                    </div>
                                </div>
                            </div>
                            <van-button class="submit-btn" round block type="info" native-type="submit"
                                :loading="loading" :disabled="surveyData.submit == '1'">提交问卷</van-button>
                        </div>
                    </van-form>
                </div>
            </div>
        </template>
        <successDialog ref="successDialogRef" :text="text" />
    </div>
</template>
<script>
import { surveyGetPage, submitSurvey } from '@/apis/survey'
import { debounce } from 'lodash';
import Loading from '@/components/Loading'
import successDialog from './successDialog.vue'

export default {
    components: {
        Loading,
        successDialog
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo;
        },
        progressPercentage() {
            if (this.questionList.length === 0) return 0
            return Math.round((this.answeredCount / this.questionList.length) * 100)
        }
    },
    watch: {
        // 深度监听表单数据变化
        questionList: {
            handler: debounce(function () {
                this.updateValidatedCount();
            }, 300),
            deep: true
        }
    },
    data() {
        return {
            awardTypeList: {
                '2': {
                    label: '金币',
                },
                '4': {
                    label: '天vip',
                },
                0: {
                    label: '无奖励',
                    type: ''
                },
            },
            pageLoading: true,
            surveyData: {},
            questionList: [],
            loading: false,
            answeredCount: 0,
            text: ''
        }
    },
    methods: {
        async updateValidatedCount() {
            try {
                await this.$refs.form.validate(); // 触发全部验证
                this.answeredCount = this.questionList.length; // 全部通过
            } catch (errors) {
                // 错误数量 = 总题数 - 错误题数
                this.answeredCount = this.questionList.length - Object.keys(errors).length;
            }
        },
        async getList() {
            let { id } = this.$route.query
            if (!id) return
            this.pageLoading = true
            try {
                let params = {
                    merchantAcct: process.env.VUE_APP_MERCHANTACCT,
                    surveyId: id
                }
                let res = await surveyGetPage(params)
                if (res.code === 0 && res.data) {
                    this.surveyData = res.data
                    this.questionList = this.surveyData.questionList
                    if (this.surveyData.submit == '1') {
                        this.questionList.map((item, i) => {
                            let check = []
                            for (let i in item) {
                                // 单选回显
                                if (item.questionType == 1 && item[`${i}Value`] == 1) {
                                    item.radio = item[i]
                                }
                                // 多选回显
                                if (item.questionType == 2 && item[`${i}Value`] == 1) {
                                    check.push(item[i])
                                    item.checkbox = check
                                }
                            }
                        })
                    }
                }
            } finally {
                this.pageLoading = false
            }

        },
       async onSubmit() {
            this.loading = true
            let { surveyId } = this.surveyData
            try {
                let params = {
                    merchantAcct: process.env.VUE_APP_MERCHANTACCT,
                    surveyId,
                    userId: this.userInfo.userId,
                    questionList: this.questionList
                }
                params.questionList = this.questionList.map((item) => {
                    let dataItem = JSON.parse(JSON.stringify(item))
                    for (let i in item) {
                        // 提取单选选中值
                        if (item.questionType == 1 && item.radio == item[i]) {
                            dataItem[`${i}Value`] = 1
                            delete dataItem.radio
                            delete dataItem.radioValue
                        }
                        // 提取多选选中值
                        if (item.questionType == 2 && item.checkbox.includes(item[i])) {
                            dataItem[`${i}Value`] = 1
                            delete dataItem.checkbox
                        }
                        delete dataItem.merchantAcct
                    }
                    return dataItem
                })

                let res = await submitSurvey(params)
                if (res.code == 0) {
                    if (this.surveyData.prizeType !== '0') {
                        this.text = `恭喜获得${this.surveyData.prizeNumber}${this.awardTypeList[this.surveyData.prizeType].label}`
                        this.$refs.successDialogRef.onShow()
                    }else{
                        this.$toast('提交成功')
                    }
                    this.getList()
                }
            } finally {
                this.loading = false
            }

        },

        onFailed(errorInfo) {
            this.$toast('请完善回答')
        },
    },
    mounted() {
        this.getList()
    }
}
</script>
<style lang="less" scoped>
.survey-page {
    background: url('../../assets/images/survey-bg.png');
    background-position: top;
    background-repeat: no-repeat;
    background-size: cover;
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    padding-bottom: 60px;
    color: #000;
    display: flex;
    flex-direction: column;

    .back-box {
        position: absolute;
        top: calc(var(--safe-area-top) + 6px);
        left: 10px;
        z-index: 10;
        font-size: 24px;
    }

    .submit-btn {
        width: 186px;
        height: 40px;
        line-height: 40px;
        color: #fff;
        background: #2098fa;
        border-radius: 20px;
        text-align: center;
        margin: 50px auto 0;
        border: none;
    }
}

.content-wrap {
    margin: 0 16px;
    flex: 1;
    margin-top: 260px;
    overflow-y: auto;
}

.lump-expl {
    .e-title {
        display: flex;
        justify-content: center;

        .img {
            width: 60%;
        }
    }

    .expl-box {
        margin-top: 14px;
        border-radius: 16px;
        padding: 12px;
        font-size: 12px;
        line-height: 18px;
        overflow: hidden;
        color: #000;
        background: #fff;

        div {
            overflow: auto;
            max-height: 133px;
            min-height: 50px;
        }
    }
}

.lump-qs {
    .qs-top {
        margin-top: 16px;
        display: flex;
        justify-content: center;

        .img {
            width: 60%;
        }
    }

    .from-content {
        margin-top: 16px;
        border-radius: 16px;
        background: #fff;
        padding: 16px 16px 10px;
        font-size: 14px;

        .progress-box {
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .progress {
                width: 100%;
            }

            .txt {
                margin-left: 5px;
            }
        }

        .qs-list {

            .title {
                line-height: 22px;

                .f-txt {
                    color: red;
                }
            }

            .key-list {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                padding: 0 10px 20px;

                .van-cell {
                    background: #f5f5f5;
                }
            }

            .type1 {
                ::v-deep .van-cell {
                    background: unset !important;

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
                            background: transparent !important;
                            border-color: red;
                            color: red;
                        }
                    }

                    .van-radio-group--horizontal {
                        width: 100%;
                        justify-content: space-between;

                        .van-radio {
                            width: 45%;
                        }
                    }

                    .van-radio__label {
                        line-height: 16px;
                        padding: 4px 0;
                        color: #000;
                    }

                    .van-radio__label--disabled {
                        color: #ccc;
                    }

                }

            }

            .type2 {
                ::v-deep .van-cell {
                    background: unset !important;

                    .van-checkbox__icon {
                        background: #fff;
                        font-size: 15px;

                        .van-icon {
                            color: #fff;
                        }
                    }

                    .van-checkbox__icon--checked {
                        .van-icon {
                            background-color: transparent !important;
                            border-color: red;
                            color: red;

                        }
                    }

                    .van-checkbox-group--horizontal {
                        width: 100%;
                        justify-content: space-between;

                        .van-checkbox {
                            width: 45%;
                        }
                    }

                    .van-checkbox__label {
                        line-height: 16px;
                        padding: 4px 0;
                        color: #000;
                    }

                    .van-checkbox__label--disabled {
                        color: #ccc;
                    }
                }

                .key-list {

                    .check {
                        border-radius: unset !important;
                    }
                }
            }

            .type3 {
                .key-list {
                    margin-top: 6px;
                    position: relative;

                    ::v-deep .van-cell {
                        overflow: unset !important;
                        padding: 6px 12px;
                        border-radius: 4px;

                        .van-field__error-message {
                            position: absolute;
                            bottom: -28px;
                            left: 0;
                        }
                    }

                }
            }
        }
    }
}
</style>