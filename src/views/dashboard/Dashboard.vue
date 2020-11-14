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
        <v-data-table
          :loading="loading"
          :headers="headers"
          :items="meetings"
          :search="search"
          fixed-header
          single-expand
          :expanded.sync="expanded"
          show-expand
          :items-per-page="page"
          @click:row="showRecordings"
          item-key="meeting_id"
        > 
          <template #item.action="{item}">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn 
                  text 
                  color="primary"
                  v-on="on"
                  @click.stop="showRecordings(item)"
                >
                  Recordings
                </v-btn>
              </template>
              <span>Show Recordings</span>
            </v-tooltip>
          </template>
           <template v-slot:expanded-item="{ headers, item }">
            <td class="detail" :colspan="headers.length">
              <v-list 
                style="max-height: 350px"
                class="overflow-y-auto"
                two-line>
                <template
                  v-for="recording in item.recording_files"
                >
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon color="indigo">
                        {{ getFileIcon(recording.file_name)}}
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>{{ recording.file_name }}</v-list-item-title>
                      <div class="d-flex align-center" :class="getStatusColor(recording.status)">
                        <div class="mr-2">{{ getStatus(recording)}}</div>
                        <v-progress-linear 
                          v-if="isUploading(recording)" 
                          v-model="recording.progress"
                          class="mr-6" 
                          height="15" 
                          color="success" 
                        >
                          <strong>{{ Math.ceil(recording.progress) }}%</strong>
                        </v-progress-linear>
                      </div>
                    </v-list-item-content>

                    <div
                      class="align-center d-flex flex-column justify-end"
                    >
                      <v-list-item-icon class="ma-0 mb-1">
                        <v-icon color="indigo">
                          mdi-clock
                        </v-icon>
                        {{ recording.run_at }}
                      </v-list-item-icon>
                      <span>{{ getFileSize(recording.file_size) }}</span>
                    </div>
                  </v-list-item>
                </template>
              </v-list>
            </td>
          </template>
        </v-data-table>
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
  import upperFirst from 'lodash/upperFirst'

  export default {
    name: 'Dashboard',

    data () {
      return {
        loading: false,
        snackbar: false,
        message: '',
        color: 'success',
        search: '',
        meetings: [],
        expanded: [],
        selectedItem: [],
        currentMeeting: null,
        headers: [
          {
            text: 'Topic',
            value: 'topic'
          },
          {
            text: 'Start Time',
            value: 'start_time'
          },
          {
            text: '# of Recordings',
            value: 'cnt_files'
          },
          // {
          //   text: 'Status',
          //   value: ''
          // },
          {
            text: '',
            value: 'action'
          }
        ],
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
      page() {
        return Number(localStorage.getItem('page')) || 5
      },
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
      async readData () {
        this.loading = true
        const res = await Get('admin/read')
        this.meetings = res.items
        this.showSnack(res)
        this.loading = false
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
      getFileIcon (fileName) {
        const ext = fileName.substr(fileName.lastIndexOf('.')+1, fileName.length).toLowerCase()
        let icon = 'mdi-file-video'
        if (ext == 'mp4') {
          icon = 'mdi-file-video'
        } else if (ext == 'm4a') {
          icon = 'mdi-book-music'
        } else {
          icon = 'mdi-file'
        }
        return icon
      },
      getStatus (recording) {
        let status = recording.status
        if (recording.status == 'error') {
          status = recording.status + ': ' + recording.message
        }
        return upperFirst(status)
      },
      getStatusColor (status) {
        if (status == 'error') {
          return 'red--text'
        } else if (status == '') {
          return 'secondary--text'
        } else if (status == 'completed') {
          return 'success--text'
        }
      },
      isUploading (recording) {
        return recording.status == 'uploading'
      },
      showRecordings (item) {
        this.currentMeeting = item
        if (this.expanded.includes(item)) {
          const index = this.expanded.indexOf(item);
          this.expanded.splice(index, 1);
        } else {
          this.expanded.push(item)
        }
      },
      getFileSize (bytes, si=true, dp=1) {
        bytes = bytes | 0

        const thresh = si ? 1000 : 1024;

        if (Math.abs(bytes) < thresh) {
          return bytes + ' B';
        }

        const units = si 
          ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
          : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let u = -1;
        const r = 10**dp;

        do {
          bytes /= thresh;
          ++u;
        } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


        return bytes.toFixed(dp) + ' ' + units[u];
      },
      
    }
  }
</script>