<div align="center">
  <a href="https://github.com/YttriumJS/yttrium-server">
    <img width="400" heigth="327" src="https://cldup.com/UItSrUsRMU.png">
</a>
<h2>jQuery web server framework</h2>
<a href="https://npmjs.org/package/yttrium-server"><img src="https://badge.fury.io/js/yttrium-server.svg" alt="npm version"></a> 
<a href='https://coveralls.io/github/YttriumJS/yttrium-server?branch=master'><img src='https://coveralls.io/repos/github/YttriumJS/yttrium-server/badge.svg?branch=master' alt='Coverage Status' /></a>
<a href='https://travis-ci.org/YttriumJS/yttrium-server'><img src='https://travis-ci.org/YttriumJS/yttrium-server.svg?branch=master' alt='Build Status' /></a>

:skull: (Do not use in production.) :skull:
</div>


## Installation
```bash
npm install yttrium-server --save
```

## How to Use
Have a look at the [example](https://github.com/YttriumJS/yttrium-server/blob/master/example/) to see how easy it is get a fully functional Yttrium server up. Below is a brief outline of some of the core functionality.

### Getting Started

The most basic Yttrium server: 
```javascript
const Y = require('yttrium-server');

// instantiating the Yttrium jQuery instance
// and the HTTP server object
const { $, server } = Y();

// on any HTTP request, send Hello World
$(server).on('request', (server, req, res) => {
    res.end('Hello World');
});

// start up server listener
$.listen(server, 8000);

$(server).on('listening', (e) => {
  console.log('Server is listening on port:', e.target.address().port);
});
```

### Routing

Add endpoints with the `$.route('<endpoint>')` function -- with the brackets. The Yttrium router utilizes a _Router DOM_, where each endpoint is an HTML element. 
The logic that fires upon request to those endpoints is defined by the `on('route')` event handler. 
The _Router DOM_ has an `<index>` route built-in, which corresponds to the `/` endpoint. Further endpoints should be appended to the index route.

By default all methods are accepted and bodies and query strings are parsed. If you want to specify a method, use the `data-method="method"`attribute on the endpoint element.

Route parameters are available by specifying a `data-dynamic="something"` attribute on the endpoint element. This will expose the route parameter "something" in the `.data('something')` jQuery request. 

The endpoint event handlers will always be passed `event, req, res` from the Yttrium router.


An example: 
```javascript
// Adding endpoints
$.route('index') // e.g. localhost/
    .append('<hello>') // localhost/hello
    .append('<param-example data-dynamic="name">'); // localhost/param-example/harry etc
    
// add handler to index route
$.route('index')
    .on('route', (e, req, res) => {
      // it's important to stop propagation of the route event
      // unless you want to trigger the parental route functions
      // which can be useful in middleware situations
      e.stopPropagation();
      return res.end('Index route!');
    });
 
// add handler to hello route
$.route('hello')
    .on('route', (e, req, res) => {
      e.stopPropagation();
      // example of sending HTML template
      $('body').html('<h1>This example uses HTML... hello world!</h1>');
      return res.end($('html').html());
    });
 
// this route responds to /param-example/:name
$.route('param-example')
    .on('route', (e, req, res) => {
      e.stopPropagation();
      const param = $.route('param-example').data('name');
      if (!param) {
        return res.end('Navigate to /param-example/anything to see dynamic routes in action')
      }
      return res.end(`I found a name! ${param}`);
    });
```   

Query string parameters are automatically parsed and placed into an object in the data-query attribute of the route element.
Accessing the query object looks like this:

```javascript
$.route('query-me') // localhost/query-me
.on('route', (e, req, res) => {
  e.stopPropagation();
  const query = $.route('query-me').data('query');
  return res.end(`Get query string params: ${JSON.stringify(query)}`);
});
```

If you're using the Yttrium router, you can pass all requests to it like this:

```javascript
const yt = require('../index');
 
const { $, server, router } = Y();
 
// ... routes ...
 
// send requests to the router
$(server).on('request', router);
 
// ... start server ...
```

To keep things clean, the recommended way to define routes is in a separate route file that looks like this:

```javascript
module.exports = ($) => {
  $.route('index')
    .append('<hello>') // ...etc.
}
```

No return value is necessary because the route functions are directly manipulating the _Router DOM_. The routes can be loaded into the Yttrium router like this:

```javascript
const yt = require('../index');
const routes = require('./routes');

const { $, server, router } = Y();

// import routes
routes($);

// ... handle requests and start server
```

#### Body Parsing
See the [Yttrium body parser](https://github.com/YttriumJS/yttbody) package for examples of parsing the request body.

### Options
You can pass in an options object upon initialization:

```javascript
const { $, server, router } = Y({ notFound: 'oh-noes' });
```

Option | Purpose
-------| -------
`notFound` (String) | Specify the name of the 404 route (the default is `not-found`)

## License
[MIT](https://github.com/YttriumJS/yttrium-server/blob/master/LICENSE)
