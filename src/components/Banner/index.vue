<template>
    <div class="b-swiper" v-if="bannerList.length">
        <van-swipe :autoplay="3000" lazy-render>
            <van-swipe-item v-for="(banner, idx) in bannerList" :key="idx">
                <Advertise :banner="banner" :radius="radius" />
            </van-swipe-item>
        </van-swipe>
    </div>
</template>

<script>
import Advertise from '@/components/Advertise'

export default {
    name: 'Banner',
    components: {
        Advertise
    },
    props: {
        location: {
            type: String,
            default: ''
        },
        radius: {
            type: String,
            default: '0'
        },
        bannerData: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    data() {
        return {
            // bannerList: []
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
        bannerList(){
            if(this.$store.state.banner && this.$store.state.banner[this.location]){
                return this.$store.state.banner[this.location]
            }else{
                return []
            }
        }
    },
    created() { },
    methods: { }
};
</script>

<style lang="less" scoped>
.b-swiper {
    position: relative;
    z-index: 0;
    padding: 0 12px;
}
::v-deep .van-swipe {
    .van-swipe__indicators {
        .van-swipe__indicator {
            background: #fff;
        }
        .van-swipe__indicator--active {
            background: #fff;
        }
    }
}

</style>