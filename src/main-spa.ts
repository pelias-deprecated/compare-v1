import Vue from 'vue';
import App from '@/views/App.vue';

new Vue({
  render: (h) => h(App, {
    props: { isBuiltForSpa: true, isBuiltForApi: false },
  }),
}).$mount('#app');
