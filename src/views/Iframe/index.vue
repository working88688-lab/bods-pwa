<template>
    <div class="page-main flex-container">
        <div class="close-btn" @click="onClose">关闭</div>
        <iframe :src="src" border="none" frameBorder="0"></iframe>
    </div>
</template>

<script>

export default {
    name: 'IFrame',
    data() {
        return {
            jumpInfo: null,
            src: ''
        }
    },
    computed: {
        previousRoute() {
            return this.$store.state.previousRoute
        }
    },
    created() {},
    mounted() {},
    activated() {
        this.jumpInfo = JSON.parse(decodeURI(this.$route.query.jumpStr))
        if(this.jumpInfo) {
            this.src = this.jumpInfo.jumpTo
        }
    },
    methods: {
        onClose() {
            if(this.previousRoute) {
                this.$router.push(this.previousRoute)
            } else {
                this.$router.push('/')
            }
        }
    }
};
</script>

<style lang="less" scoped>
.page-main {
    position: relative;
    iframe {
        width: 100%;
        flex: 1;
        overflow: auto;
    }
    .close-btn {
        position: absolute;
        z-index: 9999999;
        top: 10px;
        right: 10px;
        background: #fff;
        border-radius: 16px;
        padding: 6px 12px;
        cursor: pointer;
    }
}
</style>