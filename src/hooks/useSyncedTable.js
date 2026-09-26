import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const sortDesc = (rows, column) =>
  [...rows].sort((a, b) => new Date(b[column]) - new Date(a[column]))

const upsertRow = (rows, row, column) =>
  sortDesc([...rows.filter(r => r.id !== row.id), row], column)

/**
 * A family's rows in a Supabase table, kept in sync in real time.
 */
export function useSyncedTable(table, { orderBy, familyId }) {
  const [rows, setRows] = useState([])

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('family_id', familyId)
      .order(orderBy, { ascending: false })
    if (error) {
      console.error(`Error loading ${table}:`, error)
    } else {
      setRows(data)
    }
  }, [table, orderBy, familyId])

  useEffect(() => {
    if (!familyId) {
      setRows([])
      return
    }
    load()

    const familyFilter = { schema: 'public', table, filter: `family_id=eq.${familyId}` }
    const channel = supabase
      .channel(`${table}-${familyId}`)
      .on('postgres_changes', { event: 'INSERT', ...familyFilter }, ({ new: row }) => {
        setRows(prev => upsertRow(prev, row, orderBy))
      })
      .on('postgres_changes', { event: 'UPDATE', ...familyFilter }, ({ new: row }) => {
        setRows(prev => upsertRow(prev, row, orderBy))
      })
      // Postgres can't filter DELETE events by column; unknown ids are simply ignored
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, ({ old }) => {
        setRows(prev => prev.filter(r => r.id !== old.id))
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
  }, [table, orderBy, familyId, load])

  const add = useCallback(async (values) => {
    const { data, error } = await supabase
      .from(table)
      .insert({ ...values, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setRows(prev => upsertRow(prev, data, orderBy))
    return data
  }, [table, orderBy, familyId])

  const update = useCallback(async (id, values) => {
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
    if (error) throw error
    setRows(prev => upsertRow(prev, data, orderBy))
  }, [table, orderBy])

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    setRows(prev => prev.filter(r => r.id !== id))
  }, [table])

  return { rows, add, update, remove }
}
