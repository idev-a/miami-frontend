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
        <div class="d-flex justfify-around">
          <v-btn class="primary mt-3" :disabled="!is_new" @click="run_sysco_scraper">Run Scraper</v-btn>
          <v-btn class="success mt-3" @click="downloadFile">Download</v-btn>
        </div>
        <div v-if="!is_new" class="mt-3">
          <div>{{message}}</div>
          <div class="mt-2">If you want to run the scraper again, please refresh the page.</div>
        </div>
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
        is_new: true
      }
    },

    mounted () {
    },

    methods: {
      async run_sysco_scraper() {
        try {
          const res = await Get('admin/sysco')
          this.message = 'Successfully run the scraper, you will get notificed via email about the completion soon.'
        } catch (e) {
          this.color = 'default'
          this.message = 'Something went wrong. Please contact the admin.'
        }
        this.snackbar = true
        this.is_new = false
      },
      downloadFile () {
        var link = document.createElement("a");
        link.setAttribute("href", 'http://3.230.135.45/api/static/download');
        link.setAttribute("download", 'Item List.xlsx');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
  }
</script>

<style>
</style>