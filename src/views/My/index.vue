<template>
    <div class="my-page flex-container">
        <div class="banner-wraper" v-if="showBanner">
            <Banner location="mine" @onFinish="handleBannerFinish"/>
        </div>
        <div class="my-container">
            <BaseInfo />
            <JupmList />
            <!-- <div class="contact">
                <div class="tg">官方{{ dataDic.official_key }}</div>
            </div> -->
        </div>
    </div>
</template>

<script>
import BaseInfo from './baseInfo'
import JupmList from './jupmList'
import { centerUserInfo, followTotal } from '@/apis/user'
import { chatInfo } from '@/apis/user'
import Banner from '@/components/Banner'

export default {
    name: 'My',
    components: {
        BaseInfo,
        JupmList,
        Banner
    },
    data() {
        return {
            showBanner: true
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        dataDic() {
            return this.$store.state.dataDic
        },
    },
    created() {},
    activated() {
        this.getUserInfo()
    },
    methods: {
        async getUserInfo() {
            const res = await centerUserInfo()
            if (res && res.code === 0) {
                this.$store.commit('SET_USERINFO', res.data)
            }
            const chatInfoRes = await chatInfo({
                merchantAcct: process.env.VUE_APP_MERCHANTACCT
            })
            if (chatInfoRes && chatInfoRes.code === 0) {
                this.$store.commit('SET_WSINFO', chatInfoRes.data)
            }
            // const res2 = await followTotal({ userId: res.data.userId })
            //     if (res2 && res2.code === 0) {
            //     res.data.followed = res2.data.followed
            //     res.data.followers = res2.data.followers
            //     this.$store.commit('SET_USERINFO', res.data)
            // }
        },
        handleBannerFinish(data) {
            this.showBanner = !!data.length
        }
    }
};
</script>

<style lang="less" scoped>
.my-page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(../../assets/images/mine_bg.png) top / 100% no-repeat transparent;
    .my-container {
        padding-bottom: 24px;
        flex: 1;
        overflow: auto;
        position: relative;
        z-index: 2;
    }
    .banner-wraper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        z-index: 1;
        .b-swiper {
            padding: 0;
        }
    }
    .contact {
        margin-top: 24px;
        font-size: 12px;
        text-align: center;
    }
}
</style>