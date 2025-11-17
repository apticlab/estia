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
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from "axios";
import moment from "moment";
import { EventBus } from "../utils/event-bus.js";
import MissionCard from "@/components/MissionCard.vue";

const router = useRouter();
const store = useStore();

const instance = getCurrentInstance();
const $api = instance.appContext.config.globalProperties.$api;
const clone = instance.appContext.config.globalProperties.clone;
const is_mobile = computed(() => store.getters.is_mobile);

const date = moment();

const isLoading = ref(false);
const dayMissionLoading = ref(false);
const event_template = ref({
  key: null,
  customData: {
    title: null,
    class: "bg-blue-600-light text-blue-600 rounded-md"
  },
  dates: null
});
const events = ref([]);
const selectedDate = ref({
  date: date,
  id: date.format("yyyy-MM-DD")
});
const attributes = ref([]);
const currentView = ref("month");
const tabs = ref([
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
]);

const day_missions = computed(() => {
  dayMissionLoading.value = true;
  let filtered = events.value.filter(event => {
    let eventDate = moment(event.date);
    let selected = moment(selectedDate.value.date);

    let equal = moment(eventDate).isSame(selected, "day");
    return equal;
  });

  dayMissionLoading.value = false;
  return filtered;
});

const masks = computed(() => {
  return {
    weekdays: is_mobile.value ? "W" : "WWWW"
  };
});

const changeView = (payload) => {
  if (!payload) {
    return;
  }

  currentView.value = payload.code;
};

const setDate = (day) => {
  if (!day) {
    return 0;
  }

  selectedDate.value = day;
};

const loadMission = async () => {
  events.value = await $api.list("occurrences");
};

const processEvents = (eventsData) => {
  eventsData.forEach((event, index) => {
    let eventDate = moment(event.date).format("YYYY-MM-DD");
    let attribute = clone(event_template.value);

    attribute.customData.title = event.id;
    attribute.key = event.id;
    attribute.dates = eventDate;

    attributes.value.push(attribute);
  });
};

const goToResource = (event) => {
  if (event.event_resource.value == "customer") {
    router.push({
      name: "customers_view",
      params: {
        company_id: event.company.id
      }
    });
  } else {
    router.push({
      name: "manage_credit",
      params: {
        credit_id: event.credit.id
      }
    });
  }
};

onMounted(async () => {
  EventBus.on("reload-event-calendar", processEvents);
  isLoading.value = true;
  await loadMission();
  await processEvents(events.value);
  isLoading.value = false;
});

onBeforeUnmount(() => {
  EventBus.off("reload-event-calendar", processEvents);
});
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
