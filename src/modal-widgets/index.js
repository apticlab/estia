import ChangePasswordStrong from '@/components/ChangePasswordStrong.vue'
import Confirm from '@/components/Confirm.vue'

const baseModalWidgets = {
  'change-password-strong': ChangePasswordStrong,
  'confirm': Confirm
}

export default function (app, options) {
  app.config.globalProperties.$modalWidgets = {
    ...baseModalWidgets,
    ...options.modalWidgets ? options.modalWidgets : {}
  }
}
