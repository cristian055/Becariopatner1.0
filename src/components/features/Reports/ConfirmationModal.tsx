import React from 'react'
import { AlertCircle } from 'lucide-react'
import type { ConfirmationModalProps } from './Reports.types'
import './ConfirmationModal.css'

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirmation-modal">
      <div className="confirmation-modal__overlay"></div>
      <div className="confirmation-modal__content">
        <div className="confirmation-modal__icon-box">
          <AlertCircle size={40} />
        </div>
        <h3 className="confirmation-modal__title">Close the working day?</h3>
        <p className="confirmation-modal__text">
          This action will automatically generate a detailed report and{' '}
          <strong>reset all caddie counters</strong> to zero for the next day. This operation is
          irreversible.
        </p>
        <div className="confirmation-modal__actions">
          <button
            onClick={onConfirm}
            className="confirmation-modal__btn confirmation-modal__btn--danger"
          >
            Confirm and Download Report
          </button>
          <button
            onClick={onCancel}
            className="confirmation-modal__btn confirmation-modal__btn--secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
