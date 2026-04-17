<template>
  <div class="setting-page bg-page">
    <Header
      textColor="#222222"
      title="设置"
      @onClickLeft="onBack"
    />
    <ul>
      <li
        v-for="item in list"
        :key="item.value"
      >
        <span>{{ item.label }}</span>
        <div @click="handleclick(item)">
          <template v-if="item.sub === 'avatar' || item.sub === 'nickName'">
            <img
              v-if="item.sub === 'avatar'"
              :src="imageBase + userInfo.headUrl"
            />
            <div v-else>{{ userInfo.nickName }}</div>
          </template>
          <div v-else>{{ userInfo.referCode ? '已绑定' : item.sub }}</div>
          <van-icon name="arrow" />
        </div>
      </li>
    </ul>
    <EditPopup
      :show="show"
      :item="item"
      ref="popup"
    />
  </div>
</template>

<script>
  import Header from '@/components/Header'
  import EditPopup from './EditPopup.vue'
  export default {
    components: { Header, EditPopup },
    data() {
      return {
        list: [
          { label: '更换头像', sub: 'avatar', value: 'avatar' },
          { label: '修改昵称', sub: 'nickName', value: 'nickName' },
          { label: '修改签名', sub: '去修改', value: 'sign' },
          { label: '绑定邀请码', sub: '点击绑定', value: 'invite' },
          { label: '绑定手机号', sub: '点击绑定', value: 'phone' },
          { label: '切换手机号', sub: '去切换', value: 'change' },
          { label: '账户凭证找回账号', sub: '去找回', value: 'retrieve' },
        ],
        show: false,
        item: {},
      }
    },
    computed: {
      imageBase() {
        return this.$store.state.cdnLine ? this.$store.state.cdnLine.cdnLine : ''
      },
      userInfo() {
        return this.$store.state.userInfo
      },
    },
    methods: {
      onBack() {
        this.$router.go(-1)
      },
      close() {
        this.show = false
      },
      handleclick(e) {
        if (e.value === 'sign' && this.userInfo.referCode) {
          return
        }
        this.item = e
        this.$refs['popup'].open()
      },
    },
    created() {},
  }
</script>

<style scoped lang="less">
  .setting-page {
    height: 100%;

    ul {
      margin: 12px;
      border-radius: 6px;
      overflow: hidden;
      li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fff;
        padding: 20px;
        &:first-of-type {
          padding-bottom: 10px;
        }
        &:nth-of-type(3) {
          margin-bottom: 16px;
          border-radius: 0 0 6px 6px;
        }
        &:nth-of-type(4) {
          border-radius: 6px 6px 0 0;
        }
        & > div {
          display: flex;
          align-items: center;
          & > img {
            width: 40px;
            height: 40px;
            border-radius: 999px;
            object-fit: cover;
          }
          .van-icon {
            font-size: 20px;
            margin-left: 8px;
          }
        }
      }
    }
  }
</style>
