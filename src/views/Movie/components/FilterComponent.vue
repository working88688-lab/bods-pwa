<template>
    <div class="filter">
        <div class="filter-row" v-if="showStatus">
            <div>
                <div class="filter-label">筛选：</div>
                <div class="filter-item">
                    <span v-for="(status, idx) in statusList" :key="idx" :class="{ 'actived': recommend === status.value }" @click="onChangeStatus(status.value)">{{ status.label }}</span>
                </div>
            </div>
        </div>
        <div class="filter-row" v-if="showPayType">
            <div>
                <div class="filter-label">付费类型：</div>
                <div class="filter-item">
                    <span v-for="(pay, idx) in payTypeList" :key="idx" :class="{ 'actived': payType === pay.value }" @click="onChangePay(pay.value)">{{ pay.label }}</span>
                </div>
            </div>
        </div>
        <div class="filter-row" v-if="showSort">
            <div>
                <div class="filter-label">排序：</div>
                <div class="filter-item">
                    <span v-for="(sort, idx) in sortList" :key="idx" :class="{ 'actived': searchType === sort.value }" @click="onChangeSort(sort.value)">{{ sort.label }}</span>
                </div>
            </div>
            <div class="btn-reset" @click="onReset">重置</div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
    name: 'FilterComponent',
    props: {
        showStatus: {
            type: Boolean,
            default: true
        },
        showPayType: {
            type: Boolean,
            default: true
        },
        showSort: {
            type: Boolean,
            default: true
        },
    },
    computed: {},
    data() {
        return {
            recommend: null,
            statusList: [
                { label: '全部', value: null },
                { label: '推荐', value: 'recommend' }
            ],
            searchType: 'SORT_PUBLISH',
            sortList: [
                { label: '最新', value: 'SORT_PUBLISH_WEIGHT' },
                { label: '观看数', value: 'SORT_VIEW' },
                { label: '点赞数', value: 'SORT_FAVOR' }
            ],
            payType: null,
            payTypeList: [
                { label: '全部', value: null },
                { label: '限免', value: 1 },
                { label: '金币', value: 2 },
                { label: 'VIP', value: 4 },
            ]
        }
    },
    created() {
        this.init()
    },
    mounted() {},
    destroyed() {},
    methods: {
        init() {
            this.recommend = null
            this.searchType = 'SORT_PUBLISH'
            this.payType = null
        },
        onChangeStatus(status) {
            this.recommend = status
            const params = {
                orderType: this.searchType,
                recommend: this.recommend,
                payType: this.payType
            }
            this.$emit('onFilter', params)
        },
        onChangePay(payType) {
            this.payType = payType
            const params = {
                orderType: this.searchType,
                recommend: this.recommend,
                payType: this.payType
            }
            this.$emit('onFilter', params)
        },
        onChangeSort(sort) {
            this.searchType = sort
            const params = {
                orderType: this.searchType,
                recommend: this.recommend,
                payType: this.payType
            }
            this.$emit('onFilter', params)
        },
        onReset() {
            this.recommend = null
            this.searchType = 'SORT_PUBLISH'
            this.payType = null
            const params = {
                orderType: this.searchType,
                recommend: this.recommend,
                payType: this.payType
            }
            this.$emit('onFilter', params)
        }
    }
};
</script>

<style lang="less" scoped>
.filter {
    margin: 0 12px 0;
    background: rgb(255, 236, 236);
    padding: 12px;
    border-radius: 6px;
    .filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12px;
        >div {
            display: inline-flex;
            align-items: center;
        }
        .filter-item {
            span {
                padding: 0 6px;
            }
            .actived {
                color: #2a78f6;
            }
        }
        .btn-reset {
            background: #2a78f6;
            color: #fff;
            font-size: 10px;
            padding: 3px 6px;
            border-radius: 4px;
        }
    }
    .filter-row:last-child {
        margin-bottom: 0;
    }
}
</style>