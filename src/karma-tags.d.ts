import 'react'

declare module 'react' {
  interface HTMLAttributes<T> {
    'data-karma-action'?: string
    'data-karma-context'?: string
    'data-karma-next'?: string
    'data-karma-auth'?: 'required' | 'optional' | 'token' | 'none'
    'data-karma-security'?: string
    'data-karma-test-id'?: string
    'data-karma-role'?: string
    'data-karma-entity'?: string
    'data-karma-state'?: string
  }
}
