<template>
    <swiper ref="ArticleSwiper" class="article-swiper" :options="swiperOptions">
        <swiper-slide v-for="(movie, idx) in dataList" :key="idx" class="article-list">
            <MovieItem :videoInfo="movie" width="100%" coverHeight="212px" />
        </swiper-slide>
    </swiper>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import _ from 'lodash'
import MovieItem from '@/components/MovieItem'

export default {
    name: 'ArticleH3L6',
    components: {
        Swiper,
        SwiperSlide,
        MovieItem
    },
    props: {
        mediaList: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    data() {
        return {
            swiperOptions: {
                slidesPerView: 2.4,
                spaceBetween: 12,
            },
            dataList: [],
            activeIndex: 0
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
    },
    mounted() {},
    methods: {
        onDetail(data) {
            this.$router.push({
                path: '/detail',
                query: {
                    mediaId: data.mediaId
                }
            })
        }
    }
};
</script>

<style lang="less" scoped>
</style>