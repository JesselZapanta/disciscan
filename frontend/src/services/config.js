const DEV_API_URL = 'http://localhost:8000/api'
const PROD_API_URL = 'https://disciscan-api.jezyk.me/api'

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API_URL : DEV_API_URL)
export const STORAGE_URL = API_URL.replace(/\/api$/, '/storage')
