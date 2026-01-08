import { jwtUtils } from './jwt'
import { v4 as uuidv4 } from 'uuid'

// Script to generate JWT tokens for testing
function generateTestToken() {
  const testUsers = [
    {
      userId: uuidv4(),
      email: 'admin@caddiepro.com',
      role: 'admin',
      name: 'Admin User',
    },
    {
      userId: uuidv4(),
      email: 'operator@caddiepro.com',
      role: 'operator',
      name: 'Operator User',
    },
    {
      userId: uuidv4(),
      email: 'viewer@caddiepro.com',
      role: 'viewer',
      name: 'Viewer User',
    },
  ]

  console.log('='.repeat(80))
  console.log('JWT Token Generator - CaddiePro Backend')
  console.log('='.repeat(80))
  console.log()

  testUsers.forEach((user) => {
    const token = jwtUtils.generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    })

    const refreshToken = jwtUtils.generateRefreshToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    })

    console.log(`User: ${user.name} (${user.role})`)
    console.log(`Email: ${user.email}`)
    console.log(`User ID: ${user.userId}`)
    console.log()
    console.log('Access Token:')
    console.log(token)
    console.log()
    console.log('Refresh Token:')
    console.log(refreshToken)
    console.log()
    console.log('Use in Authorization header:')
    console.log(`Bearer ${token}`)
    console.log()
    console.log('-'.repeat(80))
    console.log()
  })

  console.log('Token Details:')
  console.log(`Expires In: ${process.env.JWT_EXPIRES_IN || '7d'}`)
  console.log(`Refresh Expires In: ${process.env.JWT_REFRESH_EXPIRES_IN || '30d'}`)
  console.log()
  console.log('To verify tokens, use the /api/auth/verify endpoint')
  console.log('='.repeat(80))
}

// Run the script
generateTestToken()
