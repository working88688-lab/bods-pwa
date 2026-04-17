<template>
    <div ref="movieVH215Ref" v-if="dataList.length">
        <template v-if="showVideoPlayer">
            <div v-if="activeVideo" class="video-section">
                <div class="vidoe-wraper" @click="onPlay">
                    <VideoPlayer
                        :id="activeVideo.mediaId"
                        :mediaType="activeVideo.mediaType"
                        :video="activeVideo.video.videoUrl"
                        :videoCover="activeVideo.video.videoCoverImg"
                        :loop="true"
                        @ended="handleEnded"
                    />
                </div>
                <div class="video-title">{{ activeVideo.video.videoTitle }}</div>
            </div>
        </template>
        <template v-else>
            <MovieItem v-if="activeVideo" :videoInfo="activeVideo" :showStart="true" width="100%" height="212px" />
        </template>
        <swiper ref="ArticleSwiper" class="article-swiper" :options="swiperOptions">
            <swiper-slide v-for="(movie, idx) in dataList" :key="idx">
                <div @click="onClickSwiper(movie)" :class="{ 'actived': activeVideo === movie }">
                    <MovieItem :videoInfo="movie" width="100%" height="75px" :ableClick="false" :showLike="false" :showBorder="activeVideo === movie"/>
                </div>
            </swiper-slide>
        </swiper>
    </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import _ from 'lodash'
import MovieItem from '@/components/MovieItem'
import VideoPlayer from '@/components/VideoPlayer'

export default {
    name: 'ArticleH3L6',
    components: {
        Swiper,
        SwiperSlide,
        MovieItem,
        VideoPlayer
    },
    props: {
        mediaList: {
            type: Array,
            default: () => {
                return []
            }
        },
        topMin: {
            type: Number,
            default: 0
        },
    },
    data() {
        return {
            swiperOptions: {
                slidesPerView: 2.9,
                spaceBetween: 12,
            },
            dataList: [],
            activeVideo: null,
            showVideoPlayer: false
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
        this.dataList = this.mediaList
        this.activeVideo = this.dataList[0]
        this.$nextTick(() => {
            this.showVideoPlayer = this.isInViewPortOfOne(this.$refs.movieVH215Ref)
        })
        window.addEventListener('scroll', this.handleScroll, true)
    },
    mounted() {},
    destroyed () {
        // 离开该页面需要移除这个监听的事件，不然会报错
        window.removeEventListener('scroll', this.handleScroll)
    },
    methods: {
       isInViewPortOfOne (el) {
            // viewPortHeight 兼容所有浏览器写法
            // const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight 
            const offsetTop = el.offsetTop
            const scrollTop = document.documentElement.scrollTop
            // const clientHeight = el.clientHeight
            const top = offsetTop - scrollTop
            return top < 500 && top > 100
        },
        onDetail(data) {
            this.$router.push({
                path: '/detail',
                query: {
                    mediaId: data.mediaId
                }
            })
        },
        onClickSwiper(data) {
            this.activeVideo = data
        },
        handleEnded() {

        },
        handleScroll() {
            this.showVideoPlayer = this.isInViewPortOfOne(this.$refs.movieVH215Ref)
        },
        onPlay() {
            this.$router.push({
                path: '/play',
                query: {
                    videoId: this.activeVideo.mediaId,
                    categoryId: this.activeVideo.categoryId,
                    payType: this.activeVideo.payType
                }
            })
        }
    }
};
</script>

<style lang="less" scoped>
.video-section {
    .vidoe-wraper {
        height: 192px;
    }
    .video-title {
        width: 100%;
        font-size: 12px;
        margin: 6px 0 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #f8f8f8;
    }
}
.actived {
    position: relative;
}
.actived::after {
    content: '';
    width: 20px;
    height: 20px;
    background: url(../../../assets/images/movie_active.png) no-repeat top center / 100%;
    position: absolute;
    left: 4px;
    top: 4px;
}
</style>