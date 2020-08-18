<template>
  <div />
</template>
<script>
import { logout } from '../utils/auth'

export default {
  mounted () {
    logout()

    this.$router.push('/login')
  }
}
</script>
