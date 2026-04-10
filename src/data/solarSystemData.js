const solarSystemData = {
  Sun: {
    type: "Star",
    diameter: "1,392,700 km",
    mass: "1.989 × 10³⁰ kg",
    distanceFromSun: "—",
    orbitalPeriod: "~25 days (equatorial)",
    moons: "—",
    surfaceTemp: "5,500°C",
    description:
      "The Sun accounts for 99.86% of the Solar System's total mass. Its core reaches 15 million°C, fusing hydrogen into helium and radiating the energy that powers all life on Earth.",
  },
  Mercury: {
    type: "Terrestrial Planet",
    diameter: "4,879 km",
    mass: "3.285 × 10²³ kg",
    distanceFromSun: "0.39 AU",
    orbitalPeriod: "88 Earth days",
    moons: "0",
    surfaceTemp: "−180°C to 430°C",
    description:
      "The smallest planet and closest to the Sun. A day on Mercury lasts 59 Earth days. Despite proximity, Venus is hotter due to its thick atmosphere trapping heat.",
  },
  Venus: {
    type: "Terrestrial Planet",
    diameter: "12,104 km",
    mass: "4.867 × 10²⁴ kg",
    distanceFromSun: "0.72 AU",
    orbitalPeriod: "225 Earth days",
    moons: "0",
    surfaceTemp: "465°C",
    description:
      "A runaway greenhouse effect heats Venus to 465°C — hotter than Mercury. It rotates retrograde and so slowly that a Venusian day is longer than its year.",
  },
  Earth: {
    type: "Terrestrial Planet",
    diameter: "12,756 km",
    mass: "5.972 × 10²⁴ kg",
    distanceFromSun: "1.00 AU",
    orbitalPeriod: "365.25 days",
    moons: "1",
    surfaceTemp: "−88°C to 58°C",
    description:
      "Our home — the only known world to harbor life. 71% of Earth's surface is liquid water. Its magnetic field and ozone layer shield life from cosmic and solar radiation.",
  },
  Mars: {
    type: "Terrestrial Planet",
    diameter: "6,779 km",
    mass: "6.39 × 10²³ kg",
    distanceFromSun: "1.52 AU",
    orbitalPeriod: "687 Earth days",
    moons: "2",
    surfaceTemp: "−153°C to 20°C",
    description:
      "The Red Planet hosts Olympus Mons, the largest volcano in the Solar System at 22 km tall. Ancient river beds and lake basins suggest Mars once harbored liquid water.",
  },
  Jupiter: {
    type: "Gas Giant",
    diameter: "142,984 km",
    mass: "1.898 × 10²⁷ kg",
    distanceFromSun: "5.20 AU",
    orbitalPeriod: "11.86 Earth years",
    moons: "95",
    surfaceTemp: "−108°C",
    description:
      "The largest planet — 1,300 Earths could fit inside it. The Great Red Spot is a storm larger than Earth, raging for over 350 years. Jupiter's gravity acts as a cosmic shield.",
  },
  Saturn: {
    type: "Gas Giant",
    diameter: "120,536 km",
    mass: "5.683 × 10²⁶ kg",
    distanceFromSun: "9.58 AU",
    orbitalPeriod: "29.46 Earth years",
    moons: "146",
    surfaceTemp: "−138°C",
    description:
      "Its spectacular rings are made of ice and rock ranging from microscopic to house-sized particles. Saturn is so low in density it would float on water if an ocean large enough existed.",
  },
  Uranus: {
    type: "Ice Giant",
    diameter: "51,118 km",
    mass: "8.681 × 10²⁵ kg",
    distanceFromSun: "19.18 AU",
    orbitalPeriod: "84 Earth years",
    moons: "27",
    surfaceTemp: "−224°C",
    description:
      "Uranus rotates on its side with an axial tilt of 97.7°, meaning its poles receive more sunlight than its equator. It holds the record for the coldest planetary atmosphere.",
  },
  Neptune: {
    type: "Ice Giant",
    diameter: "49,528 km",
    mass: "1.024 × 10²⁶ kg",
    distanceFromSun: "30.07 AU",
    orbitalPeriod: "164.8 Earth years",
    moons: "16",
    surfaceTemp: "−214°C",
    description:
      "The windiest planet — supersonic storms reach 2,100 km/h. Neptune was predicted mathematically before observation. One year on Neptune lasts nearly 165 Earth years.",
  },
  Pluto: {
    type: "Dwarf Planet",
    diameter: "2,376 km",
    mass: "1.309 × 10²² kg",
    distanceFromSun: "39.48 AU",
    orbitalPeriod: "248 Earth years",
    moons: "5",
    surfaceTemp: "−233°C",
    description:
      "Reclassified as a dwarf planet in 2006. NASA's New Horizons revealed a heart-shaped nitrogen ice plain called Tombaugh Regio. Charon is so large relative to Pluto they form a binary system.",
  },
  Moon: {
    type: "Natural Satellite",
    diameter: "3,474 km",
    mass: "7.342 × 10²² kg",
    distanceFromSun: "1.00 AU",
    orbitalPeriod: "27.3 days (around Earth)",
    moons: "0",
    surfaceTemp: "−173°C to 127°C",
    description:
      "Earth's only natural satellite, tidally locked so we always see the same face. The Moon stabilizes Earth's axial tilt and drives ocean tides through gravitational interaction.",
  },
  "Asteroid Belt": {
    type: "Asteroid Belt",
    diameter: "Ceres: 939 km (largest)",
    mass: "~4% of Moon's mass (total)",
    distanceFromSun: "2.2 – 3.2 AU",
    orbitalPeriod: "3 – 6 Earth years",
    moons: "—",
    surfaceTemp: "−73°C (avg)",
    description:
      "A vast ring of rocky remnants between Mars and Jupiter that never coalesced into a planet due to Jupiter's gravity. It contains over a million objects larger than 1 km, yet its total mass is less than 4% of our Moon.",
  },
  "Saturn's Rings": {
    type: "Ring System",
    diameter: "~270,000 km (outer edge)",
    mass: "~1.54 × 10¹⁹ kg",
    distanceFromSun: "9.58 AU",
    orbitalPeriod: "—",
    moons: "—",
    surfaceTemp: "−180°C",
    description:
      "Saturn's iconic ring system spans 270,000 km yet is strikingly thin — often less than 1 km thick. Composed mostly of water-ice particles and rocky debris, the rings are estimated to be only 10–100 million years old, a cosmic blink of an eye.",
  },
};

export default solarSystemData;
