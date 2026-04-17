<template>
  <div class="page-container">
    <Header title="联系客服" color="#0c1231" @onClickLeft="onBack" />
    <div class="page-content">

    </div>
  </div>
</template>

<script>
import Header from '@/components/Header'

export default {
  name: 'Feedback',
  components: { Header },
  data() {
    return {}
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    }
  },
  created() {},
  mounted() {},
  methods: {
    onBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="less" scoped>
.page-content {
  padding: 60px 16px 50px;
}
</style>