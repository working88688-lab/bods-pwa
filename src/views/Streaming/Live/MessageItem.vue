
<template>
    <div class="chat-item-row" :class="{ 'is-horizontal': isHorizontal }">
        <div class="chat-item">
            <span class="user-name">{{ chatInfo.fromUserInfo.nickName }}</span>
            <span class="chat-info">{{ chatInfo.content }}</span>
        </div>
    </div>
</template>

<script>

export default {
    name: 'MessageItem',
    props: {
        chatInfo: {
            type: Object,
            default: {}
        },
        isHorizontal: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {}
    },
    computed: {
        imageBase() {
            return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
        }
    },
    methods: {}
}
</script>
<style lang="less" scoped>
.chat-item-row {
    margin: 0 0 6px;
    .chat-item {
        display: inline-block;
        max-width: 75%;
        font-size: 14px;
        background: rgba(0, 0, 0, 0.5);
        padding: 6px;
        border-radius: 8px;
        .user-name {
            display: inline-block;
            color: #85b8ee;
            margin: 0 6px 0 0;
        }
    }
}
.chat-item-row.is-horizontal {
    margin: 0 0 3px;
    font-size: 6px;
    .chat-item {
        display: inline-block;
        max-width: 100%;
        font-size: 6px;
        padding: 3px;
        border-radius: 4px;
        .user-name {
            margin: 0 2px 0 0;
        }
    }
}
</style>