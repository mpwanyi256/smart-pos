<template>
    <div class="outlet">
        <h3>Outlet name</h3>
    </div>
</template>
<script>
export default {
  name: 'Outlet',
};
</script>
<style scoped lang="scss">
@import '@/styles/constants.scss';

.outlet {
    height: 56px;
    display: flex;
    flex-direction: column;
    background-color: $white;
    border: 0.5px solid $border-color;
    border-radius: 8px;
    justify-content: center;
    padding-left: 5px;
    padding-right: 5px;
}

.outlet:hover {
    // background-color: $accent;
    color: $accent;
    cursor: pointer;
    box-shadow: $elevation-mid;
    border: 0.5px solid $gray-45;
}

</style>
