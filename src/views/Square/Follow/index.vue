<template>
    <div>
        <Loading v-if="isInit" />
        <vue-loadmore
            v-else
            :on-refresh="onRefresh" 
            :on-loadmore="onLoad"
            :finished="finished">
            <div>
                <Dynami
                v-for="(dynamic, idx) in dataList"
                :key="idx"
                type="follow"
                :dynamic="dynamic"
                :showFlow="(dynamic.userInfoPo.userId !== userInfo.userId)"
                @changeData="handleChangeData($event, idx)"
                />
            </div>
        </vue-loadmore>
    </div>
</template>

<script>
import { dynamic } from '@/apis/data'
import { formatStrNum } from '@/utils/tools'
import Dynamic from '@/components/Dynamic'
import Loading from '@/components/Loading'

export default {
    name: 'Follow',
    components: {
        Dynamic,
        Loading
    },
    data() {
        return {
            isInit: true,
            finished: false,
            dataList: [],
            page: {
                pageNo: 1,
                pageSize: 10
            }
        }
    },
    computed: {
        userInfo() {
        return this.$store.state.userInfo
        }
    },
    created() {
        this.getDataList()
    },
    methods: {
        async getDataList(done, isRefresh) {
            let params = Object.assign(this.page, {
                param: {
                oneself: false,
                type: 4
                }
            })
            const res = await dynamic(params)
            done && done()
            this.isInit = false
            if (res && res.code === 0) {
                if(isRefresh) {
                this.dataList = res.data.dataList
                } else {
                this.dataList = this.dataList.concat(res.data.dataList)
                }
                this.finished = res.data.last
            }
        },
        onRefresh(done) {
            this.page.pageNo = 1
            this.getDataList(done, true)
        },
        onLoad(done) {
            this.page.pageNo++
            this.getDataList(done)
        },
        formatNum(num) {
            return formatStrNum(num)
        },
        onActivity(item) {
            this.$router.push({
                path: '/activity-detail',
                query: {
                id: item.id
                }
            })
        },
        handleChangeData({ data, action }, idx) {
            if (action === 'like' || action === 'buy') {
                this.$set(this.dataList, idx, data)
            } else if (action === 'follow') {
                    this.dataList.forEach((one, i) => {
                    if (data.userInfo.userId === one.userInfo.userId) {
                        let targetData = Object.assign({}, one)
                        targetData.followStatus = data.followStatus
                        this.$set(this.dataList, i, targetData)
                    }
                })
            }
        }
    }
};
</script>

<style lang="less" scoped>

</style>