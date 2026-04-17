<template>
    <div class="page-container flex-container">
        <Header textColor="#222222" color="#fff" :showHeaderBg="false" title="常见问题" @onClickLeft="onBack"  />
        <div class="page-content">
            <div class="fq-title">
                1. 如何充值金币
            </div>
            <div class="fq-content">
                <p>我的-钱包-选择规格-选择支付</p>
            </div>
            <div class="fq-title">
                2. 为什么提示【充值失败/充值遇到问题】
            </div>
            <div class="fq-content">
                <p>2.1 请检查付款时间网络链接是否正常</p>
                <p>2.2 请检查付款账号余额是否大于购买金币数量</p>
            </div>
            <div class="fq-title">
                3. 付款成功，但是VIP或者金币没到账？
            </div>
            <div class="fq-content">
                <p>3.1 由于网络原因可能导致金币到账延迟，滞后90分钟内属于正常现象，刷新查看。</p>
                <p>3.2 如果付款成功且超过48小时金币未到账请联系在线客服进行反馈，会有工作人员在工作时间帮你核查,反馈时请提供以下界面截图:</p>
                <p>1. 支付成功后的订单详情页截图，需要包含消费时间,金额，收款对象。</p>
                <p>2. 充值界面右上角-充值记录页截图</p>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header'

export default {
    name: 'Setting',
    components: {
        Header
    },
    data() {
        return {}
    },
    computed: {},
    created() {},
    mounted() {},
    methods: {
        onBack() {
            this.$router.go(-1)
        }
    }
};
</script>
  
<style lang="less" scoped>
.page-container {
    flex: 1;
    overflow: hidden;
    background: #f6f6f6;
}
.page-content {
    flex: 1;
    overflow: auto;
    padding: 12px;
    color: rgb(34 34 34);
    .fq-title {
        font-weight: bold;
    }
    .fq-content {

    }
}
</style>
