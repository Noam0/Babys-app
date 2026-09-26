import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, newId } from '../lib/supabase'

const sortDesc = (rows, column) =>
  [...rows].sort((a, b) => new Date(b[column]) - new Date(a[column]))

const upsertRow = (rows, row, column) =>
  sortDesc([...rows.filter(r => r.id !== row.id), row], column)

/**
 * Rows of a Supabase table kept in sync in real time.
 * Falls back to localStorage when Supabase isn't configured.
 */
export function useSyncedTable(table, { orderBy, localKey, enabled = true }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const readLocal = useCallback(
    () => JSON.parse(localStorage.getItem(localKey) || '[]'),
    [localKey]
  )

  const writeLocal = useCallback(
    (next) => {
      localStorage.setItem(localKey, JSON.stringify(next))
      return next
    },
    [localKey]
  )

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRows(sortDesc(readLocal(), orderBy))
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: false })
    if (error) {
      console.error(`Error loading ${table}:`, error)
    } else {
      setRows(data)
    }
    setLoading(false)
  }, [table, orderBy, readLocal])

  useEffect(() => {
    if (!enabled) return
    load()
    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, ({ eventType, new: row, old }) => {
        setRows(prev =>
          eventType === 'DELETE'
            ? prev.filter(r => r.id !== old.id)
            : upsertRow(prev, row, orderBy)
        )
      })
      .subscribe()

    // iOS suspends background PWAs, so realtime messages can be missed while the app is closed
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      supabase.removeChannel(channel)
    }
  }, [table, orderBy, enabled, load])

  const add = useCallback(async (values) => {
    if (!isSupabaseConfigured) {
      const row = { id: newId(), created_at: new Date().toISOString(), ...values }
      setRows(prev => writeLocal(upsertRow(prev, row, orderBy)))
      return row
    }
    const { data, error } = await supabase.from(table).insert(values).select().single()
    if (error) throw error
    setRows(prev => upsertRow(prev, data, orderBy))
    return data
  }, [table, orderBy, writeLocal])

  const update = useCallback(async (id, values) => {
    if (!isSupabaseConfigured) {
      setRows(prev => writeLocal(sortDesc(prev.map(r => (r.id === id ? { ...r, ...values } : r)), orderBy)))
      return
    }
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
    if (error) throw error
    setRows(prev => upsertRow(prev, data, orderBy))
  }, [table, orderBy, writeLocal])

  const remove = useCallback(async (id) => {
    if (!isSupabaseConfigured) {
      setRows(prev => writeLocal(prev.filter(r => r.id !== id)))
      return
    }
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    setRows(prev => prev.filter(r => r.id !== id))
  }, [table, writeLocal])

  return { rows, loading, add, update, remove }
}
