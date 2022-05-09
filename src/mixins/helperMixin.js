export default {
  name: 'helperMixin',

  props: {
    hasNext: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },

  methods: {
    handleScroll(e) {
      if (e.srcElement.scrollTop + e.srcElement.offsetHeight + 1 >= e.srcElement.scrollHeight) {
        if (this.hasNext) this.$emit('refetch');
      }
    },
  },
};
