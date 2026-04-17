<template>
    <div class="movie-box">
        <van-tabs
            class="movie-tabs"
            v-model="activedTab"
            title-inactive-color="#ebebeb"
            title-active-color="#ebebeb"
            color="#ebebeb"
            background="none"
            :ellipsis='false'
            @change="onChangeTab">
            <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.value"></van-tab>
        </van-tabs>
        <van-tabs
            v-if="videoTypeList.length > 1"
            v-model="activedVideoType"
            title-inactive-color="#ebebeb"
            title-active-color="#ebebeb"
            color="#ebebeb"
            background="none"
            :ellipsis='false'
            line-height="0"
            @change="onChangeVideoType">
            <van-tab v-for="(tab, idx) in videoTypeList" :key="idx" :title="tab.label" :name="tab.videoType"></van-tab>
        </van-tabs>
        <div class="movie-list">
            <Loading v-if="isInit" height="200px" />
            <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
                <div class="short-video" v-if="shortVideoList && shortVideoList.length" @click="onLoadMore(2)">
                    <div class="short-cover">
                        <img
                            v-if="shortVideoList[0]"
                            v-lazy="shortVideoList[0].video.videoCoverImg.indexOf('http') > -1
                            ? shortVideoList[0].video.videoCoverImg
                            : (imageBase + shortVideoList[0].video.videoCoverImg)">
                        <img
                            v-if="shortVideoList[1]"
                            v-lazy="shortVideoList[1].video.videoCoverImg.indexOf('http') > -1
                            ? shortVideoList[1].video.videoCoverImg
                            : (imageBase + shortVideoList[1].video.videoCoverImg)">
                        <img
                            v-if="shortVideoList[2]"
                            v-lazy="shortVideoList[2].video.videoCoverImg.indexOf('http') > -1
                            ? shortVideoList[2].video.videoCoverImg
                            : (imageBase + shortVideoList[2].video.videoCoverImg)">
                    </div>
                    <div class="short-content">
                        <div>{{ (activedTab === 'USER_FAVOR_RECORD' ? '喜欢的' : '看过的') + '短视频' }}</div>
                        <div>{{ shortVideoList[0].video.videoTitle }}</div>
                    </div>
                    <div class="short-right">
                        <van-icon name="arrow" />
                    </div>
                </div>
                <div class="empty-box" v-if="!dataList.length">
                    <van-empty
                        :image="require('@/assets/images/emptyImage.png')"
                        image-size="120"
                        description="暂无数据哦~"
                    />
                </div>
                <div v-else class="movie-row">
                    <MovieItem v-for="(data, idx) in dataList" :key="idx" :videoInfo="data"/>
                    <div class="view-more" v-if="total > 6" @click="onLoadMore(1)">查看更多</div>
                </div>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script>
import { listMediaBySearchType } from '@/apis/media'
import _ from 'lodash'
import Loading from '@/components/Loading'
import MovieItem from '@/components/MovieItem'
import VideoItem from '@/components/VideoItem'

export default {
    name: 'MovieRecord',
    components: {
        Loading,
        MovieItem,
        VideoItem
    },
    data() {
        return {
            activedTab: 'USER_FAVOR_RECORD',
            tabList: [
                { label: '我的喜欢', value: 'USER_FAVOR_RECORD', path: '/like' },
                // { label: '我的购买', value: 'USER_BUY_RECORD', path: '/buy' },
                { label: '浏览历史', value: 'USER_VIEW_RECORD', path: '/history' }
            ],
            activedVideoType: 1,
            videoTypeList: [
                { label: '影片', videoType: 1 },
                // { label: '短视频', videoType: 2 }
            ],
            isInit: true,
            refreshing: false,
            loading: false,
            dataList: [],
            page: {
                pageNo: 1,
                pageSize: 6
            },
            total: 0,
            shortVideoList: []
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        wsInfo() {
            return this.$store.state.wsInfo
        },
        isApp() {
            return this.$store.state.isApp
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        }
    },
    created() {
        this.getDataList(null, true)
        this.getShortVideoList()
    },
    mounted() {},
    activated() {
        this.getDataList(null, true)
        this.getShortVideoList()
    },
    methods: {
        onChangeTab() {
            this.isInit = true
            this.dataList = []
            this.page.pageNo = 1
            this.getShortVideoList()
            this.getDataList(null, true)
        },
        onChangeVideoType() {
            this.isInit = true
            this.dataList = []
            this.page.pageNo = 1
            this.getDataList(null, true)
        },
        async getShortVideoList() {
            let params = {
                pageNo: 1,
                pageSize: 3,
                searchType: this.activedTab,
                mediaType: 2
            }
            this.loading = true
            const res = await listMediaBySearchType(params)
            if(res && res.code === 0) {
                this.shortVideoList = res.data.dataList
            }
        },
        async getDataList(done, isRefresh) {
            let params = {
                ...this.page,
                searchType: this.activedTab,
                mediaType: this.activedVideoType
            }
            this.loading = true
            const res = await listMediaBySearchType(params)
            this.isInit = false
            done && done()
            this.loading = false
            if (this.refreshing) {
                this.refreshing = false
            }
            if(res && res.code === 0) {
                if(isRefresh) {
                    this.dataList = res.data.dataList
                } else {
                    this.dataList = this.dataList.concat(res.data.dataList)
                }
                this.total = res.data.total
            }
        },
        onRefresh(done) {
            this.page.pageNo = 1
            this.getDataList(done, true)
            this.getShortVideoList()
        },
        onLoadMore(type) {
            const targetData = this.tabList.find(one => one.value === this.activedTab)
            this.$router.push({
                path: targetData.path,
                query: {
                    videoType: type
                }
            })
        }
    }
};
</script>

<style lang="less" scoped>
::v-deep .van-tabs {
    .van-tabs__wrap {
        .van-tabs__nav {
            display: inline-flex;
            .van-tab {
                padding-bottom: 0;
                font-size: 15px;
                color: #ebebeb;
            }
            .van-tab--active {
                font-size: 22px;
                position: relative;
            }
            .van-tab--active::after {
                content: '';
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: linear-gradient(to right, rgba(121, 79, 255, 1), rgba(121, 79, 255, 0));
                position: absolute;
                bottom: 6px;
                right: 6px;
            }
            .van-tabs__line {
                display: none;
                // background: linear-gradient(to right, rgba(121, 79, 255, 1), rgba(121, 79, 255, 0));
                // background-color: transparent!important;
            }
        }
    }
}
.movie-list {
    padding: 8px 16px 16px;
}
.movie-row {
    display: flex;
    flex-flow: wrap;
    .movie-item:nth-child(2n) {
        margin-right: 0;
    }
    .view-more {
        width: 100%;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-radius: 20px;
        background: #252633;
        font-size: 16px;
        color: #8f8f8f;
        margin-bottom: 24px;
        cursor: pointer;
    }
}
.short-video {
    padding: 16px;
    background: #292a38;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    .short-cover {
        width: 76px;
        height: 76px;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        >img {
            border-radius: 4px;
            object-fit: cover;
        }
        img:nth-child(1) {
            width: 80%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            z-index: 3;
        }
        img:nth-child(2) {
            width: 60%;
            height: 80%;
            position: absolute;
            top: 10%;
            left: 30%;
            z-index: 2;
        }
        img:nth-child(3) {
            width: 40%;
            height: 60%;
            object-fit: cover;
            position: absolute;
            top: 20%;
            left: 60%;
            z-index: 1;
        }
    }
    .short-content {
        width: calc(100% - 78px);
        padding: 16px;
        >div:first-child {
            margin-bottom: 6px;
            font-size: 14px;
            color: #ebebeb;
        }
        >div:last-child {
            font-size: 13px;
            color: #a3a3a3;
            overflow : hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
    }
    .short-right {
        width: 24px;
        text-align: right;
        i {
            font-size: 20px;
            color: #b7adad;
        }
    }
}
</style>