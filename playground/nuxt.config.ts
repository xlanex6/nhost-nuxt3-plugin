import { defineNuxtConfig } from 'nuxt/config'
import NhostModule from '../dist/module.mjs'

export default defineNuxtConfig({
  modules: [
    NhostModule
  ]
})
