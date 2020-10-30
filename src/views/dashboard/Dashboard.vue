<template>
  <v-container
    id="dashboard"
    fluid
    tag="section"
  >
    <v-card
      icon="mdi-account-multiple"
      title="Dashboard"
      class="px-5 py-3"
    >
      <v-card-title>
        Dashboard
      </v-card-title>
      <v-card-text>
        <v-btn class="primary mt-3" :disabled="is_new" @click="run_sysco_scraper">Run Scraper</v-btn>
      </v-card-text>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      bottom
      :color="color"
      >
      {{ message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          dark
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
  import { Get } from '@/api'

  export default {
    name: 'DashboardDashboard',

    data () {
      return {
        loading: true,
        snackbar: false,
        message: '',
        color: 'success',
        is_new: false
      }
    },

    mounted () {
    },

    methods: {
      async run_sysco_scraper() {
        const res = await Get('admin/sysco')
        this.snackbar = true
        this.message = 'Successfully run the scraper, you will get notificed via email about the completion soon.'
        this.is_new = true
      }
    },
  }
</script>

<style>
</style>