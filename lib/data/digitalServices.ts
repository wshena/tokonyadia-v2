export type DigitalServiceCategory = 'topup' | 'tagihan'

export type DigitalServiceField = {
  id: string
  label: string
  type: 'text' | 'select'
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  options?: string[]
}

export type DigitalNominalOption = {
  label: string
  value: string
  price: number
}

export type DigitalService = {
  id: string
  category: DigitalServiceCategory
  label: string
  description: string
  actionLabel: 'Beli' | 'Bayar'
  formTitle: string
  summaryLabel: string
  fields: DigitalServiceField[]
  nominalOptions: DigitalNominalOption[]
}

const nominal = (amounts: number[]) =>
  amounts.map((price) => ({
    label: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(price),
    value: String(price),
    price,
  }))

export const digitalServices: DigitalService[] = [
  {
    id: 'pulsa',
    category: 'topup',
    label: 'Pulsa',
    description: 'Isi pulsa semua operator dengan proses instan.',
    actionLabel: 'Beli',
    formTitle: 'Top up pulsa',
    summaryLabel: 'Nomor telepon',
    fields: [
      {
        id: 'phoneNumber',
        label: 'Nomor telepon',
        type: 'text',
        placeholder: '08xxxxxxxxxx',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([10000, 20000, 50000, 100000, 200000]),
  },
  {
    id: 'paket-data',
    category: 'topup',
    label: 'Paket Data',
    description: 'Pilihan kuota harian, mingguan, hingga bulanan.',
    actionLabel: 'Beli',
    formTitle: 'Beli paket data',
    summaryLabel: 'Nomor telepon',
    fields: [
      {
        id: 'phoneNumber',
        label: 'Nomor telepon',
        type: 'text',
        placeholder: '08xxxxxxxxxx',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([15000, 25000, 50000, 75000, 120000]),
  },
  {
    id: 'token-listrik',
    category: 'topup',
    label: 'Token Listrik',
    description: 'Beli token PLN prabayar dengan nominal favorit.',
    actionLabel: 'Beli',
    formTitle: 'Beli token listrik',
    summaryLabel: 'Nomor meter',
    fields: [
      {
        id: 'electricityType',
        label: 'Jenis produk listrik',
        type: 'select',
        options: ['Token PLN Prabayar', 'Token PLN Non Taglis'],
      },
      {
        id: 'meterNumber',
        label: 'Nomor meter / ID pelanggan',
        type: 'text',
        placeholder: 'Masukkan nomor meter atau ID pelanggan',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([20000, 50000, 100000, 200000, 500000]),
  },
  {
    id: 'e-wallet',
    category: 'topup',
    label: 'E-Wallet',
    description: 'Isi saldo dompet digital untuk transaksi harian.',
    actionLabel: 'Beli',
    formTitle: 'Top up e-wallet',
    summaryLabel: 'Nomor akun',
    fields: [
      {
        id: 'walletBrand',
        label: 'Jenis e-wallet',
        type: 'select',
        options: ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'],
      },
      {
        id: 'accountNumber',
        label: 'Nomor akun',
        type: 'text',
        placeholder: 'Masukkan nomor akun e-wallet',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([20000, 50000, 100000, 150000, 300000]),
  },
  {
    id: 'voucher-game',
    category: 'topup',
    label: 'Voucher Game',
    description: 'Diamond, UC, dan voucher game populer lainnya.',
    actionLabel: 'Beli',
    formTitle: 'Beli voucher game',
    summaryLabel: 'User ID',
    fields: [
      {
        id: 'gameTitle',
        label: 'Jenis game',
        type: 'select',
        options: ['Mobile Legends', 'Free Fire', 'PUBG Mobile', 'Honor of Kings'],
      },
      {
        id: 'gameUserId',
        label: 'User ID',
        type: 'text',
        placeholder: 'Masukkan user ID game',
      },
    ],
    nominalOptions: nominal([12000, 25000, 50000, 100000, 250000]),
  },
  {
    id: 'streaming',
    category: 'topup',
    label: 'Streaming',
    description: 'Perpanjang langganan hiburan favoritmu.',
    actionLabel: 'Beli',
    formTitle: 'Beli voucher streaming',
    summaryLabel: 'Email akun',
    fields: [
      {
        id: 'streamingBrand',
        label: 'Platform',
        type: 'select',
        options: ['Netflix', 'Vidio', 'Spotify', 'YouTube Premium', 'Disney+'],
      },
      {
        id: 'email',
        label: 'Email akun',
        type: 'text',
        placeholder: 'nama@email.com',
      },
    ],
    nominalOptions: nominal([29000, 54000, 74000, 119000, 186000]),
  },
  {
    id: 'voucher-belanja',
    category: 'topup',
    label: 'Voucher Belanja',
    description: 'Voucher digital untuk kebutuhan belanja online.',
    actionLabel: 'Beli',
    formTitle: 'Beli voucher belanja',
    summaryLabel: 'Email penerima',
    fields: [
      {
        id: 'merchant',
        label: 'Merchant',
        type: 'select',
        options: ['Tokopedia', 'Shopee', 'Blibli', 'Alfamart', 'Indomaret'],
      },
      {
        id: 'receiverEmail',
        label: 'Email penerima',
        type: 'text',
        placeholder: 'nama@email.com',
      },
    ],
    nominalOptions: nominal([25000, 50000, 100000, 200000, 500000]),
  },
  {
    id: 'saldo-transport',
    category: 'topup',
    label: 'Saldo Transport',
    description: 'Isi saldo kartu perjalanan dan mobilitas.',
    actionLabel: 'Beli',
    formTitle: 'Top up saldo transport',
    summaryLabel: 'Nomor kartu',
    fields: [
      {
        id: 'transportCard',
        label: 'Jenis kartu',
        type: 'select',
        options: ['Flazz', 'e-Money Mandiri', 'BRIZZI', 'TapCash'],
      },
      {
        id: 'cardNumber',
        label: 'Nomor kartu',
        type: 'text',
        placeholder: 'Masukkan nomor kartu',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([20000, 50000, 100000, 200000, 300000]),
  },
  {
    id: 'listrik-pascabayar',
    category: 'tagihan',
    label: 'Listrik',
    description: 'Bayar tagihan listrik pascabayar tanpa antre.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar tagihan listrik',
    summaryLabel: 'Nomor meter',
    fields: [
      {
        id: 'electricityType',
        label: 'Jenis produk listrik',
        type: 'select',
        options: ['PLN Pascabayar', 'PLN Bisnis', 'PLN Pascabayar Nontaglis'],
      },
      {
        id: 'meterNumber',
        label: 'Nomor meter / ID pelanggan',
        type: 'text',
        placeholder: 'Masukkan nomor meter atau ID pelanggan',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([50000, 100000, 200000, 350000, 500000]),
  },
  {
    id: 'pdam',
    category: 'tagihan',
    label: 'PDAM',
    description: 'Pembayaran air bulanan lebih praktis.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar tagihan PDAM',
    summaryLabel: 'Nomor pelanggan',
    fields: [
      {
        id: 'region',
        label: 'Wilayah PDAM',
        type: 'select',
        options: ['PDAM Jakarta', 'PDAM Surabaya', 'PDAM Bandung', 'PDAM Medan'],
      },
      {
        id: 'customerId',
        label: 'Nomor pelanggan',
        type: 'text',
        placeholder: 'Masukkan nomor pelanggan',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([50000, 75000, 100000, 150000, 250000]),
  },
  {
    id: 'internet',
    category: 'tagihan',
    label: 'Internet',
    description: 'Bayar internet rumah dan broadband bulanan.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar tagihan internet',
    summaryLabel: 'Nomor pelanggan',
    fields: [
      {
        id: 'provider',
        label: 'Provider internet',
        type: 'select',
        options: ['IndiHome', 'Biznet', 'MyRepublic', 'First Media', 'ICONNET'],
      },
      {
        id: 'customerId',
        label: 'Nomor pelanggan',
        type: 'text',
        placeholder: 'Masukkan nomor pelanggan',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([150000, 250000, 350000, 500000, 750000]),
  },
  {
    id: 'bpjs',
    category: 'tagihan',
    label: 'BPJS',
    description: 'Pembayaran iuran kesehatan untuk keluarga.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar tagihan BPJS',
    summaryLabel: 'Nomor virtual account',
    fields: [
      {
        id: 'serviceType',
        label: 'Jenis layanan',
        type: 'select',
        options: ['BPJS Kesehatan', 'BPJS Ketenagakerjaan'],
      },
      {
        id: 'vaNumber',
        label: 'Nomor virtual account',
        type: 'text',
        placeholder: 'Masukkan nomor virtual account',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([35000, 100000, 150000, 250000, 500000]),
  },
  {
    id: 'tv-kabel',
    category: 'tagihan',
    label: 'TV Kabel',
    description: 'Lunasi langganan TV kabel dan hiburan rumah.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar tagihan TV kabel',
    summaryLabel: 'Nomor pelanggan',
    fields: [
      {
        id: 'provider',
        label: 'Provider TV kabel',
        type: 'select',
        options: ['Transvision', 'MNC Vision', 'IndiHome TV', 'First Media TV'],
      },
      {
        id: 'customerId',
        label: 'Nomor pelanggan',
        type: 'text',
        placeholder: 'Masukkan nomor pelanggan',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([100000, 150000, 250000, 350000, 500000]),
  },
  {
    id: 'gas',
    category: 'tagihan',
    label: 'Gas',
    description: 'Bayar tagihan gas rumah tangga bulanan.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar tagihan gas',
    summaryLabel: 'ID pelanggan',
    fields: [
      {
        id: 'gasProvider',
        label: 'Penyedia gas',
        type: 'select',
        options: ['PGN', 'Gas Kota', 'Bright Gas'],
      },
      {
        id: 'customerId',
        label: 'ID pelanggan',
        type: 'text',
        placeholder: 'Masukkan ID pelanggan',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([50000, 100000, 200000, 300000, 500000]),
  },
  {
    id: 'pbb',
    category: 'tagihan',
    label: 'PBB',
    description: 'Pembayaran pajak bumi dan bangunan lebih cepat.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar PBB',
    summaryLabel: 'NOP',
    fields: [
      {
        id: 'city',
        label: 'Wilayah',
        type: 'select',
        options: ['DKI Jakarta', 'Bandung', 'Surabaya', 'Bekasi', 'Depok'],
      },
      {
        id: 'nop',
        label: 'Nomor objek pajak',
        type: 'text',
        placeholder: 'Masukkan NOP',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([100000, 250000, 500000, 750000, 1000000]),
  },
  {
    id: 'multifinance',
    category: 'tagihan',
    label: 'Multifinance',
    description: 'Cicilan kendaraan dan pembiayaan lain jadi mudah.',
    actionLabel: 'Bayar',
    formTitle: 'Bayar tagihan multifinance',
    summaryLabel: 'Nomor kontrak',
    fields: [
      {
        id: 'financeCompany',
        label: 'Perusahaan pembiayaan',
        type: 'select',
        options: ['Adira Finance', 'BAF', 'FIF', 'Mandiri Tunas Finance'],
      },
      {
        id: 'contractNumber',
        label: 'Nomor kontrak',
        type: 'text',
        placeholder: 'Masukkan nomor kontrak',
        inputMode: 'numeric',
      },
    ],
    nominalOptions: nominal([250000, 500000, 1000000, 1500000, 2500000]),
  },
]

export const getDigitalServicesByCategory = (category: DigitalServiceCategory) =>
  digitalServices.filter((service) => service.category === category)

export const getDigitalServiceById = (id: string) =>
  digitalServices.find((service) => service.id === id)
