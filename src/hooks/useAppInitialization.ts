import { useEffect } from 'react'
import { useCaddieStore } from '@/stores/caddieStore'
import { useListStore } from '@/stores/listStore'
import { useScheduleStore } from '@/stores/scheduleStore'
import { socketClient } from '@/services/socketClient'
import { apiClient } from '@/services/apiClient'
import { logger } from '@/utils'

/**
 * useAppInitialization - Initialize app with backend data
 * - Fetches initial data from backend
 * - Sets up WebSocket connections
 * - Handles authentication state
 */
export function useAppInitialization() {
  const fetchCaddies = useCaddieStore((state) => state.fetchCaddies)
  const fetchLists = useListStore((state) => state.fetchLists)
  const fetchShifts = useScheduleStore((state) => state.fetchShifts)
  const fetchAssignments = useScheduleStore((state) => state.fetchAssignments)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('Initializing application...', 'useAppInitialization')

        // Check if user is already authenticated
        const token = apiClient.getToken()
        
        if (token) {
          logger.info('Found existing token, connecting to backend...', 'useAppInitialization')
          
          // Connect WebSocket
          socketClient.connect(token)
          
          // Subscribe to all channels
          socketClient.subscribeToCaddies()
          socketClient.subscribeToLists()
          socketClient.subscribeToSchedule()

          // Fetch initial data in parallel
          await Promise.all([
            fetchCaddies(),
            fetchLists(),
            fetchShifts(),
            fetchAssignments(),
          ])

          logger.info('Application initialized successfully', 'useAppInitialization')
        } else {
          logger.info('No authentication token found, skipping backend connection', 'useAppInitialization')
        }
      } catch (error) {
        logger.error('Failed to initialize application', error as Error, 'useAppInitialization')
      }
    }

    initializeApp()

    // Cleanup on unmount
    return () => {
      socketClient.disconnect()
    }
  }, [fetchCaddies, fetchLists, fetchShifts, fetchAssignments])

  // Setup WebSocket event listeners for real-time updates
  useEffect(() => {
    const setCaddies = useCaddieStore.getState().setCaddies
    const setLists = useListStore.getState().setLists
    const setShifts = useScheduleStore.getState().setShifts
    const setAssignments = useScheduleStore.getState().setAssignments

    // Caddie events
    socketClient.onCaddieCreated((caddie) => {
      logger.info(`Caddie created via WebSocket: ${caddie.id}`, 'useAppInitialization')
      setCaddies([...useCaddieStore.getState().caddies, caddie])
    })

    socketClient.onCaddieUpdated((caddie) => {
      logger.info(`Caddie updated via WebSocket: ${caddie.id}`, 'useAppInitialization')
      setCaddies(
        useCaddieStore.getState().caddies.map((c) => (c.id === caddie.id ? caddie : c))
      )
    })

    socketClient.onCaddieDeleted((id) => {
      logger.info(`Caddie deleted via WebSocket: ${id}`, 'useAppInitialization')
      setCaddies(useCaddieStore.getState().caddies.filter((c) => c.id !== id))
    })

    // List events
    socketClient.onListCreated((list) => {
      logger.info(`List created via WebSocket: ${list.id}`, 'useAppInitialization')
      setLists([...useListStore.getState().lists, list])
    })

    socketClient.onListUpdated((list) => {
      logger.info(`List updated via WebSocket: ${list.id}`, 'useAppInitialization')
      setLists(useListStore.getState().lists.map((l) => (l.id === list.id ? list : l)))
    })

    socketClient.onListDeleted((id) => {
      logger.info(`List deleted via WebSocket: ${id}`, 'useAppInitialization')
      setLists(useListStore.getState().lists.filter((l) => l.id !== id))
    })

    // Schedule events
    socketClient.onScheduleShiftCreated((shift) => {
      logger.info(`Shift created via WebSocket: ${shift.id}`, 'useAppInitialization')
      setShifts([...useScheduleStore.getState().shifts, shift])
    })

    socketClient.onScheduleShiftUpdated((shift) => {
      logger.info(`Shift updated via WebSocket: ${shift.id}`, 'useAppInitialization')
      setShifts(
        useScheduleStore.getState().shifts.map((s) => (s.id === shift.id ? shift : s))
      )
    })

    socketClient.onScheduleShiftDeleted((id) => {
      logger.info(`Shift deleted via WebSocket: ${id}`, 'useAppInitialization')
      setShifts(useScheduleStore.getState().shifts.filter((s) => s.id !== id))
    })

    socketClient.onScheduleAssignmentCreated((assignment) => {
      logger.info(`Assignment created via WebSocket`, 'useAppInitialization')
      setAssignments([...useScheduleStore.getState().assignments, assignment])
    })

    socketClient.onScheduleAssignmentDeleted((data) => {
      logger.info(`Assignment deleted via WebSocket`, 'useAppInitialization')
      setAssignments(
        useScheduleStore.getState().assignments.filter(
          (a) => !(a.shiftId === data.shiftId && a.caddieId === data.caddieId)
        )
      )
    })

    logger.info('WebSocket event listeners registered', 'useAppInitialization')

    // Note: Cleanup is handled by socketClient.disconnect() in the main useEffect cleanup
  }, [])
}
