<template>
    <div class="page-header">
        <img class="logo" src="@/assets/logo.png" @click="onRoute('/vip')">
        <van-notice-bar class="mheadCenter" right-icon="volume-o" :scrollable="false">
            <van-swipe
                vertical
                class="notice-swipe"
                :autoplay="5000"
                :touchable="false"
                :show-indicators="false"
            >
                <van-swipe-item v-for="(label, idx) in labelList" :key="idx" @click="onSearch">{{ label.tagName }}</van-swipe-item>
            </van-swipe>
            <template slot="right-icon">
                <van-icon name="search" @click="onSearch"/>
            </template>
        </van-notice-bar>
        <div class="sign" @click="onRoute('/signin')">
            <span class="icon-check"></span>
            <div>签到</div>
        </div>
    </div>
</template>

<script>
import Banner from '@/components/Banner'
import _ from 'lodash'
import { hotTag } from '@/apis/media'

export default {
    name: 'PageHeader',
    props: {
        mediaType: {
            type: Number,
            default: 8
        }
    },
    components: {
        Banner
    },
    computed: {
        appFooter() {
            return this.$store.state.appFooter
        },
        isApp() {
            return this.$store.state.isApp
        }
    },
    data() {
        return {
            labelList: []
        }
    },
    created() {
        this.getVideoLabel()
    },
    mounted() {},
    destroyed() {},
    methods: {
        onSearch() {
            this.$router.push({
                path: '/search',
                query: {
                    mediaType: this.mediaType
                }
            })
        },
        onRoute(path) {
            this.$router.push(path)
        },
        async getVideoLabel() {
            const res = await hotTag({ mediaType: this.mediaType })
            if (res && res.code === 0) {
                this.labelList = res.data.slice(0, 16)
            }
        }
    }
};
</script>

<style lang="less" scoped>
.page-header {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 6px 12px 0;
    .logo {
        width: 36px;
        border-radius: 50%;
    }
    .mheadCenter {
        flex: 1;
    }
    .mheadCenter.van-notice-bar {
        background: #fff;
        height: 32px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex: 1;
        cursor: pointer;
        padding: 0 8px 0 16px;
        margin: 0 10px;
        border-radius: 999px;
        .notice-swipe {
            height: 40px;
            position: relative;
            overflow: hidden;
            top: 10px;
            .van-swipe-item {
                height: 40px;
                font-size: 14px;
                color: #666666;
            }
        }
        .van-icon {
            font-size: 20px;
            color: #666666;
        }
    }
    .sign {
        font-size: 12px;
        color: #fff;
        width: 32px;
        text-align: center;
        .icon-check {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url(../../../assets/images/qiandao.png) center / 100% no-repeat;
        }
    }
}
</style>