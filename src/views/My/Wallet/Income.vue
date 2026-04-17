<template>
    <div class="page-content">
        <div class="section">
            <div class="section-title">推广收益</div>
            <div class="income-box">
                <div class="income-top">
                    <div class="income-top-item">
                        <div>{{ totalData.yesterdayIncome || 0 }}</div>
                        <div>昨日收益（元）</div>
                    </div>
                    <div class="income-top-item">
                        <div>{{( totalData.todayIncome || 0 )}}</div>
                        <div>今日收益（元）</div>
                    </div>
                </div>
                <div class="income-bottom">
                    <div class="income-bottom-item" @click="onRoute('/promotionIncome')">
                        <span>推广收益明细</span>
                        <van-icon name="arrow" />
                    </div>
                    <div class="income-bottom-item" @click="onRoute('/withdraw')">
                        <span>提现</span>
                        <van-icon name="arrow" />
                    </div>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="section-title">推广数据</div>
            <div class="income-box data-box">
                <div class="income-top">
                    <div class="income-top-item">
                        <div>{{ totalData.allMember || 0 }}</div>
                        <div>直推人数</div>
                    </div>
                    <div class="income-top-item">
                        <div>{{( totalData.allIncome || 0 )}}</div>
                        <div>收益（元）</div>
                    </div>
                </div>
                <div class="income-bottom">
                    <div class="income-bottom-item" @click="onRoute('/promote')">
                        <span>我的推广</span>
                        <van-icon name="arrow" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import { inviteTotal } from '@/apis/user'

export default {
    name: 'Income',
    data() {
        return {
            isInit: false,
            loading: false,
            finished: false,
            totalData: {}
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    created() {
        this.getDataList()
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onRoute(path) {
            this.$router.push(path)
        },
        onRecharge() {

        },
        async getDataList() {
            const res = await inviteTotal({}).catch(() => {
                this.isInit = false
            })
            this.isInit = false
            if(res && res.code === 0) {
                this.totalData = res.data
            }
        }
    }
}
</script>
  
<style lang="less" scoped>
.page-content {
    padding: 56px 12px 0;
    min-height: 100vh;
    box-sizing: border-box;
    color: #f8f8f8;
    background: #f6f6f6;
    .income-box {
        height: 124px;
        background: url(../../../assets/images/header_bg11.png) top / 100% no-repeat;
        border-radius: 8px;
        .income-top {
            display: flex;
            border-bottom: 1px solid #fff;
            .income-top-item {
                width: 50%;
                text-align: center;
                padding: 20px 0 20px;
                div:first-child {
                    font-size: 17px;
                    color: #d92514;
                    margin-bottom: 12px;
                }
                div:last-child {
                    font-size: 12px;
                }
            }
        }
        .income-bottom {
            font-size: 14px;
            display: flex;
            justify-content: center;
            .income-bottom-item {
                width: 50%;
                text-align: center;
                height: 36px;
                line-height: 36px;
                span:first-child {
                    margin-right: 10px;
                }
            }
        }
    }
    .data-box {
        .income-top {
            .income-top-item {
                div:first-child {
                    font-size: 20px;
                }
            }
        }
    }
    .section {
        padding: 0 0 24px;
        .section-title {
            font-size: 16px;
            margin-bottom: 15px;
        }
    }
}
</style>