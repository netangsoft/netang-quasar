<template>
    <q-btn
        label="test"
        @click="onTest"
    />
</template>



<script>

export default {


    setup() {
        return {
            onTest() {
                console.log('888')
            }
        }
    }
}
</script>
