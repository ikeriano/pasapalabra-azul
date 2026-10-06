# Pasapalabra Azul — fan remake

Proyecto **personal y sin ánimo de lucro**: un *fan remake* del juego de Pasapalabra pensado para jugar en tablet y móvil.
**No es oficial** y no tiene ninguna relación con el programa, la cadena ni los propietarios de la marca.

🎮 Jugar: https://ikeriano.github.io/pasapalabra-azul/

## Qué incluye

- **El Rosco** (25 letras, contrarreloj), **Rosco diario** y **Duelo** a dos jugadores en el mismo dispositivo.
- **La Silla Azul**, **Una de Cuatro**, **Sopa de Letras** y **¿Dónde están?**
- **Programa TV / Partida completa**: lista de pruebas en orden (Silla Azul → Una de Cuatro → Sopa de Letras → ¿Dónde están? → El Rosco). Los segundos ganados en cada prueba se suman al tiempo inicial de El Rosco.
- **Plató 3D** recorrible (joystick + arrastrar para mirar, o WASD) con puntos para lanzar cada prueba.
- Ranking, tienda de avatares y opciones (música y efectos), guardado en el propio dispositivo.
- Sonido de acierto solo al acertar, de fallo solo al fallar; *pasapalabra* sin sonido.
- PWA instalable (se puede añadir a la pantalla de inicio).

## Desarrollo

```bash
npm install
npm run dev          # servidor de desarrollo
npm run build        # build local (base '/')
npm run preview      # vista previa en http://127.0.0.1:5175
npm run check        # build + comprobación de la salida
npm run build:pages  # build para GitHub Pages (base /pasapalabra-azul/) en dist-pages/
```

Hecho con Vite, React, TypeScript y three.js (@react-three/fiber).
