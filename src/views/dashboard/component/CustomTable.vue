<template>
  <v-data-table
    :loading="loading"
    :headers="headers"
    :items="meetings"
    :search="search"
    fixed-header
    single-expand
    :expanded.sync="expanded"
    show-expand
    @click:row="showRecordings"
    item-key="id"
  > 
    <template #item.topic="{item}">
      <span v-html="getLink(item)"></span>
    </template>
    <template #item.start_time="{item}">
      <span>{{ changeDate(item.start_time)}}</span>
    </template>
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
</template>
<script>
  import { getFileIcon, changeDate, getStatus, getStatusColor, getFileSize } from '@/util'
  
  export default {
    name: "CustomTable",

    props: ['meetings', 'loading', 'search'],

    data () {
      return {
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
      }
    },
    methods: {
      getFileIcon,
      changeDate,
      getStatus,
      getStatusColor,
      getFileSize,

      showRecordings (item) {
        console.log(item)
        this.currentMeeting = item
        if (this.expanded.includes(item)) {
          const index = this.expanded.indexOf(item);
          this.expanded.splice(index, 1);
        } else {
          this.expanded.push(item)
        }
      },
      getLink (item) {
        if (item.folder_link) {
          return `<a href="${item.folder_link}" target="_blank">${item.topic}</a>`
        } else {
          return `<span>${item.topic}</span>`
        }
      },
      isUploading (recording) {
        return recording.status == 'uploading'
      },
    }
  }
</script>