# using.js

La función `Using` permite requerir de forma sencilla las librerías JS y/o CSS de un proyecto de forma fácil y asíncrona de manera que la plataforma carga mucho mas rápido al no leer todas los archivos innecesarios ya que estos serán leídos según son requeridos.

## Uso

```javascript
Using('jquery', function($) {
  // código
});
```
