<template>
  <v-container
    id="history"
    fluid
    tag="section"
  >
    <v-card
      icon="mdi-account-multiple"
      title="History"
      class="px-5 py-3"
    >
      <v-card-title>
        History
      </v-card-title>
      <v-card-text>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="success mt-3" :loading="loading" v-on="on" @click="readData">
              History 
              <v-icon right>mdi-clock</v-icon>
            </v-btn>
          </template>
          <span>Read the historical data</span>
        </v-tooltip>
      </v-card-text>

      <v-card-title>
        <v-text-field
          v-model="search"
          :loading='loading'
          append-icon="mdi-magnify"
          label="Search"
          clearable
          class="mb-5"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-text>
        <custom-table :meetings="meetings" :loading="loading" :search="search" />
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
  import { Get, Post, BASE_API } from '@/api'

  export default {
    name: 'History',

    components: {
      CustomTable: () => import('./component/CustomTable')
    },

    data () {
      return {
        snackbar: false,
        message: '',
        color: 'success',
        loading: false,
        search: '',
        meetings: [],
        alertDlg: false,
        alertEmails: null,
        newEmail: '',
        emailValid: true,
        checkInterval: null,
        rules: {
          required: value => {
            return !!value || 'This field is required.'
          },
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
          },
          duplicate: val => {
            return !this.emails.includes(val) || 'Duplicate email'
          }
        }
      }
    },

    mounted () {
      this.readData()
    },

    computed: {
      emails () {
        return this.alertEmails && this.alertEmails.cc_emails && this.alertEmails.cc_emails.split(',') || []
      }
    },

    methods: {
      showSnack(res) {
        this.snackbar = true
        this.color = res.status
        this.message = res.message
      },
      async readData () {
        this.loading = true
        const res = await Get('admin/read')
        this.meetings = res.items
        this.showSnack(res)
        this.loading = false
      }
    }
  }
</script>