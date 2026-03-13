export type DeviceId =
  | "megapackXL"
  | "megapack2"
  | "megapack"
  | "powerpack"
  | "transformer";

export interface Device {
  id: DeviceId;
  name: string;
  floor: string;
  dimension: string;
  energyCost: string;
  energyMWh: number;
  price: number;
  releaseDate: string;
}

export const DEVICES: Device[] = [
  {
    id: "megapackXL",
    name: "Megapack XL",
    floor: "40FT",
    dimension: "40FT x 10FT",
    energyCost: "4 MWh",
    energyMWh: 4,
    price: 120000,
    releaseDate: "2022",
  },
  {
    id: "megapack2",
    name: "Megapack 2",
    floor: "30FT",
    dimension: "30FT x 10FT",
    energyCost: "3 MWh",
    energyMWh: 3,
    price: 80000,
    releaseDate: "2021",
  },
  {
    id: "megapack",
    name: "Megapack",
    floor: "30FT",
    dimension: "30FT x 10FT",
    energyCost: "2 MWh",
    energyMWh: 2,
    price: 50000,
    releaseDate: "2005",
  },
  {
    id: "powerpack",
    name: "Powerpack",
    floor: "10FT",
    dimension: "10FT x 10FT",
    energyCost: "1 MWh",
    energyMWh: 1,
    price: 10000,
    releaseDate: "2000",
  },
  {
    id: "transformer",
    name: "Transformer",
    floor: "10FT",
    dimension: "10FT x 10FT",
    energyCost: "-0.5 MWh",
    energyMWh: -0.5,
    price: 10000,
    releaseDate: "—",
  },
];
