<template>
  <BContainer class="p-4">
    <div class="text-center">
      <h2>Multi Video Converter</h2>
    </div>
    <form action="/" class="dropzone">

    </form>
    <BCard class="mt-4">
      <BCardHeader>
        <BCardTitle class="d-flex justify-content-between">
          <div>
            Videos
          </div>
          <div>
            <button class="btn btn-success" @click="openFolder" v-if="path!=null">Open Folder!</button>
            <button class="btn btn-primary" @click="convertAll">Convert All</button>
            <button class="btn btn-warning mx-2" @click="clear">Clear</button>
          </div>
        </BCardTitle>
      </BCardHeader>
      <BCardBody>
        <BTable striped hover :items="uploadedFiles" :fields="fields">
          <template #cell(duration)="data">
            {{data.item.duration}} Seconds
          </template>
          <template #cell(actions)="">
            <b-select v-model="videoType" :options="options"></b-select>
          </template>
        </BTable>

      </BCardBody>
    </BCard>
  </BContainer>
</template>

<script>

import Dropzone from 'dropzone'

const {ipcRenderer} = window.require("electron");

export default {
  name: 'App',
  components: {},
  data() {
    return {
      path:null,
      dropzone: null,
      uploadedFiles: [],
      videoType:'avi',
      fields: [
        {
          label:"Video Name",
          key:"name"
        },
          {label: 'Duration', key: 'duration'},
        {label: 'Format', key: 'actions'}
      ],
      options:[
        {
          text:"avi",
          value:"avi"
        },
        {
          text:"mp4",
          value:"mp4"
        },
        {
          text:"mov",
          value:"mov"
        }
      ]
    }
  },
  mounted() {
    this.dropzone = new Dropzone(document.querySelector('.dropzone'), {
      uploadedFiles: this.uploadedFiles,
      createImageThumbnails: false,
      acceptedFiles: "video/*",
      url: null,
      thumbnailHeight: 0,
      thumbnailWidth: 0,
      method: 'GET',
      uploadMultiple: true,
      complete: function (f) {
        const {name, path} = f
        ipcRenderer.send("file-uploaded", {path, name})
        this.removeFile(f)


      }

    })

    ipcRenderer.on("send-data", (e, videos) => {
      this.uploadedFiles = videos
    })

    ipcRenderer.on("finish", (e, path) => {
      console.log("test")
      this.path=path
      console.log(this.path)
    })


  },
  methods: {
    openFolder(){
      ipcRenderer.send("open-folder",this.path);
    },
    clear(){
      this.path=null
      ipcRenderer.send("clear-all",{})
    },
    convertAll(){
      ipcRenderer.send("convert-all",this.videoType)
    }
  }
}
</script>
<style>
body {
  background: white;
}

.dz-preview {
  display: none;
}

.dz-image {
  display: none;
}
</style>


