'use client'

import React, { useEffect } from 'react'
import Alert from '@/components/ui/feedback/Alert';
import { useUtilityStore } from '@/lib/zustand/utilityStore';
import { useShallow } from 'zustand/shallow';

const AuthLayout = ({children}:{children:React.ReactNode}) => {

  const { alert, setAlert } = useUtilityStore(
    useShallow(state => ({
      alert: state.alert,
      setAlert: state.setAlert
    }))
  );

  useEffect(() => {
    setTimeout(() => {
      setAlert({
        label: '',
        type: 'success'
      })
    }, 2000)
  }, [])

  return (
    <>
      {children}

      {(alert && alert?.label !== '') && (
        <Alert label={alert.label} type={alert.type} />
      )}
    </>
  )
}

export default AuthLayout