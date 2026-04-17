<template>
    <div class="tag-search-result flex-container bg-page">
        <Header :title="searchLabel" textColor="#000" @onClickLeft="onBack" />
        <MovieList v-if="searchLabel" tag :searchLabel="searchLabel" style="flex: 1; overflow-y: auto;" />
    </div>
</template>

<script>
import Header from '@/components/Header'
import MovieList from './MovieList'

export default {
    name: "MovieSearch",
    components: {
        MovieList,
        Header
    },
    data() {
        return {
            searchLabel: '',
            mediaType: 1,
            isSearch: false,
            labelList: []
        };
    },
    created() {
    },
    activated() {
        const { label, mediaType } = this.$route.query
        this.searchLabel = label
        if (mediaType) {
            this.mediaType = mediaType * 1
        } else {
            this.mediaType = 1
        }
    },
    deactivated(){
        this.searchLabel = ''
    },
    destroyed() { },
    computed: {},
    mounted() { },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onSearch() { },
        onCancel() {
            if (this.isSearch) {
                this.isSearch = false;
            } else {
                this.$router.go(-1);
            }
        },
    }
}
</script>
  
<style lang="less" scoped>
.tag-search-result {
    background-color: #fffafb;
}

::v-deep .van-search {
    background: none;
    .van-search__content {
        background-color: #fff;
        .van-icon {
            color: #a3a3a3;
        }
    }
    .van-search__action {
        color: #222222;
    }
}

::v-deep .van-tabs {
    display: inline-flex;
    .van-tabs__wrap {
        .van-tabs__nav {
            display: inline-flex;
            .van-tab {
                padding-bottom: 0;
                font-size: 15px;
            }
            .van-tab--active {
                font-size: 22px;
                position: relative;
                font-weight: bold;
            }
            .van-tabs__line {
                display: none;
            }
        }
    }
}
</style>
  