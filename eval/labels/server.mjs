import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createConnection } from 'node:net'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
}

const labelsPath = join(__dirname, 'labels.json')

function tryPort(port) {
  return new Promise((resolve) => {
    const sock = createConnection({ port, host: '127.0.0.1' })
    sock.on('connect', () => { sock.destroy(); resolve(false) })
    sock.on('error', () => { sock.destroy(); resolve(true) })
  })
}

async function findPort(start) {
  for (let p = start; p < start + 20; p++) {
    if (await tryPort(p)) return p
  }
  throw new Error('No free port found')
}

async function main() {
  const port = await findPort(4317)

  const server = createServer((req, res) => {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      res.writeHead(200, { 'Content-Type': MIME['.html'] })
      res.end(readFileSync(join(__dirname, 'index.html')))
      return
    }

    if (req.method === 'GET' && req.url === '/flags.json') {
      res.writeHead(200, { 'Content-Type': MIME['.json'] })
      res.end(readFileSync(join(__dirname, 'flags.json')))
      return
    }

    if (req.method === 'GET' && req.url === '/labels.json') {
      if (existsSync(labelsPath)) {
        res.writeHead(200, { 'Content-Type': MIME['.json'] })
        res.end(readFileSync(labelsPath))
      } else {
        res.writeHead(200, { 'Content-Type': MIME['.json'] })
        res.end('{}')
      }
      return
    }

    if (req.method === 'POST' && req.url === '/labels.json') {
      let body = ''
      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        try {
          JSON.parse(body) // validate
          writeFileSync(labelsPath, body)
          res.writeHead(200, { 'Content-Type': MIME['.json'] })
          res.end('{"ok":true}')
        } catch (e) {
          res.writeHead(400, { 'Content-Type': MIME['.json'] })
          res.end('{"error":"invalid json"}')
        }
      })
      return
    }

    res.writeHead(404)
    res.end('Not found')
  })

  server.listen(port, '127.0.0.1', () => {
    console.log(`Labelling page: http://127.0.0.1:${port}`)
  })
}

main()
