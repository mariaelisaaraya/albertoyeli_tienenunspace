/**
 * Datos de los conductores. Bios condensadas a partir de la descripción que
 * cada uno comparte públicamente en su propio perfil de LinkedIn (fuente de
 * primera mano, provista directamente por los conductores), adaptadas a un
 * tono editorial para el sitio.
 */

export interface Host {
  slug: string;
  name: string;
  role: string;
  location: string;
  xHandle: string;
  xUrl: string;
  linkedinUrl: string;
  portrait: string;
  /** Una línea, para la vista compacta (home). */
  shortBio: string;
  /** Párrafos para la página individual del conductor. */
  fullBio: string[];
}

export const hosts: Host[] = [
  {
    slug: "eli",
    name: "Eli",
    role: "Co-conductora",
    location: "Argentina",
    xHandle: "@ar3lisa",
    xUrl: "https://x.com/ar3lisa",
    linkedinUrl: "https://www.linkedin.com/in/arayamariaelisa/",
    portrait: "/images/eli-portrait.png",
    shortBio:
      "FullStack developer y Web3 builder. Fundadora de Buen Día Builders, un ecosistema que forma y acompaña a mujeres de Latinoamérica en Web3. Cofundadora de Lendara, infraestructura para Stellar.",
    fullBio: [
      "FullStack developer y Web3 builder. Fundó Buen Día Builders, un ecosistema que forma y acompaña a mujeres de Latinoamérica para pasar de aprender a programar a construir y liderar sus propios proyectos en Web3. Es cofundadora de Lendara, infraestructura para Stellar.",
      "Se mueve entre Solidity y Soroban/Stellar: desarrolla y testea contratos inteligentes, mentorea en hackathons internacionales (ganó varias junto a distintos equipos) y participa en proyectos open source.",
      "Da clases y guía a nuevas desarrolladoras: fue tutora de programación backend (Node.js, diseño de APIs, bases de datos) y gestionó la parte académica de un programa full stack. También escribe contenido educativo sobre blockchain y Web3.",
    ],
  },
  {
    slug: "alberto",
    name: "Alberto",
    role: "Co-conductor",
    location: "Costa Rica",
    xHandle: "@TechRebelWorld",
    xUrl: "https://x.com/TechRebelWorld",
    linkedinUrl: "https://www.linkedin.com/in/alberto-chaves-escrowking/",
    portrait: "/images/alberto-portrait.png",
    shortBio:
      "Product leader y fundador de TechRebel. CEO de Trustless Work, construyendo escrow modular para Web3, y Web3 scout en Draper University.",
    fullBio: [
      "Product leader y fundador de TechRebel. Es CEO de Trustless Work, donde lidera el desarrollo de soluciones de escrow modulares y transparentes para Web3, pensadas para abstraer la complejidad de los contratos inteligentes en casos como crowdfunding, marketplaces y pagos cross-border.",
      "Es Web3 scout en Draper University, mentoreando founders en etapa temprana para refinar sus ideas y encontrar tracción. Formado originalmente en ingeniería biomédica, llegó a la tecnología inspirado por el trabajo remoto y el impacto global.",
      "Además de sus proyectos propios, se desempeña como Delivery Manager en una empresa Fortune 500, liderando equipos multifuncionales. Pura vida desde Costa Rica.",
    ],
  },
];
