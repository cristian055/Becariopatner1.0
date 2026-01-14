import React from 'react'
import { X, User, Calendar, Save, Power, AlertCircle, Zap, CheckCircle } from 'lucide-react'
import { Modal, Button, Input, Badge, Select } from '../../ui'
import CaddieAvailabilityEditor from './CaddieAvailabilityEditor'
import type { CaddieEditModalProps } from './CaddieManager.types'
import type { CaddieLocation, CaddieRole } from '../../../types'
import './CaddieEditModal.css'

const CATEGORY_OPTIONS = [
  { value: 'Primera', label: 'Primera' },
  { value: 'Segunda', label: 'Segunda' },
  { value: 'Tercera', label: 'Tercera' }
] as const

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
  const [originalCategory, setOriginalCategory] = React.useState(caddie?.category)
  const [showToast, setShowToast] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState('')

  React.useEffect(() => {
    if (caddie) {
      setLocalCaddie(caddie)
      setOriginalCategory(caddie.category)
    }
  }, [caddie])

  const handleSave = (): void => {
    if (!localCaddie) return

    // Validate name
    if (!localCaddie.name.trim()) {
      onErrorChange('Name is required')
      return
    }

    // Validate category
    const validCategories = ['Primera', 'Segunda', 'Tercera']
    if (localCaddie.category && !validCategories.includes(localCaddie.category)) {
      onErrorChange('Category must be Primera, Segunda, or Tercera')
      return
    }

    const categoryChanged = localCaddie.category !== originalCategory
    if (!categoryChanged) {
      // Validate number uniqueness within same category
      const isDuplicate = allCaddies.some(
        c => c.number === localCaddie.number &&
               c.category === localCaddie.category &&
               c.id !== localCaddie.id
      )
      if (isDuplicate) {
        onErrorChange(`Caddie number ${localCaddie.number} already exists in ${localCaddie.category}`)
        return
      }
    }

    // Validate weekendPriority (1-999, no 0)
    if (localCaddie.weekendPriority !== undefined) {
      if (localCaddie.weekendPriority < 1 || localCaddie.weekendPriority > 999) {
        onErrorChange('Weekend priority must be between 1 and 999')
        return
      }
    }

    onSave(localCaddie, (result: { numberReassigned: boolean } | undefined) => {
      if (result?.numberReassigned) {
        setToastMessage(`Caddie reassigned as #${localCaddie.number} in ${localCaddie.category}`)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    })
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
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="caddie-edit-modal">
          <div className="caddie-edit-modal__header">
            <div>
              <h2 className="caddie-edit-modal__title">
                {isAdding ? 'Nuevo Registro' : 'Editar información del caddie'}
              </h2>
              <p className="caddie-edit-modal__subtitle">
                Funfación Club Campestre
              </p>
            </div>
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
                    <p
                      className={`caddie-edit-modal__status-text ${
                        localCaddie.isActive
                          ? 'caddie-edit-modal__status-text--active'
                          : 'caddie-edit-modal__status-text--inactive'
                      }`}
                    >
                      {localCaddie.isActive
                        ? 'Caddie activo'
                        : 'Caddie inactivo (Oculto)'}
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
                  {localCaddie.isActive ? 'Desactivar' : 'Activar'}
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
                  Información del Caddie
                </h3>
              </div>

              <div className="caddie-edit-modal__form-grid">
                <Input
                  label="NOMBRE DEL CADDIE"
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

              <div className="caddie-edit-modal__form-grid">
                <div className="caddie-edit-modal__readonly-field">
                  <label className="caddie-edit-modal__readonly-label">SEDE</label>
                  <Select
                    label=""
                    options={[
                      { value: 'Llanogrande', label: 'Llanogrande' },
                      { value: 'Medellín', label: 'Medellín' }
                    ]}
                    value={localCaddie.location}
                    onChange={value => handleFieldChange('location', value as CaddieLocation)}
                    disabled={!isAdding}
                    className="caddie-edit-modal__readonly-select"
                  />
                </div>

                <div className="caddie-edit-modal__readonly-field">
                  <label className="caddie-edit-modal__readonly-label">Rol</label>
                  <Select
                    label=""
                    options={[
                      { value: 'Golf', label: 'Golf' },
                      { value: 'Tennis', label: 'Tennis' },
                      { value: 'Hybrid', label: 'Hybrid' }
                    ]}
                    value={localCaddie.role}
                    onChange={value => handleFieldChange('role', value as CaddieRole)}
                    disabled={!isAdding}
                    className="caddie-edit-modal__readonly-select"
                  />
                </div>
              </div>


              <div className="caddie-edit-modal__form-grid">
                <div className="caddie-edit-modal__readonly-field">
                  <label className="caddie-edit-modal__readonly-label">Categoria</label>
                  <Select
                    label=""
                    options={CATEGORY_OPTIONS}
                    value={localCaddie.category || 'Primera'}
                    onChange={value => handleFieldChange('category', value as 'Primera' | 'Segunda' | 'Tercera')}
                    required
                  />
                </div>
              </div>

              <Input
                label="Weekend Priority"
                type="number"
                min={1}
                max={999}
                value={localCaddie.weekendPriority || 0}
                onChange={e => {
                  const value = parseInt(e.target.value)
                  if (value >= 1 && value <= 999) {
                    handleFieldChange('weekendPriority', value)
                  }
                }}
                placeholder="Auto-calculated if empty"
                helperText="Lower number = higher priority (1 is first)"
              />
            </div>

            {!isAdding && (
              <div className="caddie-edit-modal__section">
                <div className="caddie-edit-modal__section-header">
                  <Zap
                    size={18}
                    className="caddie-edit-modal__section-icon"
                  />
                  <h3 className="caddie-edit-modal__section-title">
                    Estadísticas del Caddie
                  </h3>
                </div>

                <div className="caddie-edit-modal__stats-grid">
                  <div className="caddie-edit-modal__stat-item">
                    <span className="caddie-edit-modal__stat-label">Historial</span>
                    <span className="caddie-edit-modal__stat-value">{localCaddie.historyCount}</span>
                  </div>
                  <div className="caddie-edit-modal__stat-item">
                    <span className="caddie-edit-modal__stat-label">Ausencias</span>
                    <span className="caddie-edit-modal__stat-value">{localCaddie.absencesCount}</span>
                  </div>
                  <div className="caddie-edit-modal__stat-item">
                    <span className="caddie-edit-modal__stat-label">Tardanzas</span>
                    <span className="caddie-edit-modal__stat-value">{localCaddie.lateCount}</span>
                  </div>
                  <div className="caddie-edit-modal__stat-item">
                    <span className="caddie-edit-modal__stat-label">Permisos</span>
                    <span className="caddie-edit-modal__stat-value">{localCaddie.leaveCount}</span>
                  </div>
                </div>
                <p className="caddie-edit-modal__stat-note">
                  Estadísticas de solo lectura rastreadas automáticamente por el sistema
                </p>
              </div>
            )}

            <div className="caddie-edit-modal__section">
              <div className="caddie-edit-modal__section-header">
                <Calendar
                  size={18}
                  className="caddie-edit-modal__section-icon"
                />
                <h3 className="caddie-edit-modal__section-title">
                  Disponibilidad de semana
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
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              icon={Save}
              className="caddie-edit-modal__save"
            >
              {isAdding ? 'Crear Caddie' : 'Actualizar Perfil'}
            </Button>
          </div>
        </div>
      </Modal>

      {showToast && (
        <div className="caddie-edit-modal__toast">
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}

export default CaddieEditModal
