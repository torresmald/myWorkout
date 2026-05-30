export interface ModalOptions {
  title?: string
}

export interface ConfirmModalOptions extends ModalOptions {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}
