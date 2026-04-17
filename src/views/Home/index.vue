<template>
    <div class="page-container flex-container">
        <keep-alive>
            <router-view />
        </keep-alive>
        <HomeAdDialog location="index_page_promt" />
        <HomeSuspendAd location="home_suspend_ad" />
        <InstallAPP v-if="!isApp && device !== 'pc'" />
        <Footer :activePath="activePath" />
    </div>
</template>

<script>
import Footer from '@/components/Footer'
import HomeAdDialog from "@/components/HomeAdDialog"
import HomeSuspendAd from "@/components/HomeSuspendAd"
import InstallAPP from "@/components/InstallAPP"

export default {
    name: 'Layout',
    components: {
        Footer,
        HomeAdDialog,
        HomeSuspendAd,
        InstallAPP
    },
    computed: {
        key() {
            return this.$route.path
        },
        isApp() {
            return this.$store.state.isApp
        },
        device() {
            return this.$store.state.device
        },
        activePath() {
            return this.$route.path
        }
    },
    data() {
        return {}
    },
    created() {},
    mounted() {},
    methods: {}
};
</script>

<style lang="less" scoped>
// .page-main {
//     min-height: 100vh;
// }
img {
    margin-bottom: 3px;
}
/deep/.van-tabbar-item__icon img{
    height: 22px;
}
/deep/.van-tabbar-item__text span {
    font-size: 10px;
}
</style>