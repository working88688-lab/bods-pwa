<template>
    <div class="search-section">
        <Banner location="search" radius="6px" />
        <div class="search-label" v-if="searchLabels && searchLabels.length">
            <div class="search-title flex-between">
                <span>历史搜索</span>
                <van-icon name="delete-o" @click="onClear" />
            </div>
            <div class="label-list history">
                <span class="label-item" v-for="(label, idx) in searchLabels" :key="idx" @click="onSearchLabel(label)">{{ label.tagName }}</span>
            </div>
        </div>
        <div class="search-label" v-if="labelList.length">
            <div class="search-title">热门搜索</div>
            <div class="label-list">
                <span class="label-item" v-for="(label, idx) in labelList" :key="idx" @click="onSearchLabel(label)">{{ label.tagName }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { hotTag } from '@/apis/media'
import { formatStrNum } from '@/utils/tools'
import MovieItem from '@/components/MovieItem'
import Banner from '@/components/Banner'

export default {
    name: 'SearchSection',
    components: {
        MovieItem,
        Banner
    },
    props: {
        labelList: {
            type: Array,
            default: () => {
                return []
            }
        },
    },
    data() {
        return {}
    },
    computed: {
        searchLabels() {
            return this.$store.state.searchLabel
        }
    },
    created() {},
    mounted() {},
    activated() {},
    destroyed() {},
    methods: {
        onSearchLabel(label) {
            this.$emit('onSearchLabel', label)
        },
        onClear() {
            this.$store.commit('CLEAR_SEARCHLABEL')
        }
    }
};
</script>

<style lang="less" scoped>
.search-section {
    flex: 1;
    overflow: auto;
    .search-label {
        padding: 16px;
        .search-title {
            font-size: 18px;
        }
        .label-list {
            display: flex;
            flex-flow: wrap;
            .label-item {
                padding: 8px 16px;
                background: #fff;
                font-size: 12px;
                border-radius: 13px;
                margin: 16px 12px 0 0;
            }
        }
        .history.label-list {
            .label-item {
                background: #fff;
            }
        }
    }
    .banner-wraper {
        padding: 0 16px;
    }
    .recommend-list {
        padding: 16px;
        .search-title {
            margin-bottom: 12px;
        }
        .movie-row {
            display: flex;
            flex-flow: wrap;
            justify-content: space-between;
        }
    }
}
</style>