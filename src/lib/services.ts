export type Service = {
  slug: string;
  title: string;
  description: string;
  image: string;
};

export const services: Service[] = [
  {
    slug: "audio-jack-repair",
    title: "Audio Jack Repair",
    description:
      "Fix faulty or non-working headphone jacks to restore proper audio connectivity.",
    image: "/services/audio-jack-repair.jpg",
  },
  {
    slug: "audio-systems-repair",
    title: "Audio Systems Repair",
    description:
      "Fix distorted sound, no audio, or speaker issues in amplifiers and sound systems with expert diagnostics and repair.",
    image: "/services/audio-systems-repair.png",
  },
  {
    slug: "battery-replacement",
    title: "Battery Replacement",
    description:
      "Replace worn-out batteries in phones, laptops, and tablets to restore long-lasting performance and reliability.",
    image: "/services/battery-replacement.png",
  },
  {
    slug: "charging-port-repair",
    title: "Charging Port Repair",
    description:
      "Resolve charging issues caused by loose or damaged ports with precise repair or replacement services.",
    image: "/services/charging-port-repair.png",
  },
  {
    slug: "earphones-headphones-repair",
    title: "Earphones / Headphones Repair",
    description:
      "Repair sound imbalance, wiring issues, or broken components in your earphones and headphones.",
    image: "/services/earphones-headphones-repair.png",
  },
  {
    slug: "firmware-updates-flashing",
    title: "Firmware Updates & Flashing",
    description:
      "Upgrade or reinstall device firmware to fix bugs, improve performance, and restore system stability.",
    image: "/services/firmware-updates-flashing.png",
  },
  {
    slug: "hardware-troubleshooting",
    title: "Hardware Troubleshooting",
    description:
      "Identify and fix internal hardware faults with accurate diagnostics and efficient repair solutions.",
    image: "/services/hardware-troubleshooting.png",
  },
  {
    slug: "iphone-repair",
    title: "iPhone Repair",
    description:
      "Specialized repair for iPhones including screen, battery, Face ID, and other hardware issues.",
    image: "/services/iphone-repair.png",
  },
  {
    slug: "keyboard-replacement",
    title: "Keyboard Replacement",
    description:
      "Replace damaged or non-functional laptop keyboards for smooth and accurate typing.",
    image: "/services/keyboard-replacement.png",
  },
  {
    slug: "motherboard-repair",
    title: "Motherboard Repair",
    description:
      "Advanced micro-soldering repair for motherboard-level issues to revive dead or malfunctioning devices.",
    image: "/services/motherboard-repair.png",
  },
  {
    slug: "power-button-power-ic-repair",
    title: "Power Button & Power IC Repair",
    description:
      "Repair unresponsive power buttons and power IC issues to restore proper device startup and function.",
    image: "/services/power-button-power-ic-repair.png",
  },
  {
    slug: "quick-diagnostics-service",
    title: "Quick Diagnostics Service",
    description:
      "Fast and accurate device check-up to identify problems and recommend the best repair solution.",
    image: "/services/quick-diagnostics-service.png",
  },
  {
    slug: "software-installation-virus-removal",
    title: "Software Installation & Virus Removal",
    description:
      "Install operating systems, remove viruses, and optimize software for better speed and security.",
    image: "/services/software-installation-virus-removal.png",
  },
  {
    slug: "tablet-repair",
    title: "Tablet Repair",
    description:
      "Repair screens, batteries, charging ports, and software issues for all major tablet brands.",
    image: "/services/tablet-repair.png",
  },
  {
    slug: "usb-port-repair",
    title: "USB Port Repair",
    description:
      "Fix broken or loose USB ports to restore proper data transfer and charging functionality.",
    image: "/services/usb-port-repair.png",
  },
  {
    slug: "video-graphics-ic-repair",
    title: "Video / Graphics IC Repair",
    description:
      "Resolve display issues caused by GPU or graphics IC faults with expert-level repair.",
    image: "/services/video-graphics-ic-repair.png",
  },
  {
    slug: "water-damage-repair",
    title: "Water Damage Repair",
    description:
      "Deep cleaning and component repair to recover devices affected by liquid damage.",
    image: "/services/water-damage-repair.jpg",
  },
  {
    slug: "youtube-smart-device-setup",
    title: "YouTube / Smart Device Setup",
    description:
      "Set up YouTube, smart TVs, and connected devices for seamless streaming and smart functionality.",
    image: "/services/youtube-smart-device-setup.png",
  },
  {
    slug: "zif-connector-repair",
    title: "ZIF Connector Repair",
    description:
      "Repair delicate flex cable connectors to restore display, touch, or internal component connections.",
    image: "/services/zif-connector-repair.png",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
