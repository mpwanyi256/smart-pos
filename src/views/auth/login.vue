<template>
    <div class="main-login">
      <SmartPos />
        <p class="prodev_info">
          <span>
            <v-avatar size="26">
              <img
                src="../../assets/logo.png"
                alt="uganda"
              >
            </v-avatar>
          </span>
          <a href="http://prodevgroup.22web.org/?i=2" target="__blank">
            Smart POS V-3.0.1
          </a>
          | Copyrite {{ new Date().getFullYear() }}
        </p>
    </div>
</template>
<script>
import SmartPos from '@/views/auth/SmartPos.vue';

export default {
  name: 'LoginForm',
  components: {
    SmartPos,
  },

};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

.main-login {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;

  .prodev_info {
    text-align: center;
    color: $black;
    font-weight: bold;

    a {
      text-decoration: none;
      color: inherit;
    }
  }
}
</style>
