<template>
    <div class="page-container">
        <Header title="购买记录" textColor="#fff" @onClickLeft="onBack" />
        <div class="page-content">
            <Loading v-if="isInit" />
            <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
                <div class="empty-box" v-if="!recordList.length">
                    <van-empty
                        :image="require('@/assets/images/emptyImage.png')"
                        image-size="120"
                        description="暂无数据哦~"
                    />
                </div>
                <van-list
                    v-else
                    v-model:loading="loading"
                    :finished="finished"
                    finished-text="没有更多了"
                    class="data-list"
                    @load="onLoad"
                >
                    <div class="data-item" v-for="(record, idx) in recordList" :key="idx">
                        <div>
                            <span>{{ record.nickname }}</span>
                            <span>{{ record.createTime }}</span>
                        </div>
                        <div>
                            <span>{{ record.productName }}</span>
                            <span>{{ record.realAmount + '元' }}</span>
                        </div>
                    </div>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>
</template>
  
<script>
import Header from '@/components/Header'
import { payRecord } from '@/apis/pay'
import Loading from '@/components/Loading'

export default {
    name: 'PromotionRecord',
    components: {
        Header,
        Loading
    },
    data() {
        return {
            isInit: true,
            page: {
                pageNo: 1,
                pageSize: 10
            },
            finished: false,
            recordList: [],
            refreshing: false,
            loading: false
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        }
    },
    created() {},
    activated() {
        this.getDataList(null, true)
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        async getDataList(done, isRefresh) {
            const params = {
                orderType: 'vip',
                ...this.page,
                status: 3
            }
            this.loading = true
            const res = await payRecord(params).catch(() => {
                this.isInit = false
            })
            done && done()
            this.isInit = false
            this.loading = false
            if (this.refreshing) {
                this.refreshing = false
            }
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
    padding: 48px 0 0;
    min-height: 100vh;
    box-sizing: border-box;
    .van-pull-refresh {
        min-height: calc(100vh - 88px);
    }
    .data-list {
        max-height: calc(100vh - 50px);
        overflow-y: auto;
        .data-item {
            padding: 16px;
            background: rgba(255, 255, 255, 0.05);
            margin-bottom: 1px;
            color: #999999;
            font-size: 12px;
            >div {
                display: flex;
                justify-content: space-between;
            }
            >div:first-child {
                margin-bottom: 8px;
                >span:first-child {
                    color: #222222;
                    font-size: 15px;
                }
            }
            >div:last-child {
                >span:last-child {
                    color: #d92514;
                    font-size: 14px;
                }
            }
        }
    }
}
</style>