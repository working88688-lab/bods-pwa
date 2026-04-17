<template>
    <div class="page-content">
        <Loading v-if="isInit" />
        <van-pull-refresh v-else v-model="refreshing" @refresh="onRefresh">
            <div class="empty-box" v-if="!dataList.length">
                <van-empty :image="require('@/assets/images/emptyImage.png')" image-size="120" description="暂无数据哦~" />
            </div>
            <van-list v-else v-model:loading="loading" :finished="finished" finished-text="没有更多了" class="data-list"
                @load="onLoad">
                <div class="masonry-grid">
                    <div class="gutter-size"></div>
                    <div class="grid-item" v-for="(data, idx) in dataList" :key="idx">
                        <div class="data-item banner" v-if="data.type === 'banner'" :key="'banner' + idx">
                            <Advertise :banner="data.data" />
                            <div class="banner-title">{{ data.data.bannerName }}</div>
                        </div>
                        <VideoItem v-else :key="idx" :videoInfo="data" :coverHeight="data.coverHeight" />
                    </div>
                </div>
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<script>
import Loading from '@/components/Loading'
import { listShortVideoRandom } from '@/apis/media'
import { formatStrNum, formatDuration } from '@/utils/tools'
import _ from 'lodash'
import VideoItem from '@/components/VideoItem'
import Advertise from '@/components/Advertise'
import { banner } from '@/apis/data'
import Masonry from 'masonry-layout'

export default {
    name: 'VideoCategory',
    components: {
        Loading,
        VideoItem,
        Advertise,
        Masonry
    },
    data() {
        return {
            page: {
                pageNo: 1,
                pageSize: 10
            },
            isInit: true,
            finished: false,
            dataList: [],
            refreshing: false,
            loading: false,
            city: '',
            categoryId: '',
            scrollTop: '',
            bannerList: []
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        appFooter() {
            return this.$store.state.appFooter
        },
        dataDic() {
            return this.$store.state.dataDic
        }
    },
    async created() {
        const { categoryId } = this.$route.query
        this.categoryId = categoryId
        const res = await banner({
            merchantAcct: process.env.VUE_APP_MERCHANTACCT,
            bannerLocation: 'shortVideo'
        })
        if (res && res.code === 0) {
            this.bannerList = res.data || []
        }
        this.getDataList()
        // this.getBannerList()
    },
    activated() {
        // this.init()
        this.$nextTick(() => {
            document.documentElement.scrollTop = this.scrollTop
            const pageMainDom = document.getElementsByClassName('page-main')
            if (pageMainDom && pageMainDom[0]) {
                pageMainDom[0].scrollTop = this.scrollTop
            }
        })
    },
    beforeRouteLeave(to, from, next) {
        const pageMainDom = document.getElementsByClassName('page-main')
        if (pageMainDom && pageMainDom[0]) {
            this.scrollTop = pageMainDom[0].scrollTop
        }
        next()
    },
    updated() {
        const LayoutDom = document.querySelector('.masonry-grid')
        if (LayoutDom) {
            new Masonry(LayoutDom, {
                itemSelector: '.grid-item',
                gutter: '.gutter-size'
            })
        }
    },
    destroyed() { },
    methods: {
        async getBannerList() {
            const res = await banner({
                merchantAcct: process.env.VUE_APP_MERCHANTACCT,
                bannerLocation: 'shortVideo'
            })
            if (res && res.code === 0) {
                this.bannerList = res.data || []
            }
        },
        async getDataList(done, isRefresh) {
            const menuData = this.appFooter.find(one => one.expand === '/video')
            if (!menuData) {
                return this.$toast('获取分类信息失败')
            }
            const targetData = menuData.child.find(one => one.categoryId === this.categoryId)
            if (!targetData || !targetData.child || !targetData.child[0]) {
                this.isInit = false
                return this.$toast('获取分类信息失败')
            }
            let params = {
                ...this.page,
                mediaType: 2,
                categoryId: targetData.child[0].categoryId
            }
            this.loading = true
            const res = await listShortVideoRandom(params).catch(() => {
                this.isInit = false
                done && done()
            })
            this.isInit = false
            done && done()
            this.loading = false
            if (this.refreshing) {
                this.refreshing = false
            }
            if (res && res.code === 0) {
                let resultData = res.data.dataList.map(one => {
                    if (one.video && one.video.coverHeight && one.video.coverWidth) {
                        one['coverHeight'] = (one.coverHeight / one.coverWidth).toFixed(2) * 100 + '%'
                    } else {
                        one['coverHeight'] = '178%'
                    }
                    return one
                })
                if (this.bannerList.length) {
                    resultData = this.insertAd2List((this.dataDic.inADNubS || 10), resultData)
                }
                if (isRefresh) {
                    this.dataList = resultData
                } else {
                    this.dataList = this.dataList.concat(resultData)
                }
            }
        },
        /**
         * 每间隔指定长度插入广告
         * @param {number} len 
         * @param {array} data 
         */
        insertAd2List(len, data) {
            const chunkList = _.chunk(data, len)
            let resultData = []
            chunkList.forEach(one => {
                const banner = _.sample(this.bannerList)
                one.push({ type: 'banner', data: banner })
                resultData = _.concat(resultData, one)
            })
            return resultData
        },
        onRefresh(done) {
            this.page.pageNo = 1
            this.getDataList(done, true)
        },
        onLoad(done) {
            this.page.pageNo++
            this.getDataList(done)
        },
        formatNum(num) {
            return formatStrNum(num)
        },
        formatDurationStr(num) {
            return formatDuration(num)
        },
        onPlay(anchorInfo) {
            this.$router.push({
                path: '/anchorDetail',
                query: {
                    actorId: anchorInfo.mediaId
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.data-list {
    padding: 0 16px;
}

.masonry-grid {
    .gutter-size {
        width: 3%;
    }

    .grid-item {
        width: 48.5%;
    }
}

.banner {
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;

    .banner-item {
        height: 240px;
        border-radius: 8px;
        overflow: hidden;

        img {
            width: 100%;
            height: 100%;
        }
    }

    .banner-title {
        width: 100%;
        font-size: 12px;
        margin: 12px 0 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
