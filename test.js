import test from 'ava'
import lolex from 'lolex'
import requireUncached from 'require-uncached'
import td from 'testdouble'

const stubs = {
  http: td.replace('http'),
  process: td.replace('process', td.object({
    env: {},
    exit () {},
    on () {}
  })),
  server: td.object(['close', 'listen'])
}
td.when(stubs.http.createServer(td.matchers.isA(Function))).thenReturn(stubs.server)

const clock = lolex.install({toFake: ['setTimeout']})

function load (env) {
  Object.assign(stubs.process.env, {CANONICAL_HOSTNAME: 'example.com', PORT: undefined}, env)
  const {callCount: nextCreateServerCall} = td.explain(stubs.http.createServer)
  const {callCount: nextSigintCall} = td.explain(stubs.process.on)
  requireUncached('./')
  return {
    listener: td.explain(stubs.http.createServer).calls[nextCreateServerCall].args[0],
    sigint: td.explain(stubs.process.on).calls[nextSigintCall].args[1]
  }
}

test.cb('responds with a permanent redirect', t => {
  t.plan(2)
  const {listener} = load()
  listener({url: '/foo?bar'}, {
    writeHead (statusCode, headers) {
      t.is(statusCode, 301)
      t.deepEqual(headers, {location: 'https://example.com/foo?bar'})
    },
    end: t.end
  })
})

test.cb('supports /healthcheck', t => {
  t.plan(1)
  const {listener} = load()
  listener({url: '/healthcheck'}, {
    writeHead (statusCode, headers) {
      t.is(statusCode, 200)
    },
    end: t.end
  })
})

test('listens on PORT', t => {
  load({PORT: 4242})
  td.verify(stubs.server.listen(4242))
  t.pass()
})

test.serial('closes on SIGINT', t => {
  const {sigint} = load()
  td.verify(stubs.process.on('SIGINT', td.matchers.isA(Function)))
  t.is(td.explain(stubs.server.close).callCount, 0)
  sigint()
  td.verify(stubs.server.close())
})

test.serial('forcibly exits 5 seconds after SIGINT', t => {
  const {sigint} = load()
  sigint()
  t.is(td.explain(stubs.process.exit).callCount, 0)
  clock.tick(4999)
  t.is(td.explain(stubs.process.exit).callCount, 0)
  clock.tick(1)
  td.verify(stubs.process.exit())
})
