<template>
  <BContainer class="p-4">
    <div class="text-center">
      <h2>Multi Video Converter</h2>
    </div>
    <form action="/"  class="dropzone">

    </form>

  </BContainer>
</template>

<script>

import Dropzone from 'dropzone'
const { ipcRenderer } = window.require("electron");

export default {
  name: 'App',
  components: {
  },
  data(){
    return {
      dropzone:null,
    }
  },
  mounted(){
    this.dropzone=new Dropzone(document.querySelector('.dropzone'),{
      createImageThumbnails:false,
      acceptedFiles:"video/*",
      url:null,
      thumbnailHeight:0,
      thumbnailWidth:0,
      method:'GET',
      uploadMultiple:true,
      complete:function (f){
        const {name,path}=f
        ipcRenderer.send("file-uploaded",{path,name})
        console.log(path,name)
        this.removeFile(f)
        this.disable()
      }

    })


  },
  methods:{
  }
}
</script>
<style>
body {
  background: white;
}
.dz-preview{
  display: none;
}
.dz-image{
  display: none;
}
</style>


