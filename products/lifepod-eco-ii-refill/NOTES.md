# Life Pod Eco II · Refill

Cápsula intercambiable de 10k puffs del kit Life Pod Eco II (batería negra + refill).
Este producto modela solo el refill. La batería es otro producto.

## Referencias

| Archivo | Qué muestra |
| --- | --- |
| `references/watermelon-ice-frontal.webp` | Refill de frente, fondo blanco. Base para proporciones y layout de etiqueta. |
| `references/tobacco-virginia-kit-1.png` | Refill inclinado + batería. Se ve el domo de la tapa y la base. |
| `references/tobacco-virginia-kit-2.png` | Refill de frente + batería de lado. |
| `references/capuccino-kit-1.jpeg` | Refill de frente, colores cobre y verde. |
| `references/capuccino-kit-2.jpeg` | Refill insertado en la batería. |

## Medidas estimadas (mm)

Sin datos oficiales. Proporción tomada de la vista frontal: alto total ≈ 2.7 × ancho.

| Parte | Valor |
| --- | --- |
| Cuerpo | 25 × 14 × 51 (ancho × grosor × alto) |
| Tapa domo | 14 de alto, ancho completo |
| Base | 2.5 de alto, 0.9 de inset |
| Total | ≈ 67.5 |

Si consigues medidas reales, cámbialas en `base.js` y todos los sabores heredan.

## Etiqueta (template `wave`)

Tres zonas con borde ondulado y filete plateado:
- **top**: logo LIFE POD + ECO II.
- **main**: sabor en itálica, acabado foil.
- **bottom**: burbuja con `10k PUFFS`.

Colores por sabor en `flavors/<sabor>.js` (`label.colors`). El logo real se puede poner
como PNG en `public/textures/` y referenciarlo con `label.logoImage`.
