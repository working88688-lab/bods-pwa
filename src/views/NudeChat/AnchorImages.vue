<template>
    <div class="page-container">
        <Header textColor="#222222" :arrowBg="true" :isBlur="false" @onClickLeft="onBack" />
        <div class="page-content">
            <Loading v-if="isInit" />
            <template v-else>
                <div class="empty-box" v-if="!swiperDataList.length">
                    <van-empty
                        :image="require('@/assets/images/emptyImage.png')"
                        image-size="120"
                        description="暂无数据哦~"
                    />
                </div>
                <Swiper v-else ref="videoSwipe" :options="swiperOption">
                    <SwiperSlide v-for="(url, idx) in swiperDataList" :key="idx">
                        <template v-if="url.indexOf('.mp4') > -1 || url.indexOf('.m3u8') > -1">
                            <div class="full-screen" v-if="showPlayer">
                                <FullScreenPlayer :autoplay="false" :id="actorInfo.mediaId + idx.toString()" :video="url" />
                            </div>
                        </template>
                        <div v-else class="actor-images" :style="{ 'background-image': 'url('+ imageBase + url +')'}"></div>
                    </SwiperSlide>
                </Swiper>
                <div class="swiper-pagination"></div>
            </template>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import { getMediaById } from '@/apis/media'
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import FullScreenPlayer from '@/components/FullScreenPlayer'

export default {
    name: 'AnchorLike',
    components: {
        Header,
        Loading,
        Swiper,
        SwiperSlide,
        FullScreenPlayer
    },
    data() {
        const _this = this
        return {
            isInit: true,
            actorId: '',
            actorInfo: null,
            swiperOption: {
                autoHeight: true,
                slidesPerView: 1,
                mousewheel: true,
                mousewheelControl: true,
                height: window.innerHeight,
                pagination: {
                    el: '.swiper-pagination'
                },
                on:{
                    slideChange: function(){
                        _this.showPlayer = false
                        const activeIndex = _this.$refs.videoSwipe.$swiper.activeIndex
                        if(_this.swiperDataList[activeIndex].indexOf('.mp4') > -1 || _this.swiperDataList[activeIndex].indexOf('.m3u8') > -1) {
                            _this.showPlayer = true
                        }
                    }
                }
            },
            showPlayer: false,
            swiperDataList: []
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
    },
    created() {
        this.getAnchorDetail()
    },
    activated() {
        if (!this.$route.query.actorId) {
            this.$router.push('/nudeChat')
        } else {
            if (this.$route.query.actorId !== this.actorId) {
                this.getAnchorDetail()
            }
        }
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        async getAnchorDetail() {
            this.actorId = this.$route.query.actorId
            if(!this.actorId) {
                return this.$router.push('/nudeChat')
            }
            const params = {
                mediaId: this.actorId,
                mediaType: 4
            }
            this.isInit = true
            const res = await getMediaById(params).catch(() => {
                this.isInit = false
            })
            this.isInit = false
            if (res && res.code === 0) {
                this.actorInfo = res.data
                this.actorInfo.actor.actorPicUrl = JSON.parse(this.actorInfo.actor.actorPicUrl)
                this.actorInfo.actor.actorVideoUrl = JSON.parse(this.actorInfo.actor.actorVideoUrl)
                this.swiperDataList = this.actorInfo.actor.actorPicUrl.concat(this.actorInfo.actor.actorVideoUrl)
            }
        }
    }
}
</script>
  
<style lang="less" scoped>
.page-container {
    
}
.page-content {
    min-height: 100vh;
    box-sizing: border-box;
    color: #fff;
}
.swiper-container {
    .swiper-wrapper {
        .actor-images {
            width: 100%;
            height: 100vh;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        }
    }
}
::v-deep .swiper-pagination  {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    .swiper-pagination-bullet {
        background: #f5e7e7!important;
    }
}
.full-screen {
    width: 100%;
    height: 100vh;
    background-color: #f6f6f6;
}
</style>