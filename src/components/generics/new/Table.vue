<template>
    <table>
        <thead v-if="hasHeader">
            <slot name="header" />
        </thead>
        <tbody>
            <slot name="body"/>
        </tbody>
        <slot />
    </table>
</template>

<script>

export default {
  name: 'Table',
  computed: {
    hasHeader() {
      return !!this.$slots.header;
    },

    hasBody() {
      return !!this.$slots.body;
    },
  },
};
</script>

<style lang="scss" scoped>
    @import '@/styles/pos/new_variables.scss';

    table {
        border-collapse: collapse;
        table-layout: auto;
        white-space: nowrap;
        width: 100%;
    }

    th,
    td {
        text-align: left;
    }

    th {
        padding: 16px;
        position: sticky;
        top: 0;
        background-color: $white !important;
        z-index: 6;
    }

    td {
        padding: 12px 16px;
    }

    thead {
        // border-top: 1px solid $quaternary;
        border-bottom: 1px solid $quaternary;
        background: #FCFCFC;

        tr {
            border: 0;
            background-color: $white !important;
            top: 0;
        }

        th {
            @include user-select(none);
            color: $secondary;
            font-weight: bold;

            &:not(:last-child) {
                border-right: 1px solid $quaternary;
            }
        }
    }

    tbody {
        tr {
            border-bottom: 1px solid $quaternary;

            &:nth-child(even) {
                background: #fdfdfd;
            }
        }
        tr:hover {
          background-color: $quaternary;
        }
    }

    td:last-child {
        .button-wrapper {
            display: inline-flex;
            align-items: center;
        }
    }

    .left {
        text-align: left;
    }

    .right {
        text-align: right;
    }

    .center {
        text-align: center !important;
    }
</style>
