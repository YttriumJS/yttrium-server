# yttrium-server
The jQuery web server framework. Do not use in production.

## Installation
```bash
npm install yttrium-server --save
```

## How to Use
Have a look at the [example](https://github.com/YttriumJS/yttrium-server/blob/master/example/) to see how easy it is get a fully functional Yttrium server up. Below is a brief outline of some of the core functionality.

### Getting Started

The most basic Yttrium server: 
```javscript
const yt = require('../index');

const { $, server } = yt;

$(server).on('request', (server, req, res) => {
    res.end('Hello World');
});

// start up server
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
    .append('<post-example data-method="post">') // localhost/post-example (only responds to POST requests)
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
 
$.route('post-example')
    .on('route', (e, req, res) => {
      e.stopPropagation();
       
      // Parse the body
      $.body(req)
        .then((body) => {
          if (!body) {
            return res.end('Send a post body to this example')
          }
          return res.end(`Post body: ${body}`);
        });
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

If you're using the Yttrium router, you can pass all requests to it like this:

```javascript
const yt = require('../index');
 
const { $, server, router } = yt;
 
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

const { $, server, router } = yt;

// import routes
routes($);

// ... handle requests and start server
```