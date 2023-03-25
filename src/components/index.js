import DateRangePicker from 'vue2-daterange-picker'
import ImageUploader from '@/components/ImageUploader.vue'
import Loading from '@/components/Loading.vue'
import Chart from '@/components/Chart.vue'
import AwesomeTable from '@/components/AwesomeTable.vue'
import ColorSwatch from '@/components/ColorSwatch.vue'
import Avatar from '@/components/Avatar.vue'
import HorizontalPieChart from '@/components/HorizontalPieChart.vue'
import BlurImage from '@/components/BlurImage.vue'
import SvgIcon from '@/components/SvgIcon.vue'
import PageError from '@/components/PageError.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import AwesomeForm from '@/components/AwesomeForm.vue'
import ResourceSelect from '@/components/ResourceSelect.vue'
import ResourceEditor from '@/components/ResourceEditor.vue'
import FieldView from '@/components/FieldView.vue'
import FieldEdit from '@/components/FieldEdit.vue'
import VueTimepicker from 'vue2-timepicker'
import TabView from '@/views/TabView.vue'
import RecursivityPicker from '@/components/RecursivityPicker.vue'
import RecursivityView from '@/components/RecursivityView.vue'
import EditResource from '@/views/EditResource.vue'
import ListResourceBase from '@/views/ListResourceBase.vue'
import FileUploader from '@/components/FileUploader.vue'
import Login from '@/components/Login.vue'
import Popper from '@/components/Popper.vue'
import SideNav from '@/components/SideNav.vue'
import TopBar from '@/components/TopBar.vue'
import RouterView from '@/views/RouterView.vue'
import ViewResource from '@/views/ViewResource.vue'
import SearchInput from '@/components/SearchInput.vue';
import NoData from '@/components/NoData.vue'
import DatePicker from '@/components/DatePicker.vue';
import SelectMenu from '@/components/SelectMenu.vue';
import VHtml from '@/components/Vhtml.vue';

export default function (Vue) {
  Vue.component('login', Login)
  Vue.component('loading', Loading)
  Vue.component('chart', Chart)
  Vue.component('awesome-table', AwesomeTable)
  Vue.component('color-swatch', ColorSwatch)
  Vue.component('avatar', Avatar)
  Vue.component('horizontal-pie-chart', HorizontalPieChart)
  Vue.component('aw-datepicker', DateRangePicker)
  Vue.component('blr-image', BlurImage)
  Vue.component('svg-icon', SvgIcon)
  Vue.component('page-error', PageError)
  Vue.component('error-boundary', ErrorBoundary)
  Vue.component('awesome-form', AwesomeForm)
  Vue.component('resource-select', ResourceSelect)
  Vue.component('field-view', FieldView)
  Vue.component('resource-editor', ResourceEditor)
  Vue.component('field-edit', FieldEdit)
  Vue.component('vue-timepicker', VueTimepicker)
  Vue.component('tab-view', TabView)
  Vue.component('recursivity-picker', RecursivityPicker)
  Vue.component('recursivity-view', RecursivityView)
  Vue.component('resource-edit', EditResource)
  Vue.component('resource-image-uploader', ImageUploader)
  Vue.component('file-uploader', FileUploader)
  Vue.component('side-nav', SideNav)
  Vue.component('top-bar', TopBar)
  Vue.component('popper', Popper)
  Vue.component('list-resource-base', ListResourceBase)
  Vue.component('view-resource', ViewResource)
  Vue.component('search-input', SearchInput);
  Vue.component('no-data', NoData);
  Vue.component('date-picker', DatePicker);
  Vue.component('select-menu', SelectMenu);
  Vue.component('v-html', VHtml);
}

export {
  RouterView,
  EditResource,
  ViewResource,
}
