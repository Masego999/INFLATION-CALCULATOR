// ============================================
//  Inflation Calculator — JavaScript Logic
//  BSc Computer Science & Mathematics
//  TreasuryONE Graduate Intern Portfolio Project
//
//  Formula: FV = PV × (1 + r)^n
//    FV = Future Value (inflation-adjusted)
//    PV = Present Value (original amount)
//    r  = Annual inflation rate (decimal)
//    n  = Number of years
// ============================================

let chartInstance = null;

/**
 * Main calculation function.
 * Reads inputs, computes inflation-adjusted values,
 * renders the result card, chart, and breakdown table.
 */
function calculate() {
  // ── Read inputs ──────────────────────────────
  const PV        = parseFloat(document.getElementById('amount').value);
  const startYear = parseInt(document.getElementById('startYear').value);
  const endYear   = parseInt(document.getElementById('endYear').value);
  const rate      = parseFloat(document.getElementById('rate').value) / 100;

  // ── Validate ─────────────────────────────────
  if (isNaN(PV) || isNaN(startYear) || isNaN(endYear) || isNaN(rate)) {
    alert('Please fill in all fields correctly.');
    return;
  }
  if (endYear <= startYear) {
    alert('End year must be greater than start year.');
    return;
  }

  // ── Core calculation: compound inflation ─────
  const n       = endYear - startYear;
  const FV      = PV * Math.pow(1 + rate, n);       // Future Value
  const loss    = FV - PV;                            // Total monetary increase
  const pctLoss = ((FV - PV) / PV) * 100;            // % cumulative inflation

  // ── Update summary cards ─────────────────────
  document.getElementById('res-original').textContent  = formatZAR(PV);
  document.getElementById('res-adjusted').textContent  = formatZAR(FV);
  document.getElementById('res-loss').textContent      = formatZAR(loss);
  document.getElementById('res-year-start').textContent = 'in ' + startYear;
  document.getElementById('res-year-end').textContent   = 'in ' + endYear + ' terms';
  document.getElementById('res-pct').textContent        = '+' + pctLoss.toFixed(1) + '% cumulative inflation';

  // ── Build year-by-year data arrays ───────────
  const labels       = [];
  const values       = [];
  const cumInflation = [];

  for (let i = 0; i <= n; i++) {
    const v = PV * Math.pow(1 + rate, i);
    labels.push(startYear + i);
    values.push(parseFloat(v.toFixed(2)));
    cumInflation.push(parseFloat(((v - PV) / PV * 100).toFixed(1)));
  }

  // ── Render chart ─────────────────────────────
  renderChart(labels, values, n);

  // ── Render breakdown table ───────────────────
  renderTable(values, cumInflation, startYear, n, PV);

  // ── Show result card ─────────────────────────
  const resultCard = document.getElementById('resultCard');
  resultCard.classList.add('visible');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Renders the Chart.js line chart inside #myChart.
 * Destroys any existing chart instance before creating a new one.
 *
 * @param {number[]} labels - Year labels for x-axis
 * @param {number[]} values - Inflation-adjusted values for y-axis
 * @param {number}   n      - Number of years (used to control point radius)
 */
function renderChart(labels, values, n) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = document.getElementById('myChart').getContext('2d');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Equivalent Value (R)',
          data: values,
          borderColor: '#e8c97e',
          backgroundColor: 'rgba(232, 201, 126, 0.08)',
          borderWidth: 2,
          pointRadius: n > 30 ? 0 : 3,
          pointBackgroundColor: '#e8c97e',
          tension: 0.4,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111',
          titleColor: '#fff',
          bodyColor: '#aaa',
          callbacks: {
            label: ctx => ' R ' + ctx.raw.toLocaleString('en-ZA', { minimumFractionDigits: 2 })
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#666', font: { size: 11 }, maxTicksLimit: 10 }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#666',
            font: { size: 11 },
            callback: v => 'R ' + v.toLocaleString('en-ZA')
          }
        }
      }
    }
  });
}

/**
 * Renders the year-by-year breakdown table into #breakdown-body.
 * Shows every year for short ranges, every 5 years for longer ones.
 *
 * @param {number[]} values       - Inflation-adjusted values per year
 * @param {number[]} cumInflation - Cumulative inflation % per year
 * @param {number}   startYear    - Starting year
 * @param {number}   n            - Total number of years
 * @param {number}   PV           - Original present value
 */
function renderTable(values, cumInflation, startYear, n, PV) {
  const tbody = document.getElementById('breakdown-body');
  tbody.innerHTML = '';

  const step = n > 20 ? 5 : 1;

  for (let i = 0; i <= n; i += step) {
    const year     = startYear + i;
    const val      = values[i];
    const inf      = cumInflation[i];
    const realLoss = val - PV;

    tbody.innerHTML += `
      <tr>
        <td>${year}</td>
        <td>${formatZAR(val)}</td>
        <td class="gain">+${inf.toFixed(1)}%</td>
        <td>${formatZAR(realLoss)}</td>
      </tr>`;
  }
}

/**
 * Formats a number as South African Rand (ZAR).
 * Example: 1234.56 → "R 1 234.56"
 *
 * @param   {number} amount
 * @returns {string}
 */
function formatZAR(amount) {
  return 'R ' + amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ── Run on page load with default values ──────
window.onload = () => calculate();