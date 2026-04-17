<template>
    <div class="page-container flex-container notice">
        <div class="header-wraper">
            <Header color="transparent" textColor="#222" title="消息通知" @onClickLeft="onBack" />
            <van-tabs
                v-model="activedType"
                background="none"
                :ellipsis='false'>
                <van-tab v-for="(tab, idx) in noticeTypeList" :key="idx" :title="tab.label" :name="tab.type"></van-tab>
            </van-tabs>
        </div>
        <div class="page-content">
            <LikeNotice v-if="activedType === 'like'" />
            <CommentNotice v-if="activedType === 'comment'" />
            <MessageNotice v-if="activedType === 'notice'" />
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'
import LikeNotice from './LikeNotice'
import CommentNotice from './CommentNotice'
import MessageNotice from './MessageNotice'

export default {
    name: 'Notice',
    components: {
        Header,
        LikeNotice,
        CommentNotice,
        MessageNotice
    },
    data() {
        return {
            noticeTypeList: [
                { label: '点赞', type: 'like' },
                { label: '评论', type: 'comment' },
                { label: '通知', type: 'notice' }
            ],
            activedType: 'like'
        }
    },
    computed: {
        userInfo() {
            return this.$store.state.userInfo
        },
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        }
    },
    created() {
        this.activedType = this.noticeTypeList[0].type
    },
    mounted() {},
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onChangeType(noticeType) {
            this.activedType = noticeType.type
        }
    }
};
</script>

<style lang="less" scoped>
.notice {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}
::v-deep .van-tabs {
    .van-tabs__wrap {
        height: 30px;
        .van-tabs__nav {
            display: inline-flex;
            .van-tab {
                padding-bottom: 0;
                font-size: 16px;
            }
            .van-tab--active {
                font-weight: bold;
                font-size: 20px;
            }
            .van-tab:first-child {
                margin-left: 0;
            }
            .van-tabs__line {
                display: none;
            }
        }
    }
}

.page-content {
    flex: 1;
    overflow: auto;
}
</style>