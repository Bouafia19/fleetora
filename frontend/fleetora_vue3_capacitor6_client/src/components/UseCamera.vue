<template>
    <v-btn
        @click="takePicture"
        variant="text"
    >
        {{ $t('camera') }}
    </v-btn>
    <!-- <v-file-input 
        :label="$t('Photo')"
        hide-input
        @change="takePicture"
        prepend-icon="mdi-plus-circle-outline"  
    />     -->
</template>

<script setup>
    import { Camera, CameraResultType } from '@capacitor/camera'

    const emit = defineEmits('cameraUpload')
   
    const takePicture = async () => {
        const image = await Camera.getPhoto({
            quality: 90,
            // allowEditing: true,
            resultType: CameraResultType.DataUrl
        });

        // image.webPath will contain a path that can be set as an image src.
        // You can access the original file using image.path, which can be
        // passed to the Filesystem API to read the raw data of the image,
        // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
        let imageUrl = image.dataUrl
        // console.log('image', image)
        emit('cameraUpload', imageUrl)
        // let data = btoa(image.base64String);
        // console.log(imageUrl.length)
        // Can be set to the src of an image now
        // imageElement.src = imageUrl;
    }
</script>