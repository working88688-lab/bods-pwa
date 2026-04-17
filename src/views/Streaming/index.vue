<template>
    <div class="page-container">
        <div class="page-top" v-sticky="{ zIndex: 10, stickyTop: 0, disabled: false }">
            <div class="page-header">
                <div class="header-title">{{ menuData ? menuData.firstCategoryName : '' }}</div>
                <div class="right" @click="onFilter">
                    <span class="icon-filter"></span>
                    <span>筛选</span>
                </div>
            </div>
        </div>
        <div class="banner-wraper" v-if="showBanner">
            <Banner location="streamad" @onFinish="handleBannerFinish"/>
        </div>
        <keep-alive>
            <router-view :key="activedTab" />
        </keep-alive>
        <Footer activePath="/streaming" />
        <SearchPopup ref="searchPopupRef" :searchData="searchData" @onFinish="handleSearch" />
    </div>
</template>

<script>
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import _ from 'lodash'
import Footer from '@/components/Footer'
import PubSub from 'pubsub-js'
import Banner from '@/components/Banner'
import SearchPopup from './components/SearchPopup'

export default {
    name: 'Streaming',
    components: {
        Header,
        Banner,
        Loading,
        Footer,
        SearchPopup
    },
    data() {
        return {
            showBanner: true,
            tabList: [],
            activedTab: null,
            city: '',
            scrollTop: 0,
            menuData: null,
            countryList: [
                { text: '国家/地区', value: '' },
                // { text: '中国', value: 'cn' },
                // { text: '香港', value: 'hk' },
                // { text: '日本', value: 'jp' },
                // { text: '澳门', value: 'mo' },
                // { text: '台湾', value: 'tw' },
                // { text: '韩国', value: 'kr' }
            ],
            broadcastGenderList: [
                { text: '类别', value: '' },
                { text: '男性', value: 'male' },
                { text: '女性', value: 'female' },
                { text: '变性人', value: 'tranny' },
                { text: '群体表演', value: 'group' },
                { text: '情侣', value: 'couple' }
            ],
            specificsList: [
                { text: '特征', value: '' },
                // { text: '大屁股', value: 'specificsBigAss' },
                // { text: '巨乳', value: 'specificsBigTits' },
                // { text: '大屌', value: 'specificsBigCock' },
                // { text: '阴部多毛', value: 'specificsHairy' },
                // { text: '纹身', value: 'specificsTattoos' },
                // { text: '穿孔', value: 'specificsPiercing' },
                // { text: '女同', value: 'specificLesbians' },
                // { text: '跨种族', value: 'specificInterracial' },
                // { text: '怀孕', value: 'specificPregnant' },
                // { text: '小胸部', value: 'specificSmallTits' },
                // { text: '剃光', value: 'specificShaven' }
            ],
            liveStatusList: [
                { text: '在线', value: 1 },
                { text: '离线', value: 0 }
            ],
            searchData: {
                // country: '',
                broadcastGender: '',
                // specifics: null,
                isLive: 1
            }
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        },
        appFooter() {
            return this.$store.state.appFooter
        },
        isApp() {
            return this.$store.state.isApp
        }
    },
    created() {
        this.menuData = this.appFooter.find(one => one.expand === '/streaming')
        if (!this.menuData) {
            return this.$toast('获取分类信息失败')
        }
        this.tabList = this.menuData.child.map(one => {
            const obj = {
                label: one.secondCategoryName,
                categoryId: one.categoryId
            }
            return obj
        })
        if (this.$route.query.categoryId) {
            this.activedTab = this.$route.query.categoryId
        } else {
            if (this.tabList[0]) {
                this.activedTab = this.tabList[0].categoryId
            }
        }
        this.onChangeTab(this.activedTab)
    },
    activated() {
        this.$nextTick(() => {
            document.documentElement.scrollTop = this.scrollTop
        })
    },
    beforeRouteLeave(to, from, next) {
        this.scrollTop = document.documentElement.scrollTop
        next()
    },
    methods: {
        handleBannerFinish(data) {
            this.showBanner = !!data.length
        },
        onFilter() {
            this.$refs.searchPopupRef.onShow()
        },
        async onRoute(path) {
            if (!this.userInfo) {
                await this.$store.dispatch('macLogin')
            }
            this.$router.push(path)
        },
        onChangeTab(categoryId) {
            this.$router.push({
                path: '/streaming/category',
                query: {
                    categoryId: categoryId,
                }
            })
            this.$nextTick(() => {
                PubSub.publish('ON_SEARCHLIVE', this.searchData)
            })
        },
        async beforeChange(categoryId) {
            if (categoryId === 'USER_FAVOR_RECORD') {
                if (!this.userInfo) {
                    await this.$store.dispatch('macLogin')
                    return false
                } else {
                    return true
                }
            } else {
                return true
            }
        },
        handleSearch(data) {
            this.searchData = data
            PubSub.publish('ON_SEARCHLIVE', this.searchData)
        }
    }
}
</script>
  
<style lang="less" scoped>
.page-top {
    width: 100%;
    background: #fafafa;
    .page-header {
        width: 100%;
        height: 44px;
        line-height: 44px;
        position: relative;
        margin-bottom: 12px;
        .header-title {
            width: 100%;
            height: 44px;
            line-height: 44px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
        }
        .right {
            display: inline-flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 16px;
            cursor: pointer;
            font-size: 14px;
            position: absolute;
            top: 0;
            right: 0;
            .icon-filter {
                display: inline-block;
                width: 24px;
                height: 24px;
                background: url(../../assets/images/filter.png) center / 100% no-repeat;
            }
        }
    }
}
.banner-wraper {
    padding: 0 16px 12px;
}
.page-container {
    min-height: 100vh;
}
</style>