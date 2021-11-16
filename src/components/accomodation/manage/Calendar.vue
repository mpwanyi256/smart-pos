<template>
  <v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar
          flat class="tool_bar"
        >
          <!-- <v-btn
            outlined
            class="mr-4"
            color="grey darken-2"
            @click="setToday"
          >
            Today
          </v-btn> -->
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="prev"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            fab
            text
            small
            color="grey darken-2"
            @click="next"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
          <v-toolbar-title v-if="$refs.calendar">
            {{ $refs.calendar.title }} | {{ property.name }}

            <v-btn fab
                text small
                color="grey darken-2"
            >
                <v-icon small>
                mdi-pencil
                </v-icon>
            </v-btn>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <div class="tool_bar_options">
            <v-menu
                bottom
                right
            >
                <template v-slot:activator="{ on, attrs }">
                <v-btn
                    outlined
                    color="grey darken-2"
                    v-bind="attrs"
                    v-on="on"
                >
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right>
                    mdi-menu-down
                    </v-icon>
                </v-btn>
                </template>
                <v-list>
                <v-list-item @click="type = 'day'">
                    <v-list-item-title>Day</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'week'">
                    <v-list-item-title>Week</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'month'">
                    <v-list-item-title>Month</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = '4day'">
                    <v-list-item-title>4 days</v-list-item-title>
                </v-list-item>
                </v-list>
            </v-menu>
            <v-select
                class="rooms_chooser"
                :items="rooms"
                item-text="name"
                item-value="id"
                outlined dense
                v-model="selectedRoom"
            />
            <BaseTooltip
              @button="addUnit = true"
              message="Add unit"
              icon="plus"
              color="blue"
            />
          </div>
        </v-toolbar>
      </v-sheet>
      <v-sheet class="calendar_view">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="eventsClean"
          :event-color="getEventColor"
          :type="type"
          :event-overlap-mode="mode"
          :event-overlap-threshold="30"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
        />
      </v-sheet>
    </v-col>

    <ViewBookingModal
      v-if="viewBooking"
      @close="closeBookingModal"
      :booking="selectedEvent"
    />
    <CreateNewUnit
        v-if="addUnit"
        @close="addUnit = false"
        @reload="$emit('reload')"
        :property="property"
    />
    <SelectRoom
        v-if="pickRoom"
        :rooms="rooms"
        @close="pickRoom = false"
        @picked="openBookingModal"
    />
    <BookRoomModal
        v-if="bookRoom && roomPicked && checkinDatePicked"
        :room="roomPicked"
        :checkin="checkinDatePicked"
        @close="bookRoom = false"
    />
  </v-row>
</template>
<script>
/* eslint-disable no-plusplus */
import { mapActions } from 'vuex';
import ViewBookingModal from '@/components/accomodation/manage/ViewBookingModal.vue';
import BaseTooltip from '@/components/generics/BaseTooltip.vue';
import CreateNewUnit from '@/components/accomodation/dashboard/CreateNewUnit.vue';
import SelectRoom from '@/components/accomodation/manage/SelectRoom.vue';
import BookRoomModal from '@/components/accomodation/manage/BookRoomModal.vue';

export default {
  name: 'Calendar',
  props: {
    rooms: {
      type: Array,
      required: true,
    },
    property: {
      type: Object,
      required: false,
    },
  },
  components: {
    ViewBookingModal,
    BaseTooltip,
    CreateNewUnit,
    BookRoomModal,
    SelectRoom,
  },
  data() {
    return {
      focus: '',
      type: 'month',
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day',
        '4day': '4 Days',
      },
      selectedElement: null,
      selectedOpen: false,
      selectedEventId: 0,
      viewBooking: false,
      calendarStartDate: '',
      calendarEndDate: '',
      selectedRoom: 0,
      addUnit: false,
      bookings: [],
      bookRoom: false,
      pickRoom: false,
      roomPicked: null,
      checkinDatePicked: null,
      mode: 'stack',
      modes: ['stack', 'column'],
    };
  },
  computed: {
    selectedPropertyId() {
      return this.property.id;
    },
    selectedEvent() {
      return this.bookings.find((event) => event.booking_id === this.selectedEventId.booking_id);
    },
    eventsClean() {
      return this.bookings.map((event) => ({
        color: event.color,
        end: new Date(event.check_out).toISOString().substring(0, 10),
        start: new Date(event.check_in).toISOString().substring(0, 10),
        name: event.name,
        timed: event.timed,
        booking_id: event.booking_id,
        time: '09:00',
      }));
    },

  },
  watch: {
    selectedPropertyId() {
      this.selectedRoom = 0;
      this.triggerFetchBookings();
    },
    async type() {
      await this.triggerFetchBookings();
    },
    async calendarEndDate() {
      console.log('Refresh');
      await this.triggerFetchBookings();
    },
    selectedRoom() {
      this.triggerFetchBookings();
    },
  },
  eventBusCallbacks: {
    'load-calendar': 'triggerFetchBookings',
  },
  mounted() {
    this.$refs.calendar.checkChange();
  },
  methods: {
    ...mapActions('accomodation', ['post']),

    async closeBookingModal() {
      this.viewBooking = false;
      await this.triggerFetchBookings();
    },

    openBookingModal(room) {
      this.roomPicked = room;
      this.pickRoom = false;
      this.bookRoom = true;
    },

    triggerFetchBookings() {
      const params = {
        start: this.calendarStartDate,
        end: this.calendarEndDate,
        fetch_bookings: this.property.id,
        room_id: this.selectedRoom,
      };
      this.post(params).then((response) => {
        this.bookings = response.data;
      });
    },
    viewDay({ date }) {
      this.focus = date;
      this.checkinDatePicked = date;
      this.pickRoom = true;
      //   this.type = 'day';
      console.log('View Date', date);
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = '';
      this.pickRoom = true;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ event }) {
    //   this.selectedEventId = event.booking_id;
      console.log('View event', event);
      this.selectedEventId = event;
      this.viewBooking = true;
      //   this.selectedElement = nativeEvent.target;
    },
    updateRange({ start, end }) {
      this.calendarStartDate = start.date;
      this.calendarEndDate = end.date;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
  },
};
</script>
<style scoped lang="scss">
.calendar_view {
    height: calc(100vh - 168px);
    overflow-y: auto;
}

.tool_bar_options {
    display: inherit;
    gap: 10px;

    .rooms_chooser {
        height: 36px !important;
        margin: 0;
        top: 0;
        bottom: 0;
    }
    /* flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    align-items: center;
    height: 100%; */
}
</style>
