const deals = [
  { id: 'TIQ-0019', product: 'Electronics - PCBs', origin: 'Shenzhen', dest: 'Mumbai', value: 320000, margin: 14.2, risk: 72, status: 'high', eta: 'Mar 4' },
  { id: 'TIQ-0020', product: 'Textile Machinery', origin: 'Stuttgart', dest: 'Surat', value: 185000, margin: 21.0, risk: 38, status: 'active', eta: 'Mar 8' },
  { id: 'TIQ-0021', product: 'Chemical Compounds', origin: 'Dubai', dest: 'Chennai', value: 94000, margin: 18.7, risk: 55, status: 'pending', eta: 'Feb 27' },
  { id: 'TIQ-0022', product: 'LED Components', origin: 'Guangzhou', dest: 'Delhi', value: 210000, margin: 16.3, risk: 65, status: 'pending', eta: 'Mar 12' },
  { id: 'TIQ-0023', product: 'Steel Coils', origin: 'Seoul', dest: 'Nhava Sheva', value: 440000, margin: 9.8, risk: 47, status: 'pending', eta: 'Mar 1' },
  { id: 'TIQ-0024', product: 'Auto Parts', origin: 'Tokyo', dest: 'Pune', value: 275000, margin: 22.4, risk: 31, status: 'active', eta: 'Mar 15' },
  { id: 'TIQ-0025', product: 'Pharma Raw Material', origin: 'Basel', dest: 'Hyderabad', value: 560000, margin: 28.1, risk: 44, status: 'active', eta: 'Mar 7' },
  { id: 'TIQ-0026', product: 'Solar Panels', origin: 'Suzhou', dest: 'Rajkot', value: 380000, margin: 11.5, risk: 79, status: 'high', eta: 'Mar 20' }
];

const fxPairs = [
  ['USD/INR', '83.47', '↓'],
  ['EUR/USD', '1.082', '↑'],
  ['USD/CNY', '7.241', '→'],
  ['GBP/USD', '1.267', '↑']
];

const riskFeed = [
  'New sanctions on electronics exporters announced',
  'Port of Nhava Sheva congestion: 3–5 day delays',
  'Brent crude up 2.3% — freight surcharge expected',
  'India GDP upgraded to 6.8% for FY25'
];

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function uniqueValues(key) {
  return [...new Set(deals.map((deal) => deal[key]))].sort();
}

function initFilters() {
  const countryFilter = document.getElementById('country-filter');
  const productFilter = document.getElementById('product-filter');

  uniqueValues('dest').forEach((dest) => {
    countryFilter.insertAdjacentHTML('beforeend', `<option value="${dest}">${dest}</option>`);
  });

  uniqueValues('product').forEach((product) => {
    productFilter.insertAdjacentHTML('beforeend', `<option value="${product}">${product}</option>`);
  });

  [countryFilter, productFilter, document.getElementById('risk-filter')].forEach((el) =>
    el.addEventListener('change', render)
  );
}

function riskClass(score) {
  if (score >= 71) return 'high';
  if (score >= 41) return 'medium';
  return 'low';
}

function statusLabel(status) {
  if (status === 'high') return 'HIGH';
  if (status === 'pending') return 'PENDING';
  return 'ACTIVE';
}

function filterDeals() {
  const country = document.getElementById('country-filter').value;
  const product = document.getElementById('product-filter').value;
  const risk = document.getElementById('risk-filter').value;

  return deals.filter((deal) => {
    const countryOk = country === 'all' || deal.dest === country;
    const productOk = product === 'all' || deal.product === product;
    const riskOk = risk === 'all' || riskClass(deal.risk) === risk;
    return countryOk && productOk && riskOk;
  });
}

function renderTable(filteredDeals) {
  const tbody = document.getElementById('deal-body');
  tbody.innerHTML = filteredDeals
    .map((deal) => `
      <tr>
        <td><strong>${deal.id}</strong></td>
        <td>${deal.product}</td>
        <td>${deal.origin} → ${deal.dest}</td>
        <td>${currency.format(deal.value)}</td>
        <td>${deal.margin.toFixed(1)}%</td>
        <td>${deal.risk}</td>
        <td><span class="badge status-${deal.status}">${statusLabel(deal.status)}</span></td>
        <td>${deal.eta}</td>
      </tr>
    `)
    .join('');
}

function updateKpis(filteredDeals) {
  const totalExposure = filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  const avgRisk = filteredDeals.reduce((sum, deal) => sum + deal.risk, 0) / (filteredDeals.length || 1);
  const avgMargin = filteredDeals.reduce((sum, deal) => sum + deal.margin, 0) / (filteredDeals.length || 1);
  const delayed = filteredDeals.filter((deal) => deal.status === 'high').length;

  document.getElementById('active-deals').textContent = filteredDeals.length;
  document.getElementById('active-deals-meta').textContent = `${Math.max(filteredDeals.length - 20, 0)} new this week`;
  document.getElementById('total-exposure').textContent = currency.format(totalExposure);
  document.getElementById('exposure-meta').textContent = 'FX variance +2.1%';
  document.getElementById('avg-risk').textContent = avgRisk.toFixed(0);
  document.getElementById('risk-meta').textContent = `${delayed} high-risk deals`; 
  document.getElementById('shipments').textContent = filteredDeals.length;
  document.getElementById('shipment-meta').textContent = `${delayed} potentially delayed`;
  document.getElementById('avg-margin').textContent = `${avgMargin.toFixed(1)}%`;
  document.getElementById('margin-meta').textContent = '↑ 1.2% vs last month';
}

function renderRail(filteredDeals) {
  document.getElementById('fx-list').innerHTML = fxPairs
    .map(([pair, value, move]) => `<li><strong>${pair}</strong> ${value} ${move}</li>`)
    .join('');

  document.getElementById('risk-feed').innerHTML = riskFeed
    .map((item) => `<li>${item}</li>`)
    .join('');

  const monthly = [
    ['M+1', filteredDeals.reduce((sum, deal) => sum + deal.value * 0.33, 0)],
    ['M+2', filteredDeals.reduce((sum, deal) => sum + deal.value * 0.37, 0)],
    ['M+3', filteredDeals.reduce((sum, deal) => sum + deal.value * 0.41, 0)]
  ];

  const max = Math.max(...monthly.map((m) => m[1]), 1);
  document.getElementById('forecast-bars').innerHTML = monthly
    .map(([label, value]) => {
      const pct = (value / max) * 100;
      return `<div class="bar-wrap"><span>${label}</span><div class="bar"><span style="width:${pct}%"></span></div><strong>${currency.format(value)}</strong></div>`;
    })
    .join('');
}

function tickClock() {
  const now = new Date();
  document.getElementById('utc-clock').textContent = `${now.toISOString().slice(11, 19)} UTC`;
}

function render() {
  const filteredDeals = filterDeals();
  renderTable(filteredDeals);
  updateKpis(filteredDeals);
  renderRail(filteredDeals);
}

initFilters();
render();
tickClock();
setInterval(tickClock, 1000);
