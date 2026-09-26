import { useCallback, useEffect, useState } from 'react'
import { supabase, PHOTO_BUCKET } from '../lib/supabase'

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7

/**
 * The signed-in user's family: baby details, weight, photo and invite code.
 */
export function useFamily(userId) {
  const [family, setFamily] = useState(null)
  const [loadedForUserId, setLoadedForUserId] = useState(null)
  const [photo, setPhoto] = useState('')

  useEffect(() => {
    if (!userId) {
      setFamily(null)
      setLoadedForUserId(null)
      return
    }
    supabase
      .from('families')
      .select('*')
      .order('created_at')
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Error loading family:', error)
        setFamily(data ?? null)
        setLoadedForUserId(userId)
      })
  }, [userId])

  const familyId = family?.id

  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel(`family-${familyId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'families', filter: `id=eq.${familyId}` },
        ({ new: row }) => setFamily(row)
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId])

  const photoPath = family?.photo_path
  const photoUrl = family?.photo_url

  useEffect(() => {
    if (!photoPath) {
      setPhoto(photoUrl || '')
      return
    }
    let cancelled = false
    supabase.storage
      .from(PHOTO_BUCKET)
      .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS)
      .then(({ data }) => {
        if (!cancelled) setPhoto(data?.signedUrl || '')
      })
    return () => {
      cancelled = true
    }
  }, [photoPath, photoUrl])

  const createFamily = async (babyName, birthDatetime) => {
    const { data, error } = await supabase.rpc('create_family', {
      p_baby_name: babyName,
      p_birth_datetime: birthDatetime
    })
    if (error) throw error
    setFamily(data)
  }

  const joinFamily = async (inviteCode) => {
    const { data, error } = await supabase.rpc('join_family', { p_invite_code: inviteCode })
    if (error) throw error
    setFamily(data)
  }

  const updateFamily = useCallback(async (values) => {
    const { data, error } = await supabase
      .from('families')
      .update(values)
      .eq('id', familyId)
      .select()
      .single()
    if (error) throw error
    setFamily(data)
  }, [familyId])

  const saveWeight = (kg) => updateFamily({ weight_kg: kg })

  const savePhotoUrl = (url) => updateFamily({ photo_url: url, photo_path: null })

  const savePhotoFile = async (file) => {
    const extension = file.name.split('.').pop() || 'jpg'
    const path = `${familyId}/photo-${Date.now()}.${extension}`
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { contentType: file.type })
    if (error) throw error
    await updateFamily({ photo_path: path, photo_url: null })
  }

  return {
    family,
    loading: Boolean(userId) && loadedForUserId !== userId,
    photo,
    createFamily,
    joinFamily,
    updateFamily,
    saveWeight,
    savePhotoUrl,
    savePhotoFile
  }
}
