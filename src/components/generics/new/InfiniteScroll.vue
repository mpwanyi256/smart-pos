<template>
    <div class="infinite-scroll" @scroll="handleScroll">
        <slot name="content"></slot>
    </div>
</template>
<script>
import helperMixin from '@/mixins/helperMixin';

export default {
  name: 'InfiniteScroll',
  mixins: [helperMixin],
};
</script>
<style scoped>
.infinite-scroll {
    width: inherit;
    height: inherit;
    overflow-y: auto;
    overflow-x: hidden;
    top: 0;
    bottom: 0;
    margin: 0;
}
</style>
