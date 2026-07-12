// ─────────────────────────────────────────────────────────────────────────────
// TransitOps — PDF Export Utility
// Uses jsPDF + jspdf-autotable to generate branded, consistent PDFs.
// ─────────────────────────────────────────────────────────────────────────────

// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

// Brand colours
const AMBER  = [245, 158, 11]  as [number, number, number];
const NAVY   = [15,  23,  42]  as [number, number, number];
const WHITE  = [255, 255, 255] as [number, number, number];
const GRAY   = [100, 116, 139] as [number, number, number];
const DARK   = [30,  41,  59]  as [number, number, number];


export interface PdfColumn {
  header: string;
  dataKey: string;
}

export interface PdfOptions {
  title: string;
  subtitle?: string;
  filename?: string;
}

/**
 * Create a branded jsPDF doc, draw the header, and return the doc + startY.
 */
const createDoc = (options: PdfOptions): { doc: any; startY: number } => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── Header background strip ────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 28, 'F');

  // Amber accent line
  doc.setFillColor(...AMBER);
  doc.rect(0, 28, W, 1.5, 'F');

  // Logo square
  doc.setFillColor(...AMBER);
  doc.roundedRect(10, 6, 14, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('TO', 17, 15, { align: 'center' });

  // App name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text('TransitOps', 27, 13);

  // Sub-brand
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('Smart Transport Operations Platform', 27, 19);

  // Report title (right-aligned)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text(options.title, W - 10, 13, { align: 'right' });

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...AMBER);
    doc.text(options.subtitle, W - 10, 20, { align: 'right' });
  }

  // Timestamp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  doc.text(`Generated: ${now}`, W - 10, 25.5, { align: 'right' });

  return { doc, startY: 35 };
};

/**
 * Add a page footer with page numbers.
 */
const addFooters = (doc: any) => {
  const pageCount = doc.internal.getNumberOfPages();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...NAVY);
    doc.rect(0, H - 8, W, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text('TransitOps — Confidential', 10, H - 2.5);
    doc.text(`Page ${i} of ${pageCount}`, W - 10, H - 2.5, { align: 'right' });
  }
};

/**
 * Standard table style applied to every autoTable call.
 */
const tableStyles = {
  headStyles: {
    fillColor: DARK,
    textColor: AMBER,
    fontStyle: 'bold' as const,
    fontSize: 8,
    halign: 'left' as const,
  },
  alternateRowStyles: { fillColor: [22, 33, 55] as [number, number, number] },
  bodyStyles: {
    fillColor: [15, 23, 42] as [number, number, number],
    textColor: [203, 213, 225] as [number, number, number],
    fontSize: 8,
    cellPadding: 3,
  },
  styles: { overflow: 'linebreak' as const, cellWidth: 'wrap' as const },
  margin: { left: 10, right: 10 },
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * exportTablePDF — generic table export
 * @param columns  - array of { header, dataKey }
 * @param rows     - array of plain objects
 * @param options  - title, subtitle, filename
 */
export const exportTablePDF = (
  columns: PdfColumn[],
  rows: Record<string, any>[],
  options: PdfOptions
) => {
  const { doc, startY } = createDoc(options);
  autoTable(doc, {
    columns,
    body: rows,
    startY,
    ...tableStyles,
  });
  addFooters(doc);
  doc.save(`${options.filename ?? options.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * exportTrips — pre-formatted trips export
 */
export const exportTripsPDF = (trips: any[]) => {
  const rows = trips.map(t => ({
    code:        t.tripCode ?? '—',
    origin:      t.origin ?? '—',
    destination: t.destination ?? '—',
    driver:      t.driver?.name ?? '—',
    vehicle:     t.vehicle?.regNumber ?? '—',
    cargo:       t.cargoWeight != null ? `${t.cargoWeight} kg` : '—',
    distance:    t.distanceKm != null ? `${t.distanceKm} km` : '—',
    status:      t.status ?? '—',
    scheduled:   t.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString('en-IN') : '—',
    completed:   t.completedAt ? new Date(t.completedAt).toLocaleDateString('en-IN') : '—',
  }));
  exportTablePDF(
    [
      { header: 'Trip Code',   dataKey: 'code' },
      { header: 'Origin',      dataKey: 'origin' },
      { header: 'Destination', dataKey: 'destination' },
      { header: 'Driver',      dataKey: 'driver' },
      { header: 'Vehicle',     dataKey: 'vehicle' },
      { header: 'Cargo',       dataKey: 'cargo' },
      { header: 'Distance',    dataKey: 'distance' },
      { header: 'Status',      dataKey: 'status' },
      { header: 'Scheduled',   dataKey: 'scheduled' },
      { header: 'Completed',   dataKey: 'completed' },
    ],
    rows,
    { title: 'Trips Report', subtitle: `${rows.length} trips`, filename: 'trips_report' }
  );
};

/**
 * exportVehiclesPDF
 */
export const exportVehiclesPDF = (vehicles: any[]) => {
  const rows = vehicles.map(v => ({
    reg:      v.regNumber ?? '—',
    name:     v.name ?? '—',
    type:     v.type ?? '—',
    status:   v.status ?? '—',
    capacity: v.capacityKg != null ? `${v.capacityKg} kg` : '—',
    odometer: v.odometer != null ? `${v.odometer.toLocaleString('en-IN')} km` : '—',
    year:     v.year ?? '—',
    region:   v.region ?? '—',
  }));
  exportTablePDF(
    [
      { header: 'Reg Number', dataKey: 'reg' },
      { header: 'Name',       dataKey: 'name' },
      { header: 'Type',       dataKey: 'type' },
      { header: 'Status',     dataKey: 'status' },
      { header: 'Capacity',   dataKey: 'capacity' },
      { header: 'Odometer',   dataKey: 'odometer' },
      { header: 'Year',       dataKey: 'year' },
      { header: 'Region',     dataKey: 'region' },
    ],
    rows,
    { title: 'Fleet Report', subtitle: `${rows.length} vehicles`, filename: 'fleet_report' }
  );
};

/**
 * exportDriversPDF
 */
export const exportDriversPDF = (drivers: any[]) => {
  const rows = drivers.map(d => ({
    name:     d.name ?? '—',
    license:  d.licenseNumber ?? '—',
    category: d.licenseCategory ?? '—',
    expiry:   d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString('en-IN') : '—',
    phone:    d.phone ?? '—',
    status:   d.status ?? '—',
    safety:   d.safetyScore != null ? `${d.safetyScore}/100` : '—',
    trips:    d.totalTrips ?? 0,
    region:   d.region ?? '—',
  }));
  exportTablePDF(
    [
      { header: 'Name',             dataKey: 'name' },
      { header: 'License No.',      dataKey: 'license' },
      { header: 'Category',         dataKey: 'category' },
      { header: 'License Expiry',   dataKey: 'expiry' },
      { header: 'Phone',            dataKey: 'phone' },
      { header: 'Status',           dataKey: 'status' },
      { header: 'Safety Score',     dataKey: 'safety' },
      { header: 'Total Trips',      dataKey: 'trips' },
      { header: 'Region',           dataKey: 'region' },
    ],
    rows,
    { title: 'Drivers Report', subtitle: `${rows.length} drivers`, filename: 'drivers_report' }
  );
};

/**
 * exportMaintenancePDF
 */
export const exportMaintenancePDF = (logs: any[]) => {
  const rows = logs.map(m => ({
    vehicle:    m.vehicle?.regNumber ?? m.vehicleId ?? '—',
    type:       m.type ?? '—',
    vendor:     m.vendor ?? '—',
    cost:       m.cost != null ? `₹${Number(m.cost).toLocaleString('en-IN')}` : '—',
    odometer:   m.odometer != null ? `${Number(m.odometer).toLocaleString('en-IN')} km` : '—',
    status:     m.status ?? '—',
    servicedAt: m.servicedAt ? new Date(m.servicedAt).toLocaleDateString('en-IN') : '—',
    nextService: m.nextServiceAt ? new Date(m.nextServiceAt).toLocaleDateString('en-IN') : '—',
    notes:      m.description ?? '—',
  }));
  exportTablePDF(
    [
      { header: 'Vehicle',      dataKey: 'vehicle' },
      { header: 'Type',         dataKey: 'type' },
      { header: 'Vendor',       dataKey: 'vendor' },
      { header: 'Cost',         dataKey: 'cost' },
      { header: 'Odometer',     dataKey: 'odometer' },
      { header: 'Status',       dataKey: 'status' },
      { header: 'Serviced At',  dataKey: 'servicedAt' },
      { header: 'Next Service', dataKey: 'nextService' },
      { header: 'Notes',        dataKey: 'notes' },
    ],
    rows,
    { title: 'Maintenance Report', subtitle: `${rows.length} records`, filename: 'maintenance_report' }
  );
};

/**
 * exportFuelPDF
 */
export const exportFuelPDF = (logs: any[]) => {
  const rows = logs.map(f => ({
    vehicle:  f.vehicle?.regNumber ?? f.vehicleId ?? '—',
    litres:   f.litres != null ? `${Number(f.litres).toFixed(2)} L` : '—',
    price:    f.pricePerLtr != null ? `₹${Number(f.pricePerLtr).toFixed(2)}/L` : '—',
    total:    f.totalCost != null ? `₹${Number(f.totalCost).toLocaleString('en-IN')}` : '—',
    odometer: f.odometer != null ? `${Number(f.odometer).toLocaleString('en-IN')} km` : '—',
    filledAt: f.filledAt ? new Date(f.filledAt).toLocaleDateString('en-IN') : '—',
  }));
  exportTablePDF(
    [
      { header: 'Vehicle',     dataKey: 'vehicle' },
      { header: 'Litres',      dataKey: 'litres' },
      { header: 'Price/Litre', dataKey: 'price' },
      { header: 'Total Cost',  dataKey: 'total' },
      { header: 'Odometer',    dataKey: 'odometer' },
      { header: 'Filled At',   dataKey: 'filledAt' },
    ],
    rows,
    { title: 'Fuel Log Report', subtitle: `${rows.length} entries`, filename: 'fuel_report' }
  );
};

/**
 * exportAnalyticsPDF — for the Reports/Analytics page
 */
export const exportAnalyticsPDF = (
  roiData: { fleetAvgRoi: number; vehicles: any[] },
  costData: any[],
  efficiencyData: { avgEfficiency: number; totalDistance: number; totalLitres: number },
  utilizationData: { fleetUtilizationPct: number }
) => {
  const { doc, startY } = createDoc({
    title: 'Analytics Report',
    subtitle: 'ROI · Cost · Efficiency',
    filename: 'analytics_report',
  });
  const W = doc.internal.pageSize.getWidth();

  // Summary KPI row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...AMBER);
  doc.text('KEY METRICS', 10, startY + 2);

  const kpis = [
    { label: 'Fleet Avg ROI', value: `${roiData.fleetAvgRoi}%` },
    { label: 'Fleet Utilization', value: `${utilizationData.fleetUtilizationPct}%` },
    { label: 'Avg Fuel Efficiency', value: `${efficiencyData.avgEfficiency} km/L` },
    { label: 'Total Distance', value: `${Number(efficiencyData.totalDistance).toLocaleString('en-IN')} km` },
  ];
  const boxW = (W - 20) / kpis.length;
  kpis.forEach((k, i) => {
    const x = 10 + i * boxW;
    doc.setFillColor(...DARK);
    doc.roundedRect(x + 1, startY + 6, boxW - 2, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text(k.value, x + boxW / 2, startY + 17, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(k.label, x + boxW / 2, startY + 22, { align: 'center' });
  });

  // ROI Table
  const roiRows = roiData.vehicles.map(v => ({
    vehicle:     `${v.name} (${v.regNumber})`,
    revenue:     `₹${Number(v.revenue).toLocaleString('en-IN')}`,
    fuelCost:    `₹${Number(v.fuelCost).toLocaleString('en-IN')}`,
    maintCost:   `₹${Number(v.maintenanceCost).toLocaleString('en-IN')}`,
    totalCost:   `₹${(Number(v.fuelCost) + Number(v.maintenanceCost)).toLocaleString('en-IN')}`,
    roi:         `${v.roi}%`,
  }));

  autoTable(doc, {
    columns: [
      { header: 'Vehicle',           dataKey: 'vehicle' },
      { header: 'Revenue (₹)',       dataKey: 'revenue' },
      { header: 'Fuel Cost (₹)',     dataKey: 'fuelCost' },
      { header: 'Maint. Cost (₹)',   dataKey: 'maintCost' },
      { header: 'Total Cost (₹)',    dataKey: 'totalCost' },
      { header: 'ROI (%)',           dataKey: 'roi' },
    ],
    body: roiRows,
    startY: startY + 30,
    ...tableStyles,
    didDrawPage: () => {

      // Section heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...AMBER);
      doc.text('VEHICLE ROI BREAKDOWN', 10, startY + 28);
    },
  });

  // Cost breakdown table on next section
  const costRows = costData.map(v => ({
    vehicle:   `${v.name} (${v.regNumber})`,
    fuel:      `₹${Number(v.fuelCost).toLocaleString('en-IN')}`,
    maint:     `₹${Number(v.maintenanceCost).toLocaleString('en-IN')}`,
    total:     `₹${Number(v.totalCost).toLocaleString('en-IN')}`,
  }));

  const lastY = (doc as any).lastAutoTable?.finalY ?? startY + 30;
  const costY = lastY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...AMBER);
  doc.text('OPERATIONAL COST BREAKDOWN', 10, costY);

  autoTable(doc, {
    columns: [
      { header: 'Vehicle',          dataKey: 'vehicle' },
      { header: 'Fuel Cost',        dataKey: 'fuel' },
      { header: 'Maintenance Cost', dataKey: 'maint' },
      { header: 'Total Cost',       dataKey: 'total' },
    ],
    body: costRows,
    startY: costY + 4,
    ...tableStyles,
  });

  addFooters(doc);
  doc.save(`analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
