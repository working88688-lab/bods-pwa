<template>
    <div class="page-container flex-container">
        <Header title="预约记录" color="#fff" textColor="#222222" @onClickLeft="onBack" />
        <div class="page-content">
            <Loading v-if="isInit" />
            <template v-else>
                <div class="empty-box" v-if="!dataList.length">
                    <van-empty
                        :image="require('@/assets/images/emptyImage.png')"
                        image-size="120"
                        description="暂无数据哦~"
                    />
                </div>
                <vue-loadmore
                    v-else
                    :on-refresh="onRefresh" 
                    :on-loadmore="onLoad"
                    :finished="finished">
                    <div class="data-list">
                        <div class="data-item" v-for="(data, idx) in dataList" :key="idx">
                            <div class="base-info">
                                <div class="avatar">
                                    <img :src="data.actor.actorCoverImg ? (imageBase + data.actor.actorCoverImg) : require('@/assets/images/img_default_avatar1.png')" alt="avatar">
                                </div>
                                <div>{{ data.actor.actorName }}</div>
                            </div>
                            <div class="flow-box">
                                <span v-if="data.actor.status === 0" class="btn-reserve">已预约</span>
                                <span v-if="data.actor.status === 1" class="btn-accept">已接单</span>
                                <span v-if="data.actor.status === 2" class="btn-finish">已完成</span>
                            </div>
                        </div>
                    </div>
                </vue-loadmore>
            </template>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { listMediaBySearchType } from '@/apis/media'

export default {
    name: 'Notice',
    components: {
        Header,
        Loading
    },
    data() {
        return {
            isInit: true,
            finished: false,
            dataList: [],
            page: {
                pageNo: 1,
                pageSize: 10
            }
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
    created() {
        this.getDataList()
    },
    mounted() {},
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        async getDataList(done, isRefresh) {
            let params = {
                ...this.page,
                mediaType: 4,
                searchType: 'USER_APPOINTMENT'
            }
            const res = await listMediaBySearchType(params)
            this.isInit = false
            done && done()
            if(res && res.code === 0) {
                if(isRefresh) {
                    this.dataList = res.data.dataList
                } else {
                    this.dataList = this.dataList.concat(res.data.dataList)
                }
                this.finished = (this.page.pageNo * this.page.pageSize > res.data.total)
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
};
</script>

<style lang="less" scoped>
.page-content {
    flex: 1;
    overflow: auto;
    .data-list {
        .data-item {
            padding: 12px 16px;
            background: #fff;
            margin-bottom: 1px;
            color: #222222;
            font-size: 14px;
            display: flex;
            justify-content: space-between;
            .base-info {
                display: inline-flex;
                align-items: center;
                .avatar {
                    position: relative;
                    margin-right: 12px;
                    img {
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        overflow: hidden;
                    }
                }
            }
            .flow-box {
                display: inline-flex;
                align-items: center;
                .btn-reserve {
                    display: inline-block;
                    width: 64px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    color: #fff;
                    background: #d92514;
                    border: 1px solid #d92514;
                    border-radius: 12px;
                    font-size: 12px;
                }
                .btn-accept {
                    display: inline-block;
                    width: 64px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    color: #fff;
                    background: #ff976a;
                    border: 1px solid #ff976a;
                    border-radius: 12px;
                    font-size: 12px;
                }
                .btn-finish {
                    display: inline-block;
                    width: 64px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    color: #fff;
                    background: #07c160;
                    border: 1px solid #07c160;
                    border-radius: 12px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>