<template>
    <div class="menu_items_section">
        <div class="header_section">
            <div class="head_title">
                <h2>
                <BaseTooltip @button="downloadModal = true"
                message="Download items" icon="cloud-download" />
                Menu Items</h2>
            </div>
            <div class="search_area">
                <v-select
                  outlined
                  label="Department"
                  v-model="departmentSelected" dense
                  item-text="name"
                  item-value="id"
                  :items="departments"
                />
                <v-text-field label="Search"
                  v-model="itemSearch" dense outlined placeholder="Search" />
                <BaseTooltip message="Upload items" icon="cloud-upload" />
                <BaseTooltip message="Add new item" icon="plus" @button="createModal = true" />
            </div>
        </div>
        <LinearLoader v-if="loading" />
        <template v-else>
            <div class="menu_items_display_section">
              <Table>
                <template slot="header">
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Shown</th>
                    <th>update</th>
                  </tr>
                </template>
                <template slot="body">
                  <tr v-for="item in menuItemsFiltered" :key="`menuItem${item.id}`">
                    <td>{{ item.id }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.category }}</td>
                    <td>{{ item.price_display }}</td>
                    <td>
                      <v-btn small dark @click="updateMenuItemStatus(item)"
                        class="toggle_hide_button"
                        :color="item.status == 1 ? 'red darken-3' : 'green darken-3'">
                        {{ item.status == 1 ? 'No' : 'Yes' }}
                      </v-btn>
                    </td>
                    <td>
                      <v-btn icon small class="update_button"
                          @click="updateItem(item)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </template>
              </Table>
                <!-- <MenuItem v-for="(item, i) in menuItemsFiltered" :key="i"
                    :menu-item="item"
                    @changeStatus="updateMenuItemStatus"
                    @update="updateItem"
                /> -->
            </div>
        </template>
        <UpdateMenuItem
          v-if="updateModal && selectedMenuItem"
          :item="selectedMenuItem"
          @close="updateModal = false"
          @reload="reloadMenu"
        />
        <ConfirmModal
          v-if="openConfirmModal"
          :title="confirmTitle"
          @yes="updateStatus"
          @close="openConfirmModal = false"
        />
        <DownloadMenu v-if="downloadModal" @close="downloadModal = false" />
        <CreateNewMenuItem
          v-if="createModal"
          @close="createModal = false; fetchMenuItems()"
        />
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import LinearLoader from '@/components/generics/Loading.vue';
import UpdateMenuItem from '@/components/menu/UpdateMenuItem.vue';
import CreateNewMenuItem from '@/components/menu/CreateNewMenuItem.vue';
import ConfirmModal from '@/components/generics/ConfirmModal.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import DownloadMenu from '@/components/menu/DownloadMenu.vue';
import Table from '@/components/generics/new/Table.vue';

export default {
  name: 'MenuItems',
  components: {
    LinearLoader,
    UpdateMenuItem,
    ConfirmModal,
    CreateNewMenuItem,
    BaseTooltip,
    DownloadMenu,
    Table,
  },
  data() {
    return {
      departmentSelected: 0,
      itemSearch: '',
      updateModal: false,
      menuItemSelected: null,
      openConfirmModal: false,
      confirmTitle: '',
      selectedDepartmentId: 0,
      selectedMenuItem: null,
      createModal: false,
      downloadModal: false,
    };
  },
  watch: {
    async departmentSelected(val) {
      const filters = { department_id: val };
      await this.getMenuItems(filters);
    },
  },
  computed: {
    ...mapGetters('menu', ['menuItems', 'departments', 'loading']),

    menuItemsFiltered() {
      return this.menuItems.filter((Item) => Item.name.toLowerCase()
        .match(this.itemSearch.toLowerCase()));
    },

    selectedDepartmentName() {
      // eslint-disable-next-line eqeqeq
      return this.departments.find((dept) => dept.id == this.departmentSelected).name.toLowerCase();
    },
  },
  methods: {
    ...mapActions('menu', ['getMenuItems', 'getDepartments', 'toggleLoad', 'updateItemStatus']),

    async reloadMenu() {
      this.fetchMenuItems();
      this.selectedMenuItem = null;
      this.updateModal = false;
    },

    updateItem(item) {
      this.selectedMenuItem = item;
      this.updateModal = true;
    },

    fetchMenuDepartments() {
      this.getDepartments(this.selectedDepartmentId);
    },
    async fetchMenuItems() {
      const filters = { item_id: this.selectedDepartmentId };
      await this.getMenuItems(filters);
    },
    updateMenuItemStatus(item) {
      this.menuItemSelected = item;
      if (item.status === 1) {
        this.confirmTitle = 'Show Item';
      } else this.confirmTitle = 'Hide item';
      this.openConfirmModal = true;
    },
    async updateStatus() {
      this.openConfirmModal = false;
      await this.updateItemStatus(this.menuItemSelected);
      await this.fetchMenuItems();
    },
  },
  async created() {
    this.fetchMenuDepartments();
    this.fetchMenuItems();
  },
};
</script>
<style scoped lang="scss">
@import '../../../styles/constants.scss';

    .menu_items_section {
        background-color: inherit;
        width: 100%;
        min-height: 100%;
        display: flex;
        flex-direction: column;

        .header_section {
            height: 60px;
            width: 100%;
            display: grid;
            grid-template-columns: 30% 70%;
            background-color: $white;
            gap: 5px;
            // justify-items: left;
            text-align: left;
            padding: 15px;
            overflow: hidden;

            .head_title h2 span {
              display: inline-flex;
              gap: 5px;
            }

            .search_area {
              display: inline-flex;
              gap: 5px;
            }
        }

        .menu_items_display_section {
            background-color: $white;
            height: calc(100vh - 112px);
            overflow-y: auto;
            overflow-x: hidden;
            border: 0.5px solid $light-grey;
            display: flex;
            flex-direction: column;
        }
    }

    .create_menu_item_icon {
      background-color: $blue;
    }
</style>
