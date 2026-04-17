<template>
    <div>
        <GridModal v-if="showIndex == 1" @closeChange="showIndex = 2" />
        <HomeAdDialog v-if="showIndex == 2" location='index_page_promt' @closeChange="showIndex = 3" />
        <CredIdDialog v-if="showIndex == 3" @closeChange="showIndex = 4" />
    </div>
</template>
<script>
import HomeAdDialog from '@/components/HomeAdDialog'
import CredIdDialog from '@/components/CredIdDialog'
import GridModal from '@/components/GridModal'
/**
 * 每个弹窗，前一个关闭后才弹出下一个
 */
export default {
    name: 'AdModal',
    components: {
        HomeAdDialog,
        CredIdDialog,
        GridModal
    },
    data() {
        return {
            showIndex: 1, // 默认弹出第一个
        }
    },
    watch: {
        showIndex(a, b) {
            // console.log(a, b);
        }
    },
    computed: {
    },
    methods: {
    }
}
</script>