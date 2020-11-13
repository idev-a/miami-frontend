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
                      <div :class="getStatusColor(recording.status)">
                        {{ getStatus(recording)}}
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
    name: 'History',

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
      this.readData()
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
      async readData () {
        console.log(this.checkInterval)

        this.loading = true
        const res = await Get('admin/read')
        this.meetings = res.items
        this.showSnack(res)
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