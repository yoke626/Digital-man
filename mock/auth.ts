// /mock/auth.ts

import Mock from 'mockjs'
// 引入我们为请求体定义的类型
import type { LoginPayload, RegisterPayload } from '../src/types/auth'

// 直接导出一个数组，不再使用 defineMock
export default [
  {
    // 模拟登录接口
    url: '/api/v1/auth/login',
    method: 'post',
    // 为 response 的参数提供类型
    response: ({ body }: { body: LoginPayload }) => {
      if (body.username === 'admin' && body.password === '123456') {
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: Mock.Random.guid(),
            expiresIn: 7200,
          },
        }
      } else {
        return {
          code: 401,
          message: '用户名或密码错误',
          data: null,
        }
      }
    },
  },
  {
    // 模拟注册接口
    url: '/api/v1/auth/register',
    method: 'post',
    response: ({ body }: { body: RegisterPayload }) => {
      if (body.username === 'existing_user') {
        return {
          code: 409,
          message: '该用户名已被注册',
          data: null,
        }
      }
      
      return {
        code: 201,
        message: '注册成功',
        data: null,
      }
    },
  },
]