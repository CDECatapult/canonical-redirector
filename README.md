# @digicat/canonical-redirector

Redirects HTTP traffic to a configured canonical HTTPS host.

This package is perfect for running in an [ALB] target group, receiving HTTP
traffic, or even HTTPS traffic for a non-canonical host. It supports health
checks at `/healthcheck`, requests to which receive a `200 OK` response instead
of a redirect. No requests are logged, errors are not reported. Configuration is
done through two environment variables:

* `CANONICAL_HOSTNAME`: The host to redirect to.
* `PORT`: The port to listen on. Defaults to `4000`.

Note that `.env` files are not resolved.

## Usage

```console
$ CANONICAL_HOSTNAME=www.digitalcatapultcentre.org.uk PORT=4000 npm start
```

Then:

```console
$ curl -v -H 'host: digitalcatapultcentre.org.uk' localhost:4000/
> GET / HTTP/1.1
> host: digitalcatapultcentre.org.uk
> User-Agent: curl/7.54.0
> Accept: */*
>
< HTTP/1.1 301 Moved Permanently
< location: https://www.digitalcatapultcentre.org.uk/
< Date: Tue, 17 Oct 2017 15:28:54 GMT
< Connection: keep-alive
< Transfer-Encoding: chunked
<
```

[ALB]: http://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html
[Node.js]: https://nodejs.org/en/
