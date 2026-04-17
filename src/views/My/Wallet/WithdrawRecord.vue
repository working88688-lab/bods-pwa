<template>
    <div class="page-container">
        <Header textColor="#222222" color="#fff" title="提现记录" @onClickLeft="onBack"/>
        <div class="page-content">
            <Loading v-if="isInit" />
            <template v-else>
                <vue-loadmore
                    class="data-list"
                    :on-refresh="onRefresh" 
                    :on-loadmore="onLoad"
                    :finished="finished">
                    <div class="data-item" v-for="(record, idx) in recordList" :key="idx">
                        <div>
                            <template v-for="(status, idx) in statusList">
                                <van-tag plain v-if="(status.value === record.status)" round :type="status.type">{{ status.label }}</van-tag>
                            </template>
                            <span>
                                {{ record.amount }}元
                            </span>
                        </div>
                        <div>
                            <span>
                                <template v-for="(withdrawalWay, idx) in withdrawalWayList">
                                    <template v-if="(withdrawalWay.value === record.withdrawalWay)">{{ withdrawalWay.label }}</template>
                                </template>
                            </span>
                            <span>订单号：{{ record.withdrawalId }}</span>
                            <!-- <span>{{ record.applyTime }}</span> -->
                        </div>
                    </div>
                </vue-loadmore>
            </template>
        </div>
    </div>
</template>
  
<script>
import Header from '@/components/Header'
import { withdrawPage } from '@/apis/user'
import Loading from '@/components/Loading'

export default {
    name: 'Balance',
    components: {
        Header,
        Loading
    },
    data() {
        return {
            isInit: true,
            loading: false,
            page: {
                pageNo: 1,
                pageSize: 10
            },
            finished: false,
            recordList: [],
            withdrawalWayList: [
                { label: 'USDT', value: 'usdt', info: null },
                { label: '银行卡', value: 'bank', info: null },
                { label: '支付宝收款二维码', value: 'alipay', info: null },
                { label: '微信收款二维码', value: 'wechat', info: null }
            ],
            statusList: [
                { label: '未打款', value: 0, type: 'primary' },
                { label: '已打款', value: 1, type: 'success' },
                { label: '驳回', value: 2, type: 'warning' }
            ]
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    created() {},
    mounted() {
        this.getDataList()
    },
    methods: {
        onBack() {
            this.$router.push('/withdraw')
        },
        async getDataList(done, isRefresh) {
            const params = {
                ...this.page
            }
            const res = await withdrawPage(params).catch(() => {
                this.isInit = false
            })
            done && done()
            this.isInit = false
            if(res && res.code === 0) {
                if(isRefresh) {
                    this.recordList = res.data.dataList
                } else {
                    this.recordList = this.recordList.concat(res.data.dataList)
                }
                if (res.data.current * this.page.pageSize >= res.data.total) {
                    this.finished = true
                }
            }
        },
        onRefresh(done) {
            this.page.pageNo = 1
            this.getDataList(done, true)
        },
        onLoad(done) {
            this.page.pageNo++
            this.getDataList(done)
        }
    }
}
</script>
  
<style lang="less" scoped>
.page-content {
    padding: 64px 12px 12px;
    background: #f5f5f5;
    min-height: 100vh;
    .data-list {
        .data-item {
            padding: 16px;
            background: #fff;
            margin-bottom: 1px;
            color: #999999;
            font-size: 12px;
            >div {
                display: flex;
                justify-content: space-between;
            }
            >div:first-child {
                margin-bottom: 8px;
                >span:last-child {
                    color: #d92514;
                    font-size: 15px;
                }
            }
        }
    }
}
</style>