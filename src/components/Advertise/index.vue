<template>
    <div class="b-item" @click="onClickBanner(banner)" :style="{ 'border-radius': radius }">
        <img :src="imageBase + banner.bannerImageUrl" />
    </div>
</template>

<script>
import { clickBanner } from '@/apis/data'

export default {
    name: 'Advertise',
    props: {
        banner: {
            type: Object,
            default: () => { },
        },
        radius: {
            type: String,
            default: '6px',
        },
    },
    data() {
        return {
            links: {
                CHARGE_LINK_COIN: '/recharge',
                BECOME_LINK_VIP: '/vip',
                JUMP_LINK_GOSSIP: '/square',
                JUMP_LINK_PROXY: '/promote',
                JUMP_LINK_CHECK: '/signin',
                JUMP_LINK_AI: '/ai',
                JUMP_LINK_CUSTOMER: '/recharge',
                JUMP_LINK_VIP: '/vip',
                JUMP_LINK_STREAM: '/streaming',
                JUMP_LINK_VIDEO: '/video',
                JUMP_LINK_GAME: '/product',
                JUMP_LINK_RANK: '/rank',
            },
        }
    },
    computed: {
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        isApp() {
            return this.$store.state.isApp
        },
        dataDic() {
            return this.$store.state.dataDic
        },
        userInfo() {
            return this.$store.state.userInfo
        },
    },
    methods: {
        async onClickBanner(banner) {
            // jumpType = 0 ===> 内链
            if (banner.jumpType === 0) {
                if (this.links[banner.jumpUrl]) {
                    if (banner.remark) {
                        this.$router.push(`/vip?vipCode=${banner.remark}`)
                    } else {
                        this.$router.push(this.links[banner.jumpUrl])
                    }
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
    },
}
</script>

<style lang="less" scoped>
.b-item {
    width: 100%;
    display: inline-block;
    cursor: pointer;
    overflow: hidden;
    vertical-align: middle;

    img {
        width: 100%;
        height: 100%;
        border-radius: 6px;
        vertical-align: middle;
    }
}
</style>
