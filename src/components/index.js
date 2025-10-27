import ImageUploader from '@/components/ImageUploader.vue'
import Loading from '@/components/Loading.vue'
import Chart from '@/components/Chart.vue'
import AwesomeTable from '@/components/AwesomeTable.vue'
import ColorSwatch from '@/components/ColorSwatch.vue'
import Avatar from '@/components/Avatar.vue'
import HorizontalPieChart from '@/components/HorizontalPieChart.vue'
import BlurImage from '@/components/BlurImage.vue'
import PageError from '@/components/PageError.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import AwesomeForm from '@/components/AwesomeForm.vue'
import ResourceSelect from '@/components/ResourceSelect.vue'
import ResourceEditor from '@/components/ResourceEditor.vue'
import FieldView from '@/components/FieldView.vue'
import FieldEdit from '@/components/FieldEdit.vue'
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

export default function (app) {
  app.component('login', Login)
  app.component('loading', Loading)
  app.component('chart', Chart)
  app.component('awesome-table', AwesomeTable)
  app.component('color-swatch', ColorSwatch)
  app.component('avatar', Avatar)
  app.component('horizontal-pie-chart', HorizontalPieChart)
  app.component('blr-image', BlurImage)
  app.component('page-error', PageError)
  app.component('error-boundary', ErrorBoundary)
  app.component('awesome-form', AwesomeForm)
  app.component('resource-select', ResourceSelect)
  app.component('field-view', FieldView)
  app.component('resource-editor', ResourceEditor)
  app.component('field-edit', FieldEdit)
  app.component('tab-view', TabView)
  app.component('recursivity-picker', RecursivityPicker)
  app.component('recursivity-view', RecursivityView)
  app.component('resource-edit', EditResource)
  app.component('resource-image-uploader', ImageUploader)
  app.component('file-uploader', FileUploader)
  app.component('side-nav', SideNav)
  app.component('top-bar', TopBar)
  app.component('popper', Popper)
  app.component('list-resource-base', ListResourceBase)
  app.component('view-resource', ViewResource)
  app.component('search-input', SearchInput);
  app.component('no-data', NoData);
  app.component('date-picker', DatePicker);
  app.component('select-menu', SelectMenu);
  app.component('v-html', VHtml);
}

export {
  RouterView,
  EditResource,
  ViewResource,
}
