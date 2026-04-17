<template>
    <div class="search-page flex-container">
        <div class="top-wraper">
            <van-search v-model="searchLabel" placeholder="请输入搜索关键词" :show-action="true"
                @search="handleSearch" @cancel="onCancel" @click-right-icon="handleSearch">
                <span slot="right-icon">搜索</span>
            </van-search>
        </div>
        <SearchSection v-if="!isSearch" :labelList="labelList" @onSearchLabel="handleSearchLabel" />
        <SearchResult v-else ref="searchResult" :mediaType="mediaType" :searchLabel="searchLabel" />
    </div>
</template>

<script>
import SearchSection from "./SearchSection";
import SearchResult from "./SearchResult";
import { hotTag } from '@/apis/media'

export default {
    name: "MovieSearch",
    components: {
        SearchSection,
        SearchResult
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
        this.getHotTag()
    },
    activated() {
        const { label, mediaType } = this.$route.query
        if (mediaType) {
            this.mediaType = mediaType * 1
        } else {
            this.mediaType = 1
        }
        if (label) {
            this.searchLabel = label
            this.handleSearchLabel({ tagName: this.searchLabel })
        }
    },
    beforeRouteLeave(to, from, next) {
        if (this.$refs.searchResult) {
            this.$refs.searchResult.setScrollTop()
        }
        next();
    },
    destroyed() { },
    computed: {},
    mounted() { },
    methods: {
        onSearch() { },
        onCancel() {
            if (this.isSearch) {
                this.isSearch = false;
            } else {
                this.$router.go(-1);
            }
        },
        handleSearch() {
            if (!this.searchLabel) {
                return null;
            }
            const label = {
                tagName: this.searchLabel,
            }
            this.handleSearchLabel(label)
        },
        handleSearchLabel(label) {
            this.searchLabel = label.tagName
            if (this.isSearch) {
                this.$refs.searchResult.onRefresh()
            } else {
                this.isSearch = true
            }
            this.$store.commit("SET_SEARCHLABEL", label)
        },
        async getHotTag() {
            const res = await hotTag({})
            if (res && res.code === 0) {
                this.labelList = res.data.slice(0, 16)
            }
        },
    }
}
</script>
  
<style lang="less" scoped>
.top-wraper {
    background-color: #fffafb;
}

.search-page {
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
  