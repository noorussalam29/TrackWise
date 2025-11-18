import React, { useState, useEffect } from 'react'
import api from '../../services/api'

export default function PunchCard(){
  const [status, setStatus] = useState('idle')

  async function punch(type){
    setStatus('saving')
    try{
      const resp = await api.post('/attendance/punch', { type })
      setStatus('ok')
      console.log(resp.data)
    }catch(err){
      setStatus('error')
    }
  }

  return (
    <div className="p-4 border rounded">
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={()=>punch('in')}>Punch In</button>
        <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={()=>punch('out')}>Punch Out</button>
        <div className="ml-auto">Status: {status}</div>
      </div>
    </div>
  )
}
