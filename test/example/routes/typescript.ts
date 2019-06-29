import { ServerResponse, IncomingMessage } from 'http'

export default function(req: IncomingMessage, res: ServerResponse) {
  res.end('hello from typescript.ts')
}
