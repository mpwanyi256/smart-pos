<template>
  <div class="text_field">
    <input :type="inputType ? inputType : 'text'"
    :disabled="disabled"
    v-model="input_text"
    class="search_field number_input"
    :class="flat ? 'flat' : ''"
    :placeholder="placeholder ? placeholder : 'Search'" />
  </div>
</template>
<script>
export default {
  name: 'BaseTextfield',
  props: {
    inputType: {
      type: String,
      required: false,
    },
    preset: {
      type: [String, Number],
      required: false,
    },
    placeholder: {
      type: String,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: () => false,
    },
    flat: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  data() {
    return {
      input_text: '',
    };
  },
  watch: {
    input_text(val) {
      this.$nextTick(() => {
        this.$emit('input', val);
      });
    },
    preset(val) {
      this.input_text = val;
    },
  },
  created() {
    if (this.preset) {
      this.input_text = this.preset;
    }
  },
};
</script>
<style lang="scss" scoped>
@import '@/styles/constants.scss';

  .number_input {
    -moz-appearance: textfield;
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none !important;
  }

  .search_field, .search_field:focus, .search_field:active {
    height: 40px;
    width: 100%;
    border: 1px solid $white;
    background-color: $white;
    border-radius: 5px;
    margin-right: 10px;
    direction: ltr;
    padding-left: 5px;
    padding-right: 5px;
    border: 0.5px solid rgba(148, 148, 148, 0.87);
    font-size: 14px;
  }

  .flat {
    border-radius: 0px !important;
  }
</style>
