// Catálogo DSTAR — única fuente de precios y stock, la usan la web y las Netlify Functions.
// Edita aquí tus productos. Imágenes en Cloudinary: https://res.cloudinary.com/dflyysqln/image/upload/
(function (root) {
  const PRODUCTS = [
    {
      id: 'dstar-bts-shirt-01',
      name: 'BORN TO SHINE',
      drop: 'BORN TO SHINE',
      price: 450,
      description: 'Camisa del drop Born to Shine. Pieza limitada DSTAR.',
      image: 'https://res.cloudinary.com/dflyysqln/image/upload/borntoshinedosvistas_blwlew.webp',
      gallery: [
        'https://res.cloudinary.com/dflyysqln/image/upload/borntoshine1_mhdrgc.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/brn1_ixp42v.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/borntoshine3_apqt8r.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/borntoshine4_hpg4y8.jpg',
      ],
      badge: 'LIMITED',       // LIMITED | NEW | SOLDOUT
      stock: 2,
      sizes: ['S', 'L'],
      sizesStock: { S: 1, L: 1 }
    },
    {
      id: 'dstar-bts-jort-01',
      name: 'OVER AS F**K',
      drop: 'BORN TO SHINE',
      price: 500,
      description: 'Jort del drop Born to Shine. Pieza limitada DSTAR.',
      image: 'https://res.cloudinary.com/dflyysqln/image/upload/overasdosvistas_lwrtst.webp',
      gallery: [
        'https://res.cloudinary.com/dflyysqln/image/upload/overas1_tgmuzs.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/overas2_flxg98.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/overas3_ypmnih.jpg',
      ],
      badge: 'LIMITED',
      stock: 3,
      sizes: ['S', 'M', 'L'],
      sizesStock: { S: 1, M: 1, L: 1 }
    },
    {
      id: 'dstar-apnm-ls-01',
      name: 'UNDER MY SKIN',
      drop: 'EL ANIMAL PRINT NUNCA MUERE',
      price: 400,
      description: 'Long sleeve del drop El Animal Print Nunca Muere. Pieza limitada DSTAR.',
      image: 'https://res.cloudinary.com/dflyysqln/image/upload/undermyskindosvistas_foypii.webp',
      gallery: [
        'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin1_u3ulw1.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin2_brvy0g.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin3_jrteip.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin4_zef1fn.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin5_nzap7h.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/undermyskin6_f97hki.jpg',
      ],
      badge: 'LIMITED',
      stock: 3,
      sizes: ['S', 'M', 'L'],
      sizesStock: { S: 1, M: 1, L: 1 }
    },
    {
      id: 'dstar-apnm-ls-02',
      name: 'BE A DEPREDATOR',
      drop: 'EL ANIMAL PRINT NUNCA MUERE',
      price: 350,
      description: 'Long sleeve del drop El Animal Print Nunca Muere. Pieza limitada DSTAR.',
      image: 'https://res.cloudinary.com/dflyysqln/image/upload/beadepredatordosvistas_wxwbp2.webp',
      gallery: [
        'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator1_btz8nt.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator2_oprlcc.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator3_cffy7u.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator4_h7oyhv.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator5_yyvzh9.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/beadepredator6_bwigtm.jpg',
      ],
      badge: null,
      stock: 2,
      sizes: ['M', 'L'],
      sizesStock: { M: 1, L: 1 }
    },
    {
      id: 'dstar-apnm-shirt-01',
      name: 'BENDECIDO',
      drop: 'EL ANIMAL PRINT NUNCA MUERE',
      price: 350,
      description: 'Long sleeve del drop El Animal Print Nunca Muere. Pieza limitada DSTAR.',
      image: 'https://res.cloudinary.com/dflyysqln/image/upload/bendecido_shkmci.webp',
      gallery: [
        'https://res.cloudinary.com/dflyysqln/image/upload/bendecido1_lollup.jpg',
        'https://res.cloudinary.com/dflyysqln/image/upload/bendecido2_f5b9gb.jpg',
      ],
      badge: 'LIMITED',
      stock: 3,
      sizes: ['S', 'M', 'L'],
      sizesStock: { S: 1, M: 1, L: 1 }
    }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = PRODUCTS;
  else root.DSTAR_PRODUCTS = PRODUCTS;
})(typeof self !== 'undefined' ? self : this);
