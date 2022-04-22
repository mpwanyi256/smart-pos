<template>
    <div class="main-login">
        <div class="smart">
            <v-card class="auth_card">
                <v-card-text>
                    <div class="text-center mb-3">
                        <h1>Select Outlet</h1>
                    </div>
                    <div class="outlets-list">
                        <Outlet v-for="i in 20" :key="i" />
                    </div>
                </v-card-text>
            </v-card>
        </div>
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
import { mapGetters } from 'vuex';
import Outlet from '@/components/outlets/Outlet.vue';

export default {
  name: 'SelectOutlet',

  components: {
    Outlet,
  },

  computed: {
    ...mapGetters('auth', ['user']),
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
    background-size: 100%;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    background-image: url('../../assets/rocket.jpeg');

    .smart {
        height: calc(100vh - 56px);
        display: flex;
        gap: 15px;
        justify-content: center;
        align-items: center;

        .auth_card {
            width: 50vw !important;

            .outlets-list {
                max-height: 450px;
                overflow-y: auto;
                overflow-x: hidden;
            }
        }
    }

  .prodev_info {
    text-align: center;
    color: $white;
    font-weight: bold;

    a {
      text-decoration: none;
      color: inherit;
    }
  }
}
</style>
