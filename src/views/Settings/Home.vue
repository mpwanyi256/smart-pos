<template>
    <div class="pos_settings">
        <NavBar />
        <div class="settings_nav_pane">
            <div class="link_pane">
                <SalesNavBar :title="'Settings'" :links="links" />
            </div>
            <div class="link_views">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>
<script>
import NavBar from '@/components/nav/Navbar.vue';
import SalesNavBar from '@/components/nav/SalesNavBar.vue';

export default {
  name: 'Settings',
  components: {
    NavBar,
    SalesNavBar,
  },
  data() {
    return {
      links: [
        { name: 'Access controls', icon: 'mdi-security', path: 'access_controls' },
        { name: 'Company settings', icon: 'mdi-domain', path: 'company_settings' },
        { name: 'Clients', icon: 'mdi-account-group', path: 'company_clients' },
        { name: 'Departments', icon: 'mdi-shape', path: 'company_departments_list' },
        { name: 'Email list', icon: 'mdi-email', path: 'company_mail_list' },
        { name: 'Employees', icon: 'mdi-account-group-outline', path: 'company_employees' },
        { name: 'Outlets', icon: 'mdi-home-city', path: 'company_outlets' },
        { name: 'Printer settings', icon: 'mdi-printer', path: 'company_departments' },
        { name: 'Sections and tables', icon: 'mdi-table-arrow-right', path: 'sections_and_tables' },
        { name: 'Menu Categories', icon: 'mdi-book-open-page-variant', path: 'settings_menu_categories' },
        { name: 'Menu Items', icon: 'mdi-book-open-variant', path: 'settings_menu_items' },
      ],
    };
  },
  computed: {
    // sortedLinks() {
    //   // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    //   return this.links.sort((a, b) => a.name - b.name);
    // },
  },
};
</script>
<style scoped lang="scss">
@import '../../styles/constants.scss';

    .pos_settings {
        width: 100vw;
        height: 100vh;
        margin: 0;
        background-color: $body-bg;
        display: flex;
        flex-direction: column;
        font-family: $font-style !important;

        ::-webkit-scrollbar{
            width: 5px;
            height: 5px;
        }

        ::-webkit-scrollbar-thumb {
            background: $scrollbar-color;
            border-radius: 1ex;
            -webkit-border-radius: 1ex;
        }

        ::-webkit-scrollbar-corner {
            background: #000;
        }

        .settings_nav_pane {
            overflow: hidden;
            top: 0;
            bottom: 0;
            height: calc(100vh - 52px);
            display: grid;

            @media only screen and (max-width: 1200px) {
                grid-template-columns: 20% 80%;
            }

            @media only screen and (min-width: 1600px) {
                grid-template-columns: 20% 80%;
            }

            @media only screen and (max-width: 1600px) {
                grid-template-columns: 30% 70%;
            }

            .link_views {
                background-color: $white;
                height: calc(100vh - 52px);
                overflow: auto;
            }

            .link_pane {
                background-color: inherit;
            }

        }
    }

</style>
