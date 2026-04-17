
<template>
    <div class="page-header" v-sticky="{ zIndex: 99, stickyTop: 0, disabled: false }">
        <van-icon name="arrow-left" @click="onClickLeft"/>
        <van-tabs
            v-if="tabList.length > 1"
            v-model="activeTab"
            title-inactive-color="#ebebeb"
            title-active-color="#ebebeb"
            color="#ebebeb"
            background="none"
            :ellipsis=false
            @change="onChangeTab"
            >
            <van-tab v-for="(tab, idx) in tabList" :key="idx" :title="tab.label" :name="tab.value"></van-tab>
        </van-tabs>
    </div>
</template>

<script>
export default {
    name: 'Header',
    props: {},
    data() {
        return {
            activeTab: 1,
            tabList: [
                { label: '禁言', value: 1 },
                { label: '禁入', value: 2}
            ]
        }
    },
    computed: {},
    created() {
        this.$emit('setTypeValue', this.activeTab)
    },
    methods: {
        onClickLeft() {
            this.$emit('onClickLeft')
        },
        onChangeTab() {
            this.$emit('setTypeValue', this.activeTab)
        }
    }
}
</script>
<style lang="less" scoped>
.page-header {
    width: 100%;
    height: 44px;
    line-height: 44px;
    position: absolute;
    z-index: 999;
    i {
        width: 24px;
        height: 24px;
        font-size: 24px;
        position: absolute;
        top: 10px;
        left: 15px;
        z-index: 1;
        color: #fff;
        cursor: pointer;
    }
}
::v-deep .van-tabs {
    .van-tabs__wrap {
        text-align: center;
    }
}
</style>