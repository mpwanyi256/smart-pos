<template>
    <div class="header-overview">
        <h3>{{ title }}</h3>
    </div>
</template>
<script>
export default {
  name: 'OverviewHeader',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
<style lang="scss">
@import '@/styles/constants.scss';

.header-overview {
    min-height: 32px;
    width: 100%;
    background-color: $body-bg;
    border-bottom: 0.5px solid $gray-80;
    display: inline-flex;
    justify-content: left;
    align-items: center;

    h3 {
      line-height: 1.5;
      color: $black;
      font-weight: 400;
      margin: 15px;
    }
}

</style>
