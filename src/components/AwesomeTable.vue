<template>
  <div class="align-middle inline-block min-w-full">
    <div
      v-if="fields && !readonly"
      class="flex flex-row"
    >
      <div
        :class="addResourceClass"
        class="ml-auto flex flex-row items-center cursor-pointer"
        @click="addRow()"
      >
        <i class="ti-plus mr-2" />
        <span>Aggiungi</span>
      </div>
    </div>
    <table
      class="w-full table-auto border-collapse"
      :class="tableClass"
    >
      <thead>
        <tr
          :class="{
            [headerClass]: true,
          }"
        >
          <th
            v-for="(header, index) in headers"
            :key="index"
            :class="[getHeaderClass(header)]"
            class="px-4 py-3 font-semibold text-md"
          >
            <div
              class="flex flex-row"
              :class="getHeaderClass(header)"
            >
              {{ header.label | translate }}
            </div>
          </th>
          <th
            v-if="actions.length || selectable"
            class="py-5 px-3"
          >
            <div
              class="flex flex-row justify-center"
              :class="headerClass"
            >
              Azioni
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in rows">
          <tr
            :key="index"
            class="cursor-pointer"
            :class="rowClass"
            @click="selectable ? selectRow(row) : null"
          >
            <td
              v-for="(header, index) in headers"
              :key="index"
              class="py-4 px-4"
            >
              <div
                class="flex flex-row items-center h-full text-gray-dark"
                :class="getRowClass(header)"
              >
                <div
                  v-if="header.type == 'avatar'"
                  class="flex flex-row items-center"
                >
                  <img
                    :src="deepPick(row, header.fields.image)"
                    class="bg-no-repeat mr-4 bg-gray-400 bg-auto rounded-full w-12 h-12"
                  >
                  <div class="flex flex-col">
                    <div class="mb-1 flex flex-row items-center">
                      <a
                        target="_blank"
                        :href="
                          ig_usr_url + '/' + deepPick(row, header.fields.title)
                        "
                        class="text-base mr-2 text-blue-500 hover:text-blue-600"
                      >{{ deepPick(row, header.fields.title) }}</a>
                      <span
                        v-if="deepPick(row, 'usr.is_verified')"
                        class="h-4 w-4"
                      >
                        <svg-icon
                          name="verified-badge"
                          width="w-4"
                          height="h-4"
                        />
                      </span>
                      <span
                        v-if="false"
                        class="h-4 w-4"
                      >
                        <svg-icon
                          name="friendship-badge"
                          width="w-4"
                          height="h-4"
                          class="bg-blue-400"
                        />
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ deepPick(row, header.fields.description) }}
                    </div>
                  </div>
                </div>

                <div
                  v-if="header.type == 'image' || header.type == 'ig-media'"
                  class="flex flex-row justify-center flex-grow items-center"
                >
                  <img
                    :src="getImage(row, header.field)"
                    class="bg-no-repeat bg-gray-400 bg-auto rounded-lg w-10 h-10 object-cover"
                  >
                </div>

                <div
                  v-if="header.type == 'link'"
                  class="flex flex-row items-end"
                >
                  <a
                    class="btn bg-blue-500 rounded-md text-white px-4 py-2"
                    target="_blank"
                    :href="
                      'https://www.instagram.com/p/' +
                        deepPick(row, header.fields.url_link)
                    "
                  >{{ deepPick(row, header.fields.url_name) | translate }}</a>
                </div>

                <div
                  v-if="header.type == 'tag'"
                  class="flex flex-row items-end"
                >
                  <span>{{ deepPick(row, header.field).length || 0 }}</span>
                </div>

                <div
                  v-if="header.type == 'timeago'"
                  class="flex flex-row items-center"
                >
                  <span class>{{
                    deepPick(row, header.field) | time_ago
                  }}</span>
                </div>

                <div
                  v-if="header.type == 'date'"
                  class="flex flex-row items-center"
                >
                  <span class>{{
                    deepPick(row, header.field) | date(header.dateFormat)
                  }}</span>
                </div>

                <div
                  v-if="header.type == 'time'"
                  class="flex flex-row items-center"
                >
                  <span>{{ deepPick(row, header.field) }}</span>
                </div>

                <div
                  v-if="header.type == 'text'"
                  class="flex flex-row items-end"
                >
                  <span :class="header.class">
                    {{ deepPick(row, header.field, header.type) }}
                  </span>
                </div>

                <div
                  v-if="header.type == 'username'"
                  class="flex flex-row items-end"
                >
                  <a
                    target="_blank"
                    :href="ig_usr_url + '/' + deepPick(row, 'user.username')"
                    class="text-base mr-2 text-blue-500 hover:text-blue-600"
                    :class="header.class"
                  >{{ deepPick(row, 'user.username') }}</a>
                </div>

                <div
                  v-if="header.type == 'number'"
                  class="flex flex-row items-end"
                >
                  <span :class="header.class">
                    {{ deepPick(row, header.field, header.type) | size_number }}
                    {{ header.udm }}
                  </span>
                </div>

                <div
                  v-if="header.type == 'hashtag'"
                  class="flex flex-row items-end"
                >
                  <span
                    class="font-medium underline text-blue-700 cursor-pointer"
                  >#{{ deepPick(row, header.field) }}</span>
                </div>

                <template v-if="header.type == 'details'">
                  <div class="flex flex-col">
                    <div class="text-base mb-1">
                      {{ deepPick(row, header.field.title) }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ deepPick(row, header.field.description) }}
                    </div>
                  </div>
                </template>

                <template v-if="header.type == 'stock'">
                  <div class="flex flex-row">
                    <span class="text-base font-bold">{{
                      deepPick(row, header.fields.current_value)
                    }}</span>
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
                      />
                      <span>{{ deepPick(row, header.fields.trend) }}%</span>
                    </div>
                  </div>
                </template>

                <template v-if="header.type == 'count'">
                  <div class>
                    {{ deepPick(row, header.field) | count }}
                  </div>
                </template>

                <div v-if="header.type == 'recursivity-picker'">
                  <recursivity-view :week="deepPick(row, header.field)" />
                </div>

                <div
                  v-else-if="header.type == 'pill'"
                  class="flex flex-row items-center h-full"
                >
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
                  v-else-if="header.type == 'friendship'"
                  class="flex flex-row justify-center h-full w-full items-center"
                >
                  <span
                    class="rounded-full h-5 w-5"
                    :class="
                      deepPick(row, header.field)
                        ? 'bg-green-300'
                        : 'bg-gray-200'
                    "
                  />
                </div>

                <div
                  v-else-if="header.type == 'boolean'"
                  class="flex flex-row justify-center h-full w-full items-center"
                >
                  <span
                    class="rounded-full h-5 w-5"
                    :class="
                      deepPick(row, header.field)
                        ? 'bg-green-300'
                        : 'bg-red-300'
                    "
                  />
                </div>

                <div
                  v-else-if="header.type == 'partnership'"
                  class="flex flex-row items-center h-full"
                >
                  <div
                    class="w-5 h-5 rounded-full"
                    :class="deepPick(row, header.field) ? 'bg-green-400' : ''"
                  />
                </div>

                <div
                  v-else-if="header.type == 'status'"
                  class="h-full w-full flex flex-col items-center"
                >
                  <div
                    :class="{
                      'bg-green-400': row.isActive,
                      'bg-red-400': !row.isActive,
                    }"
                    class="w-5 h-5 rounded-full bg-gray-400"
                  />
                </div>
                <div
                  v-else-if="header.type == 'percentage'"
                  class="h-full w-full flex flex-col items-center"
                >
                  {{ deepPick(row, header.field) | percentage }}
                </div>
                <div
                  v-else-if="header.type == 'horizontalpiechart'"
                  class="h-full w-full flex flex-col items-center"
                >
                  <horizontal-pie-chart
                    :values="header.values"
                    :elem="row"
                  />
                </div>

                <div
                  v-else-if="header.field == 'actions'"
                  class="h-full flex flex-col items-end"
                >
                  <div
                    class="flex-grow flex flex-row justify-center items-center transition-all duration-75 ease-in"
                  />
                </div>
              </div>
            </td>
            <td
              v-if="actions.length || selectable"
              style="width: 20%"
              class="px-6 py-4 whitespace-no-wrap"
            >
              <div
                v-if="!selectable"
                class="flex flex-row items-center justify-center"
              >
                <popper
                  v-for="action in actions"
                  v-if="getActionVisibility(action, row)"
                  :key="action.name"
                  trigger="hover"
                >
                  <div
                    class="popper shadow-md bg-white text-gray-700 rounded py-1 px-2"
                  >
                    {{ action.label }}
                  </div>
                  <button
                    slot="reference"
                    :class="action.class"
                    class="mr-1 text-gray-500 focus:outline-none p-1"
                    @click="actOnRow(action, index)"
                  >
                    <i
                      class="fa text-xl"
                      :class="action.icon"
                    />
                  </button>
                </popper>
              </div>
              <div
                v-else
                class="flex flex-row items-center justify-center"
              >
                <div
                  class="rounded-full h-6 w-6 flex flex-row items-center justify-center hover:bg-gray-700 text-white border-2 border-gray-700"
                  :class="isSelected(row) ? 'bg-gray-700 tx-white' : 'bg-white'"
                  @click="selectRow(row)"
                >
                  <!-- <i class="fa fa-check text-xs" :class="isSelected(row) ? 'text-white' : 'text-gray-700'"></i> -->
                </div>
              </div>
            </td>
          </tr>
          <tr
            v-if="editIndex == index"
            :key="'0_' + index"
          >
            <td :colspan="headers.length + 2">
              <div
                v-if="!readonly && fields"
                class="bg-blue-light p-5 my-2"
              >
                <awesome-form
                  :form.sync="resourceToEdit"
                  :is_edit="true"
                  :headers="fields"
                  :validate="true"
                  @valid="(_valid) => (resourceToEditValid = _valid)"
                  @change="(_resource) => (resourceToEdit = _resource)"
                />
                <div class="flex flex-row w-full mt-5">
                  <div class="ml-auto">
                    <button
                      v-show="mode == 'edit'"
                      class="btn bg-transparent text-gray-600 mr-3 active:outline-none focus:outline-none hover:text-gray-800"
                      @click="cancelCreation()"
                    >
                      Annulla
                    </button>
                    <button
                      :disabled="!resourceToEditValid"
                      class="bg-blue text-white disabled:bg-gray-light disabled:text-gray disabled:cursor-not-allowed focus:outline-none"
                      @click="createNew()"
                    >
                      {{ mode == 'edit' ? 'Salva' : 'Aggiungi' }}
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-if="fields && !readonly"
                class="flex flex-row"
              />
            </td>
          </tr>
        </template>
        <tr v-if="editIndex == 'add'">
          <td :colspan="headers.length + 2">
            <div
              v-if="!readonly && fields"
              class="bg-blue-light p-5 my-2"
            >
              <awesome-form
                :form.sync="resourceToEdit"
                :is_edit="false"
                :headers="fields"
                :validate="true"
                @valid="(_valid) => (resourceToEditValid = _valid)"
                @change="(_resource) => (resourceToEdit = _resource)"
              />
              <div class="flex flex-row w-full mt-5">
                <div class="ml-auto">
                  <button
                    class="btn bg-transparent text-gray-600 mr-3 active:outline-none focus:outline-none hover:text-gray-800"
                    @click="cancelCreation()"
                  >
                    Annulla
                  </button>
                  <button
                    :disabled="!resourceToEditValid"
                    class="bg-blue text-white disabled:bg-gray-light disabled:text-gray disabled:cursor-not-allowed focus:outline-none"
                    @click="createNew()"
                  >
                    {{ mode == 'edit' ? 'Salva' : 'Aggiungi' }}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="!rows || rows.length == 0">
          <td :colspan="headers.length + 2">
            <div
              class="text-center text-gray font-bold text-md font-semibold bg-white py-5"
            >
              Nessuna riga da mostrare
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import Popper from '@/components/Popper.vue'
import SvgIcon from '@/components/SvgIcon.vue'

export default {
  name: 'AwesomeTable',
  components: {
    'svg-icon': SvgIcon,
    popper: Popper
  },
  props: {
    rows: { required: false, default: [] },
    headers: {},
    actions: {},
    fields: { required: false },
    addResourceClass: { required: false, default: '' },
    headerClass: { required: false, default: '' },
    rowClass: { required: false, default: '' },
    theme: { required: false, default: 'green' },
    striped: { required: false, default: true },
    shadow: { required: false, default: true },
    selectable: { required: false, default: false },
    readonly: { required: false, default: false },
    tableClass: { required: false, type: String, default: '' }
  },
  data () {
    return {
      selected_row: null,
      mode: 'create',
      resourceToEdit: {},
      resourceToEditValid: false,
      editIndex: null,
      ig_url: 'https://instagram.com/p',
      ig_usr_url: 'https://instagram.com'
    }
  },
  computed: {},
  methods: {
    getImage (obj, header) {
      if (header.type === 'image') {
        return this.deepPick(obj, header.field)
      }
      return `${this.ig_url}/${obj.ig_link.url}/media/?size=t`
    },
    getRowClass (header) {
      // Possible versions:
      // class: "justify-center" => applied to both row and header
      // class: {
      //    row: 'justify-center',
      //    header: 'justify-start'
      // }

      if (header.class && header.class.row) {
        return header.class.row
      }

      return header.class || 'justify-center'
    },
    getHeaderClass (header) {
      // Possible versions:
      // class: "justify-center" => applied to both row and header
      // class: {
      //    row: 'justify-center',
      //    header: 'justify-start'
      // }

      if (header.class && header.class.header) {
        return header.class.header
      }

      return header.class || 'justify-center'
    },
    getSelectedRowClass (row) {
      let row_class = ''

      if (this.selectable) {
        row_class += ' hover:bg-gray-200 cursor-pointer'
        if (row.id == (this.selected_row ? this.selected_row.id : -1)) {
          row_class += ' bg-gray-200'
        }
      }
      return row_class
    },
    isSelected (row) {
      if (!this.selected_row) return false
      return this.selected_row.id == row.id
    },
    actOnRow (action, index) {
      if (!this.fields) {
        this.$emit('act', {
          action,
          index
        })
        return
      }

      // We are using the editor right inside the table
      if (this[action.callback]) {
        this[action.callback](index)
      }
    },
    selectRow (row) {
      this.selected_row = row
      this.$emit('selected', { row: this.selected_row })
    },
    getActionVisibility (action, row) {
      if (!action.visible) {
        return true
      }

      let negative = action.visible[0] === '!'
      let field = action.visible

      if (negative) {
        field = action.visible.substring(1, action.visible.length)
      }

      let value = this.deepPick(row, field)

      return negative ? !value : !!value
    },
    cancelCreation () {
      this.resourceToEdit = {}
      this.mode = 'create'
      this.editIndex = null
    },
    canAdd () {
      let canAdd = true

      this.fields.forEach((field) => {
        if (field.validator) {
          field.validator.forEach((validator) => {
            switch (validator) {
              case 'required':
                canAdd = canAdd && !!this.resourceToEdit[field.field]
                break
            }
          })
        }
      })

      return canAdd
    },
    addRow () {
      this.mode = 'create'
      this.editIndex = 'add'
      this.resourceToEdit = {}
    },
    createNew () {
      let new_row = _.clone(this.resourceToEdit)

      this.resourceToEdit = {}

      let rows = _.clone(this.rows)

      if (this.mode != 'edit') {
        rows.push(new_row)
      } else {
        rows[this.editIndex] = new_row
      }

      this.mode = 'create'
      this.editIndex = null

      this.$emit('row-added', rows)
    },
    edit (index) {
      this.mode = 'edit'

      let row = this.rows[index]

      this.resourceToEdit = JSON.parse(JSON.stringify(row))

      this.editIndex = index
    },
    async delete (index) {
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
      let result = confirm('Sei sicuro di voler cancellare questa riga?')

      if (result) {
        this.rows.splice(index, 1)
      }

      this.$emit('row-deleted', this.rows)
    }
  }
}
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
