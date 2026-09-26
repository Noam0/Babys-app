import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, PHOTO_BUCKET } from '../lib/supabase'

const DEFAULT_WEIGHT = 3.5
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

/**
 * Gefen's shared settings (weight + photo), stored in a single-row table.
 * Falls back to localStorage when Supabase isn't configured.
 */
export function useBabySettings(enabled = true) {
  const [weight, setWeight] = useState(DEFAULT_WEIGHT)
  const [photo, setPhoto] = useState('')

  const applyRow = useCallback(async (row) => {
    if (!row) return
    if (row.weight_kg != null) setWeight(Number(row.weight_kg))
    if (row.photo_path) {
      const { data } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(row.photo_path, SIGNED_URL_TTL_SECONDS)
      setPhoto(data?.signedUrl || '')
    } else {
      setPhoto(row.photo_url || '')
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    if (!isSupabaseConfigured) {
      const savedWeight = localStorage.getItem('gefenWeight')
      if (savedWeight) setWeight(parseFloat(savedWeight))
      setPhoto(localStorage.getItem('gefenPhoto') || '')
      return
    }

    supabase
      .from('baby_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Error loading settings:', error)
        else applyRow(data)
      })

    const channel = supabase
      .channel('baby_settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'baby_settings' }, ({ new: row }) => {
        applyRow(row)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, applyRow])

  const saveSettings = async (values) => {
    const { data, error } = await supabase
      .from('baby_settings')
      .upsert({ id: 1, ...values, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    await applyRow(data)
  }

  const saveWeight = async (kg) => {
    if (!isSupabaseConfigured) {
      setWeight(kg)
      localStorage.setItem('gefenWeight', String(kg))
      return
    }
    await saveSettings({ weight_kg: kg })
  }

  const savePhotoUrl = async (url) => {
    if (!isSupabaseConfigured) {
      setPhoto(url)
      localStorage.setItem('gefenPhoto', url)
      return
    }
    await saveSettings({ photo_url: url, photo_path: null })
  }

  const savePhotoFile = async (file) => {
    if (!isSupabaseConfigured) {
      const dataUrl = await readFileAsDataUrl(file)
      setPhoto(dataUrl)
      localStorage.setItem('gefenPhoto', dataUrl)
      return
    }
    const extension = file.name.split('.').pop() || 'jpg'
    const path = `gefen-${Date.now()}.${extension}`
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type })
    if (error) throw error
    await saveSettings({ photo_path: path, photo_url: null })
  }

  return { weight, photo, saveWeight, savePhotoUrl, savePhotoFile }
}
