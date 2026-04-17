<template>
    <div class="page-container">
        <Header title="收藏主播" color="#1d1d28" textColor="#ebebeb" @onClickLeft="onBack" />
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
                    class="data-list"
                    :on-refresh="onRefresh" 
                    :on-loadmore="onLoad"
                    :finished="finished">
                    <div class="data-row">
                        <div class="data-item" v-for="(data, idx) in dataList" :key="idx" @click="handlePlay(data)">
                            <div class="item-left">
                                <div class="avatar">
                                    <img v-if="data.anchor.isOnline" v-lazy="data.liveImage && data.liveImage.indexOf('http') > -1 ? data.liveImage : (imageBase + data.liveImage)">
                                    <img v-else v-lazy="data.anchor.avatarUrl && data.anchor.avatarUrl.indexOf('http') > -1 ? data.anchor.avatarUrl : (imageBase + data.anchor.avatarUrl)">
                                </div>
                                <div class="nickname">{{ data.anchor.name || data.anchor.username }}</div>
                            </div>
                            <div class="item-right">
                                <div class="btn-join" v-if="data.anchor.isOnline">
                                    <span>进入直播间</span>
                                    <img src="@/assets/images/right-c.png" alt="">
                                </div>
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
    name: 'CollectAnchor',
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
            dataList: [],
            scrollTop: 0
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
    activated() {
        this.$nextTick(() => {
            document.documentElement.scrollTop = this.scrollTop
        })
    },
    beforeRouteLeave(to, from, next) {
        this.scrollTop = document.documentElement.scrollTop
        next()
    },
    mounted() {
        this.getDataList()
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        async getDataList(done, isRefresh) {
            let params = {
                ...this.page,
                mediaType: 7,
                searchType: 'USER_COLLECT_RECORD'
            }
            const res = await listMediaBySearchType(params).catch(() => {
                this.isInit = false
            })
            done && done()
            this.isInit = false
            if(res && res.code === 0) {
                const resultData = res.data.dataList.map(one => {
                    one['liveImage'] = one.anchor.avatarUrl || one.anchor.previewUrl || one.anchor.previewUrlThumbBig || one.anchor.previewUrlThumbSmall
                    return one
                })
                if(isRefresh) {
                    this.dataList = resultData
                } else {
                    this.dataList = this.dataList.concat(resultData)
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
        },
        handlePlay(anchorInfo) {
            this.$router.push({
                path: '/live',
                query: {
                    actorId: anchorInfo.mediaId
                }
            })
        }
    }
}
</script>
  
<style lang="less" scoped>
.page-content {
    padding: 48px 0 0;
    min-height: 100vh;
    box-sizing: border-box;
    color: #f8f8f8;
    .data-list {
    padding: 0 16px;
}
    .data-row {
        .data-item {
            margin: 0 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            .item-left {
                display: inline-flex;
                align-items: center;
                .avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 24px;
                    overflow: hidden;
                    margin-right: 8px;
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }
                .nickname {
                    font-size: 14px;
                    color: #ebebeb;
                }
            }
            .item-right {
                .btn-join {
                    font-size: 12px;
                    background: linear-gradient(to right, #6d42ff, #9c6bff);
                    display: inline-flex;
                    align-items: center;
                    padding: 6px 12px;
                    border-radius: 17px;
                    img {
                        width: 12px;
                        margin-left: 4px;
                    }
                }
            }
        }
    }
}
</style>