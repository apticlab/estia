<template>
  <div class="flex flex-col flex-grow">
    <tab-view :external_tabs="tabs" v-on:tab-change="changeView" initial_tab="2"></tab-view>
    <div v-if="isLoading" class="flex flex-col flex-grow items-center justify-center">
      <loading></loading>
    </div>
    <div></div>
    <div
      class="flex flex-col w-full px-4 sm:px-0 mx-auto sm:max-w-screen-sm md:max-w-screen-md xl:max-w-screen-xl"
      v-if="!isLoading"
    >
      <div class="flex-grow flex flex-col" v-if="currentView == 'month'">
        <div class="flex flex-col mt-12">
          <v-date-picker
            v-model="selectedDate"
            :attributes="attributes"
            :masks="masks"
            mode="single"
            class="custom-calendar w-full px-2 md:px-16 py-3"
            style="width: 100%"
            :min-date="new Date()"
            is-inline
          >
            <div slot-scope="header" slot="header-title">
              <span class="text-blue-600">{{ header.title | capitalize }}</span>
            </div>
            <div
              @click="setDate(day)"
              slot="day-content"
              slot-scope="{ day, attributes }"
              :class="is_mobile ? 'justify-center' : 'h-32'"
              class="flex flex-col h-full z-10 overflow-hidden p-2"
            >
              <span
                :class="[selectedDate.id == day.id ? 'text-blue-600' : 'text-gray', is_mobile ? 'text-center' : 'text-right']"
                class="day-label text-normal"
              >{{ day.day }}</span>
              <div v-if='!is_mobile' class="flex flex-col flex-grow overflow-y-auto overflow-x-hidden">
                <p
                  
                  v-for="(attr, index) in attributes"
                  :key="'attr_' + index"
                  class="text leading-tight rounded-sm p-1 mt-0 mb-1 ml-auto"
                  :class="attr.customData ? attr.customData.class : ''"
                >
                  {{
                  attr.customData ? attr.customData.title : "" | leftpad(6)
                  }}
                </p>
              </div>
              <div
                :class="[
                selectedDate.id == day.id ? 'h-2 bg-blue-600' : ' h-05 bg-gray',
                is_mobile ? 'mx-0' : 'mx-3'
                ]"
                class="w-full rounded-md mt-2"
              ></div>
            </div>
          </v-date-picker>
          <div class="bg-gray-50 flex-grow flex flex-col mt-4">
            <transition name="slide-fade" mode="in-out">
              <div class="flex flex-col flex-grow">
                <span
                  class="text-gray-light font-bold text-center py-8 text-xl"
                  v-if="!day_missions.length && !dayMissionLoading"
                >Nessuna missione per questo giorno</span>

                <loading class="mt-8" v-else-if="!day_missions.length && dayMissionLoading">
                  <template v-slot:message>
                    <span class="text-gray mt-4">Caricamento missioni</span>
                  </template>
                </loading>

                <div class="flex flex-col py-2" v-else>
                  <mission-card
                    v-for="(mission, index) in day_missions"
                    :mission="mission"
                    :key="'mission_' + index"
                  ></mission-card>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      <div class="flex-grow flex flex-col" v-if="currentView == 'day'">
        <p>Coming soon...</p>
      </div>
      <div class="flex-grow flex flex-col" v-if="currentView == 'week'">
        <p>Coming soon...</p>
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import moment from "moment";
import { EventBus } from "../utils/event-bus.js";
import MissionCard from "@/components/MissionCard.vue";

export default {
  name: "Calendar",
  components: {
    "mission-card": MissionCard
  },
  props: {},
  data() {
    const date = moment();
    return {
      isLoading: false,
      dayMissionLoading: false,
      event_template: {
        key: null,
        customData: {
          title: null,
          class: "bg-blue-600-light text-blue-600 rounded-md"
        },
        dates: null
      },
      events: [],
      selectedDate: {
        date: date,
        id: date.format("yyyy-MM-DD")
      },
      attributes: [],
      currentView: "month",
      tabs: [
        {
          code: "day",
          label: "Giorno"
        },
        {
          code: "week",
          label: "Settimana"
        },
        {
          code: "month",
          label: "Mese"
        }
      ]
    };
  },
  async mounted() {
    EventBus.$on("reload-event-calendar", this.processEvents);
    this.isLoading = true;
    await this.loadMission();
    await this.processEvents(this.events);
    this.isLoading = false;
  },
  methods: {
    changeView(payload) {
      if (!payload) {
        return;
      }

      this.currentView = payload.code;
    },
    setDate(day) {
      if (!day) {
        return 0;
      }

      this.selectedDate = day;
    },
    async loadMission() {
      this.events = await this.$api.list("occurrences");
    },
    processEvents(events) {
      events.forEach((event, index) => {
        let eventDate = moment(event.date).format("YYYY-MM-DD");
        let attribute = this.clone(this.event_template);

        attribute.customData.title = event.id;
        attribute.key = event.id;
        attribute.dates = eventDate;

        this.attributes.push(attribute);
      });
    },
    goToResource(event) {
      if (event.event_resource.value == "customer") {
        this.$router.push({
          name: "customers_view",
          params: {
            company_id: event.company.id
          }
        });
      } else {
        this.$router.push({
          name: "manage_credit",
          params: {
            credit_id: event.credit.id
          }
        });
      }
    }
  },
  computed: {
    day_missions() {
      this.dayMissionLoading = true;
      let day_missions = this.events.filter(event => {
        let eventDate = moment(event.date);
        let selectedDate = moment(this.selectedDate.date);

        let equal = moment(eventDate).isSame(selectedDate, "day");
        return equal;
      });

      this.dayMissionLoading = false;
      return day_missions;
    },
    masks() {
      return {
        weekdays: this.is_mobile ? "W" : "WWWW"
      }
    }
  }
};
</script>
<style lang="scss">
::-webkit-scrollbar {
  width: 0px;
}
::-webkit-scrollbar-track {
  display: none;
}
.custom-calendar.vc-container {
  font-family: Muli, sans-serif;
  --day-border: 0px solid #b8c2cc;
  --day-border-highlight: 1px solid #b8c2cc;
  --day-width: 90px;
  --day-height: 90px;
  --weekday-bg: #f8fafc;
  --weekday-border: 0px solid #eaeaea;
  --highlight-height: 0px;
  border-radius: 0;
  & .vc-header {
    @apply bg-white text-blue-600-dark;
    padding: 10px 0;
  }
  & .vc-weeks {
    padding: 0;
    @apply bg-white;
  }
  & .vc-weekday {
    text-transform: capitalize;
  }
  & .vc-day {
    @apply cursor-pointer;
    padding: 0 5px 3px 5px;
    text-align: left;
    height: var(--day-height);
    min-width: var(--day-width);
    background-color: white;
    overflow: auto;

    @media screen and (max-width: 640px) { 
      height: initial;
      min-width: initial;
    }

    &.weekday-1,
    &.weekday-7 {
      @apply bg-white;
    }
    &:not(.on-bottom) {
      /*  border-bottom: var(--day-border); */
      &.weekday-1 {
        /* border-bottom: var(--day-border-highlight); */
      }
    }
    &:not(.on-right) {
      border-right: var(--day-border);
    }
  }
  & .vc-day-dots {
    margin-bottom: 5px;
  }
}
</style>
