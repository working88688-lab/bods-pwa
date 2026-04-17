<template>
    <div class="page-container flex-container vip">
        <Header textColor="#000" title="金币明细" @onClickLeft="onBack"/>
        <Balance v-if="(activedType && activedType.value === 'balance')" />
        <Income v-if="(activedType && activedType.value === 'income')" />
    </div>
</template>

<script>
import Header from '@/components/Header'
import Balance from './Balance'
import Income from './Income'
import { centerUserInfo } from '@/apis/user'

export default {
    name: 'Wallet',
    components: {
        Header,
        Balance,
        Income
    },
    data(){
        return {
            activedType: null,
            headerTypeList: [
                { label: '金币', value: 'balance' },
                { label: '收益', value: 'income' }
            ]
        }
    },
    created() {
        this.activedType = this.headerTypeList[0]
    },
    activated() {
        this.getUserInfo()
    },
    methods: {
        onBack() {
            this.$router.go(-1)
        },
        onChangeType(data) {
            this.activedType = data
        },
        async getUserInfo() {
            const res = await centerUserInfo()
                if (res && res.code === 0) {
                this.$store.commit('SET_USERINFO', res.data)
            }
        }
    }
}
</script>

<style lang="less" scoped>
.vip {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(../../../assets/images/top_bg.png) top / 100% no-repeat
    transparent;
  padding-top: calc(var(--safe-area-top));
}
</style>