import React from 'react'
import { X, User, Calendar, Save, Power, AlertCircle } from 'lucide-react'
import { Modal, Button, Input, Badge } from '../../ui'
import CaddieAvailabilityEditor from './CaddieAvailabilityEditor'
import type { CaddieEditModalProps } from './CaddieManager.types'
import './CaddieEditModal.css'

const CaddieEditModal: React.FC<CaddieEditModalProps> = ({
  isOpen,
  caddie,
  isAdding,
  allCaddies,
  error,
  onClose,
  onSave,
  onErrorChange
}) => {
  const [localCaddie, setLocalCaddie] = React.useState(caddie)

  React.useEffect(() => {
    if (caddie) {
      setLocalCaddie(caddie)
    }
  }, [caddie])

  const handleSave = () => {
    if (!localCaddie) return

    // Validate name
    if (!localCaddie.name.trim()) {
      onErrorChange('Name is required')
      return
    }

    // Validate number uniqueness
    const isDuplicate = allCaddies.some(
      c => c.number === localCaddie.number && c.id !== localCaddie.id
    )
    if (isDuplicate) {
      onErrorChange(`Caddie number ${localCaddie.number} is already assigned`)
      return
    }

    onSave(localCaddie)
  }

  const handleFieldChange = <K extends keyof typeof localCaddie>(
    field: K,
    value: typeof localCaddie[K]
  ): void => {
    onErrorChange(null)
    const prev: typeof localCaddie = localCaddie
    setLocalCaddie(() => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
  }

  if (!isOpen || !localCaddie) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="caddie-edit-modal">
        <div className="caddie-edit-modal__header">
          <div>
            <h2 className="caddie-edit-modal__title">
              {isAdding ? 'New Record' : 'Edit Profile'}
            </h2>
            <p className="caddie-edit-modal__subtitle">
              Club Campestre Operations
            </p>
          </div>
          <button
            onClick={() => {
              onClose()
              onErrorChange(null)
            }}
            className="caddie-edit-modal__close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="caddie-edit-modal__content">
          {error && (
            <div className="caddie-edit-modal__error">
              <AlertCircle size={18} />
              <Badge variant="danger">{error}</Badge>
            </div>
          )}

          {!isAdding && (
            <div className="caddie-edit-modal__status-toggle">
              <div className="caddie-edit-modal__status-info">
                <div
                  className={`caddie-edit-modal__status-icon ${
                    localCaddie.isActive
                      ? 'caddie-edit-modal__status-icon--active'
                      : 'caddie-edit-modal__status-icon--inactive'
                  }`}
                >
                  <Power size={24} />
                </div>
                <div>
                  <p className="caddie-edit-modal__status-label">
                    Master Status
                  </p>
                  <p
                    className={`caddie-edit-modal__status-text ${
                      localCaddie.isActive
                        ? 'caddie-edit-modal__status-text--active'
                        : 'caddie-edit-modal__status-text--inactive'
                    }`}
                  >
                    {localCaddie.isActive
                      ? 'Caddie Active in System'
                      : 'Caddie Inactive (Hidden)'}
                  </p>
                </div>
              </div>
              <Button
                variant={localCaddie.isActive ? 'secondary' : 'primary'}
                onClick={() =>
                  handleFieldChange('isActive', !localCaddie.isActive)
                }
                size="sm"
              >
                {localCaddie.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          )}

          <div className="caddie-edit-modal__section">
            <div className="caddie-edit-modal__section-header">
              <User
                size={18}
                className="caddie-edit-modal__section-icon"
              />
              <h3 className="caddie-edit-modal__section-title">
                General Information
              </h3>
            </div>

            <div className="caddie-edit-modal__form-grid">
              <Input
                label="Full Name"
                placeholder="Ex: Juan Pérez"
                value={localCaddie.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                required
              />

              <Input
                label="Caddie Number"
                type="number"
                value={localCaddie.number}
                onChange={e =>
                  handleFieldChange('number', parseInt(e.target.value) || 0)
                }
                required
              />
            </div>
          </div>

          <div className="caddie-edit-modal__section">
            <div className="caddie-edit-modal__section-header">
              <Calendar
                size={18}
                className="caddie-edit-modal__section-icon"
              />
              <h3 className="caddie-edit-modal__section-title">
                Weekly Availability
              </h3>
            </div>

            <CaddieAvailabilityEditor
              availability={localCaddie.availability}
              onChange={avail => handleFieldChange('availability', avail)}
            />
          </div>
        </div>

        <div className="caddie-edit-modal__footer">
          <Button
            variant="secondary"
            onClick={() => {
              onClose()
              onErrorChange(null)
            }}
            className="caddie-edit-modal__cancel"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={Save}
            className="caddie-edit-modal__save"
          >
            {isAdding ? 'Create Caddie' : 'Update Profile'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default CaddieEditModal
