/**
 * Datos de los conductores. Bios condensadas a partir de la descripción que
 * cada uno comparte públicamente en su propio perfil de LinkedIn (fuente de
 * primera mano, provista directamente por los conductores), adaptadas a un
 * tono editorial breve para el sitio.
 */

export interface Host {
  slug: string;
  name: string;
  role: string;
  location: string;
  xHandle: string;
  xUrl: string;
  linkedinUrl: string;
  bio: string;
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
    bio: "FullStack developer y Web3 builder. Cofundó Buen Día Builders, un ecosistema que forma y acompaña a mujeres de Latinoamérica para pasar de aprender a programar a construir y liderar sus propios proyectos en Web3. Se mueve entre Solidity y Soroban/Stellar, mentorea en hackathons internacionales y participa en proyectos open source.",
  },
  {
    slug: "alberto",
    name: "Alberto",
    role: "Co-conductor",
    location: "Costa Rica",
    xHandle: "@TechRebelWorld",
    xUrl: "https://x.com/TechRebelWorld",
    linkedinUrl: "https://www.linkedin.com/in/alberto-chaves-escrowking/",
    bio: "Product leader y fundador de TechRebel. Es CEO de Trustless Work, donde construye soluciones de escrow modulares para Web3, y Web3 scout en Draper University, mentoreando founders en etapa temprana. Formado originalmente en ingeniería biomédica, hoy conecta blockchain con casos de uso del mundo real desde Costa Rica.",
  },
];
