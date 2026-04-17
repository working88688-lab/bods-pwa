<template>
    <VueDragResize v-if="bannerList.length && show" :w="85" :h="85" :z="999" :y="maxY - 130" :parentW="maxX"
        :parentH="maxY" :parentLimitation="true" :isResizable="false" @clicked="onClicked" @dragstop="onDragstop">
        <van-swipe ref="vanSwipe" :autoplay="3000" lazy-render indicator-color="white">
            <van-swipe-item v-for="(banner, idx) in bannerList" :key="idx">
                <div class="banner-item" @click="onClickBanner(banner)">
                    <img :src="imageBase + banner.bannerImageUrl" />
                </div>
            </van-swipe-item>
        </van-swipe>
    </VueDragResize>
</template>

<script>
import VueDragResize from 'vue-drag-resize'
import { Swipe, SwipeItem } from 'vant';
import { clickBanner } from '@/apis/data'

export default {
    name: 'HomeSuspendAd',
    components: {
        VueDragResize,
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem
    },
    props: {
        location: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            isScrolling: false,
            maxX: window.innerWidth,
            startTime: null,
            endTime: null,
        }
    },
    computed: {
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        cdnLine() {
            return this.$store.state.cdnLine
        },
        isApp() {
            return this.$store.state.isApp
        },
        maxY() {
            return document.querySelector('.page-wraper').offsetHeight
        },
        show() {
            return this.$route.meta.show && this.$route.path !== '/video'
        },
        bannerList() {
            if (this.$store.state.banner && this.$store.state.banner[this.location]) {
                return this.$store.state.banner[this.location]
            } else {
                return []
            }
        },
    },

    methods: {
        async onClickBanner(banner) {
            // jumpType = 0 ===> 内链
            if (banner.jumpType === 0) {
                if (this.links[banner.jumpUrl]) {
                    this.$router.push(this.links[banner.jumpUrl])
                } else {
                    if (banner.jumpUrl === 'JUMP_LINK_CUSTOMER') {
                        const csUrl =
                            this.dataDic.chat_url +
                            `/im/index.html?appid=${this.dataDic.chat_appid}&userid=${this.userInfo.shareCode}&url=http%3A%2F%2Flocalhost%3A8035%2Ftestclient.html&skill=${this.dataDic.chat_skill}`
                        window.open(csUrl, '_blank')
                    } else if (banner.jumpUrl === 'JUMP_LINK_QUESTION') {
                        this.$router.push('/survey?id=' + banner.remark)
                    }
                }
            } else if (banner.jumpType === 1) {
                // jumpType = 1 ===> 外链
                if (this.isApp) {
                    window.open(banner.jumpUrl, '_self')
                } else {
                    window.open(banner.jumpUrl, '_blank')
                }
            } else {
                // jumpType = 3 ===> 不跳
            }
            clickBanner({ bannerCode: banner.bannerCode })
        },
        onClicked() {
            this.startTime = new Date().getTime()
        },
        onDragstop() {
            this.endTime = new Date().getTime()
            if (this.endTime - this.startTime < 200) {
                // 时间差200以下判断为点击事件
                const idx = this.$refs.vanSwipe.active
                this.onClickBanner(this.bannerList[idx])
            }
        },
    },
}
</script>

<style lang="less" scoped>
.vdr {
    position: absolute;
}

.vdr.active:before {
    display: none;
}

.banner-item {
    width: 100%;
    display: inline-block;
    cursor: pointer;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }
}
</style>
