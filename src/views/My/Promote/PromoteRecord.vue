<template>
    <div class="page-container flex-container vip">
        <Header textColor="#222222" title="推广记录" @onClickLeft="onBack" />
        <div class="page-content">
            <Loading v-if="isInit" />
            <template v-else>
                <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
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
                                <span>用户ID</span>
                                <span>注册时间</span>
                            </div>
                            <div>
                                <span>{{ record.toNickname }}</span>
                                <span>{{ record.toRegisterTime }}</span>
                            </div>
                        </div>
                    </van-list>
                </van-pull-refresh>
            </template>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getInviteDetail } from '@/apis/activity'

export default {
    name: 'Promote',
    components: {
        Header,
        Loading
    },
    data(){
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
    created() {
        this.getDataList(null, true)
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        async getDataList(done, isRefresh) {
            const params = {
                ...this.page
            }
            this.loading = true
            const res = await getInviteDetail(params).catch(() => {
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
.vip {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}
.page-content {
    flex: 1;
    overflow: auto;
    .data-list {
        padding: 12px 16px;
        .data-item {
            padding: 16px;
            background: #fff;
            color:#999999;
            margin-bottom: 8px;
            font-size: 12px;
            >div {
                display: flex;
                justify-content: space-between;
            }
            >div:first-child {
                margin-bottom: 8px;
                color: #222222;
            }
            >div:last-child {
                font-size: 15px;
            }
        }
    }
}
</style>