// Type overrides for PayloadCMS generated routes
declare module '@payloadcms/next/routes' {
  import type { NextRequest } from 'next/server'

  export function REST_OPTIONS(config: any): (request: NextRequest, context?: any) => Promise<Response>
  export function GRAPHQL_POST(config: any): (request: NextRequest, context?: any) => Promise<Response>
  export function GRAPHQL_PLAYGROUND_GET(config: any): (request: NextRequest, context?: any) => Promise<Response>
  export function REST_GET(config: any): (request: NextRequest, context?: any) => Promise<Response>
  export function REST_POST(config: any): (request: NextRequest, context?: any) => Promise<Response>
  export function REST_DELETE(config: any): (request: NextRequest, context?: any) => Promise<Response>
  export function REST_PATCH(config: any): (request: NextRequest, context?: any) => Promise<Response>
  export function REST_PUT(config: any): (request: NextRequest, context?: any) => Promise<Response>
}
