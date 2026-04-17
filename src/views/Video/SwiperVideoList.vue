<template>
    <div class="page-container flex-container">
        <div class="page-top">
            <Header textColor="#fff" :title="label" @onClickLeft="onBack" />
        </div>
        <SwiperVideo
            v-if="isShow"
            :videoId="videoId"
            :pageNo="pageNo"
            :categoryId="categoryId"
            :mediaType="mediaType"
            :keyword="label"
            :searchBy="searchBy"
            :searchType="searchType"
            :upInfoId="upInfoId"/>
    </div>
</template>
 
<script>
import { Dialog } from 'vant'
import Header from '@/components/Header'
import SwiperVideo from './SwiperVideo'

export default {
    name: 'SwiperVideoList',
    components: {
        Header,
        SwiperVideo
    },
    computed: {},
    data() {
        return {
            label: null,
            videoId: null,
            pageNo: null,
            categoryId: null,
            mediaType: 2,
            isShow: false,
            searchBy: 'categoryId',
            searchType: 'SORT_PUBLISH',
            upInfoId: ''
        }
    },
    created() {},
    mounted() {},
    activated() {
        this.init()
    },
    deactivated() {},
    destroyed() {},
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        init() {
            const { categoryId, mediaType, label, videoId, pageNo, searchBy, searchType, upInfoId } = this.$route.query
            this.categoryId = categoryId
            this.label = label
            this.videoId = videoId
            this.pageNo = pageNo
            this.searchBy = searchBy
            this.searchType = (searchType ? searchType : 'SORT_PUBLISH')
            this.upInfoId = upInfoId
            this.mediaType = (mediaType ? mediaType : 2)
            if (categoryId) {
                this.isShow = true
            }
        }
    }
};
</script>

<style lang="less" scoped>
.page-container {
    .page-top {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1200;
    }
}
</style>
