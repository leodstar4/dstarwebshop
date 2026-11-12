// Ropa que el gato del museo se puede probar, por id de producto.
// Cada prenda usa dos fotos planas de la galería (frente y espalda) y un molde: longsleeve, camisa o jort.
// Las zonas van en fracciones de la foto (0 a 1): `rect` es [x0, y0, x1, y1]; una manga es una tira
// que va del hombro (`de`) al puño (`a`) con su `ancho`. `muestra` toma el color del tejido en el frente.
const BASE = 'https://res.cloudinary.com/dflyysqln/image/upload/';

export const fotoRopa = (archivo, formato) => `${BASE}f_${formato},q_auto,dpr_auto,w_900/${archivo}`;

export const ROPA = {
  'dstar-apnm-ls-01': {
    molde: 'longsleeve',
    muestra: [0.432, 0.29, 0.550, 0.54],
    frente: {
      foto: 'undermyskin1_u3ulw1.jpg',
      cuerpo: { rect: [0.39, 0.22, 0.57, 0.85] },
      izq: { de: [0.307, 0.26], a: [0.319, 0.835], ancho: 0.125 },
      der: { de: [0.657, 0.253], a: [0.645, 0.84], ancho: 0.126 }
    },
    espalda: {
      foto: 'undermyskin2_brvy0g.jpg',
      cuerpo: { rect: [0.385, 0.2, 0.585, 0.86] },
      izq: { de: [0.284, 0.26], a: [0.369, 0.846], ancho: 0.125 },
      der: { de: [0.670, 0.253], a: [0.621, 0.828], ancho: 0.125 }
    }
  },
  'dstar-apnm-ls-02': {
    molde: 'longsleeve',
    muestra: [0.413, 0.48, 0.583, 0.74],
    frente: {
      foto: 'beadepredator1_btz8nt.jpg',
      cuerpo: { rect: [0.323, 0.158, 0.675, 0.824], contorno: [[0.339, 0.167], [0.420, 0.135], [0.547, 0.134], [0.655, 0.175], [0.689, 0.823], [0.310, 0.823]] }
    },
    espalda: {
      foto: 'beadepredator2_oprlcc.jpg',
      cuerpo: { rect: [0.327, 0.160, 0.651, 0.821], contorno: [[0.320, 0.173], [0.416, 0.133], [0.542, 0.134], [0.631, 0.170], [0.664, 0.818], [0.311, 0.818]] }
    }
  },
  'dstar-apnm-shirt-01': {
    molde: 'longsleeve',
    muestra: [0.413, 0.39, 0.585, 0.66],
    frente: {
      foto: 'bendecido1_lollup.jpg',
      cuerpo: { rect: [0.33, 0.22, 0.67, 0.84] },
      izq: { de: [0.308, 0.296], a: [0.243, 0.801], ancho: 0.095 },
      der: { de: [0.688, 0.299], a: [0.750, 0.837], ancho: 0.094 }
    },
    espalda: {
      foto: 'bendecido1_lollup.jpg',
      cuerpo: { rect: [0.33, 0.22, 0.67, 0.84] }
    }
  },
  'dstar-bts-shirt-01': {
    molde: 'camisa',
    muestra: [0.401, 0.491, 0.482, 0.672],
    frente: {
      foto: 'borntoshine1_mhdrgc.jpg',
      cuerpo: { rect: [0.331, 0.274, 0.705, 0.817] },
      izq: { de: [0.277, 0.350], a: [0.282, 0.523], ancho: 0.073 },
      der: { de: [0.787, 0.344], a: [0.783, 0.535], ancho: 0.071 }
    },
    espalda: {
      foto: 'brn1_ixp42v.jpg',
      cuerpo: { rect: [0.292, 0.257, 0.657, 0.793] },
      izq: { de: [0.222, 0.315], a: [0.232, 0.480], ancho: 0.073 },
      der: { de: [0.730, 0.338], a: [0.729, 0.501], ancho: 0.069 }
    }
  },
  'dstar-bts-jort-01': {
    molde: 'jort',
    muestra: [0.368, 0.491, 0.441, 0.700],
    frente: {
      foto: 'overas1_tgmuzs.jpg',
      cuerpo: { rect: [0.323, 0.156, 0.640, 0.442], contorno: [[0.351, 0.141], [0.602, 0.143], [0.651, 0.449], [0.313, 0.449]] },
      izq: { rect: [0.322, 0.466, 0.465, 0.851] },
      der: { rect: [0.526, 0.467, 0.654, 0.848] }
    },
    espalda: {
      foto: 'overas2_flxg98.jpg',
      cuerpo: { rect: [0.315, 0.137, 0.608, 0.457], contorno: [[0.327, 0.124], [0.589, 0.125], [0.623, 0.466], [0.300, 0.466]] },
      izq: { rect: [0.280, 0.481, 0.429, 0.841] },
      der: { rect: [0.488, 0.481, 0.627, 0.841] }
    }
  }
};
