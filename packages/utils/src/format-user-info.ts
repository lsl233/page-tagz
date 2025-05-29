export const formatLocalUserInfo = (user: string | null) => {
  try {
    // 如果没有传入 user 参数，则从 localStorage 获取
    const userStr = user
    
    if (!userStr) {
      return null
    }

    const parsedUser = JSON.parse(userStr)

    // 验证用户数据的完整性
    if (!parsedUser || typeof parsedUser !== 'object') {
      return null
    }

    // 确保返回的用户对象具有所需的所有属性
    return {
      id: parsedUser.id || '',
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      image: parsedUser.image || ''
    }
  } catch (error) {
    console.error('Error formatting user info:', error)
    return null
  }
}