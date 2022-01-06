<template>
    <v-menu offset-y>
        <template v-slot:activator="{ attrs, on }">
            <v-btn :color="color" class="white--text" v-bind="attrs" fab small v-on="on">
              <v-icon>{{ `mdi-${icon}` }}</v-icon>
            </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(option, idx) in options"
          :key="`drop-down-option-${idx}`"
          link
        >
          <v-list-item-title
            v-text="option.text"
            @click="selectedOption = option"
          />
        </v-list-item>
      </v-list>
    </v-menu>
</template>
<script>
export default {
  name: 'BaseDropDownFab',
  props: {
    color: {
      type: String,
      required: false,
      default: () => 'black',
    },
    icon: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedOption: null,
    };
  },
  watch: {
    selectedOption: {
      handler(val) {
        if (val) this.$emit('selected', val);
        this.selectedOption = null;
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
