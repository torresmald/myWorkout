import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as personalRecordApi from '@/api/personal-record.api'
import type { PersonalRecordPublic } from '@/interfaces/personal-record.interface'

export const usePersonalRecordStore = defineStore('personalRecord', () => {
  const records = ref<PersonalRecordPublic[]>([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true

    try {
      records.value = await personalRecordApi.getPersonalRecords()
      return records.value
    } finally {
      loading.value = false
    }
  }

  return {
    records,
    loading,
    fetchAll,
  }
})
