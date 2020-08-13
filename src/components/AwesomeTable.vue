<template>
  <div class="align-middle inline-block min-w-full" :class="shadow ? 'box-shadow-light' : ''">
    <div class="flex flex-row" v-if="fields && !readonly">
      <div
        @click="addRow()"
        class="text-blue ml-auto flex flex-row items-center cursor-pointer hover:text-blue-dark font-bold"
      >
        <i class="ti-plus mr-2"></i>
        <span>Aggiungi</span>
      </div>
    </div>
    <table class="w-full table-auto border-collapse" :class="shadow ? 'box-shadow-light' : ''">
      <thead>
        <tr class="border-b-2 bg-blue-light" :class="theming.header.tr">
          <th
            v-for="(header, index) in headers"
            :key="index"
            :class="[
              getHeaderClass(header),
              ...theming.header.td,
              ...theming.header.text
            ]"
            class="px-2 py-3 font-semibold text-md"
          >{{ header.label | translate }}</th>
          <th
            v-if="actions.length || selectable"
            class="py-5 px-3 border-b border-gray-200 text-md font-semibold text-gray-500 tracking-wider"
          >Azioni</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in rows">
          <tr
            :key="index"
            @click="selectable ? selectRow(row) : null"
            class="border-blue-light border-b bg-white hover:bg-yellow-light cursor-pointer"
          >
            <td v-for="(header, index) in headers" :key="index" class="py-4 px-3">
              <div
                class="flex flex-row items-center h-full text-gray-dark"
                :class="getRowClass(header)"
              >
                <div class="flex flex-row items-center" v-if="header.type == 'avatar'">
                  <img
                    :src="deepPick(row, header.fields.image)"
                    class="bg-no-repeat mr-4 bg-gray-400 bg-auto rounded-full w-12 h-12"
                  />
                  <div class="flex flex-col">
                    <div class="mb-1 flex flex-row items-center">
                      <a
                        target="_blank"
                        :href="
                          ig_usr_url + '/' + deepPick(row, header.fields.title)
                        "
                        class="text-base mr-2 text-blue-500 hover:text-blue-600"
                      >{{ deepPick(row, header.fields.title) }}</a>
                      <span class="h-4 w-4" v-if="deepPick(row, 'usr.is_verified')">
                        <svg-icon name="verified-badge" width="w-4" height="h-4" />
                      </span>
                      <span class="h-4 w-4" v-if="false">
                        <svg-icon
                          name="friendship-badge"
                          width="w-4"
                          height="h-4"
                          class="bg-blue-400"
                        />
                      </span>
                    </div>
                    <div
                      class="text-xs text-gray-500"
                    >{{ deepPick(row, header.fields.description) }}</div>
                  </div>
                </div>

                <div
                  class="flex flex-row justify-center flex-grow items-center"
                  v-if="header.type == 'image' || header.type == 'ig-media'"
                >
                  <img
                    :src="getImage(row, header.field)"
                    class="bg-no-repeat bg-gray-400 bg-auto rounded-lg w-10 h-10 object-cover"
                  />
                </div>

                <div class="flex flex-row items-end" v-if="header.type == 'link'">
                  <a
                    class="btn bg-blue-500 rounded-md text-white px-4 py-2"
                    target="_blank"
                    :href="
                      'https://www.instagram.com/p/' +
                        deepPick(row, header.fields.url_link)
                    "
                  >{{ deepPick(row, header.fields.url_name) | translate }}</a>
                </div>

                <div class="flex flex-row items-end" v-if="header.type == 'tag'">
                  <span>{{ deepPick(row, header.field).length || 0 }}</span>
                </div>

                <div class="flex flex-row items-center" v-if="header.type == 'timeago'">
                  <span class>{{ deepPick(row, header.field) | time_ago }}</span>
                </div>

                <div class="flex flex-row items-center" v-if="header.type == 'date'">
                  <span class>{{ deepPick(row, header.field) | date(header.dateFormat) }}</span>
                </div>

                <div class="flex flex-row items-center" v-if="header.type == 'time'">
                  <span>{{ deepPick(row, header.field) }}</span>
                </div>

                <div class="flex flex-row items-end" v-if="header.type == 'text'">
                  <span :class="header.class">
                    {{
                    deepPick(row, header.field, header.type)
                    }}
                  </span>
                </div>

                <div class="flex flex-row items-end" v-if="header.type == 'username'">
                  <a
                    target="_blank"
                    :href="ig_usr_url + '/' + deepPick(row, 'user.username')"
                    class="text-base mr-2 text-blue-500 hover:text-blue-600"
                    :class="header.class"
                  >{{ deepPick(row, "user.username") }}</a>
                </div>

                <div class="flex flex-row items-end" v-if="header.type == 'number'">
                  <span :class="header.class">
                    {{ deepPick(row, header.field, header.type) | size_number }}
                    {{ header.udm }}
                  </span>
                </div>

                <div class="flex flex-row items-end" v-if="header.type == 'hashtag'">
                  <span
                    class="font-medium underline text-blue-700 cursor-pointer"
                  >#{{ deepPick(row, header.field) }}</span>
                </div>

                <template v-if="header.type == 'details'">
                  <div class="flex flex-col">
                    <div class="text-base mb-1">{{ deepPick(row, header.field.title) }}</div>
                    <div class="text-xs text-gray-500">{{ deepPick(row, header.field.description) }}</div>
                  </div>
                </template>

                <template v-if="header.type == 'stock'">
                  <div class="flex flex-row">
                    <span
                      class="text-base font-bold"
                    >{{ deepPick(row, header.fields.current_value) }}</span>
                    <div
                      class="ml-2"
                      :class="
                        deepPick(row, header.fields.flow) == 'plus'
                          ? 'text--600'
                          : 'text-red-500'
                      "
                    >
                      <i
                        class="mx-1"
                        :class="
                          deepPick(row, header.fields.flow) == 'plus'
                            ? 'hi-trending-up'
                            : 'hi-trending-down'
                        "
                      ></i>
                      <span>{{ deepPick(row, header.fields.trend) }}%</span>
                    </div>
                  </div>
                </template>

                <template v-if="header.type == 'count'">
                  <div class>{{ deepPick(row, header.field) | count }}</div>
                </template>

                <div v-if="header.type == 'recursivity-picker'">
                  <recursivity-view :week="deepPick(row, header.field)"></recursivity-view>
                </div>

                <div class="flex flex-row items-center h-full" v-else-if="header.type == 'pill'">
                  <span
                    class="rounded-lg px-3 py-1 text-xs"
                    :class="
                      'pill-color-' + deepPick(row, header.field.color)
                        ? deepPick(row, header.field.color)
                        : 'green'
                    "
                  >{{ deepPick(row, header.field.text) }}</span>
                </div>

                <div
                  class="flex flex-row justify-center h-full w-full items-center"
                  v-else-if="header.type == 'friendship'"
                >
                  <span
                    class="rounded-full h-5 w-5"
                    :class="
                      deepPick(row, header.field)
                        ? 'bg-green-300'
                        : 'bg-gray-200'
                    "
                  ></span>
                </div>

                <div
                  class="flex flex-row justify-center h-full w-full items-center"
                  v-else-if="header.type == 'boolean'"
                >
                  <span
                    class="rounded-full h-5 w-5"
                    :class="
                      deepPick(row, header.field)
                        ? 'bg-green-300'
                        : 'bg-red-300'
                    "
                  ></span>
                </div>

                <div
                  class="flex flex-row items-center h-full"
                  v-else-if="header.type == 'partnership'"
                >
                  <div
                    class="w-5 h-5 rounded-full"
                    :class="deepPick(row, header.field) ? 'bg-green-400' : ''"
                  ></div>
                </div>

                <div
                  class="h-full w-full flex flex-col items-center"
                  v-else-if="header.type == 'status'"
                >
                  <div
                    :class="{
                      'bg-green-400': row.isActive,
                      'bg-red-400': !row.isActive
                    }"
                    class="w-5 h-5 rounded-full bg-gray-400"
                  ></div>
                </div>
                <div
                  class="h-full w-full flex flex-col items-center"
                  v-else-if="header.type == 'percentage'"
                >{{ deepPick(row, header.field) | percentage }}</div>
                <div
                  class="h-full w-full flex flex-col items-center"
                  v-else-if="header.type == 'horizontalpiechart'"
                >
                  <horizontal-pie-chart :values="header.values" :elem="row"></horizontal-pie-chart>
                </div>

                <div class="h-full flex flex-col items-end" v-else-if="header.field == 'actions'">
                  <div
                    class="flex-grow flex flex-row justify-center items-center transition-all duration-75 ease-in"
                  ></div>
                </div>
              </div>
            </td>
            <td
              v-if="actions.length || selectable"
              style="width: 20%"
              class="px-6 py-4 whitespace-no-wrap"
            >
              <div class="flex flex-row items-center justify-center" v-if="!selectable">
                <popper
                  :key="action.name"
                  trigger="hover"
                  v-if="getActionVisibility(action, row)"
                  v-for="action in actions"
                >
                  <div
                    class="popper shadow-md bg-white text-gray-700 rounded py-1 px-2"
                  >{{ action.label }}</div>
                  <button
                    slot="reference"
                    @click="actOnRow(action, index)"
                    :class="action.class"
                    class="mr-1 text-gray-500 focus:outline-none p-1"
                  >
                    <i class="fa text-xl" :class="action.icon"></i>
                  </button>
                </popper>
              </div>
              <div class="flex flex-row items-center justify-center" v-else>
                <div
                  class="rounded-full h-6 w-6 flex flex-row items-center justify-center hover:bg-gray-700 text-white border-2 border-gray-700"
                  @click="selectRow(row)"
                  :class="isSelected(row) ? 'bg-gray-700 tx-white' : 'bg-white'"
                >
                  <!-- <i class="fa fa-check text-xs" :class="isSelected(row) ? 'text-white' : 'text-gray-700'"></i> -->
                </div>
              </div>
            </td>
          </tr>
          <tr :key="'0_' + index" v-if="editIndex == index">
            <td :colspan="headers.length + 2">
              <div v-if="!readonly && fields" class="bg-blue-light p-5 my-2">
                <awesome-form
                  :form.sync="resourceToEdit"
                  :is_edit="true"
                  :headers="fields"
                  :validate="true"
                  @valid="_valid => (resourceToEditValid = _valid)"
                  @change="_resource => (resourceToEdit = _resource)"
                ></awesome-form>
                <div class="flex flex-row w-full mt-5">
                  <div class="ml-auto">
                    <button
                      v-show="mode == 'edit'"
                      class="btn bg-transparent text-gray-600 mr-3 active:outline-none focus:outline-none hover:text-gray-800"
                      @click="cancelCreation()"
                    >Annulla</button>
                    <button
                      :disabled="!resourceToEditValid"
                      class="bg-blue text-white disabled:bg-gray-light disabled:text-gray disabled:cursor-not-allowed focus:outline-none"
                      @click="createNew()"
                    >{{ mode == "edit" ? "Salva" : "Aggiungi" }}</button>
                  </div>
                </div>
              </div>
              <div class="flex flex-row" v-if="fields && !readonly"></div>
            </td>
          </tr>
        </template>
        <tr v-if="editIndex == 'add'">
          <td :colspan="headers.length + 2">
            <div v-if="!readonly && fields" class="bg-blue-light p-5 my-2">
              <awesome-form
                :form.sync="resourceToEdit"
                :is_edit="false"
                :headers="fields"
                :validate="true"
                @valid="_valid => (resourceToEditValid = _valid)"
                @change="_resource => (resourceToEdit = _resource)"
              ></awesome-form>
              <div class="flex flex-row w-full mt-5">
                <div class="ml-auto">
                  <button
                    class="btn bg-transparent text-gray-600 mr-3 active:outline-none focus:outline-none hover:text-gray-800"
                    @click="cancelCreation()"
                  >Annulla</button>
                  <button
                    :disabled="!resourceToEditValid"
                    class="bg-blue text-white disabled:bg-gray-light disabled:text-gray disabled:cursor-not-allowed focus:outline-none"
                    @click="createNew()"
                  >{{ mode == "edit" ? "Salva" : "Aggiungi" }}</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="!rows || rows.length == 0">
          <td :colspan="headers.length + 2">
            <div
              class="text-center text-gray font-bold text-md font-semibold bg-white py-5"
            >Nessuna riga da mostrare</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import Popper from "@/components/Popper.vue";
import SvgIcon from "@/components/SvgIcon.vue";

export default {
  name: "awesome-table",
  components: {
    "svg-icon": SvgIcon,
    popper: Popper,
  },
  props: {
    rows: { required: false, default: [] },
    headers: {},
    actions: {},
    fields: { required: false },
    theme: { required: false, default: "green" },
    striped: { required: false, default: true },
    shadow: { required: false, default: true },
    selectable: { required: false, default: false },
    readonly: { required: false, default: false },
  },
  data() {
    return {
      selected_row: null,
      mode: "create",
      resourceToEdit: {},
      resourceToEditValid: false,
      editIndex: null,
      ig_url: "https://instagram.com/p",
      ig_usr_url: "https://instagram.com",
    };
  },
  methods: {
    updateResource(res) {
      console.log(res);
    },
    getImage(obj, header) {
      if (header.type == "image") {
        return this.deepPick(obj, header.field);
      }
      return `${this.ig_url}/${obj.ig_link.url}/media/?size=t`;
    },
    getRowClass(header) {
      return header.class ? header.class.row : "justify-center";
    },
    getHeaderClass(header) {
      return header.class ? header.class.header : "text-center";
    },
    getSelectedRowClass(row) {
      let row_class = "";

      if (this.selectable) {
        row_class += " hover:bg-gray-200 cursor-pointer";
        if (row.id == (this.selected_row ? this.selected_row.id : -1)) {
          row_class += " bg-gray-200";
        }
      }
      return row_class;
    },
    isSelected(row) {
      if (!this.selected_row) return false;
      return this.selected_row.id == row.id;
    },
    actOnRow(action, index) {
      if (!this.fields) {
        this.$emit("act", {
          action,
          index,
        });
        return;
      }

      // We are using the editor right inside the table
      if (this[action.callback]) {
        this[action.callback](index);
      }
    },
    selectRow(row) {
      this.selected_row = row;
      this.$emit("selected", { row: this.selected_row });
    },
    getActionVisibility(action, row) {
      if (!action.visible) {
        return true;
      }

      let negative = action.visible[0] == "!";
      let field = action.visible;

      if (negative) {
        field = action.visible.substring(1, action.visible.length);
      }

      let value = this.deepPick(row, field);

      return negative ? !value : !!value;
    },
    cancelCreation() {
      this.resourceToEdit = {};
      this.mode = "create";
      this.editIndex = null;
    },
    canAdd() {
      let canAdd = true;

      this.fields.forEach((field) => {
        if (field.validator) {
          field.validator.forEach((validator) => {
            switch (validator) {
              case "required":
                canAdd = canAdd && !!this.resourceToEdit[field.field];
                break;
            }
          });
        }
      });

      return canAdd;
    },
    addRow() {
      this.mode = "create";
      this.editIndex = "add";
      this.resourceToEdit = {};
    },
    createNew() {
      let new_row = _.clone(this.resourceToEdit);

      console.log(new_row);

      this.resourceToEdit = {};

      let rows = _.clone(this.rows);

      if (this.mode != "edit") {
        rows.push(new_row);
      } else {
        rows[this.editIndex] = new_row;
      }

      this.mode = "create";
      this.editIndex = null;

      this.$emit("row-added", rows);
    },
    edit(index) {
      this.mode = "edit";

      let row = this.rows[index];

      this.resourceToEdit = JSON.parse(JSON.stringify(row));

      this.editIndex = index;
    },
    async delete(index) {
      /*
      let response = await this.$fire({
        title: "Elimina Riga",
        text: "Sei sicuro di voler cancellare questo elemento?",
        type: "question",
        animation: false,
        focusCancel: true,
        confirmButtonColor: "red",
        confirmButtonText: "Elimina",
        cancelButtonText: "Annulla",
        showCancelButton: true,
        reverseButtons: true
      });
      */
      let result = confirm("Sei sicuro di voler cancellare questa riga?");

      if (result) {
        this.rows.splice(index, 1);
      }

      this.$emit("row-deleted", this.rows);
    },
  },
  computed: {
    theming() {
      return {
        header: {
          tr: `text-blue border-b`,
          td: `text-${this.theme}-100`,
          text: `text-blue`,
        },
      };
    },
  },
};
</script>

<style>
.select-circle {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 1px solid var(--primary);
  transition: 0.2s ease-in-out;
}

.select-circle:hover {
  background-color: var(--primary);
}

.select-circle.selected {
  background-color: var(--primary);
}
</style>
