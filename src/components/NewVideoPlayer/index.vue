<template>
    <div>xxx</div>
</template>

<script>
export default {
    name: 'NewVideoPlayer',
    props: {
        isVip: { //是否vip
            type: Boolean,
            default: false,
        },
        advertise: { // vip广告参数
            type: Object,
            default: () => { },
        },
        resources: { // 视频资源
            type: String,
            default: null,
        },
    },
    data() {
        return {

        }
    }
}
</script>