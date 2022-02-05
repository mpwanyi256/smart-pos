<template>
    <div class="time-elapsed">
        <p>{{ timePassed }}</p>
    </div>
</template>
<script>
import moment from 'moment';

export default {
  name: 'TimeElapsed',

  props: {
    timestamp: {
      type: String,
      required: true,
      validator: (val) => val instanceof String,
    },
    format: {
      type: String,
      required: false,
    },
    color: {
      type: String,
      required: false,
      default: () => 'white',
    },
  },

  computed: {
    timePassed() {
      const prevDate = moment(this.timestamp).fromNow();
      const dateFormatted = this.format && prevDate.format(this.format);
      return this.format ? dateFormatted : prevDate;
    },
  },
};
</script>
<style scoped lang="scss">
.time-elapsed {
    width: 100%;
    background-color: inherit;

    p {
      font-size: 1rem;
    }
}
</style>
