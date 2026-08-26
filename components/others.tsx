const suffixs = [
  { label: "Jr", value: "Jr" },
  { label: "Sr", value: "Sr" },
  { label: "I", value: "I" },
  { label: "II", value: "II" },
  { label: "III", value: "III" },
  { label: "IV", value: "IV" },
  { label: "V", value: "V" },
  { label: "VI", value: "VI" },
  { label: "VII", value: "VII" },
  { label: "VIII", value: "VIII" },
  { label: "IX", value: "IX" },
  { label: "X", value: "X" },
];

const maritalStatuses = [
  { label: "Single", value: "Single" },
  { label: "Married", value: "Married" },
  { label: "Widowed", value: "Widowed" },
  { label: "Separated", value: "Separated" },
  { label: "Annulled", value: "Annulled" },
  { label: "Divorced", value: "Divorced" },
  { label: "Live-in", value: "Live-in" },
];

const religions = [
  { label: "Roman Catholic", value: "Roman Catholic" },
  { label: "Islam", value: "Islam" },
  { label: "Iglesia ni Cristo", value: "Iglesia ni Cristo" },
  {
    label: "Aglipayan (Philippine Independent Church)",
    value: "Aglipayan (Philippine Independent Church)",
  },
  {
    label: "Seventh-day Adventist",
    value: "Seventh-day Adventist",
  },
  { label: "Jehovah's Witnesses", value: "Jehovah's Witnesses" },
  {
    label: "Church of Jesus Christ of Latter-day Saints (LDS)",
    value: "Church of Jesus Christ of Latter-day Saints (LDS)",
  },
  {
    label: "United Church of Christ in the Philippines (UCCP)",
    value: "United Church of Christ in the Philippines (UCCP)",
  },
  { label: "United Methodist Church", value: "United Methodist Church" },
  { label: "Baptist", value: "Baptist" },
  { label: "Pentecostal", value: "Pentecostal" },
  { label: "Born Again Christian", value: "Born Again Christian" },
  { label: "Evangelical Christian", value: "Evangelical Christian" },
  {
    label: "Christian (Non-Denominational)",
    value: "Christian (Non-Denominational)",
  },
  { label: "Orthodox Christian", value: "Orthodox Christian" },
  { label: "Buddhism", value: "Buddhism" },
  { label: "Hinduism", value: "Hinduism" },
  { label: "Judaism", value: "Judaism" },
  { label: "Sikhism", value: "Sikhism" },
  {
    label: "Indigenous/Traditional Beliefs",
    value: "Indigenous/Traditional Beliefs",
  },
  { label: "No Religion", value: "No Religion" },
  { label: "Agnostic", value: "Agnostic" },
  { label: "Atheist", value: "Atheist" },
  { label: "Others", value: "Others" },
];

const address = {
  province: "Misamis Oriental",
  municipality: "Opol",
  barangays: [
    { label: "Awang", value: "Awang" },
    { label: "Bagocboc", value: "Bagocboc" },
    { label: "Barra", value: "Barra" },
    { label: "Bonbon", value: "Bonbon" },
    { label: "Cauyonan", value: "Cauyonan" },
    { label: "Igpit", value: "Igpit" },
    { label: "Limonda", value: "Limonda" },
    { label: "Luyong Bonbon", value: "Luyong Bonbon" },
    { label: "Malanang", value: "Malanang" },
    { label: "Nangcaon", value: "Nangcaon" },
    { label: "Patag", value: "Patag" },
    { label: "Poblacion", value: "Poblacion" },
    { label: "Taboc", value: "Taboc" },
    { label: "Tingalan", value: "Tingalan" },
  ],
  postal_code: "9016",
};

const idTypes = [
  {
    label: 'PhilID / National ID',
    value: 'PhilID / National ID'
  },
  {
    label: 'UMID Card',
    value: 'UMID Card'
  },
  {
    label: 'LTO Driver License',
    value: 'LTO Driver License'
  },
  {
    label: 'TIN Card',
    value: 'TIN Card'
  },
  {
    label: 'Other Valid ID',
    value: 'Other Valid ID'
  },
];

export { suffixs, maritalStatuses, religions, address, idTypes };
