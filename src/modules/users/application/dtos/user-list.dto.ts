import type { PaginatedResult } from '@/shared/application/pagination.dto'

export interface UserDTO {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  lastLoginAt: string | null
  createdAt: string | null
}

export type UserListDTO = PaginatedResult<UserDTO>
