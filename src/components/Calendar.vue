<template>
  <div class="flex flex-col flex-grow">
    <div
      v-if="isLoading"
      class="flex flex-col flex-grow items-center justify-center"
    >
      <loading></loading>
    </div>
    <div class="flex flex-col flex-grow" v-if="!isLoading">
      <div
        :class="getWidgetClass(widget, 'bg')"
        class="text-white font-semibold text-sm uppercase tracking-wider p-3 border-b border-gray-200 flex items-center"
      >
        <span>
          {{ widget.title }}
        </span>
        <span
          :class="getWidgetClass(widget, 'text')"
          class="ml-auto bg-white text-white w-8 flex items-center justify-center text-lg rounded-full"
        >
          {{ events.length }}
        </span>
      </div>
      <div class="flex-grow flex flex-col">
        <div class="flex flex-col flex-grow">
          <v-date-picker
            v-model="selectedDate"
            :attributes="attributes"
            :class="'vc-border-none'"
            :min-date="new Date()"
            is-inline
            is-expanded
          >
          </v-date-picker>
          <div
            class="border-t border-gray-200 bg-gray-50 flex-grow flex flex-col p-2"
          >
            <div
              class="overflow-y-auto flex flex-col flex-grow"
              style="max-height: 100px"
            >
              <span
                class="text-gray-400 font-semibold m-auto"
                v-if="!events.length"
              >
                Nessun promemoria per questo giorno
              </span>
              <div class="flex flex-col py-2 px-3" v-else>
                <div
                  v-for="event in events"
                  class="grid grid-cols-3 border-b border-gray-200 flex flex-row items-center py-3"
                >
                  <div class="col-span-2">
                    <i class="far fa-sticky-note text-gray-500 mr-2"></i>
                    <span class="text-gray-700 col-span-">{{
                      event.memo
                    }}</span>
                  </div>
                  <div v-if="event.memo_resource.value == 'credit'">
                    <i class="fas fa-list text-teal-500 mr-2"></i>
                    <span
                      @click="goToResource(event)"
                      class="text-teal-600 hover:underline cursor-pointer"
                    >
                      {{ event.credit.npl_ndg }}
                    </span>
                  </div>
                  <div v-if="event.memo_resource.value == 'customer'">
                    <i class="fas fa-user text-blue-500 mr-2"></i>
                    <span
                      @click="goToResource(event)"
                      class="text-blue-600 hover:underline cursor-pointer"
                    >
                      {{ event.customer.full_name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getWidgetClass } from "../utils/helpers.js";
import axios from "axios";
import moment from "moment";
import { EventBus } from "../utils/event-bus.js";

export default {
  name: "MemoCalendar",
  props: {
    widget: {}
  },
  data() {
    return {
      isLoading: true,
      memos: [],
      selectedDate: new Date(),
      attributes: []
    };
  },
  async mounted() {
    EventBus.$on("reload-memo-calendar", this.reloadMemos);
    await this.reloadMemos();
  },
  methods: {
    async reloadMemos() {
      this.isLoading = true;

      let response = await axios.get("/ajax/memo");
      this.memos = this.processMemos(response.data);

      this.isLoading = false;
    },
    processMemos(memos) {
      let memosForDate = {};
      this.attributes = [];

      memos.forEach(memo => {
        let memoDate = moment(memo.date).format("YYYY-MM-DD");

        if (!memosForDate[memoDate]) {
          memosForDate[memoDate] = [];
        }

        memosForDate[memoDate].push(memo);
      });

      this.attributes.push({
        dot: "red",
        dates: Object.keys(memosForDate).map(date => new Date(date))
      });

      return memosForDate;
    },
    goToResource(memo) {
      if (memo.memo_resource.value == "customer") {
        this.$router.push({
          name: "customers_view",
          params: {
            company_id: memo.company.id
          }
        });
      } else {
        this.$router.push({
          name: "manage_credit",
          params: {
            credit_id: memo.credit.id
          }
        });
      }
    }
  },
  computed: {
    events() {
      return this.memos[moment(this.selectedDate).format("YYYY-MM-DD")] || [];
    }
  }
};
</script>
