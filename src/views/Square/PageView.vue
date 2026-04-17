<template>
    <div>
        <Game v-if="expand.includes('game')" />
        <Category v-else />
    </div>
</template>

<script>
import Category from './Category'
import Game from './Game'

export default {
    name: 'PageView',
    components: {
        Category,
        Game
    },
    computed: {
        expand() {
            return this.$route.query.expand
        }
    },
};
</script>

<style lang="less" scoped></style>