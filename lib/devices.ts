export type DeviceId =
  | "megapackXL"
  | "megapack2"
  | "megapack"
  | "powerpack"
  | "transformer";

export interface Device {
  id: DeviceId;
  name: string;
  width: number;
  depth: number;
  energyCost: string;
  energyMWh: number;
  price: number;
  releaseDate: string;
}

export const DEVICES: Device[] = [
  {
    id: "megapackXL",
    name: "Megapack XL",
    width: 40,
    depth: 10,
    energyCost: "4 MWh",
    energyMWh: 4,
    price: 120000,
    releaseDate: "2022",
  },
  {
    id: "megapack2",
    name: "Megapack 2",
    width: 30,
    depth: 10,
    energyCost: "3 MWh",
    energyMWh: 3,
    price: 80000,
    releaseDate: "2021",
  },
  {
    id: "megapack",
    name: "Megapack",
    width: 30,
    depth: 10,
    energyCost: "2 MWh",
    energyMWh: 2,
    price: 50000,
    releaseDate: "2005",
  },
  {
    id: "powerpack",
    name: "Powerpack",
    width: 10,
    depth: 10,
    energyCost: "1 MWh",
    energyMWh: 1,
    price: 10000,
    releaseDate: "2000",
  },
  {
    id: "transformer",
    name: "Transformer",
    width: 10,
    depth: 10,
    energyCost: "-0.5 MWh",
    energyMWh: -0.5,
    price: 10000,
    releaseDate: "—",
  },
];
