import type { Ref } from 'vue'
import { User } from '@nhost/core'
import { useState } from '#imports'

export const useNhostUser = (): Ref<User | null> => useState<User | null>('nhost_user')
