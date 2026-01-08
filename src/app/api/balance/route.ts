import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.ONEAPI_KEY
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'ONEAPI_KEY 未配置' 
      }, { status: 500 })
    }

    const response = await fetch('https://api.getoneapi.com/back/user/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()

    if (data.code === 200) {
      return NextResponse.json({ 
        success: true,
        balance: data.data?.balance ?? data.data ?? 0
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: data.message || `错误码: ${data.code}`
    })

  } catch (error: any) {
    console.error('Balance API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch balance' 
    }, { status: 500 })
  }
}

