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
        <v-tooltip v-if="false" bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="success mt-3" :loading="loading" v-on="on" @click="readTodayData">
              Today 
              <v-icon right>mdi-database</v-icon>
            </v-btn>
          </template>
          <span>Read today data</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn class="success mt-3" :loading="loading" v-on="on" @click="showAlertDlg">
              Alert 
              <v-icon right>mdi-email-alert</v-icon>
            </v-btn>
          </template>
          <span>Manage alert emails</span>
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

    <v-dialog
      v-model="alertDlg"
      max-width="550"
    >
      <v-card>
        <v-card-title>
          Manage alert emails
        </v-card-title>
        <v-card-text>
          <v-card-actions>
            <v-form
              ref="form"
              v-model="emailValid"
              class="d-flex"
              style="width: 100%;"
            >
              <v-text-field
                v-model="newEmail"
                :loading="loading"
                label="Email"
                :rules="[rules.email, rules.duplicate]"
                class="mr-2"
              />
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn class="success mt-3" :loading="loading" :disabled="loading || !emailValid" v-on="on" @click="addEmail">
                    Add
                    <v-icon right>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <span>Add New Email</span>
              </v-tooltip>
            </v-form>
          </v-card-actions>
          <v-list
            style="max-height: 300px"
            class="overflow-y-auto"
          >
            <v-list-item-group
              color="primary"
            >
              <v-list-item
                v-for="(email, i) in emails"
                :key="i"
                class="grow flex-wrap" 
              >
                <v-list-item-icon>
                  <v-icon>mdi-email</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ email }}</v-list-item-title>
                </v-list-item-content>

                <v-row
                  align="center"
                  justify="end"
                >
                  <v-btn 
                    @click="deleteEmail(email)"
                    text
                  >
                    <v-icon class="mr-1">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </v-row>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

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
  import { getFileIcon, changeDate, getStatus, getStatusColor, getFileSize } from '@/util'
  import upperFirst from 'lodash/upperFirst'

  export default {
    name: 'Dashboard',

    components: {
      CustomTable: () => import('./component/CustomTable')
    },
    
    data () {
      return {
        loading: false,
        snackbar: false,
        message: '',
        color: 'success',
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
      this.readTodayData()

      this.registerInterval()
    },

    beforeDestroy () {
      clearInterval(this.checkInterval)
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
      registerInterval() {
        const self = this
        this.checkInterval = setInterval(function() { self.readTodayData() }, 5000)
      },
      async readTodayData () {
        // this.loading = true
        const res = await Get('admin/read/today')
        // this.showSnack(res)
        this.meetings = res.items
        // this.loading = false
      },
      async readAlertEmails () {
        this.loading = true
        const res = await Get('admin/alert/get')
        this.showSnack(res)
        this.alertEmails = res.items
        this.loading = false
      },
      showAlertDlg () {
        this.readAlertEmails()
        this.alertDlg = true
      },
      async addEmail () {
        this.$refs.form.validate()
        if (!this.emailValid) {
          return
        }
        this.loading = true
        let cc_emails = this.emails.concat([this.newEmail])
        this._updateEmails(cc_emails)
      },
      deleteEmail (email) {
        const self = this
        this.$dialog.confirm({
          text: 'Are you sure?',
          title: 'Warning',
          actions: {
            false: 'No',
            true: {
              color: 'red',
              text: 'Yes',
              handle: () => {
                self._deleteEmail(email)
              }
            }
          }
        })
      },
      _deleteEmail(email) {
        const cc_emails = this.emails.filter(_email => _email != email)
        this._updateEmails(cc_emails)
      },
      async _updateEmails(cc_emails) {
        const data = {
          id: this.alertEmails.id,
          cc_emails: cc_emails.join(',')
        }
        const res = await Post('admin/alert/update', data)
        this.showSnack(res)
        if (res.status == 'success') {
          this.alertEmails.cc_emails = cc_emails.join(',')
          this.newEmail = ''
        }
        this.loading = false
      },
    }
  }
</script>