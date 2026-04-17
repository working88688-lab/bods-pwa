<template>
    <div class="flex-container">
        <Banner location="search" radius="6px" />
        <Loading v-if="isRefresh" />
        <van-tabs
            v-else
            v-model="activedTab"
            background="none"
            :ellipsis='false'
            swipeable
            :animated="true"
            class="page-tabs flex-container">
            <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.value">
                <ComicsList v-if="tab.value === 8" :searchLabel="searchLabel" />
                <CartoonList v-if="tab.value === 9" :searchLabel="searchLabel" />
                <FictionList v-if="tab.value === 10" :searchLabel="searchLabel" />
                <MovieList v-if="tab.value === 1" :searchLabel="searchLabel" />
                <DynamicList v-if="tab.value === 3" :searchLabel="searchLabel" />
            </van-tab>
        </van-tabs>
    </div>
</template>

<script>
import Loading from '@/components/Loading'
import Banner from "@/components/Banner";
import CartoonList from './CartoonList'
import FictionList from './FictionList'
import ComicsList from './ComicsList'
import MovieList from './MovieList'
import DynamicList from './DynamicList'

export default {
    name: 'ResultSection',
    components: {
        Banner,
        Loading,
        CartoonList,
        FictionList,
        ComicsList,
        MovieList,
        DynamicList
    },
    props: {
        mediaType: {
            type: Number,
            default: 1
        },
        searchLabel: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            activedTab: 1,
            tabList: [
                { label: "漫画", value: 8 },
                { label: "动漫", value: 9 },
                { label: "小说", value: 10 },
                { label: "视频", value: 1 },
                { label: "广场", value: 3 }
            ],
            scrollTop: 0,
            isRefresh: false
        }
    },
    created() {
        this.activedTab = this.mediaType
    },
    mounted() {},
    activated() {
        this.$nextTick(() => {
            const pageContentDom = document.getElementsByClassName('van-tab__pane-wrapper')
            const idx = _.findIndex(this.tabList, one => one.value === this.activedTab)
            if (pageContentDom && pageContentDom[idx]) {
                pageContentDom[idx].scrollTop = this.scrollTop
            }
        })
    },
    methods: {
        onRefresh() {
            // 手动输入时，处理搜索结果
            this.isRefresh = true
            this.$nextTick(() => {
                this.isRefresh = false
            })
        },
        setScrollTop() {
            const pageContentDom = document.getElementsByClassName('van-tab__pane-wrapper')
            const idx = _.findIndex(this.tabList, one => one.value === this.activedTab)
            if (pageContentDom && pageContentDom[idx]) {
                this.scrollTop = pageContentDom[idx].scrollTop
            }
        }
    }
};
</script>

<style lang="less" scoped>
::v-deep .page-tabs {
    .van-tabs__content {
        flex: 1;
        overflow: hidden;
        .van-tabs__track {
            height: 100%;
            .van-tab__pane-wrapper {
                overflow: auto;
            }
        }
    }
}
</style>