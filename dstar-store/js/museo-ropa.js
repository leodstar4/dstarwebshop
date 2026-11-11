// Ropa que el gato del museo se puede probar, por id de producto.
// Cada prenda usa dos fotos planas de la galería (frente y espalda) y un molde: longsleeve, camisa o jort.
// Las zonas van en fracciones de la foto (0 a 1): `rect` es [x0, y0, x1, y1]; una manga es una tira
// que va del hombro (`de`) al puño (`a`) con su `ancho`. Sin zona, esa parte sale lisa con el color de la tela.
const BASE = 'https://res.cloudinary.com/dflyysqln/image/upload/';

export const fotoRopa = (archivo, formato) => `${BASE}f_${formato},q_auto,dpr_auto,w_900/${archivo}`;

export const ROPA = {
  'dstar-apnm-ls-01': {
    molde: 'longsleeve',
    frente: {
      foto: 'undermyskin1_u3ulw1.jpg',
      cuerpo: { rect: [0.39, 0.22, 0.57, 0.85] },
      izq: { de: [0.3, 0.25], a: [0.31, 0.84], ancho: 0.14 },
      der: { de: [0.665, 0.24], a: [0.64, 0.85], ancho: 0.15 }
    },
    espalda: {
      foto: 'undermyskin2_brvy0g.jpg',
      cuerpo: { rect: [0.385, 0.2, 0.585, 0.86] },
      izq: { de: [0.27, 0.25], a: [0.365, 0.86], ancho: 0.15 },
      der: { de: [0.675, 0.24], a: [0.615, 0.84], ancho: 0.14 }
    }
  },
  'dstar-apnm-ls-02': {
    molde: 'longsleeve',
    frente: {
      foto: 'beadepredator1_btz8nt.jpg',
      cuerpo: { rect: [0.3, 0.15, 0.7, 0.85] }
    },
    espalda: {
      foto: 'beadepredator2_oprlcc.jpg',
      cuerpo: { rect: [0.31, 0.15, 0.69, 0.85] }
    }
  },
  'dstar-apnm-shirt-01': {
    molde: 'longsleeve',
    frente: {
      foto: 'bendecido1_lollup.jpg',
      cuerpo: { rect: [0.33, 0.22, 0.67, 0.84] },
      izq: { de: [0.325, 0.27], a: [0.245, 0.82], ancho: 0.115 },
      der: { de: [0.675, 0.27], a: [0.75, 0.86], ancho: 0.115 }
    },
    espalda: {
      foto: 'bendecido1_lollup.jpg',
      cuerpo: { rect: [0.33, 0.22, 0.67, 0.84] }
    }
  },
  'dstar-bts-shirt-01': {
    molde: 'camisa',
    frente: {
      foto: 'borntoshine1_mhdrgc.jpg',
      cuerpo: { rect: [0.33, 0.28, 0.72, 0.84] },
      izq: { de: [0.3, 0.34], a: [0.275, 0.545], ancho: 0.1 },
      der: { de: [0.77, 0.34], a: [0.775, 0.55], ancho: 0.1 }
    },
    espalda: {
      foto: 'brn1_ixp42v.jpg',
      cuerpo: { rect: [0.28, 0.26, 0.67, 0.79] },
      izq: { de: [0.23, 0.31], a: [0.225, 0.5], ancho: 0.1 },
      der: { de: [0.71, 0.32], a: [0.735, 0.52], ancho: 0.1 }
    }
  },
  'dstar-bts-jort-01': {
    molde: 'jort',
    frente: {
      foto: 'overas1_tgmuzs.jpg',
      cuerpo: { rect: [0.325, 0.13, 0.645, 0.5] },
      izq: { rect: [0.3, 0.72, 0.48, 0.9] },
      der: { rect: [0.52, 0.72, 0.7, 0.9] }
    },
    espalda: {
      foto: 'overas2_flxg98.jpg',
      cuerpo: { rect: [0.295, 0.15, 0.615, 0.5] },
      izq: { rect: [0.25, 0.62, 0.45, 0.88] },
      der: { rect: [0.48, 0.62, 0.66, 0.88] }
    }
  }
};
