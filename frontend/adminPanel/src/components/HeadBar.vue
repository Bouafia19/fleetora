<template>
    <div>
        <v-app-bar color="next" dark app scroll-target="#main">
            <v-toolbar-title>{{ $t(pageTitle) }}</v-toolbar-title>
        </v-app-bar>

        <v-main>
            <slot/>
        </v-main>
    </div>
</template>

<script>
    export default {
        props: ['pageTitle'],
    }
</script>