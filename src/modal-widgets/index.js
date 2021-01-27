import ChangePasswordStrong from '@/components/ChangePasswordStrong.vue'

const baseModalWidgets = {
  'change-password-strong': ChangePasswordStrong
}

export default function (Vue, options) {
  Vue.prototype.$modalWidgets = {
    ...baseModalWidgets,
    ...options.modalWidgets ? options.modalWidgets : {}
  }
}
