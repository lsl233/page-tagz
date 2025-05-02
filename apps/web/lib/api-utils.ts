import { revalidatePath } from "next/cache"

/**
 * API 错误代码枚举
 */
export enum ErrorCode {
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  BOOKMARK_NOT_FOUND = "BOOKMARK_NOT_FOUND",
  TAG_NOT_FOUND = "TAG_NOT_FOUND",
  USER_EXISTS = "USER_EXISTS",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

/**
 * 通用 API 响应类型
 */
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  message: string
  error?: {
    code: string
    details?: string
  }
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 成功消息
 * @param paths 需要重新验证的路径数组
 * @returns 成功响应对象
 */
export async function createSuccessResponse<T = any>(
  data?: T,
  message: string = "success",
  paths: string[] = ["/"]
) {
  // 重新验证所有指定路径
  paths.forEach(path => revalidatePath(path))
  
  return {
    success: true,
    data,
    message
  }
}

/**
 * 创建错误响应
 * @param code 错误代码
 * @param message 错误消息
 * @param details 错误详情
 * @returns 错误响应对象
 */
export async function createErrorResponse(
  code: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR,
  message: string = "operation failed",
  details?: string
) {
  return {
    success: false,
    message,
    error: {
      code,
      details
    }
  }
}

/**
 * 处理异常并创建错误响应
 * @param error 捕获的异常
 * @param defaultMessage 默认错误消息
 * @param defaultCode 默认错误代码
 * @returns 错误响应对象
 */
export async function handleError(
  error: unknown,
  defaultMessage: string = "unknown error",
  defaultCode: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR
) {
  console.error("Error:", error)
  
  const errorMessage = error instanceof Error ? error.message : defaultMessage
  const details = error instanceof Error ? error.stack : undefined
  
  return createErrorResponse(
    defaultCode,
    errorMessage, 
    details
  )
}

/**
 * API 操作处理器，包含 try-catch 逻辑
 * @param handler 处理函数
 * @param errorMessage 错误消息
 * @param errorCode 错误代码
 * @returns API 响应
 */
export async function apiHandler<T = any>(
  handler: () => Promise<ApiResponse<T>>,
  errorMessage: string = "operation failed",
  errorCode: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR
) {
  try {
    return await handler()
  } catch (error) {
    return handleError(error, errorMessage, errorCode)
  }
}