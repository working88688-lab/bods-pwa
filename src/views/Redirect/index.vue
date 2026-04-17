<template>
  <div></div>
</template>

<script>
export default {
  beforeCreate() {
    const path = this.$store.state.appFooter.filter(
      item => item.expand !== '/product'
    )[0].expand
    this.$router.replace(path)
  },
}
</script>
